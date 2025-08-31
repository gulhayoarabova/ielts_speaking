import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Flame, Menu } from "lucide-react";

const SimpleHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left section with menu toggle and logo */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </SidebarTrigger>
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IP</span>
            </div>
            <span className="font-bold text-xl text-primary">IELTS PREP Course</span>
          </Link>
        </div>

        {/* Right section with Learning Streak and Register */}
        <div className="flex items-center space-x-6">
          {/* Learning Streak */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 px-4 py-2 rounded-full border border-orange-500/20">
            <Flame className="w-5 h-5 text-orange-500" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Learning Streak</span>
              <span className="text-xs text-muted-foreground">0 days</span>
            </div>
          </div>

          {/* Register Button */}
          <Button 
            asChild 
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold px-6 py-2 rounded-full"
          >
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;