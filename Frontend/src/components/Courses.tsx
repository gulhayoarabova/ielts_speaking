import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BookOpen, Headphones, FileText, Mic, Users, Clock, Award } from "lucide-react";

const Courses = () => {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const fullPackage = {
    id: "full",
    title: "Complete IELTS Preparation Package",
    description: "Comprehensive training for all four IELTS skills in one complete package",
    price: "$299",
    duration: "6 months access",
    students: "10,000+",
    rating: 4.9,
    features: [
      "All 4 IELTS skills included",
      "216+ practice lessons",
      "AI-powered assessments",
      "Unlimited mock tests",
      "Expert feedback",
      "Certificate of completion"
    ],
    modules: ["Listening (12 units)", "Reading (12 units)", "Writing (12 units)", "Speaking (12 units)"],
    icon: Award,
    gradient: "bg-gradient-primary"
  };

  const individualCourses = [
    {
      id: "listening",
      title: "IELTS Listening",
      description: "Master listening skills with interactive exercises and real exam scenarios",
      price: "$99",
      duration: "2 months access",
      students: "5,000+",
      rating: 4.8,
      icon: Headphones,
      color: "bg-blue-500",
      modules: ["12 units", "36 sessions", "648 lessons"],
      features: [
        "Audio practice materials",
        "Accent variety training",
        "Note-taking techniques",
        "Real exam simulations"
      ]
    },
    {
      id: "reading",
      title: "IELTS Reading",
      description: "Develop reading comprehension and time management skills",
      price: "$99",
      duration: "2 months access",
      students: "4,800+",
      rating: 4.7,
      icon: BookOpen,
      color: "bg-green-500",
      modules: ["12 units", "36 sessions", "648 lessons"],
      features: [
        "Academic & General texts",
        "Speed reading techniques",
        "Question type strategies",
        "Vocabulary building"
      ]
    },
    {
      id: "writing",
      title: "IELTS Writing",
      description: "Perfect your writing skills for both Task 1 and Task 2",
      price: "$99",
      duration: "2 months access",
      students: "6,200+",
      rating: 4.9,
      icon: FileText,
      color: "bg-purple-500",
      modules: ["12 units", "36 sessions", "648 lessons"],
      features: [
        "Task 1 & Task 2 training",
        "Essay structure techniques",
        "Grammar improvement",
        "Sample answers analysis"
      ]
    },
    {
      id: "speaking",
      title: "IELTS Speaking",
      description: "Build confidence and fluency for the speaking test",
      price: "$99",
      duration: "2 months access",
      students: "5,500+",
      rating: 4.8,
      icon: Mic,
      color: "bg-orange-500",
      modules: ["12 units", "36 sessions", "648 lessons"],
      features: [
        "Interactive speaking practice",
        "Pronunciation training",
        "Confidence building",
        "Mock interviews"
      ]
    }
  ];

  const toggleExpand = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  return (
    <section id="courses" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Our <span className="text-gradient">Courses</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Choose from our comprehensive IELTS preparation courses designed to help you achieve your target score.
          </p>
        </div>

        {/* Full Package - Featured */}
        <div className="mb-12 animate-fade-up">
          <div className="relative bg-card rounded-3xl p-8 shadow-strong border-2 border-primary/20 hover:shadow-strong hover:scale-[1.02] transition-all duration-300">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold shadow-medium">
                MOST POPULAR
              </div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 ${fullPackage.gradient} rounded-2xl flex items-center justify-center`}>
                    <fullPackage.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{fullPackage.title}</h3>
                    <p className="text-muted-foreground">{fullPackage.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{fullPackage.students} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{fullPackage.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">{fullPackage.rating}/5</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {fullPackage.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => toggleExpand('full')}
                  className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
                >
                  <span className="font-medium">View Course Modules</span>
                  {expandedCourse === 'full' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {expandedCourse === 'full' && (
                  <div className="mt-4 p-4 bg-secondary/50 rounded-xl animate-fade-up">
                    <div className="grid md:grid-cols-2 gap-4">
                      {fullPackage.modules.map((module, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">{module}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Each unit contains 3 sessions, and each session includes 18 comprehensive lessons
                    </p>
                  </div>
                )}
              </div>
              
              <div className="text-center lg:text-right">
                <div className="text-4xl font-bold text-primary mb-2">{fullPackage.price}</div>
                <div className="text-sm text-muted-foreground mb-6">One-time payment</div>
                <Button variant="hero" size="lg" className="w-full lg:w-auto" asChild>
                  <a href="https://preview--genius-lesson-forge.lovable.app/courses">Start Learning Now</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Courses */}
        <div className="grid lg:grid-cols-2 gap-8">
          {individualCourses.map((course, index) => {
            const Icon = course.icon;
            return (
              <div
                key={course.id}
                className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 ${course.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-primary" />
                    <span className="text-xs text-muted-foreground">{course.students}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    <span className="text-xs text-muted-foreground">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-muted-foreground">{course.rating}/5</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {course.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => toggleExpand(course.id)}
                  className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors mb-4"
                >
                  <span className="text-sm font-medium">Course Structure</span>
                  {expandedCourse === course.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {expandedCourse === course.id && (
                  <div className="mb-4 p-3 bg-secondary/50 rounded-lg animate-fade-up">
                    <div className="space-y-2">
                      {course.modules.map((module, moduleIndex) => (
                        <div key={moduleIndex} className="flex items-center gap-2">
                          <BookOpen className="w-3 h-3 text-primary" />
                          <span className="text-xs text-foreground">{module}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">{course.price}</div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/course/${course.id}`}>Enroll Now</a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Courses;