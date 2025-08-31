import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface LetterArrangementLessonProps {
  word: string;
  onComplete: () => void;
  onSkip: () => void;
}

const LetterArrangementLesson = ({ word, onComplete, onSkip }: LetterArrangementLessonProps) => {
  const [targetWord] = useState(word.toLowerCase());
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [placedLetters, setPlacedLetters] = useState<(string | null)[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Shuffle the letters of the target word
    const letters = targetWord.split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setShuffledLetters(shuffled);
    setPlacedLetters(new Array(letters.length).fill(null));
  }, [targetWord]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", shuffledLetters[index]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, slotIndex: number) => {
    e.preventDefault();
    const letter = e.dataTransfer.getData("text/plain");
    
    if (draggedIndex !== null && placedLetters[slotIndex] === null) {
      // Place the letter in the slot
      const newPlacedLetters = [...placedLetters];
      newPlacedLetters[slotIndex] = letter;
      setPlacedLetters(newPlacedLetters);

      // Remove the letter from available letters
      const newShuffledLetters = [...shuffledLetters];
      newShuffledLetters[draggedIndex] = '';
      setShuffledLetters(newShuffledLetters);
      
      // Check if word is complete
      if (newPlacedLetters.every(letter => letter !== null)) {
        const formedWord = newPlacedLetters.join('');
        const correct = formedWord === targetWord;
        setIsCorrect(correct);
        setIsComplete(true);
      }
    }
    setDraggedIndex(null);
  };

  const handleSlotClick = (slotIndex: number) => {
    // Remove letter from slot and return it to available letters
    if (placedLetters[slotIndex] !== null) {
      const letter = placedLetters[slotIndex]!;
      const newPlacedLetters = [...placedLetters];
      newPlacedLetters[slotIndex] = null;
      setPlacedLetters(newPlacedLetters);

      // Find empty spot in shuffled letters and place it back
      const newShuffledLetters = [...shuffledLetters];
      const emptyIndex = newShuffledLetters.findIndex(l => l === '');
      if (emptyIndex !== -1) {
        newShuffledLetters[emptyIndex] = letter;
      } else {
        newShuffledLetters.push(letter);
      }
      setShuffledLetters(newShuffledLetters);
      
      setIsComplete(false);
      setIsCorrect(null);
    }
  };

  const handleLetterClick = (letterIndex: number) => {
    // Find first empty slot and place the letter there
    if (shuffledLetters[letterIndex] !== '') {
      const letter = shuffledLetters[letterIndex];
      const emptySlotIndex = placedLetters.findIndex(slot => slot === null);
      
      if (emptySlotIndex !== -1) {
        const newPlacedLetters = [...placedLetters];
        newPlacedLetters[emptySlotIndex] = letter;
        setPlacedLetters(newPlacedLetters);

        const newShuffledLetters = [...shuffledLetters];
        newShuffledLetters[letterIndex] = '';
        setShuffledLetters(newShuffledLetters);
        
        // Check if word is complete
        if (newPlacedLetters.every(letter => letter !== null)) {
          const formedWord = newPlacedLetters.join('');
          const correct = formedWord === targetWord;
          setIsCorrect(correct);
          setIsComplete(true);
        }
      }
    }
  };

  const resetExercise = () => {
    const letters = targetWord.split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setShuffledLetters(shuffled);
    setPlacedLetters(new Array(letters.length).fill(null));
    setIsComplete(false);
    setIsCorrect(null);
  };

  const handleNext = () => {
    if (isCorrect) {
      onComplete();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background to-primary/5">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-6">
            Arrange the Letters
          </h3>
          <p className="text-muted-foreground mb-8">
            Drag and drop the letters to spell: <span className="font-semibold text-foreground">{word}</span>
          </p>

          {/* Letter Slots */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {placedLetters.map((letter, index) => (
              <div
                key={index}
                className="w-12 h-12 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center bg-background hover:border-primary/50 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => handleSlotClick(index)}
              >
                {letter && (
                  <span className="text-xl font-bold text-foreground uppercase">
                    {letter}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Available Letters */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {shuffledLetters.map((letter, index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                  letter === '' 
                    ? 'opacity-0 pointer-events-none' 
                    : 'bg-primary text-primary-foreground hover:opacity-80 active:scale-95'
                }`}
                draggable={letter !== ''}
                onDragStart={(e) => handleDragStart(e, index)}
                onClick={() => handleLetterClick(index)}
              >
                {letter && (
                  <span className="text-xl font-bold uppercase">
                    {letter}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Result */}
          {isComplete && (
            <div className="mb-6">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                isCorrect ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isCorrect ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
              <h4 className={`text-xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? 'Perfect!' : 'Try Again'}
              </h4>
              <p className="text-muted-foreground">
                {isCorrect 
                  ? 'You spelled the word correctly!' 
                  : 'The letters are not in the right order.'
                }
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={resetExercise} 
              variant="outline" 
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={onSkip} variant="outline" className="flex-1">
              Skip
            </Button>
            {isCorrect && (
              <Button onClick={handleNext} className="flex-1 bg-gradient-primary hover:opacity-90">
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LetterArrangementLesson;