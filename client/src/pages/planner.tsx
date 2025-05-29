import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import LoginStep from "@/components/LoginStep";
import WelcomeStep from "@/components/WelcomeStep";
import ActivitySelection from "@/components/ActivitySelection";
import SelfCareCheck from "@/components/SelfCareCheck";
import ContactStep from "@/components/ContactStep";
import GeneratedSchedule from "@/components/GeneratedSchedule";
import { Activity, SelfCareResponse } from "@shared/schema";
import { Heart, Bookmark, Share2 } from "lucide-react";

export default function Planner() {
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for login
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [selfCareResponses, setSelfCareResponses] = useState<SelfCareResponse>({});
  const [scheduleId, setScheduleId] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("8:00");
  
  // User information from login
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyEncouragement, setDailyEncouragement] = useState(false);

  const totalSteps = 5; // Login + Welcome + Activities + Self-care + Contact + Schedule
  const progress = (currentStep / totalSteps) * 100;

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleLogin = (userData: { firstName: string; email: string; phoneNumber: string; isReturning: boolean }) => {
    setFirstName(userData.firstName);
    setEmail(userData.email);
    setPhoneNumber(userData.phoneNumber);
    setCurrentStep(1); // Move to welcome step
  };

  const addActivity = (activity: Activity) => {
    setSelectedActivities(prev => [...prev, { ...activity, id: Date.now().toString() }]);
  };

  const removeActivity = (activityId: string) => {
    setSelectedActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const updateSelfCareResponses = (responses: SelfCareResponse) => {
    setSelfCareResponses(responses);
  };

  const updateContactInfo = (contactData: {
    firstName: string;
    email: string;
    phoneNumber: string;
    notificationsEnabled: boolean;
    dailyEncouragement: boolean;
  }) => {
    setFirstName(contactData.firstName);
    setEmail(contactData.email);
    setPhoneNumber(contactData.phoneNumber);
    setNotificationsEnabled(contactData.notificationsEnabled);
    setDailyEncouragement(contactData.dailyEncouragement);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="text-primary text-2xl" fill="currentColor" />
              <h1 className="heading-font text-2xl font-bold text-primary">
                Mom's Daily Planner
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress Bar */}
        {currentStep > 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        <div className="fade-in">
          {currentStep === 0 && (
            <LoginStep onLogin={handleLogin} />
          )}
          
          {currentStep === 1 && (
            <WelcomeStep 
              onNext={() => goToStep(2)} 
              firstName={firstName}
              startTime={startTime}
              onStartTimeChange={setStartTime}
              email={email}
              phoneNumber={phoneNumber}
            />
          )}
          
          {currentStep === 2 && (
            <ActivitySelection
              selectedActivities={selectedActivities}
              onAddActivity={addActivity}
              onRemoveActivity={removeActivity}
              onNext={() => goToStep(3)}
              onBack={() => goToStep(1)}
            />
          )}
          
          {currentStep === 3 && (
            <SelfCareCheck
              selectedActivities={selectedActivities}
              selfCareResponses={selfCareResponses}
              onUpdateResponses={updateSelfCareResponses}
              onNext={() => goToStep(4)}
              onBack={() => goToStep(2)}
            />
          )}
          
          {currentStep === 4 && (
            <ContactStep
              firstName={firstName}
              email={email}
              phoneNumber={phoneNumber}
              notificationsEnabled={notificationsEnabled}
              dailyEncouragement={dailyEncouragement}
              onUpdateContact={updateContactInfo}
              onNext={() => goToStep(5)}
              onBack={() => goToStep(3)}
            />
          )}
          
          {currentStep === 5 && (
            <GeneratedSchedule
              selectedActivities={selectedActivities}
              selfCareResponses={selfCareResponses}
              firstName={firstName}
              email={email}
              phoneNumber={phoneNumber}
              notificationsEnabled={notificationsEnabled}
              dailyEncouragement={dailyEncouragement}
              startTime={startTime}
              onScheduleCreated={setScheduleId}
              onBack={() => goToStep(4)}
              onStartNew={() => {
                setCurrentStep(0);
                setSelectedActivities([]);
                setSelfCareResponses({});
                setScheduleId("");
                setFirstName("");
                setEmail("");
                setPhoneNumber("");
                setNotificationsEnabled(false);
                setDailyEncouragement(false);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
