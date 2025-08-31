import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionGenerator } from "@/components/QuestionGenerator";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";

interface RecordingData {
  duration: string;
  audioUrl?: string;
}

function Speaking() {
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [recordingData, setRecordingData] = useState<RecordingData | null>(
    null
  );
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [allRecordings, setAllRecordings] = useState<RecordingData[]>([]);

  const handleStart = () => {
    setShowQuestion(true);
    setRecordingData(null);
    setFeedback("");
    setShowFeedback(false);
    setQuestionCount(0);
    setSessionComplete(false);
    setAllRecordings([]);
  };

  const handleRecordingComplete = (data: RecordingData) => {
    setRecordingData(data);
    setAllRecordings((prev) => [...prev, data]);
  };

  const handleCheckFeedback = () => {
    if (recordingData) {
      setShowFeedback(true);
    }
  };

  const handleViewSessionFeedback = () => {
    setShowFeedback(true);
  };

  const handleReset = () => {
    setShowQuestion(false);
    setCurrentQuestion("");
    setRecordingData(null);
    setFeedback("");
    setShowFeedback(false);
    setQuestionCount(0);
    setSessionComplete(false);
    setAllRecordings([]);
  };

  const handleNext = () => {
    const newQuestionCount = questionCount + 1;
    setQuestionCount(newQuestionCount);
    setCurrentQuestion("");
    setRecordingData(null);
    setFeedback("");
    setShowFeedback(false);

    // Check if we've completed the image description (question 6)
    if (newQuestionCount >= 6) {
      setSessionComplete(true);
    }

    // Generate new question
    setShowQuestion(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-center">IELTS Speaking Practice</h1>
          <p className="text-center text-muted-foreground mt-2">
            Practice your IELTS speaking skills with AI-powered feedback
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Question Section */}
          <Card>
            <CardHeader>
              <CardTitle>Speaking Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showQuestion ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Start your IELTS speaking practice session with 5 Part 1
                    questions followed by an image description task
                  </p>
                  <Button onClick={handleStart} size="lg">
                    Start Practice Session
                  </Button>
                </div>
              ) : (
                <QuestionGenerator
                  onQuestionGenerated={setCurrentQuestion}
                  currentQuestion={currentQuestion}
                  questionCount={questionCount}
                />
              )}
            </CardContent>
          </Card>

          {/* Recording Section */}
          {showQuestion && (
            <Card>
              <CardHeader>
                <CardTitle>Voice Recording</CardTitle>
              </CardHeader>
              <CardContent>
                <VoiceRecorder onRecordingComplete={handleRecordingComplete} />

                {recordingData && (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Recording Duration:
                      </p>
                      <p className="font-medium">{recordingData.duration}</p>
                    </div>

                    <div className="text-center">
                      {sessionComplete ? (
                        <Button
                          onClick={handleViewSessionFeedback}
                          variant="outline"
                        >
                          View Feedback and Score
                        </Button>
                      ) : (
                        <Button onClick={handleCheckFeedback} variant="outline">
                          Check Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Feedback Section */}
          {showFeedback && (
            <Card>
              <CardHeader>
                <CardTitle>AI Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackDisplay
                  question={currentQuestion}
                  recordingData={recordingData}
                  onFeedbackGenerated={setFeedback}
                  isSessionComplete={sessionComplete}
                  allRecordings={allRecordings}
                  questionCount={questionCount}
                />
              </CardContent>
            </Card>
          )}

          {/* Control Buttons */}
          {showQuestion && (
            <div className="flex justify-center space-x-4 pt-6">
              <Button onClick={handleReset} variant="outline">
                {sessionComplete ? "Start New Session" : "Reset"}
              </Button>
              {!sessionComplete && (
                <Button onClick={handleNext} disabled={!recordingData}>
                  Next Question
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
export default Speaking;
