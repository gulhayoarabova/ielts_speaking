import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Part 1 Questions (Simple, personal questions)
const PART1_QUESTIONS = [
  "Describe yourself and your family. What do you do for work or study?",
  "What are your hobbies and interests? How do you spend your free time?",
  "Tell me about your hometown. What do you like most about it?",
  "Do you prefer to live in a city or in the countryside? Why?",
  "What kind of food do you like? Do you enjoy cooking?",
  "How do you usually travel to work or school? Do you like this method of transport?",
  "What's your favorite season and why? How does weather affect your mood?",
  "Do you like reading books? What kind of books do you prefer?",
  "Tell me about your daily routine. How has it changed over the years?",
  "Do you prefer to shop online or in physical stores? Why?",
  "What kind of music do you like? Do you play any musical instruments?",
  "How do you usually spend your weekends?",
  "Do you like watching TV? What's your favorite TV program?",
  "Tell me about your friends. How did you meet them?",
  "What do you like about your job or studies?",
  "Do you enjoy traveling? Where have you been recently?",
  "What's your favorite way to relax?",
  "Do you like sports? Which ones do you enjoy watching or playing?",
  "How has technology changed your daily life?",
  "What do you usually do in your free time?"
];

// Image search queries for Part 2 description tasks
const IMAGE_SEARCH_QUERIES = [
  "family gathering celebration",
  "modern office workspace",
  "beautiful park landscape", 
  "busy city street",
  "traditional market food",
  "students studying library",
  "people exercising outdoors",
  "mountain hiking adventure",
  "beach sunset landscape",
  "art gallery exhibition"
];

interface QuestionGeneratorProps {
  onQuestionGenerated: (question: string) => void;
  currentQuestion: string;
  questionCount: number;
}

export function QuestionGenerator({ onQuestionGenerated, currentQuestion, questionCount }: QuestionGeneratorProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  useEffect(() => {
    if (!currentQuestion) {
      if (questionCount < 5) {
        // Generate Part 1 question for first 5 questions
        const randomIndex = Math.floor(Math.random() * PART1_QUESTIONS.length);
        const selectedQuestion = PART1_QUESTIONS[randomIndex];
        onQuestionGenerated(selectedQuestion);
      } else if (questionCount === 5) {
        // Generate image description task for 6th question
        generateImageDescriptionTask();
      }
    }
  }, [currentQuestion, questionCount, onQuestionGenerated]);

  const generateImageDescriptionTask = () => {
    setIsLoadingImage(true);
    
    // Set up the image question
    const imageQuestion = "Look at the image below and describe what you see. You should speak for 2-3 minutes and include: what is happening in the image, who or what you can see, the setting or location, and your thoughts or feelings about what you observe.";
    
    // Use the fetched image from Unsplash
    setImageUrl("https://images.unsplash.com/photo-1722252799088-4781aabc3d0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBnYXRoZXJpbmclMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NTY1NzM5NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral");
    onQuestionGenerated(imageQuestion);
    setIsLoadingImage(false);
  };

  if (!currentQuestion || isLoadingImage) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          {isLoadingImage ? 'Loading image for description task...' : 'Generating question...'}
        </p>
      </div>
    );
  }

  const isImageQuestion = questionCount === 5;
  const questionType = questionCount < 5 ? 'Part 1' : 'Part 2 - Image Description';

  return (
    <div className="space-y-4">
      {/* Question Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {questionCount + 1} of 6</span>
        <span className="bg-primary/10 px-2 py-1 rounded">{questionType}</span>
      </div>

      <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
        <h2 className="mb-4">Your Speaking Question:</h2>
        <p className="leading-relaxed mb-4">{currentQuestion}</p>
        
        {/* Display image for image description questions */}
        {isImageQuestion && imageUrl && (
          <div className="mt-4">
            <ImageWithFallback 
              src={imageUrl}
              alt="Image to describe"
              className="w-full max-w-lg mx-auto rounded-lg border"
            />
          </div>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground space-y-2">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Take a moment to think about your answer</li>
          <li>Speak clearly and at a natural pace</li>
          {questionCount < 5 ? (
            <li>Try to speak for 1-2 minutes and give specific examples</li>
          ) : (
            <>
              <li>Speak for 2-3 minutes describing the image in detail</li>
              <li>Include what you see, the setting, people/objects, and your impressions</li>
            </>
          )}
          <li>Use specific examples and details in your response</li>
        </ul>
      </div>
    </div>
  );
}