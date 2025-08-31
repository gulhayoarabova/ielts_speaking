import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  Video, 
  FileText, 
  CheckCircle, 
  PlayCircle,
  ArrowLeft,
  Star,
  Globe,
  Headphones,
  Mic
} from "lucide-react";

const CourseDetail = () => {
  const { courseId } = useParams();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Generate 12 units with 3 sessions each and lessons
  const units = Array.from({ length: 12 }, (_, unitIndex) => ({
    id: `unit-${unitIndex + 1}`,
    title: `Unit ${unitIndex + 1}: ${getUnitTitle(unitIndex + 1)}`,
    description: getUnitDescription(unitIndex + 1),
    sessions: Array.from({ length: 3 }, (_, sessionIndex) => ({
      id: `session-${unitIndex + 1}-${sessionIndex + 1}`,
      title: `Session ${sessionIndex + 1}: ${getSessionTitle(unitIndex + 1, sessionIndex + 1)}`,
      duration: "45 mins",
      lessons: [
        {
          id: `lesson-${unitIndex + 1}-${sessionIndex + 1}-1`,
          title: "Lead-In",
          type: "video",
          duration: "15 mins",
          completed: false
        },
        {
          id: `lesson-${unitIndex + 1}-${sessionIndex + 1}-2`,
          title: "Presentation",
          type: "interactive",
          duration: "20 mins",
          completed: false
        },
        {
          id: `lesson-${unitIndex + 1}-${sessionIndex + 1}-3`,
          title: "Quick Tips",
          type: "video",
          duration: "18 mins",
          completed: false
        },
        {
          id: `lesson-${unitIndex + 1}-${sessionIndex + 1}-4`,
          title: "Improvement",
          type: "interactive",
          duration: "25 mins",
          completed: false
        },
        {
          id: `lesson-${unitIndex + 1}-${sessionIndex + 1}-5`,
          title: "Practice",
          type: "quiz",
          duration: "15 mins",
          completed: false
        },
        {
          id: `lesson-${unitIndex + 1}-${sessionIndex + 1}-6`,
          title: "Summary",
          type: "quiz",
          duration: "10 mins",
          completed: false
        }
      ]
    }))
  }));

  function getUnitTitle(unitNumber: number): string {
    const titles = [
      "Introduction to IELTS",
      "Basic Grammar & Vocabulary", 
      "Listening Fundamentals",
      "Reading Strategies",
      "Writing Task 1 Basics",
      "Speaking Confidence",
      "Advanced Grammar",
      "Academic Vocabulary",
      "Listening for Details",
      "Reading Comprehension",
      "Writing Task 2 Mastery",
      "Speaking Fluency & Final Review"
    ];
    return titles[unitNumber - 1] || `Advanced Topic ${unitNumber}`;
  }

  function getUnitDescription(unitNumber: number): string {
    const descriptions = [
      "Get familiar with IELTS format and requirements",
      "Build essential grammar foundation and expand vocabulary",
      "Learn basic listening techniques and note-taking skills",
      "Master skimming, scanning and reading comprehension",
      "Understand charts, graphs and data interpretation",
      "Build confidence in spoken English communication",
      "Advanced grammatical structures and complex sentences",
      "Academic words and phrases for higher band scores",
      "Practice identifying specific information in audio",
      "Advanced reading strategies for complex texts",
      "Essay writing techniques and argumentation skills",
      "Final speaking practice and comprehensive review"
    ];
    return descriptions[unitNumber - 1] || "Advanced IELTS preparation content";
  }

  function getSessionTitle(unitNumber: number, sessionNumber: number): string {
    const sessionTypes = ["Theory & Concepts", "Practical Application", "Assessment & Review"];
    return sessionTypes[sessionNumber - 1];
  }

  const toggleLessonComplete = (lessonId: string) => {
    const newCompleted = new Set(completedLessons);
    if (newCompleted.has(lessonId)) {
      newCompleted.delete(lessonId);
    } else {
      newCompleted.add(lessonId);
    }
    setCompletedLessons(newCompleted);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'interactive': return <PlayCircle className="w-4 h-4" />;
      case 'quiz': return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const courseInfo = {
    title: "Complete IELTS Preparation Course",
    description: "Master all four IELTS skills with our comprehensive preparation program designed to help you achieve your target band score.",
    duration: "6 months",
    students: "15,000+",
    rating: 4.9,
    price: "$299",
    features: [
      "36 comprehensive sessions across 12 units",
      "Video lessons with expert instructors",
      "Interactive practice exercises",
      "Regular assessments and feedback",
      "Mock tests with detailed analysis",
      "24/7 online support community",
      "Certificate of completion",
      "Lifetime access to materials"
    ],
    skills: [
      { name: "Listening", icon: Headphones, color: "bg-blue-500" },
      { name: "Reading", icon: BookOpen, color: "bg-green-500" },
      { name: "Writing", icon: FileText, color: "bg-purple-500" },
      { name: "Speaking", icon: Mic, color: "bg-orange-500" }
    ]
  };

  const totalLessons = units.reduce((total, unit) => 
    total + unit.sessions.reduce((sessionTotal, session) => sessionTotal + session.lessons.length, 0), 0
  );
  
  const completedCount = completedLessons.size;
  const progressPercentage = (completedCount / totalLessons) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
          
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{courseInfo.title}</h1>
              <p className="text-lg text-primary-foreground/90 mb-6">{courseInfo.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{courseInfo.students} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{courseInfo.duration} access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-current text-yellow-300" />
                  <span>{courseInfo.rating}/5 rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  <span>English</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {courseInfo.skills.map((skill) => (
                  <Badge key={skill.name} variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
                    <skill.icon className="w-3 h-3 mr-1" />
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-white/10 border-white/20 text-primary-foreground">
                <CardHeader>
                  <div className="text-3xl font-bold">{courseInfo.price}</div>
                  <CardDescription className="text-primary-foreground/80">One-time payment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="secondary" size="lg" className="w-full bg-white text-primary hover:bg-white/90">
                    Start Learning Now
                  </Button>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{completedCount}/{totalLessons} lessons</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-primary-foreground/80">
                      {Math.round(progressPercentage)}% complete
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Course Content</h2>
              <p className="text-muted-foreground mb-6">
                {units.length} units • {units.length * 3} sessions • {totalLessons} lessons
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {units.map((unit) => (
                <AccordionItem key={unit.id} value={unit.id} className="border border-border/50 rounded-lg">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <h3 className="font-semibold text-foreground">{unit.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{unit.description}</p>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {unit.sessions.length} sessions
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-4">
                      {unit.sessions.map((session, sessionIndex) => (
                        <div key={session.id} className="bg-secondary/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-foreground">{session.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {session.duration}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {session.lessons.map((lesson, lessonIndex) => (
                              <div 
                                key={lesson.id} 
                                className="flex items-center justify-between p-3 bg-background rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
                                onClick={() => {
                                  // Make first session lessons and all lesson 4 (Improvement) for listening course clickable
                                  if (sessionIndex === 0 || (courseId === 'listening' && lessonIndex === 3)) {
                                    const courseType = courseId || 'reading';
                                    const unitNumber = parseInt(unit.id.split('-')[1]);
                                    window.location.href = `/lesson/${courseType}/${unitNumber}/${sessionIndex + 1}/${lessonIndex + 1}`;
                                  } else {
                                    toggleLessonComplete(lesson.id);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    completedLessons.has(lesson.id) 
                                      ? 'bg-primary text-primary-foreground' 
                                      : 'bg-secondary text-muted-foreground'
                                  }`}>
                                    {completedLessons.has(lesson.id) ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : (
                                      getLessonIcon(lesson.type)
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground">{lesson.title}</div>
                                    <div className="text-sm text-muted-foreground capitalize">
                                      {lesson.type} • {lesson.duration}
                                    </div>
                                  </div>
                                </div>
                                <PlayCircle className="w-5 h-5 text-primary" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Course Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courseInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>IELTS Skills Covered</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courseInfo.skills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${skill.color} rounded-lg flex items-center justify-center`}>
                        <skill.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-foreground">{skill.name}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;