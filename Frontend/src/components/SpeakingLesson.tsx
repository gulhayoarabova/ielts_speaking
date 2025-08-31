import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, Mic, StopCircle, CheckCircle, XCircle } from "lucide-react";
import LetterArrangementLesson from "./LetterArrangementLesson";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      }
    }
  }
}

interface SpeakingLessonProps {
  word: string;
  onComplete: () => void;
  onSkip: () => void;
}

const SpeakingLesson = ({ word, onComplete, onSkip }: SpeakingLessonProps) => {
  const [phase, setPhase] = useState<'listen' | 'speak' | 'result' | 'arrangement'>('listen');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userSpeech, setUserSpeech] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hasPronounced, setHasPronounced] = useState(false);
  const [wordImage, setWordImage] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setUserSpeech(transcript);
        setIsRecording(false);
        checkPronunciation(transcript);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // Generate image for the word
    generateImageForWord();

    return () => {
      if (synthRef.current) {
        speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [word]);

  const generateImageForWord = async () => {
    setIsGeneratingImage(true);
    try {
      // Check if we have a pre-generated image for this word
      const wordKey = word.toLowerCase();
      
      // Import the generated image for "opportunity"
      if (wordKey === 'opportunity') {
        const { default: opportunityImage } = await import('@/assets/word-opportunity.jpg');
        setWordImage(opportunityImage);
      } else {
        // For other words, use a placeholder with the word
        setWordImage(`https://api.dicebear.com/7.x/shapes/svg?seed=${word}&backgroundColor=4ade80&size=200`);
      }
    } catch (error) {
      console.error('Failed to load image:', error);
      // Fallback to simple placeholder
      setWordImage(`https://via.placeholder.com/200x200/4ade80/ffffff?text=${encodeURIComponent(word)}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const pronounceWord = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      synthRef.current = new SpeechSynthesisUtterance(word);
      synthRef.current.rate = 0.8;
      synthRef.current.pitch = 1;
      synthRef.current.volume = 1;
      
      synthRef.current.onend = () => {
        setHasPronounced(true);
      };
      
      speechSynthesis.speak(synthRef.current);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      setUserSpeech("");
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const checkPronunciation = (transcript: string) => {
    // Simple pronunciation check - you can make this more sophisticated
    const targetWord = word.toLowerCase();
    const spokenWord = transcript.toLowerCase();
    
    // Check if the spoken word is similar to the target word
    const similarity = calculateSimilarity(targetWord, spokenWord);
    const correct = similarity > 0.7 || spokenWord.includes(targetWord) || targetWord.includes(spokenWord);
    
    setIsCorrect(correct);
    setPhase('result');
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const handleNext = () => {
    if (phase === 'listen' && hasPronounced) {
      setPhase('speak');
    } else if (phase === 'result') {
      setPhase('arrangement');
    }
  };

  const handleArrangementComplete = () => {
    onComplete();
  };

  const handleArrangementSkip = () => {
    onSkip();
  };

  const renderListenPhase = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-6">Listen and Learn</h3>
        <div className="bg-primary/10 rounded-2xl p-8 mb-6">
          {/* Word Image */}
          {isGeneratingImage ? (
            <div className="w-32 h-32 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          ) : wordImage ? (
            <img 
              src={wordImage} 
              alt={`Visual representation of ${word}`}
              className="w-32 h-32 mx-auto mb-4 rounded-lg object-cover"
            />
          ) : null}
          
          <p className="text-4xl font-bold text-primary mb-4">{word}</p>
          <Button
            onClick={pronounceWord}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
          >
            <Volume2 className="w-6 h-6 mr-2" />
            Play Audio
          </Button>
        </div>
        <p className="text-muted-foreground mb-4">
          Press the speaker button to hear the pronunciation
        </p>
        {hasPronounced && (
          <Button onClick={handleNext} size="lg" className="w-full">
            Next: Try Speaking
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderSpeakPhase = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-6">Now You Speak</h3>
        <div className="bg-secondary/20 rounded-2xl p-8 mb-6">
          <p className="text-3xl font-bold text-foreground mb-6">{word}</p>
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            size="lg"
            className={`w-20 h-20 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-primary hover:opacity-90'}`}
            disabled={!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)}
          >
            {isRecording ? (
              <StopCircle className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-primary-foreground" />
            )}
          </Button>
        </div>
        <p className="text-muted-foreground mb-4">
          {isRecording ? 'Listening... Speak now!' : 'Press the microphone to record your pronunciation'}
        </p>
        {!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && (
          <p className="text-red-500 text-sm">Speech recognition is not supported in your browser</p>
        )}
      </CardContent>
    </Card>
  );

  const renderResultPhase = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
          isCorrect ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isCorrect ? (
            <CheckCircle className="w-12 h-12 text-green-600" />
          ) : (
            <XCircle className="w-12 h-12 text-red-600" />
          )}
        </div>
        
        <h3 className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {isCorrect ? 'Great Pronunciation!' : 'Try Again'}
        </h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Target word:</p>
            <p className="text-xl font-semibold text-foreground">{word}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">You said:</p>
            <p className="text-xl font-semibold text-foreground">{userSpeech || "Nothing detected"}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onSkip} variant="outline" className="flex-1">
            Skip
          </Button>
          <Button onClick={handleNext} className="flex-1 bg-gradient-primary hover:opacity-90">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background to-primary/5">
      {phase === 'listen' && renderListenPhase()}
      {phase === 'speak' && renderSpeakPhase()}
      {phase === 'result' && renderResultPhase()}
      {phase === 'arrangement' && (
        <LetterArrangementLesson 
          word={word}
          onComplete={handleArrangementComplete}
          onSkip={handleArrangementSkip}
        />
      )}
    </div>
  );
};

export default SpeakingLesson;