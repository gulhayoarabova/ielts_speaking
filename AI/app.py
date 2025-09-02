from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import uvicorn
import json
import os
from dotenv import load_dotenv
from groq import Groq
import random
import re

# Init app
app = FastAPI()

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔑 Set your Groq API Key in env
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
def transcribe_audio(audio_path: str) -> str:
    """Transcribe speech using Whisper on Groq"""
    with open(audio_path, "rb") as f:
        transcript = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=f
        )
    return transcript.text if transcript else ""

def evaluate_ielts(question: str, answer: str) -> dict:
    # Stricter IELTS prompt with few-shot calibration
    prompt = f"""
You are a certified IELTS examiner. 
Your task is to strictly evaluate the speaking performance on IELTS Band Descriptors.

Assessment Criteria:
- Fluency and Coherence
- Lexical Resource
- Grammatical Range and Accuracy
- Pronunciation

Rules:
1. Always return ONLY a JSON object.
2. Band scores must be realistic (0–9) in steps of 0.5.
3. Give detailed strengths and weaknesses.

Examples for calibration:
Q: "Where do you live?" 
A: "I live in Tashkent. Big city. Good food."  
→ {{
  "overall_band": "5.0",
  "fluency": "5.0",
  "vocabulary": "5.0",
  "grammar": "5.0",
  "pronunciation": "5.5",
  "strengths": ["Basic communication possible"],
  "weaknesses": ["Short sentences", "Limited vocabulary", "Many grammar errors"]
}}

Q: "Where do you live?"  
A: "I currently reside in Tashkent, the capital of Uzbekistan. It is a lively city with diverse food and cultural attractions."  
→ {{
  "overall_band": "7.0",
  "fluency": "7.0",
  "vocabulary": "7.0",
  "grammar": "7.0",
  "pronunciation": "7.0",
  "strengths": ["Good fluency", "Appropriate vocabulary", "Clear sentence structure"],
  "weaknesses": ["Could expand ideas more", "Minor pronunciation slips"]
}}

Now evaluate the following:

Question: "{question}"
Answer: "{answer}"

Return only JSON:
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # 🔥 stronger model
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=500,
        )

        text_output = response.choices[0].message.content

        # Extract JSON
        result_json = json.loads(text_output[text_output.index("{"): text_output.rindex("}")+1])

        return result_json
    except Exception as e:
        return {"error": str(e)}

@app.post("/evaluate")
async def evaluate(
    question: str = Form(...),
    audio: UploadFile = File(None),
    manual_text: str = Form(None)
):
    transcript = ""

    if manual_text:  # case: typed answer
        transcript = manual_text
    elif audio:  # case: recorded answer
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(await audio.read())
            audio_path = tmp.name
        transcript = transcribe_audio(audio_path)

    if not transcript:
        return {"error": "No transcript to evaluate"}

    evaluation = evaluate_ielts(question, transcript)
    return {"transcript": transcript, "evaluation": evaluation}


# Keep a pool of asked questions in memory
asked_questions = set()

QUESTION_STYLES = [
    "Ask a 'What/Why/How' type question.",
    "Ask a 'Do you think' opinion-based question.",
    "Ask a 'Describe' style question.",
    "Ask a 'Talk about' style question.",
    "Ask a 'Would you rather / If you could' hypothetical question.",
]

def normalize_question(q: str) -> str:
    """Normalize a question to detect duplicates by meaning (basic)."""
    q = q.lower().strip()
    q = re.sub(r'^(can you|could you|do you think|describe|talk about|tell me about|would you rather|if you could)\s+', '', q)
    q = re.sub(r'[?.!,]', '', q)  # remove punctuation
    return q.strip()

def generate_ielts_question() -> dict:
    style_instruction = random.choice(QUESTION_STYLES)

    prompt = f"""
    Generate ONE IELTS-style speaking question.

    Requirements:
    - Open-ended, suitable for a 30–40 second spoken answer
    - About familiar IELTS topics (family, education, work, hobbies, travel, technology, environment, culture, future, society, etc.)
    - Use this style: {style_instruction}
    - Return ONLY the question text, nothing else.
    """

    try:
        for _ in range(5):
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=1.0,
                top_p=1,
                presence_penalty=1.2,
                frequency_penalty=0.9,
                max_tokens=100,
            )

            question = response.choices[0].message.content.strip()
            normalized = normalize_question(question)

            if normalized not in asked_questions:
                asked_questions.add(normalized)

                # reset after 200 unique questions
                if len(asked_questions) > 200:
                    asked_questions.clear()
                    asked_questions.add(normalized)

                return {"question": question}

        return {"question": question, "note": "⚠️ Might be semantically similar"}

    except Exception as e:
        return {"error": str(e)}


@app.get("/generate-question")
async def generate_question():
    return generate_ielts_question()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
