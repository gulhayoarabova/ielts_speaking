import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, Headphones, BookOpen, PenTool, Mic, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import SpeakingLesson from "@/components/SpeakingLesson";
import ListeningLesson from "@/components/ListeningLesson";

const Lesson = () => {
  const { courseId, unitId, sessionId, lessonId } = useParams();
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showContent, setShowContent] = useState(true);

  // Check if this is a Presentation lesson (lesson 2 in the sequence)
  const isPresentationLesson = lessonId === '2';
  
  // Check if this is a Tips lesson (lesson 3 in the sequence)
  const isTipsLesson = lessonId === '3';
  
  // Check if this is a speaking improvement lesson (lesson 4 for improvement)
  const isSpeakingImprovementLesson = courseId === 'speaking' && lessonId === '4';
  
  // Check if this is a listening improvement lesson (lesson 4 for improvement)
  const isListeningImprovementLesson = courseId === 'listening' && lessonId === '4';

  // Sample words for pronunciation practice
  const speakingWords = [
    "photography", "extraordinary", "development", "university", "opportunity", 
    "architecture", "pronunciation", "responsibility", "communication", "environment"
  ];

  const getQuestionData = () => {
    const courseQuestions = {
      reading: {
        icon: BookOpen,
        color: "bg-blue-500",
        subject: "Academic Vocabulary",
        question: "Choose the correct meaning of 'analyze'",
        options: [
          "to examine in detail",
          "to memorize completely", 
          "to ignore purposefully",
          "to write quickly"
        ],
        correctAnswer: 1
      },
      writing: {
        icon: PenTool,
        color: "bg-purple-500",
        subject: "Essay Structure",
        question: "What is the main purpose of an introduction paragraph?",
        options: [
          "to provide detailed examples",
          "to introduce the topic and thesis statement",
          "to conclude the argument",
          "to list all references"
        ],
        correctAnswer: 2
      },
      listening: {
        icon: Headphones,
        color: "bg-green-500", 
        subject: "Audio Comprehension",
        question: "What should you do first when listening to an audio passage?",
        options: [
          "start writing immediately",
          "read the questions first",
          "close your eyes and focus",
          "take notes on everything"
        ],
        correctAnswer: 2
      },
      speaking: {
        icon: Mic,
        color: "bg-orange-500",
        subject: "Pronunciation Practice",
        question: "Which technique helps improve English pronunciation?",
        options: [
          "speaking very fast",
          "mimicking native speakers",
          "avoiding difficult words",
          "speaking only in your head"
        ],
        correctAnswer: 2
      }
    };

  return courseQuestions[courseId as keyof typeof courseQuestions] || courseQuestions.reading;
  };

  const getPresentationContent = () => {
    const contentMap = {
      reading: {
        title: "Reading: True/False/Not Given Questions",
        content: [
          {
            type: "section",
            title: "Understanding Question Types",
            text: "In IELTS Reading, you'll encounter three types of responses for statements about the passage:"
          },
          {
            type: "definition",
            title: "TRUE",
            icon: CheckCircle,
            color: "text-green-600",
            text: "The statement agrees with the information in the passage."
          },
          {
            type: "definition", 
            title: "FALSE",
            icon: XCircle,
            color: "text-red-600",
            text: "The statement contradicts the information in the passage."
          },
          {
            type: "definition",
            title: "NOT GIVEN",
            icon: HelpCircle,
            color: "text-gray-600", 
            text: "The information is not provided in the passage - you cannot determine if it's true or false."
          },
          {
            type: "tip",
            title: "Key Strategy",
            text: "Don't use your own knowledge! Base your answers only on what's written in the passage. If the passage doesn't mention something, the answer is 'Not Given'."
          },
          {
            type: "example",
            title: "Example",
            text: "Passage: 'The library opens at 9 AM on weekdays.'\nStatement: 'The library opens at 9 AM on Saturday.'\nAnswer: NOT GIVEN (Saturday isn't mentioned)"
          }
        ]
      },
      writing: {
        title: "Writing: Essay Structure and Development",
        content: [
          {
            type: "section",
            title: "IELTS Writing Task Structure",
            text: "Learn the essential components of a high-scoring IELTS essay."
          },
          {
            type: "definition",
            title: "Introduction",
            icon: BookOpen,
            color: "text-blue-600",
            text: "Paraphrase the question and present your thesis statement clearly."
          },
          {
            type: "definition",
            title: "Body Paragraphs", 
            icon: PenTool,
            color: "text-purple-600",
            text: "Develop your main ideas with examples and explanations."
          },
          {
            type: "definition",
            title: "Conclusion",
            icon: CheckCircle,
            color: "text-green-600",
            text: "Summarize your main points and restate your position."
          }
        ]
      },
      listening: {
        title: "Listening: Note-taking and Prediction Strategies", 
        content: [
          {
            type: "section",
            title: "Effective Listening Techniques",
            text: "Master these strategies to improve your IELTS Listening performance."
          },
          {
            type: "definition",
            title: "Prediction",
            icon: BookOpen,
            color: "text-blue-600",
            text: "Read questions before listening to predict what information you need."
          },
          {
            type: "definition",
            title: "Key Words",
            icon: Headphones,
            color: "text-green-600", 
            text: "Listen for keywords and synonyms that signal important information."
          }
        ]
      },
      speaking: {
        title: "Speaking: Fluency and Coherence",
        content: [
          {
            type: "section", 
            title: "Speaking Assessment Criteria",
            text: "Understand how your speaking is evaluated in IELTS."
          },
          {
            type: "definition",
            title: "Fluency",
            icon: Mic,
            color: "text-orange-600",
            text: "Speak smoothly without too many pauses or hesitations."
          },
          {
            type: "definition",
            title: "Coherence", 
            icon: BookOpen,
            color: "text-blue-600",
            text: "Organize your ideas logically and use linking words effectively."
          }
        ]
      }
    };

    return contentMap[courseId as keyof typeof contentMap] || contentMap.reading;
  };

  const getTipsContent = () => {
    const tipsMap = {
      reading: {
        title: "IELTS Reading: Essential Tips & Strategies",
        tips: [
          {
            number: "01",
            title: "Skim First, Read Later",
            description: "Spend 2-3 minutes skimming the entire passage to get the general idea before attempting questions.",
            icon: BookOpen,
            color: "bg-blue-500"
          },
          {
            number: "02", 
            title: "Keywords are Key",
            description: "Underline keywords in questions and look for synonyms or paraphrases in the passage.",
            icon: CheckCircle,
            color: "bg-green-500"
          },
          {
            number: "03",
            title: "Follow the Order",
            description: "Most questions follow the order of information in the passage. Use this to your advantage.",
            icon: ArrowLeft,
            color: "bg-purple-500"
          },
          {
            number: "04",
            title: "Don't Leave Blanks",
            description: "There's no penalty for wrong answers. Always guess if you're running out of time.",
            icon: HelpCircle,
            color: "bg-orange-500"
          },
          {
            number: "05",
            title: "Time Management",
            description: "Allocate 20 minutes per passage. Don't spend too long on difficult questions.",
            icon: GraduationCap,
            color: "bg-red-500"
          },
          {
            number: "06",
            title: "True/False/Not Given Strategy",
            description: "Base answers only on the passage. If info isn't mentioned, it's 'Not Given'.",
            icon: XCircle,
            color: "bg-yellow-500"
          },
          {
            number: "07",
            title: "Practice Active Reading",
            description: "Read with purpose. Ask yourself what each paragraph is about as you read.",
            icon: Headphones,
            color: "bg-indigo-500"
          },
          {
            number: "08",
            title: "Review Your Answers",
            description: "Save 2-3 minutes at the end to review and transfer answers to the answer sheet.",
            icon: CheckCircle,
            color: "bg-teal-500"
          }
        ]
      },
      writing: {
        title: "IELTS Writing: Expert Tips for High Scores",
        tips: [
          {
            number: "01",
            title: "Plan Before You Write",
            description: "Spend 5 minutes planning your essay structure and main points before writing.",
            icon: PenTool,
            color: "bg-purple-500"
          },
          {
            number: "02",
            title: "Address All Parts",
            description: "Make sure you answer all parts of the question fully. Missing parts = lower score.",
            icon: CheckCircle,
            color: "bg-green-500"
          },
          {
            number: "03",
            title: "Use Linking Words",
            description: "Connect your ideas with cohesive devices: however, furthermore, in addition, on the other hand.",
            icon: BookOpen,
            color: "bg-blue-500"
          },
          {
            number: "04",
            title: "Vary Your Vocabulary",
            description: "Use synonyms and avoid repetition. Show your range of vocabulary to examiners.",
            icon: GraduationCap,
            color: "bg-orange-500"
          },
          {
            number: "05",
            title: "Write Clear Conclusions",
            description: "Summarize your main points and restate your position clearly in the conclusion.",
            icon: ArrowLeft,
            color: "bg-red-500"
          },
          {
            number: "06",
            title: "Check Word Count",
            description: "Task 1: 150+ words, Task 2: 250+ words. Under the limit = automatic deduction.",
            icon: HelpCircle,
            color: "bg-yellow-500"
          },
          {
            number: "07",
            title: "Practice Time Management",
            description: "Task 1: 20 minutes, Task 2: 40 minutes. Task 2 is worth more, so prioritize it.",
            icon: Headphones,
            color: "bg-indigo-500"
          },
          {
            number: "08",
            title: "Proofread Your Work",
            description: "Save 3-5 minutes to check grammar, spelling, and punctuation errors.",
            icon: CheckCircle,
            color: "bg-teal-500"
          }
        ]
      },
      listening: {
        title: "IELTS Listening: Proven Success Strategies",
        tips: [
          {
            number: "01",
            title: "Read Questions First",
            description: "Use the preparation time to read questions and predict what you'll hear.",
            icon: Headphones,
            color: "bg-green-500"
          },
          {
            number: "02",
            title: "Listen for Keywords",
            description: "Focus on stressed words, dates, numbers, and proper nouns for key information.",
            icon: CheckCircle,
            color: "bg-blue-500"
          },
          {
            number: "03",
            title: "Follow the Speakers",
            description: "Pay attention to who is speaking and their role (student, professor, receptionist, etc.).",
            icon: BookOpen,
            color: "bg-purple-500"
          },
          {
            number: "04",
            title: "Write as You Listen",
            description: "Don't wait until the end. Write answers as you hear them to avoid forgetting.",
            icon: PenTool,
            color: "bg-orange-500"
          },
          {
            number: "05",
            title: "Watch for Distractors",
            description: "Speakers often mention wrong information first, then correct it. Listen carefully.",
            icon: XCircle,
            color: "bg-red-500"
          },
          {
            number: "06",
            title: "Use Context Clues",
            description: "If you miss an answer, use the context and other speakers' responses to guess.",
            icon: HelpCircle,
            color: "bg-yellow-500"
          },
          {
            number: "07",
            title: "Check Spelling",
            description: "Incorrect spelling = wrong answer. Double-check names, places, and technical terms.",
            icon: GraduationCap,
            color: "bg-indigo-500"
          },
          {
            number: "08",
            title: "Transfer Answers Carefully",
            description: "You get 10 minutes to transfer. Use this time to check spelling and grammar.",
            icon: ArrowLeft,
            color: "bg-teal-500"
          }
        ]
      },
      speaking: {
        title: "IELTS Speaking: Confidence Building Tips",
        tips: [
          {
            number: "01",
            title: "Extend Your Answers",
            description: "Don't give one-word answers. Explain, give examples, and elaborate on your points.",
            icon: Mic,
            color: "bg-orange-500"
          },
          {
            number: "02",
            title: "Use Natural Fillers",
            description: "Use 'well', 'actually', 'I mean' naturally, but don't overuse them.",
            icon: CheckCircle,
            color: "bg-green-500"
          },
          {
            number: "03",
            title: "Practice Topic Vocabulary",
            description: "Prepare vocabulary for common topics: family, hobbies, travel, technology, environment.",
            icon: BookOpen,
            color: "bg-blue-500"
          },
          {
            number: "04",
            title: "Think Out Loud",
            description: "It's okay to take a moment to think. Say 'That's an interesting question' to buy time.",
            icon: GraduationCap,
            color: "bg-purple-500"
          },
          {
            number: "05",
            title: "Use Personal Examples",
            description: "Make your answers interesting with personal stories and specific examples.",
            icon: HelpCircle,
            color: "bg-red-500"
          },
          {
            number: "06",
            title: "Correct Yourself Naturally",
            description: "If you make a mistake, correct it naturally: 'Sorry, I mean...' or 'Actually...'",
            icon: XCircle,
            color: "bg-yellow-500"
          },
          {
            number: "07",
            title: "Maintain Eye Contact",
            description: "Look at the examiner when speaking. It shows confidence and engagement.",
            icon: Headphones,
            color: "bg-indigo-500"
          },
          {
            number: "08",
            title: "Stay Calm and Confident",
            description: "Smile, speak clearly, and don't worry about perfect grammar. Communication is key.",
            icon: ArrowLeft,
            color: "bg-teal-500"
          }
        ]
      }
    };

    return tipsMap[courseId as keyof typeof tipsMap] || tipsMap.reading;
  };

  const questionData = getQuestionData();
  const presentationContent = getPresentationContent();
  const tipsContent = getTipsContent();
  const Icon = questionData.icon;

  const isCorrect = selectedAnswer === questionData.correctAnswer;

  const handleCheck = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
    }
  };

  const handleNext = () => {
    if (isPresentationLesson && showContent) {
      setShowContent(false);
    } else {
      navigate(`/course/${courseId}`);
    }
  };

  const handleSkip = () => {
    // Navigate to next lesson or back to course
    navigate(`/course/${courseId}`);
  };

  // Get course title for header
  const getCourseTitle = () => {
    const titles = {
      reading: "Reading Practice",
      writing: "Writing Practice", 
      listening: "Listening Practice",
      speaking: "Speaking Practice"
    };
    return titles[courseId as keyof typeof titles] || "Practice";
  };

  // Calculate progress based on lesson/session
  const calculateProgress = () => {
    const totalLessons = 4; // 4 lessons per session typically
    const currentLessonNum = parseInt(lessonId || '1');
    return (currentLessonNum / totalLessons) * 100;
  };

  // Common Header Component
  const CourseHeader = () => (
    <div className="bg-gradient-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link 
            to={`/course/${courseId}`}
            className="flex items-center gap-2 text-primary-foreground hover:text-primary-foreground/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Course
          </Link>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{getCourseTitle()}</h1>
          <div className="w-full bg-primary-foreground/20 rounded-full h-2 max-w-md mx-auto">
            <div 
              className="bg-primary-foreground h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // If this is a listening improvement lesson, render the ListeningLesson component
  if (isListeningImprovementLesson) {
    return (
      <div className="min-h-screen bg-background">
        <CourseHeader />
        <ListeningLesson 
          onComplete={handleSkip}
          onSkip={handleSkip}
        />
      </div>
    );
  }

  // If this is a speaking improvement lesson, render the SpeakingLesson component
  if (isSpeakingImprovementLesson) {
    const randomWord = speakingWords[Math.floor(Math.random() * speakingWords.length)];
    return (
      <div className="min-h-screen bg-background">
        <CourseHeader />
        <div className="py-8">
          <SpeakingLesson 
            word={randomWord}
            onComplete={() => navigate(`/course/${courseId}`)}
            onSkip={() => navigate(`/course/${courseId}`)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CourseHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isPresentationLesson && showContent ? (
            // Presentation Content View
            <>
              {/* Subject Header */}
              <div className="text-center mb-8">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Presentation Lesson
                </div>
              </div>
              
              {/* Content Title */}
              <div className="text-center mb-12">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {presentationContent.title}
                </h1>
              </div>

              {/* Character with Speech Bubble */}
              <div className="flex justify-center mb-16">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm shadow-md">
                    Let's learn!
                  </div>
                </div>
              </div>

              {/* Educational Content */}
              <div className="max-w-3xl mx-auto space-y-8">
                {presentationContent.content.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {item.type === 'section' && (
                      <div className="p-6 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h2>
                        <p className="text-gray-700 text-lg leading-relaxed">{item.text}</p>
                      </div>
                    )}
                    
                    {item.type === 'definition' && (
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {item.icon && (
                            <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center ${item.color}`}>
                              <item.icon className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-700 leading-relaxed">{item.text}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type === 'tip' && (
                      <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400">
                        <h3 className="text-lg font-bold text-yellow-800 mb-2">💡 {item.title}</h3>
                        <p className="text-yellow-700 leading-relaxed">{item.text}</p>
                      </div>
                    )}

                    {item.type === 'example' && (
                      <div className="p-6 bg-blue-50">
                        <h3 className="text-lg font-bold text-blue-800 mb-3">📝 {item.title}</h3>
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <pre className="text-blue-700 text-sm whitespace-pre-wrap font-mono">{item.text}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : isTipsLesson ? (
            // Tips Content View
            <>
              {/* Subject Header */}
              <div className="text-center mb-8">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Quick Tips Session
                </div>
              </div>
              
              {/* Content Title */}
              <div className="text-center mb-12">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {tipsContent.title}
                </h1>
              </div>

              {/* Character with Speech Bubble */}
              <div className="flex justify-center mb-16">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm shadow-md">
                    Pro tips!
                  </div>
                </div>
              </div>

              {/* Tips Grid - Interactive Flip Cards */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tipsContent.tips.map((tip, index) => {
                    const [isFlipped, setIsFlipped] = useState(false);
                    
                    // Extended detailed info for each tip
                    const getDetailedInfo = (tipTitle: string, courseId: string) => {
                      const detailedTips: Record<string, Record<string, string>> = {
                        reading: {
                          "Skim First, Read Later": "Start by reading the title, headings, and first sentence of each paragraph. Look for topic sentences and concluding statements. This gives you the passage structure before diving into details. Practice this technique with different text types to build speed.",
                          "Keywords are Key": "Circle or underline important words in questions. Look for synonyms like 'enormous/huge', 'decrease/decline', 'advantages/benefits'. The IELTS often uses paraphrasing, so train your eye to spot these connections quickly.",
                          "Follow the Order": "Questions usually appear in the same sequence as information in the passage. If question 5 asks about paragraph 2, question 6 likely refers to paragraph 3 or later. Use this pattern to navigate efficiently.",
                          "Don't Leave Blanks": "Every blank answer is a guaranteed loss. Even random guessing gives you a 25% chance with multiple choice. In the last 2 minutes, quickly fill any remaining blanks with educated guesses based on context.",
                          "Time Management": "Set your watch/phone timer: 20 minutes per passage. If stuck on a question for over 1 minute, move on. Mark difficult questions and return if time permits. Practice this timing religiously.",
                          "True/False/Not Given Strategy": "TRUE = statement matches passage exactly. FALSE = statement contradicts passage. NOT GIVEN = no information provided either way. Don't use outside knowledge - only what's written in the text.",
                          "Practice Active Reading": "As you read each paragraph, mentally summarize it in 3-5 words. Ask yourself: 'What is the main point here?' This keeps you engaged and helps with comprehension questions later.",
                          "Review Your Answers": "In the final minutes, transfer answers carefully to the answer sheet. Check spelling of names and places. Ensure you haven't skipped any numbers and that your answers align with the question numbers."
                        },
                        writing: {
                          "Plan Before You Write": "Spend 5 minutes creating a mind map or outline. For Task 2: Introduction (paraphrase + thesis), Body Paragraph 1 (main idea + examples), Body Paragraph 2 (contrasting view + examples), Conclusion (summarize + opinion).",
                          "Address All Parts": "Task 1: Describe trends, compare data, note significant features. Task 2: If asked to 'discuss both views and give opinion', you MUST do both. Missing any part results in automatic deduction regardless of language quality.",
                          "Use Linking Words": "Learn various connectors: Addition (furthermore, moreover), Contrast (however, nevertheless), Cause/Effect (consequently, as a result), Examples (for instance, such as). Don't overuse 'and', 'but', 'so'.",
                          "Vary Your Vocabulary": "Instead of 'good': excellent, outstanding, remarkable. Instead of 'bad': detrimental, problematic, concerning. Keep a vocabulary journal with synonyms for common words you use frequently.",
                          "Write Clear Conclusions": "Restate your thesis using different words. Summarize your main arguments briefly. End with a prediction, recommendation, or thought-provoking statement that leaves impact on the examiner.",
                          "Check Word Count": "Learn to estimate: 150 words ≈ 6-8 lines, 250 words ≈ 10-12 lines (depends on handwriting). Counting every word wastes time. Practice estimating, then verify with actual counts during preparation.",
                          "Practice Time Management": "Task 1: 5 min planning + 15 min writing. Task 2: 5 min planning + 35 min writing. Task 2 carries double the weight, so if running short on time, prioritize completing Task 2 properly.",
                          "Proofread Your Work": "Check for: subject-verb agreement, article usage (a/an/the), plural forms, verb tenses, and spelling. Read your essay backwards sentence by sentence to catch errors you might miss when reading normally."
                        },
                        listening: {
                          "Read Questions First": "During preparation time, scan all questions in the section. Underline key words and predict what type of answer you need (number, name, date, etc.). This primes your brain for relevant information.",
                          "Listen for Keywords": "Pay special attention to: capital letters (names, places), numbers and dates, superlatives (biggest, most important), and stressed words. These often contain the answers you're looking for.",
                          "Follow the Speakers": "Note who's speaking: student asking questions, receptionist giving information, professor explaining concepts. Understanding roles helps predict what information they'll provide.",
                          "Write as You Listen": "Don't wait for pauses to write answers. Write while listening, as the audio doesn't repeat. Use abbreviations and shorthand, then clarify during the 10-minute transfer time.",
                          "Watch for Distractors": "Speakers often correct themselves: 'The lecture is on Monday... actually, let me check... it's on Tuesday.' Always listen for the final, confirmed information, not the first thing mentioned.",
                          "Use Context Clues": "If you miss an answer, use surrounding information to make educated guesses. Other speakers' reactions or follow-up comments often provide hints about what was said.",
                          "Check Spelling": "Common spelling mistakes: proper nouns (Edinburgh not Edinburg), double letters (accommodation not accomodation), British vs American spelling. When in doubt, choose the British spelling.",
                          "Transfer Answers Carefully": "Use the 10 minutes wisely: check spelling, ensure answers fit grammatically, verify word limits (no more than 3 words means exactly 3 words or fewer), and check numbering sequence."
                        },
                        speaking: {
                          "Extend Your Answers": "For Part 1, aim for 2-3 sentences per answer. For Part 3, aim for 3-4 sentences minimum. Use the PREP method: Point (main idea) → Reason (why) → Example (specific) → Point (conclude).",
                          "Use Natural Fillers": "Appropriate fillers: 'Well, let me think...', 'That's an interesting question...', 'Actually, I'd say...', 'To be honest...'. Avoid excessive 'um', 'er', 'like' which sound unnatural.",
                          "Practice Topic Vocabulary": "Prepare 5-10 advanced vocabulary items for each topic: Family (extended family, upbringing, siblings), Travel (itinerary, destination, accommodation), Technology (innovative, cutting-edge, revolutionize).",
                          "Think Out Loud": "It's perfectly acceptable to say: 'Let me think about that for a moment...', 'That's quite a complex question...', 'I've never really considered that before, but I think...' This shows natural communication.",
                          "Use Personal Examples": "Make answers memorable with specific details: Instead of 'I like reading', say 'I'm currently reading a fascinating biography about Steve Jobs, which has given me insights into innovation and leadership.'",
                          "Correct Yourself Naturally": "If you make a mistake, self-correct naturally: 'I went to university in 2020... sorry, I mean 2021.' Don't panic or stop speaking. Native speakers self-correct too.",
                          "Maintain Eye Contact": "Look at the examiner while speaking to show confidence and engagement. It's okay to look away briefly while thinking, but return eye contact when making your points.",
                          "Stay Calm and Confident": "Remember: the examiner wants you to succeed. Smile, speak at normal pace, don't rush. If you don't understand a question, politely ask: 'Could you please repeat that?' or 'I'm not sure I understand the question.'"
                        }
                      };
                      return detailedTips[courseId]?.[tipTitle] || tip.description;
                    };

                    // Sticker colors with gradients for variety
                    const stickerColors = [
                      "bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600",
                      "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600", 
                      "bg-gradient-to-br from-green-400 via-green-500 to-green-600",
                      "bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600",
                      "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600",
                      "bg-gradient-to-br from-red-400 via-red-500 to-red-600",
                      "bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600",
                      "bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600"
                    ];
                    
                    return (
                      <div key={index} className="h-80 perspective-1000">
                        <div 
                          className={`relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${
                            isFlipped ? 'rotate-y-180' : ''
                          }`}
                          onClick={() => setIsFlipped(!isFlipped)}
                          style={{
                            transformStyle: 'preserve-3d'
                          }}
                        >
                          {/* Front Side - Sticker Style */}
                          <div 
                            className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-xl ${
                              stickerColors[index % stickerColors.length]
                            } border-4 border-white transform hover:scale-105 transition-transform duration-200`}
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateX(0deg)'
                            }}
                          >
                            <div className="p-6 h-full flex flex-col justify-between text-white relative overflow-hidden">
                              {/* Decorative elements for sticker feel */}
                              <div className="absolute top-2 right-2 w-4 h-4 bg-white/20 rounded-full"></div>
                              <div className="absolute bottom-2 left-2 w-3 h-3 bg-white/20 rounded-full"></div>
                              
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                  <tip.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                                  {tip.number}
                                </span>
                              </div>
                              
                              <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-white mb-3 leading-tight">{tip.title}</h3>
                                <p className="text-white/90 text-sm leading-relaxed line-clamp-4">{tip.description}</p>
                              </div>
                              
                              <div className="text-center">
                                <span className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                  Click for details →
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Back Side - Detailed Info */}
                          <div 
                            className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-xl bg-white border-4 border-gray-100 rotate-y-180 overflow-hidden"
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)'
                            }}
                          >
                            <div className="p-6 h-full flex flex-col">
                              <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 ${tip.color} rounded-xl flex items-center justify-center`}>
                                  <tip.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {tip.number}
                                  </span>
                                  <h3 className="text-lg font-bold text-gray-900 mt-1">{tip.title}</h3>
                                </div>
                              </div>
                              
                              <div className="flex-1 overflow-y-auto">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {getDetailedInfo(tip.title, courseId as string)}
                                </p>
                              </div>
                              
                              <div className="text-center mt-4">
                                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                  ← Click to flip back
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            // Question View (for all lessons or after Next is pressed in Presentation)
            <>
              {/* Subject Header */}
              <div className="text-center mb-8">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {questionData.subject}
                </div>
              </div>
              
              {/* Question Title */}
              <div className="text-center mb-12">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {questionData.question}
                </h1>
              </div>

              {/* Character with Speech Bubble */}
              <div className="flex justify-center mb-16">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm shadow-md">
                    Let's practice!
                  </div>
                </div>
              </div>

              {/* Answer Options */}
              <div className="max-w-2xl mx-auto space-y-4 mb-8">
                {questionData.options.map((option, index) => (
                  <div 
                    key={index}
                    className={`px-6 py-4 rounded-xl border-2 cursor-pointer transition-all duration-200 shadow-sm ${
                      selectedAnswer === index + 1 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    } ${
                      showResult && selectedAnswer === index + 1
                        ? isCorrect 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-red-400 bg-red-50'
                        : ''
                    } ${
                      showResult && index + 1 === questionData.correctAnswer && selectedAnswer !== questionData.correctAnswer
                        ? 'border-green-400 bg-green-50'
                        : ''
                    }`}
                    onClick={() => !showResult && setSelectedAnswer(index + 1)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700 border border-gray-200">
                        {index + 1}
                      </div>
                      <span className="text-lg font-medium text-gray-900">{option}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Result Message */}
              {showResult && (
                <div className="max-w-2xl mx-auto mb-8">
                  <div className={`p-6 rounded-xl text-center shadow-md ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`text-2xl font-bold mb-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '🎉 Excellent!' : '😔 Incorrect'}
                    </div>
                    <p className="text-gray-700 text-lg">
                      {isCorrect 
                        ? 'Great job! You got the right answer.' 
                        : `The correct answer is: "${questionData.options[questionData.correctAnswer - 1]}"`
                      }
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sticky Footer with Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center">
            {isPresentationLesson && showContent ? (
              // Presentation content view buttons
              <>
                <button 
                  onClick={handleSkip}
                  className="px-8 py-3 text-gray-500 hover:text-gray-700 font-bold text-lg uppercase tracking-wide transition-colors"
                >
                  Skip
                </button>
                <button 
                  onClick={handleNext}
                  className="px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg uppercase tracking-wide rounded-xl transition-all duration-200 shadow-lg"
                >
                  Next
                </button>
              </>
            ) : isTipsLesson ? (
              // Tips content view buttons
              <>
                <button 
                  onClick={handleSkip}
                  className="px-8 py-3 text-gray-500 hover:text-gray-700 font-bold text-lg uppercase tracking-wide transition-colors"
                >
                  Skip
                </button>
                <button 
                  onClick={handleNext}
                  className="px-12 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-lg uppercase tracking-wide rounded-xl transition-all duration-200 shadow-lg"
                >
                  Continue
                </button>
              </>
            ) : (
              // Question view buttons  
              <>
                <button 
                  onClick={handleSkip}
                  className="px-8 py-3 text-gray-500 hover:text-gray-700 font-bold text-lg uppercase tracking-wide transition-colors"
                >
                  {showResult ? 'Continue' : 'Skip'}
                </button>
                {!showResult && (
                  <button 
                    onClick={handleCheck}
                    disabled={selectedAnswer === null}
                    className="px-12 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg uppercase tracking-wide rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  >
                    Check
                  </button>
                )}
                {showResult && (
                  <button 
                    onClick={handleNext}
                    className="px-12 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg uppercase tracking-wide rounded-xl transition-all duration-200 shadow-lg"
                  >
                    Continue
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;