import { useState, useEffect } from "react";
import { Leaf } from "lucide-react";

const LearningStreak = () => {
  const [streak, setStreak] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Simulate getting streak from localStorage or API
    const savedStreak = localStorage.getItem('learningStreak') || '0';
    setStreak(parseInt(savedStreak));
    
    // Show animation when component mounts or streak increases
    setShowAnimation(true);
    const timer = setTimeout(() => setShowAnimation(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Function to increment streak (called when user completes exercises)
  const incrementStreak = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('learningStreak', newStreak.toString());
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 1000);
  };

  // Custom green leaf with energy icon
  const GrowthIcon = () => (
    <div className="relative">
      <Leaf className="h-5 w-5 text-success" />
      {showAnimation && (
        <div className="absolute -inset-1 rounded-full bg-success/20 animate-ping"></div>
      )}
    </div>
  );

  return (
    <div className="flex items-center space-x-2 bg-success/10 rounded-full px-3 py-1.5 border border-success/20">
      <GrowthIcon />
      <div className="flex flex-col">
        <span className="text-xs font-medium text-success">Learning Streak</span>
        <span className="text-sm font-bold text-success">{streak} days</span>
      </div>
      {/* Hidden button for demo - in real app this would be triggered by exercise completion */}
      <button 
        onClick={incrementStreak}
        className="hidden"
        aria-label="Increment streak"
      />
    </div>
  );
};

export default LearningStreak;