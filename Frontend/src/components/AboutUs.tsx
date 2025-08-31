import studentsImage from "@/assets/students-studying.jpg";
import expertsImage from "@/assets/ielts-experts.jpg";
import { CheckCircle, Users, BookOpen, Award } from "lucide-react";

const AboutUs = () => {
  return (
    <section id="about" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            About <span className="text-gradient">IELTS PREP Course</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Automated learning platform that helps you to ace in your IELTS exam with methodology that experts in IELTS have prepared.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Left Content */}
          <div className="animate-fade-up">
            <div className="rounded-2xl overflow-hidden shadow-medium">
              <img
                src={studentsImage}
                alt="Students studying IELTS together"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="animate-slide-in-right">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Innovative Learning Experience
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Our platform combines cutting-edge AI technology with proven IELTS preparation methods to deliver personalized learning experiences that adapt to your unique needs and pace.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-foreground">Personalized AI-powered learning paths</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-foreground">Expert-crafted methodology</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-foreground">Real-time performance tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-foreground">24/7 learning accessibility</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="lg:order-2 animate-fade-up">
            <div className="rounded-2xl overflow-hidden shadow-medium">
              <img
                src={expertsImage}
                alt="IELTS experts and teachers"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:order-1 animate-slide-in-right">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Expert IELTS Methodology
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Our curriculum is developed by certified IELTS experts with years of teaching experience and proven track records of helping students achieve their target scores.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-card rounded-xl shadow-soft">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-lg font-semibold text-foreground">Expert Team</div>
                <div className="text-sm text-muted-foreground">Certified IELTS professionals</div>
              </div>
              <div className="text-center p-4 bg-card rounded-xl shadow-soft">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-lg font-semibold text-foreground">Proven Method</div>
                <div className="text-sm text-muted-foreground">Research-backed approach</div>
              </div>
              <div className="text-center p-4 bg-card rounded-xl shadow-soft">
                <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-lg font-semibold text-foreground">High Accuracy</div>
                <div className="text-sm text-muted-foreground">Precise assessment</div>
              </div>
              <div className="text-center p-4 bg-card rounded-xl shadow-soft">
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-lg font-semibold text-foreground">Quality</div>
                <div className="text-sm text-muted-foreground">Premium content</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;