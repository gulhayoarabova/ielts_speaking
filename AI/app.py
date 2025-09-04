from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import uvicorn
import json
import os
import asyncio
import base64
from dotenv import load_dotenv
from groq import Groq
import logging
from typing import Dict, List
from fastapi.responses import StreamingResponse
import io
from datetime import datetime
import uuid

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Init app
app = FastAPI(title="Real-time IELTS Voice Chat API")
load_dotenv()

# CORS setup
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "https://ielts-speaking-practice.vercel.app",
    "https://ielts-speaking-1.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Connection manager for WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.user_sessions[session_id] = {
            "connected_at": datetime.now(),
            "current_question": None,
            "conversation_history": [],
            "current_part": 1,
            "question_count": 0
        }
        logger.info(f"User {session_id} connected")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.user_sessions:
            del self.user_sessions[session_id]
        logger.info(f"User {session_id} disconnected")

    async def send_message(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_text(json.dumps(message))

    async def broadcast(self, message: dict):
        for session_id in self.active_connections:
            await self.send_message(session_id, message)

manager = ConnectionManager()

def transcribe_audio_chunk(audio_data: bytes) -> str:
    """Transcribe audio chunk using Whisper on Groq"""
    try:
        # Save audio data to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            tmp_file.write(audio_data)
            tmp_file.flush()
            
            with open(tmp_file.name, "rb") as f:
                transcript = client.audio.transcriptions.create(
                    model="whisper-large-v3",
                    file=f
                )
            
            os.unlink(tmp_file.name)  # Clean up temp file
            return transcript.text if transcript else ""
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return ""

def generate_ai_response(conversation_history: List[dict], current_part: int) -> str:
    """Generate AI examiner response based on conversation history"""
    
    # System prompts for different parts
    system_prompts = {
        1: """You are an IELTS Speaking examiner conducting Part 1. Ask short, personal questions about 
        familiar topics like hometown, hobbies, work, study, daily routine. Keep responses natural and 
        encouraging. Ask follow-up questions based on the candidate's answers.""",
        
        2: """You are an IELTS Speaking examiner conducting Part 2. Give the candidate a cue card topic 
        and tell them they have 1 minute to prepare and 1-2 minutes to speak. Topics should be about 
        describing a person, place, experience, or object.""",
        
        3: """You are an IELTS Speaking examiner conducting Part 3. Ask abstract, analytical questions 
        related to the Part 2 topic. Focus on opinions, comparisons, predictions, and societal issues. 
        Encourage detailed responses."""
    }
    
    messages = [
        {"role": "system", "content": system_prompts.get(current_part, system_prompts[1])}
    ]
    
    # Add conversation history
    for entry in conversation_history[-10:]:  # Last 10 exchanges to avoid token limit
        messages.append({"role": "user" if entry["type"] == "candidate" else "assistant", 
                        "content": entry["content"]})
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=150,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"AI response generation error: {e}")
        return "I'm sorry, could you repeat that please?"

def synthesize_speech_stream(text: str) -> bytes:
    """Convert text to speech using Groq TTS"""
    try:
        # Note: Groq might not have TTS yet, this is a placeholder
        # You might need to use another service like ElevenLabs, OpenAI TTS, or Azure
        response = client.audio.speech.create(
            model="tts-1",  # This might not exist in Groq yet
            voice="alloy",
            input=text,
        )
        return response.content
    except Exception as e:
        logger.error(f"TTS error: {e}")
        # Return empty bytes or use a fallback TTS service
        return b""

def evaluate_response_realtime(question: str, answer: str) -> dict:
    """Quick evaluation for real-time feedback"""
    prompt = f"""
    Quickly evaluate this IELTS speaking response. Give brief feedback in 2-3 sentences.
    
    Question: "{question}"
    Answer: "{answer}"
    
    Return JSON with: {{"feedback": "brief feedback text", "score": estimated_band_score}}
    """
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=100,
        )
        text_output = response.choices[0].message.content
        result = json.loads(text_output[text_output.index("{"): text_output.rindex("}")+1])
        return result
    except Exception as e:
        logger.error(f"Evaluation error: {e}")
        return {"feedback": "Good response, keep going!", "score": 6.0}

@app.websocket("/ws/voice-chat/{session_id}")
async def voice_chat_websocket(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    
    # Send initial greeting
    initial_greeting = "Hello! Welcome to your IELTS Speaking practice session. Let's start with Part 1. Can you tell me your name and where you're from?"
    
    await manager.send_message(session_id, {
        "type": "ai_response",
        "content": initial_greeting,
        "timestamp": datetime.now().isoformat()
    })
    
    # Generate TTS for greeting (if available)
    try:
        tts_data = synthesize_speech_stream(initial_greeting)
        if tts_data:
            tts_base64 = base64.b64encode(tts_data).decode()
            await manager.send_message(session_id, {
                "type": "ai_audio",
                "audio_data": tts_base64,
                "timestamp": datetime.now().isoformat()
            })
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "audio_chunk":
                # Handle real-time audio transcription
                audio_data = base64.b64decode(message["audio_data"])
                transcript = transcribe_audio_chunk(audio_data)
                
                if transcript:
                    # Send transcription back to client
                    await manager.send_message(session_id, {
                        "type": "transcription",
                        "content": transcript,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # Add to conversation history
                    session = manager.user_sessions[session_id]
                    session["conversation_history"].append({
                        "type": "candidate",
                        "content": transcript,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # Generate AI response
                    ai_response = generate_ai_response(
                        session["conversation_history"],
                        session["current_part"]
                    )
                    
                    session["conversation_history"].append({
                        "type": "examiner",
                        "content": ai_response,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # Send AI response
                    await manager.send_message(session_id, {
                        "type": "ai_response",
                        "content": ai_response,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # Generate and send TTS
                    try:
                        tts_data = synthesize_speech_stream(ai_response)
                        if tts_data:
                            tts_base64 = base64.b64encode(tts_data).decode()
                            await manager.send_message(session_id, {
                                "type": "ai_audio",
                                "audio_data": tts_base64,
                                "timestamp": datetime.now().isoformat()
                            })
                    except Exception as e:
                        logger.error(f"TTS generation failed: {e}")
                    
                    # Provide real-time feedback
                    if len(session["conversation_history"]) >= 2:
                        last_question = None
                        for entry in reversed(session["conversation_history"]):
                            if entry["type"] == "examiner":
                                last_question = entry["content"]
                                break
                        
                        if last_question:
                            feedback = evaluate_response_realtime(last_question, transcript)
                            await manager.send_message(session_id, {
                                "type": "feedback",
                                "feedback": feedback["feedback"],
                                "score": feedback["score"],
                                "timestamp": datetime.now().isoformat()
                            })
            
            elif message["type"] == "next_part":
                # Move to next part of the test
                session = manager.user_sessions[session_id]
                session["current_part"] += 1
                
                if session["current_part"] > 3:
                    # End of test
                    await manager.send_message(session_id, {
                        "type": "test_complete",
                        "message": "Congratulations! You've completed all three parts of the IELTS Speaking test.",
                        "timestamp": datetime.now().isoformat()
                    })
                else:
                    part_instructions = {
                        2: "Now let's move to Part 2. I'll give you a topic card. You'll have 1 minute to prepare and then speak for 1-2 minutes.",
                        3: "Finally, let's do Part 3. I'll ask you some more abstract questions for discussion."
                    }
                    
                    instruction = part_instructions[session["current_part"]]
                    await manager.send_message(session_id, {
                        "type": "part_transition",
                        "part": session["current_part"],
                        "instruction": instruction,
                        "timestamp": datetime.now().isoformat()
                    })
            
            elif message["type"] == "ping":
                # Heartbeat to keep connection alive
                await manager.send_message(session_id, {
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                })
    
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
        manager.disconnect(session_id)

@app.post("/start-session")
async def start_session():
    """Create a new voice chat session"""
    session_id = str(uuid.uuid4())
    return {"session_id": session_id}

@app.get("/session/{session_id}/status")
async def get_session_status(session_id: str):
    """Get current session status"""
    if session_id in manager.user_sessions:
        session = manager.user_sessions[session_id]
        return {
            "active": True,
            "current_part": session["current_part"],
            "connected_at": session["connected_at"].isoformat(),
            "conversation_length": len(session["conversation_history"])
        }
    return {"active": False}

@app.post("/session/{session_id}/end")
async def end_session(session_id: str):
    """End a voice chat session"""
    if session_id in manager.user_sessions:
        session = manager.user_sessions[session_id]
        conversation_history = session["conversation_history"]
        manager.disconnect(session_id)
        
        return {
            "message": "Session ended successfully",
            "conversation_history": conversation_history,
            "total_duration": len(conversation_history)
        }
    return {"message": "Session not found"}

# Additional endpoints for real-time functionality

@app.post("/transcribe")
async def transcribe_only(audio: UploadFile = File(...)):
    """Transcribe audio without evaluation"""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            content = await audio.read()
            tmp_file.write(content)
            tmp_file.flush()
            
            transcript = transcribe_audio_chunk(content)
            os.unlink(tmp_file.name)
            
            return {"transcript": transcript}
    except Exception as e:
        return {"error": str(e)}

@app.post("/synthesize-speech")
async def synthesize_speech_endpoint(request: dict):
    """Convert text to speech"""
    text = request.get("text", "")
    if not text:
        return {"error": "No text provided"}
    
    try:
        audio_data = synthesize_speech_stream(text)
        if audio_data:
            return StreamingResponse(
                io.BytesIO(audio_data),
                media_type="audio/mpeg",
                headers={"Content-Disposition": "attachment; filename=speech.mp3"}
            )
        else:
            return {"error": "TTS generation failed"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/generate-examiner-response")
async def generate_examiner_response_endpoint(request: dict):
    """Generate contextual examiner response"""
    conversation_history = request.get("conversation_history", [])
    current_part = request.get("current_part", 1)
    question_count = request.get("question_count", 0)
    
    # Create context from conversation history
    recent_exchanges = conversation_history[-6:]  # Last 3 exchanges
    context = ""
    
    for entry in recent_exchanges:
        role = "Candidate" if entry["type"] == "candidate" else "Examiner"
        context += f"{role}: {entry['content']}\n"
    
    # Generate appropriate response based on part and context
    system_prompts = {
        1: f"""You are an IELTS Speaking examiner conducting Part 1. Based on this conversation:

{context}

Generate the next appropriate question or response. Keep it natural, encouraging, and ask follow-up questions about familiar topics like hobbies, hometown, work, study, daily routine, food, or family. Questions should be simple and direct, suitable for 20-30 second answers.

If the candidate seems nervous, be more encouraging. If they give very short answers, ask follow-up questions. If they give detailed answers, acknowledge and move to a related topic.""",

        2: f"""You are an IELTS Speaking examiner conducting Part 2. Based on this conversation:

{context}

If this is the beginning of Part 2, give a cue card topic with bullet points. If the candidate is preparing, give encouragement. If they're speaking, listen and give minimal responses. Topics should be about describing a person, place, experience, or object.

Example format: "Now I'd like you to describe [topic]. You have one minute to think about what you're going to say. You can make some notes if you wish. Here's your topic: Describe a [something]. You should say: - [bullet point 1] - [bullet point 2] - [bullet point 3] - and explain [why/how/what you felt]".""",

        3: f"""You are an IELTS Speaking examiner conducting Part 3. Based on this conversation:

{context}

Ask abstract, analytical questions that require longer responses. Focus on opinions, comparisons, predictions, and societal issues. Questions should be thought-provoking and related to broader themes from Part 2.

Examples: "How do you think...", "What are the advantages and disadvantages of...", "Do you believe...", "How might this change in the future?", "What impact does... have on society?"."""
    }
    
    prompt = system_prompts.get(current_part, system_prompts[1])
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=150,
        )
        
        ai_response = response.choices[0].message.content.strip()
        return {"response": ai_response}
        
    except Exception as e:
        logger.error(f"Examiner response generation error: {e}")
        fallback_responses = {
            1: "That's interesting. Can you tell me more about that?",
            2: "Take your time to prepare. Let me know when you're ready to start.",
            3: "That's a good point. How do you think this might change in the future?"
        }
        return {"response": fallback_responses.get(current_part, "Please continue.")}

@app.post("/quick-evaluate")
async def quick_evaluate(request: dict):
    """Quick evaluation for real-time feedback"""
    answer = request.get("answer", "")
    question = request.get("question", "")
    
    prompt = f"""
    Quickly evaluate this IELTS speaking response in 1-2 sentences:
    
    Question: "{question}"
    Answer: "{answer}"
    
    Return JSON with:
    {{
        "feedback": "Brief encouraging feedback (1-2 sentences)",
        "score": estimated_band_score_float,
        "strengths": ["strength1", "strength2"],
        "suggestions": ["suggestion1", "suggestion2"]
    }}
    
    Be encouraging and constructive. Focus on what they did well and one area for improvement.
    """
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=120,
        )
        
        text_output = response.choices[0].message.content
        result = json.loads(text_output[text_output.index("{"): text_output.rindex("}")+1])
        return result
        
    except Exception as e:
        logger.error(f"Quick evaluation error: {e}")
        return {
            "feedback": "Good response! Keep practicing to improve fluency.",
            "score": 6.0,
            "strengths": ["Clear communication"],
            "suggestions": ["Try to elaborate more on your ideas"]
        }

@app.post("/realtime-feedback")
async def realtime_feedback(request: dict):
    """Generate real-time feedback based on recent conversation"""
    recent_conversation = request.get("recent_conversation", [])
    
    if len(recent_conversation) < 2:
        return {
            "feedback": "Keep going! You're doing well.",
            "fluency": 6.0,
            "vocabulary": 6.0,
            "grammar": 6.0,
            "pronunciation": 6.0,
            "suggestions": ["Continue speaking naturally"]
        }
    
    # Extract candidate responses
    candidate_responses = [entry["content"] for entry in recent_conversation if entry["type"] == "candidate"]
    combined_response = " ".join(candidate_responses)
    
    prompt = f"""
    Analyze these recent IELTS speaking responses and provide brief feedback:
    
    Recent responses: "{combined_response}"
    
    Return JSON with:
    {{
        "feedback": "Brief feedback (1-2 sentences)",
        "fluency": score_0_to_9,
        "vocabulary": score_0_to_9,
        "grammar": score_0_to_9,
        "pronunciation": score_0_to_9,
        "suggestions": ["quick suggestion1", "quick suggestion2"]
    }}
    
    Focus on immediate improvements they can make in the next response.
    """
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=150,
        )
        
        text_output = response.choices[0].message.content
        result = json.loads(text_output[text_output.index("{"): text_output.rindex("}")+1])
        return result
        
    except Exception as e:
        logger.error(f"Realtime feedback error: {e}")
        return {
            "feedback": "You're making good progress!",
            "fluency": 6.0,
            "vocabulary": 6.0,
            "grammar": 6.0,
            "pronunciation": 6.0,
            "suggestions": ["Continue speaking with confidence"]
        }

@app.post("/save-session")
async def save_session_endpoint(request: dict):
    """Save session data (optional - for analytics)"""
    session_id = request.get("session_id")
    conversation_history = request.get("conversation_history", [])
    total_duration = request.get("total_duration", 0)
    parts_completed = request.get("parts_completed", 0)
    
    # Here you could save to database, send to analytics service, etc.
    logger.info(f"Session {session_id} completed: {len(conversation_history)} exchanges, {parts_completed} parts, {total_duration}ms duration")
    
    return {"status": "saved", "session_id": session_id}

@app.post("/analyze-audio-quality")
async def analyze_audio_quality_endpoint(request: dict):
    """Analyze audio quality and provide suggestions"""
    audio_chunk = request.get("audio_chunk", "")
    
    # This is a simplified version - you could use actual audio analysis
    # For now, return general suggestions
    return {
        "quality": "fair",
        "suggestions": [
            "Speak closer to your microphone",
            "Try to minimize background noise",
            "Speak at a steady pace"
        ]
    }

@app.post("/pronunciation-feedback")
async def pronunciation_feedback_endpoint(request: dict):
    """Provide pronunciation-specific feedback"""
    audio_chunk = request.get("audio_chunk", "")
    transcript = request.get("transcript", "")
    
    # Simplified pronunciation feedback
    # In a real implementation, you'd use specialized pronunciation analysis tools
    
    words = transcript.lower().split()
    common_difficult_words = ["think", "three", "through", "world", "work", "comfortable", "development"]
    
    problematic_words = [word for word in words if any(diff in word for diff in common_difficult_words)]
    
    return {
        "score": 6.5,
        "feedback": "Your pronunciation is generally clear. Focus on consonant sounds and word stress.",
        "problematic_words": problematic_words[:3]  # Top 3 challenging words
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)