import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, CheckCircle, XCircle } from "lucide-react";

interface ListeningLessonProps {
  onComplete: () => void;
  onSkip: () => void;
}

const ListeningLesson = ({ onComplete, onSkip }: ListeningLessonProps) => {
  const [phase, setPhase] = useState<'listen' | 'test'>('listen');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sample listening content
  const listeningData = {
    title: "University Library Conversation",
    dialogue: [
      { speaker: "Student", text: "Excuse me, could you help me find some books about environmental science?" },
      { speaker: "Librarian", text: "Of course! Environmental science books are on the third floor in section C. You can take the elevator or the stairs." },
      { speaker: "Student", text: "Great! And how many books can I borrow at once?" },
      { speaker: "Librarian", text: "Students can borrow up to 5 books for 2 weeks. You can renew them online if you need more time." },
      { speaker: "Student", text: "Perfect. Is the library open on weekends?" },
      { speaker: "Librarian", text: "Yes, we're open Saturday from 9 AM to 6 PM, and Sunday from 1 PM to 9 PM." }
    ],
    questions: [
      {
        question: "Where are the environmental science books located?",
        options: [
          "Second floor, section B",
          "Third floor, section C", 
          "First floor, section A",
          "Fourth floor, section D"
        ],
        correctAnswer: 1
      },
      {
        question: "How many books can a student borrow?",
        options: [
          "3 books",
          "4 books",
          "5 books",
          "6 books"
        ],
        correctAnswer: 2
      },
      {
        question: "What are the Sunday opening hours?",
        options: [
          "9 AM to 6 PM",
          "1 PM to 9 PM",
          "10 AM to 8 PM",
          "2 PM to 10 PM"
        ],
        correctAnswer: 1
      }
    ]
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = listeningData.questions[currentQuestionIndex];

  useEffect(() => {
    // Create a synthetic audio experience since we don't have actual audio files
    audioRef.current = new Audio();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      setIsPlaying(true);
      // Simulate audio playing for demo purposes
      setTimeout(() => {
        setIsPlaying(false);
      }, 15000); // 15 seconds audio simulation
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleCheck = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
    }
  };

  const handleNext = () => {
    if (phase === 'listen') {
      setPhase('test');
    } else if (showResult) {
      if (currentQuestionIndex < listeningData.questions.length - 1) {
        // Next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // All questions completed
        onComplete();
      }
    }
  };

  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const renderListenPhase = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6 text-center">{listeningData.title}</h3>
        
        {/* Audio Player */}
        <div className="bg-primary/10 rounded-2xl p-6 mb-6 text-center">
          <Button
            onClick={handlePlayPause}
            size="lg"
            className={`w-20 h-20 rounded-full ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-primary hover:opacity-90'}`}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-primary-foreground" />
            )}
          </Button>
          <p className="text-muted-foreground mt-4">
            {isPlaying ? 'Playing audio...' : 'Click to play the conversation'}
          </p>
        </div>

        {/* Dialogue */}
        <div className="space-y-4 mb-6">
          <h4 className="text-lg font-semibold text-foreground">Dialogue:</h4>
          <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
            {listeningData.dialogue.map((line, index) => (
              <div key={index} className="mb-3">
                <span className="font-semibold text-primary">{line.speaker}:</span>
                <span className="ml-2 text-foreground">{line.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onSkip} variant="outline" className="flex-1">
            Skip
          </Button>
          <Button onClick={handleNext} className="flex-1 bg-gradient-primary hover:opacity-90">
            Next: Answer Questions
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderTestPhase = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Question {currentQuestionIndex + 1} of {listeningData.questions.length}
          </h3>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / listeningData.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-xl font-semibold text-foreground mb-6">{currentQuestion.question}</h4>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === index
                    ? showResult
                      ? isCorrect && selectedAnswer === index
                        ? 'border-green-500 bg-green-50'
                        : selectedAnswer === index && !isCorrect
                        ? 'border-red-500 bg-red-50'
                        : 'border-primary bg-primary/5'
                      : 'border-primary bg-primary/5'
                    : showResult && index === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <span className="font-medium text-foreground">{String.fromCharCode(65 + index)}. {option}</span>
                {showResult && index === currentQuestion.correctAnswer && (
                  <CheckCircle className="w-5 h-5 text-green-600 float-right" />
                )}
                {showResult && selectedAnswer === index && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-600 float-right" />
                )}
              </button>
            ))}
          </div>
        </div>

        {showResult && (
          <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            {!isCorrect && (
              <p className="text-muted-foreground mt-1">
                The correct answer is: {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={onSkip} variant="outline" className="flex-1">
            Skip
          </Button>
          {showResult ? (
            <Button onClick={handleNext} className="flex-1 bg-gradient-primary hover:opacity-90">
              {currentQuestionIndex < listeningData.questions.length - 1 ? 'Next Question' : 'Complete'}
            </Button>
          ) : (
            <Button 
              onClick={handleCheck} 
              disabled={selectedAnswer === null}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              Check Answer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background to-primary/5">
      {phase === 'listen' && renderListenPhase()}
      {phase === 'test' && renderTestPhase()}
    </div>
  );
};

export default ListeningLesson;