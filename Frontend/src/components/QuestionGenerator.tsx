import React, { useEffect, useMemo, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// --- Types ---
interface ApiQuestion {
  question: string;
  image?: string;
}

interface QuestionGeneratorProps {
  onQuestionGenerated: (question: string) => void;
  currentQuestion: string;
  questionCount: number; // 0..5 (0-4 Part 1, 5 = image task)
}

// --- Config ---
const QUESTIONS_API_URL =
  "https://ielts-speaking-1.onrender.com/generate-question";

const IMAGE_TASK_PROMPT =
  "Look at the image below and describe what you see. Speak for 2–3 minutes. Include: what is happening, who/what is visible, the setting/location, and your thoughts or feelings.";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1080&auto=format&fit=crop";

export function QuestionGenerator({
  onQuestionGenerated,
  currentQuestion,
  questionCount,
}: QuestionGeneratorProps) {
  const [apiQuestions, setApiQuestions] = useState<ApiQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // --- Fetch question from API ---
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(QUESTIONS_API_URL, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        console.log("API RESPONSE:", data);

        // ✅ Handle single object response
        if (!data || typeof data.question !== "string") {
          throw new Error("Unexpected API response format");
        }

        // Wrap into an array for internal consistency
        const cleaned: ApiQuestion[] = [
          {
            question: data.question.trim(),
            image: data.image ? data.image.trim() : FALLBACK_IMAGE,
          },
        ];

        setApiQuestions(cleaned);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e?.message || "Failed to load questions.");
        }
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  // --- Precompute Part 2 image (if any) ---
  const part2ImageUrl = useMemo(() => {
    if (apiQuestions.length > 0 && apiQuestions[0].image)
      return apiQuestions[0].image;
    return FALLBACK_IMAGE;
  }, [apiQuestions]);

  // --- Generate current question ---
  useEffect(() => {
    if (isLoading || error || currentQuestion) return;

    if (questionCount < 5) {
      // Always reuse the same single question from API
      const q = apiQuestions[0]?.question;
      if (q) onQuestionGenerated(q);
    } else if (questionCount === 5) {
      // Image description task
      setIsLoadingImage(true);
      setImageUrl(part2ImageUrl);
      onQuestionGenerated(IMAGE_TASK_PROMPT);
      setIsLoadingImage(false);
    }
  }, [
    isLoading,
    error,
    currentQuestion,
    questionCount,
    apiQuestions,
    onQuestionGenerated,
    part2ImageUrl,
  ]);

  // --- Loading / Error States ---
  if (isLoading || isLoadingImage) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          {isLoadingImage
            ? "Loading image for description task..."
            : "Fetching questions..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // --- UI Rendering ---
  const isImageQuestion = questionCount === 5;
  const questionType =
    questionCount < 5 ? "Part 1" : "Part 2 - Image Description";

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {questionCount + 1} of 6</span>
        <span className="bg-primary/10 px-2 py-1 rounded">{questionType}</span>
      </div>

      {/* Question Box */}
      <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
        <h2 className="mb-4">Your Speaking Question:</h2>
        <p className="leading-relaxed mb-4">{currentQuestion}</p>

        {/* Image Task */}
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

      {/* Instructions */}
      <div className="text-sm text-muted-foreground space-y-2">
        <p>
          <strong>Instructions:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Take a moment to think about your answer.</li>
          <li>Speak clearly and at a natural pace.</li>
          {questionCount < 5 ? (
            <li>Try to speak for 1–2 minutes and give specific examples.</li>
          ) : (
            <>
              <li>Speak for 2–3 minutes describing the image in detail.</li>
              <li>
                Include what you see, the setting, people/objects, and your
                impressions.
              </li>
            </>
          )}
          <li>Use specific examples and details in your response.</li>
        </ul>
      </div>
    </div>
  );
}
