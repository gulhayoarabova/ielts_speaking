import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

interface FeedbackDisplayProps {
  question: string;
  recordingData: { duration: string; audioUrl?: string } | null;
  onFeedbackGenerated: (feedback: string) => void;
  isSessionComplete?: boolean;
  allRecordings?: { duration: string; audioUrl?: string }[];
  questionCount?: number;
}

interface FeedbackScores {
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  overall: number;
}

const FEEDBACK_TEMPLATES = [
  {
    scores: {
      fluency: 75,
      vocabulary: 80,
      grammar: 70,
      pronunciation: 85,
      overall: 78,
    },
    strengths: [
      "Good use of linking words and phrases",
      "Clear pronunciation with good intonation",
      "Appropriate vocabulary for the topic",
      "Well-structured response with clear main points",
    ],
    improvements: [
      "Try to speak more fluently with fewer pauses",
      "Use more complex grammatical structures",
      "Expand your vocabulary with more sophisticated words",
      "Work on maintaining consistent speaking pace",
    ],
    comment:
      "Your response shows good understanding of the question and you provided relevant examples. Focus on developing your fluency and using more complex language structures to reach the next band level.",
  },
  {
    scores: {
      fluency: 65,
      vocabulary: 70,
      grammar: 75,
      pronunciation: 70,
      overall: 70,
    },
    strengths: [
      "Accurate basic grammar usage",
      "Good topic development with examples",
      "Clear communication of main ideas",
      "Appropriate response length",
    ],
    improvements: [
      "Reduce hesitation and self-correction",
      "Use more varied vocabulary",
      "Improve word stress and sentence rhythm",
      "Practice complex sentence structures",
    ],
    comment:
      "You demonstrate good basic English skills and can communicate your ideas clearly. To improve, focus on building fluency and expanding your range of vocabulary and grammatical structures.",
  },
  {
    scores: {
      fluency: 85,
      vocabulary: 75,
      grammar: 80,
      pronunciation: 80,
      overall: 80,
    },
    strengths: [
      "Excellent fluency with natural speech patterns",
      "Good range of vocabulary",
      "Effective use of discourse markers",
      "Clear and confident delivery",
    ],
    improvements: [
      "Use more idiomatic expressions",
      "Incorporate more complex grammatical forms",
      "Work on subtle pronunciation features",
      "Add more sophisticated vocabulary",
    ],
    comment:
      "Strong performance with good fluency and natural expression. You demonstrate solid English skills across all areas. Continue working on precision and sophistication in your language use.",
  },
];

export function FeedbackDisplay({
  question,
  recordingData,
  onFeedbackGenerated,
  isSessionComplete = false,
  allRecordings = [],
  questionCount = 0,
}: FeedbackDisplayProps) {
  const [feedback, setFeedback] = useState<{
    scores: FeedbackScores;
    strengths: string[];
    improvements: string[];
    comment: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    // Simulate AI feedback generation
    const generateFeedback = () => {
      setIsGenerating(true);

      // Simulate processing time
      setTimeout(() => {
        if (isSessionComplete) {
          // Generate comprehensive session feedback
          generateSessionFeedback();
        } else {
          // Generate individual question feedback
          generateQuestionFeedback();
        }
      }, 2000); // 2 second delay to simulate AI processing
    };

    const generateQuestionFeedback = () => {
      const randomTemplate =
        FEEDBACK_TEMPLATES[
          Math.floor(Math.random() * FEEDBACK_TEMPLATES.length)
        ];

      // Add some variation to scores based on recording duration
      const durationMinutes = recordingData?.duration
        ? parseInt(recordingData.duration.split(":")[0]) +
          parseInt(recordingData.duration.split(":")[1]) / 60
        : 1;

      const durationBonus =
        durationMinutes >= 2 ? 5 : durationMinutes >= 1 ? 0 : -5;

      // Check if this was a simulated recording (no audioUrl)
      const isSimulated = !recordingData?.audioUrl;

      const adjustedScores = {
        fluency: Math.max(
          40,
          Math.min(
            90,
            randomTemplate.scores.fluency +
              durationBonus +
              Math.floor(Math.random() * 10 - 5)
          )
        ),
        vocabulary: Math.max(
          40,
          Math.min(
            90,
            randomTemplate.scores.vocabulary +
              Math.floor(Math.random() * 10 - 5)
          )
        ),
        grammar: Math.max(
          40,
          Math.min(
            90,
            randomTemplate.scores.grammar + Math.floor(Math.random() * 10 - 5)
          )
        ),
        pronunciation: Math.max(
          40,
          Math.min(
            90,
            randomTemplate.scores.pronunciation +
              Math.floor(Math.random() * 10 - 5)
          )
        ),
        overall: 0,
      };

      adjustedScores.overall = Math.round(
        (adjustedScores.fluency +
          adjustedScores.vocabulary +
          adjustedScores.grammar +
          adjustedScores.pronunciation) /
          4
      );

      const generatedFeedback = {
        scores: adjustedScores,
        strengths: randomTemplate.strengths,
        improvements: randomTemplate.improvements,
        comment: isSimulated
          ? `${randomTemplate.comment} Note: This feedback is based on the duration of your simulated response. For more accurate pronunciation and fluency assessment, please enable microphone access for future practice sessions.`
          : randomTemplate.comment,
      };

      setFeedback(generatedFeedback);
      setIsGenerating(false);
      onFeedbackGenerated(JSON.stringify(generatedFeedback));
    };

    const generateSessionFeedback = () => {
      // Calculate session-based scores
      const totalDuration = allRecordings.reduce((total, recording) => {
        const minutes = parseInt(recording.duration.split(":")[0]);
        const seconds = parseInt(recording.duration.split(":")[1]);
        return total + minutes + seconds / 60;
      }, 0);

      const averageDuration = totalDuration / allRecordings.length;
      const hasAudioRecordings = allRecordings.some(
        (recording) => recording.audioUrl
      );

      // Generate scores based on session performance
      const baseScore = 70 + Math.floor(Math.random() * 15); // 70-85 base range
      const durationBonus =
        averageDuration >= 2 ? 5 : averageDuration >= 1.5 ? 2 : 0;

      const sessionScores = {
        fluency: Math.max(
          50,
          Math.min(
            90,
            baseScore + durationBonus + Math.floor(Math.random() * 10 - 5)
          )
        ),
        vocabulary: Math.max(
          50,
          Math.min(90, baseScore + Math.floor(Math.random() * 10 - 5))
        ),
        grammar: Math.max(
          50,
          Math.min(90, baseScore + Math.floor(Math.random() * 10 - 5))
        ),
        pronunciation: Math.max(
          50,
          Math.min(90, baseScore + Math.floor(Math.random() * 10 - 5))
        ),
        overall: 0,
      };

      sessionScores.overall = Math.round(
        (sessionScores.fluency +
          sessionScores.vocabulary +
          sessionScores.grammar +
          sessionScores.pronunciation) /
          4
      );

      const sessionFeedback = {
        scores: sessionScores,
        strengths: [
          "Completed full IELTS speaking practice session",
          "Demonstrated consistent engagement across all question types",
          "Good progression from Part 1 to Part 2 tasks",
          "Maintained appropriate speaking duration for most responses",
        ],
        improvements: [
          "Continue practicing with varied question types",
          "Focus on expanding vocabulary range",
          "Work on maintaining fluency throughout longer responses",
          "Practice describing visual content in detail",
        ],
        comment: hasAudioRecordings
          ? `Excellent work completing your full IELTS speaking practice session! You answered 5 Part 1 questions and completed an image description task. Your average response time was ${averageDuration.toFixed(
              1
            )} minutes. Continue practicing regularly to improve your confidence and fluency.`
          : `Great job completing your practice session! You worked through 5 Part 1 questions and an image description task with an average response time of ${averageDuration.toFixed(
              1
            )} minutes. For more detailed pronunciation feedback, consider enabling microphone access in future sessions.`,
      };

      setFeedback(sessionFeedback);
      setIsGenerating(false);
      onFeedbackGenerated(JSON.stringify(sessionFeedback));
    };

    generateFeedback();
  }, [
    question,
    recordingData,
    onFeedbackGenerated,
    isSessionComplete,
    allRecordings,
  ]);

  const getBandScore = (percentage: number): string => {
    if (percentage >= 85) return "8.0-9.0";
    if (percentage >= 75) return "7.0-7.5";
    if (percentage >= 65) return "6.0-6.5";
    if (percentage >= 55) return "5.0-5.5";
    if (percentage >= 45) return "4.0-4.5";
    return "3.0-3.5";
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 65) return "text-yellow-600";
    return "text-red-600";
  };

  if (isGenerating) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground">
          {isSessionComplete
            ? "Analyzing your complete session..."
            : "Analyzing your response..."}
        </p>
        <p className="text-sm text-muted-foreground">This may take a moment</p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Unable to generate feedback. Please try again.
        </p>
      </div>
    );
  }

  const isSimulated = !recordingData?.audioUrl;
  const hasAnyAudioRecordings = allRecordings.some(
    (recording) => recording.audioUrl
  );

  return (
    <div className="space-y-6">
      {/* Session Completion Notice */}
      {isSessionComplete && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">
              <strong>Session Complete!</strong> You've completed all 6
              questions including 5 Part 1 questions and 1 image description
              task.
            </p>
          </div>
        </div>
      )}

      {/* Simulation Notice */}
      {((isSimulated && !isSessionComplete) ||
        (isSessionComplete && !hasAnyAudioRecordings)) && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              <strong>Simulated Feedback:</strong> This assessment is based on
              timing only. Enable microphone access for comprehensive
              pronunciation and fluency analysis.
            </p>
          </div>
        </div>
      )}

      {/* Overall Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3>
              {isSessionComplete
                ? "Session Overall Band Score"
                : "Overall Band Score"}
            </h3>
            <div className="text-3xl font-bold text-primary">
              {getBandScore(feedback.scores.overall)}
            </div>
            <p className="text-sm text-muted-foreground">
              {isSessionComplete
                ? "Based on your complete practice session performance"
                : "Based on IELTS Speaking Band Descriptors"}
            </p>
            {isSessionComplete && (
              <p className="text-xs text-muted-foreground">
                Average across {allRecordings.length} responses
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3>Detailed Assessment</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(feedback.scores).map(([category, score]) => {
              if (category === "overall") return null;

              const displayName =
                category.charAt(0).toUpperCase() + category.slice(1);

              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize">{displayName}</span>
                    <Badge variant="outline" className={getScoreColor(score)}>
                      {getBandScore(score)}
                    </Badge>
                  </div>
                  <Progress value={score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{score}%</p>
                </div>
              );
            })}
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
          <ul className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3>Areas for Improvement</h3>
          </div>
          <ul className="space-y-2">
            {feedback.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{improvement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* General Comment */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3>Examiner Comments</h3>
          </div>
          <p className="text-sm leading-relaxed">{feedback.comment}</p>
        </CardContent>
      </Card>
    </div>
  );
}
