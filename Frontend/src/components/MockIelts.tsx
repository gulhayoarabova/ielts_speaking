import { Button } from "@/components/ui/button";
import { ExternalLink, TestTube, Clock, Award, Users } from "lucide-react";

const MockIelts = () => {
  return (
    <section className="py-20 bg-gradient-hero text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-foreground/20 rounded-full text-primary-foreground text-sm font-medium mb-8">
            <TestTube className="w-4 h-4" />
            Official Mock Test Platform
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Take Your <span className="text-primary-foreground">Free Mock IELTS Test</span>
          </h2>
          
          <p className="text-lg text-primary-foreground/90 mb-12 max-w-3xl mx-auto">
            Experience the real IELTS test environment with our official mock test platform. Get instant results and detailed feedback to improve your performance.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real Test Timing</h3>
              <p className="text-primary-foreground/80">Experience actual IELTS test duration and time pressure</p>
            </div>
            
            <div className="text-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-primary-foreground/80">Get your band scores immediately after completion</p>
            </div>
            
            <div className="text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Analysis</h3>
              <p className="text-primary-foreground/80">Detailed feedback from IELTS professionals</p>
            </div>
          </div>

          <div className="animate-fade-up">
            <a
              href="https://mock-ielts.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button 
                variant="secondary" 
                size="xl" 
                className="group hover:bg-primary-foreground hover:text-primary shadow-strong hover:shadow-strong"
              >
                Start Free Mock Test
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            
            <p className="text-sm text-primary-foreground/70 mt-4">
              No registration required • Completely free • Instant results
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MockIelts;