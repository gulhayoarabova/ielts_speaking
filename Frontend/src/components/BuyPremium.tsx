import { Button } from "@/components/ui/button";
import { Crown, Check, Zap, Shield, Headphones, Award, Users, ExternalLink } from "lucide-react";

const BuyPremium = () => {
  const features = [
    "Access to all 216+ premium lessons",
    "Unlimited AI-powered mock tests",
    "Personalized study plans",
    "Expert feedback on writing & speaking",
    "Priority customer support",
    "Downloadable practice materials",
    "Progress tracking & analytics",
    "Certificate of completion"
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Faster Results",
      description: "Premium students achieve target scores 40% faster"
    },
    {
      icon: Shield,
      title: "Guaranteed Success",
      description: "100% money-back guarantee if you don't improve"
    },
    {
      icon: Headphones,
      title: "Expert Support",
      description: "Direct access to IELTS professionals"
    },
    {
      icon: Award,
      title: "Proven Method",
      description: "95% success rate among premium students"
    }
  ];

  return (
    <section id="premium" className="py-20 bg-gradient-hero text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-foreground/20 rounded-full text-primary-foreground text-sm font-medium mb-8">
            <Crown className="w-4 h-4" />
            Premium Membership
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Unlock Your <span className="text-primary-foreground">IELTS Potential</span>
          </h2>
          
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Join thousands of successful students who achieved their dream IELTS scores with our premium features and expert guidance.
          </p>

          {/* Pricing Card */}
          <div className="max-w-lg mx-auto mb-16">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-8 border-2 border-primary-foreground/20 shadow-strong animate-fade-up">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Crown className="w-8 h-8 text-amber-400" />
                <span className="text-2xl font-bold">Premium Access</span>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">$299</div>
                <div className="text-primary-foreground/80">One-time payment</div>
                <div className="text-sm text-primary-foreground/60">6 months full access</div>
              </div>
              
              <div className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-primary-foreground/90 text-left">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="secondary" 
                size="xl" 
                className="w-full hover:bg-primary-foreground hover:text-primary shadow-strong group"
              >
                Get Premium Access
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-xs text-primary-foreground/70 mt-4">
                30-day money-back guarantee • Secure payment • Instant access
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="text-center animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-primary-foreground/80 text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Testimonial */}
        <div className="text-center animate-fade-up">
          <div className="max-w-4xl mx-auto bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/20">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Award key={star} className="w-5 h-5 text-amber-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl font-medium text-primary-foreground mb-4">
              "IELTS PREP Course premium helped me achieve Band 8.5 in just 3 months. The AI feedback and expert support made all the difference!"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-primary-foreground">Sarah Chen</div>
                <div className="text-sm text-primary-foreground/70">Medical Student, Canada</div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16 animate-fade-up">
          <Button 
            variant="secondary" 
            size="xl" 
            className="hover:bg-primary-foreground hover:text-primary shadow-strong group"
          >
            Start Your Premium Journey Today
            <Crown className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BuyPremium;