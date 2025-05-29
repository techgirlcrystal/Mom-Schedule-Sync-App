import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DailyDevotional from "./DailyDevotional";
import PersonalizedDevotional from "./PersonalizedDevotional";
import { ArrowRight, Heart, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface WelcomeStepProps {
  onNext: () => void;
  firstName?: string;
  startTime?: string;
  onStartTimeChange?: (time: string) => void;
  email?: string;
  phoneNumber?: string;
}

export default function WelcomeStep({ onNext, firstName = "Beautiful", startTime = "8:00", onStartTimeChange, email, phoneNumber }: WelcomeStepProps) {
  const [dayThoughts, setDayThoughts] = useState("");
  const [showDevotional, setShowDevotional] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [planningStartTime, setPlanningStartTime] = useState("");

  // Set current time when component loads
  useEffect(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setCurrentTime(timeString);

    // Default planning start time to current time
    const roundedTime = new Date(now);
    roundedTime.setMinutes(Math.ceil(roundedTime.getMinutes() / 15) * 15, 0, 0);
    const defaultStart = roundedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    setPlanningStartTime(defaultStart);
  }, []);

  const handleContinue = async () => {
    if (!showDevotional) {
      setShowDevotional(true);
    } else {
      // Make sure to pass the selected start time to the parent component
      if (onStartTimeChange && planningStartTime) {
        onStartTimeChange(planningStartTime);
      }

       // Capture contact when user starts planning
      if (email || phoneNumber) {
        try {
          await apiRequest('POST', '/api/ghl/webhook', {
            scheduleId: "planning_start_" + Date.now(),
            phone: phoneNumber || "",
            email: email || "",
            firstName: firstName,
            action: "started_planning"
          });
          console.log('Contact captured in Creative Space CRM');
        } catch (error) {
          console.error("Failed to capture contact:", error);
          // Don't block the user flow if Go High Level fails
        }
      }
      onNext();
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Hero Section */}
      <div className="text-center">
        <div className="relative rounded-xl overflow-hidden shadow-lg mb-6 h-64 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">☀️</div>
            <h3 className="text-xl font-semibold text-primary">Beautiful Morning</h3>
            <p className="text-muted-foreground">A new day of grace and purpose</p>
          </div>
        </div>

        <h2 className="heading-font text-3xl font-bold text-primary mb-4">
          Good Morning, Beautiful! ✨
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Before we plan your day, let's take a moment to center ourselves
        </p>
      </div>

      {!showDevotional ? (
        <div className="space-y-6">
          {/* Current Time & Planning Start */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Clock className="text-accent" />
                Let's Plan Your Beautiful Day
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-medium">Current Time</Label>
                  <div className="bg-secondary p-3 rounded-lg text-center">
                    <span className="text-lg font-semibold text-primary">{currentTime}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="startTime" className="text-base font-medium">
                    When do you want to start planning from?
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={planningStartTime}
                    onChange={(e) => setPlanningStartTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <p className="text-sm text-foreground/80">
                  💡 We'll create your schedule starting from this time and sync everything to your calendar!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Daily Check-in */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Heart className="text-pink-500" fill="currentColor" />
                How are you feeling today?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dayThoughts" className="text-base font-medium">
                  Take a moment to share what's on your heart today...
                </Label>
                <Textarea
                  id="dayThoughts"
                  value={dayThoughts}
                  onChange={(e) => setDayThoughts(e.target.value)}
                  placeholder="I'm feeling grateful for... I'm worried about... I'm excited about... Today I hope to..."
                  className="mt-2 min-h-[120px] resize-none"
                />
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-foreground/80 italic">
                  Remember, sweet mama: God sees your heart and loves you completely. 
                  Your feelings are valid, and He's right there with you in every moment. 💕
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Personalized Devotional based on thoughts */
        dayThoughts.trim() ? (
          <PersonalizedDevotional dayThoughts={dayThoughts} />
        ) : (
          <DailyDevotional />
        )
      )}

      {/* Action Button */}
      <Button 
        onClick={handleContinue}
        size="lg"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg"
      >
        {!showDevotional ? "Continue to Today's Word" : "Start Planning My Day"}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}