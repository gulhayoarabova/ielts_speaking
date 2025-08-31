import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import Testimonials from "@/components/Testimonials";
import JoinUs from "@/components/JoinUs";
import FAQ from "@/components/FAQ";

const About = () => {
  return (
    <div className="min-h-screen">
      <main>
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <JoinUs />
        <FAQ />
      </main>
    </div>
  );
};

export default About;