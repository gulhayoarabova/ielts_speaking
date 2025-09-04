import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

interface FeedbackDisplayProps {
  question: string;
  recordingData: { duration: string; audioBlob?: Blob } | null;
  onFeedbackGenerated: (feedback: string) => void;
  isSessionComplete: boolean;            // ✅ added
  allRecordings: { duration: string; audioUrl?: string }[]; // ✅ added
  questionCount: number;                 // ✅ added
}


interface FeedbackResponse {
  transcript?: string;
  evaluation?: {
    overall_band?: string;
    fluency?: string;
    vocabulary?: string;
    grammar?: string;
    pronunciation?: string;
    strengths?: string[];
    weaknesses?: string[];
  };
}

export function FeedbackDisplay({
  question,
  recordingData,
  onFeedbackGenerated,
}: FeedbackDisplayProps) {
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!recordingData?.audioBlob || !question) return;

      setIsGenerating(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("question", question);
        formData.append("audio", recordingData.audioBlob, "response.wav");

        const res = await fetch(
          "https://ielts-speaking-1.onrender.com/send-audio",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        console.log("API FEEDBACK RESPONSE:", data);

        setFeedback(data);
        onFeedbackGenerated(JSON.stringify(data));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Feedback API Error:", err);
        setError("Failed to fetch feedback. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    };

    fetchFeedback();
  }, [question, recordingData, onFeedbackGenerated]);

  // --- Loading State ---
  if (isGenerating) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Analyzing your response...</p>
        <p className="text-sm text-muted-foreground">
          This may take a few seconds
        </p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // --- No Feedback Yet ---
  if (!feedback) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Record your answer to get feedback
        </p>
      </div>
    );
  }

  const evaluation = feedback.evaluation || {};
  const strengths = evaluation.strengths || [];
  const weaknesses = evaluation.weaknesses || [];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3>Overall Band Score</h3>
            <div className="text-3xl font-bold text-primary">
              {evaluation.overall_band || "N/A"}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on IELTS Speaking Band Descriptors
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3>Detailed Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center">
              <span>Fluency</span>
              <Badge variant="outline">{evaluation.fluency || "N/A"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Vocabulary</span>
              <Badge variant="outline">{evaluation.vocabulary || "N/A"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Grammar</span>
              <Badge variant="outline">{evaluation.grammar || "N/A"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Pronunciation</span>
              <Badge variant="outline">
                {evaluation.pronunciation || "N/A"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3>Strengths</h3>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No strengths listed.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3>Areas for Improvement</h3>
          </div>
          {weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No suggested improvements.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transcript */}
      {feedback.transcript && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3>Transcript</h3>
            </div>
            <p className="text-sm leading-relaxed">{feedback.transcript}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
