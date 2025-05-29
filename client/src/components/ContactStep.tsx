import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Star, Heart, MessageCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ContactStepProps {
  firstName: string;
  email: string;
  phoneNumber: string;
  notificationsEnabled: boolean;
  dailyEncouragement: boolean;
  onUpdateContact: (data: {
    firstName: string;
    email: string;
    phoneNumber: string;
    notificationsEnabled: boolean;
    dailyEncouragement: boolean;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ContactStep({
  firstName,
  email,
  phoneNumber,
  notificationsEnabled,
  dailyEncouragement,
  onUpdateContact,
  onNext,
  onBack
}: ContactStepProps) {
  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localEmail, setLocalEmail] = useState(email);
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber);
  const [localNotifications, setLocalNotifications] = useState(notificationsEnabled);
  const [localDailyEncouragement, setLocalDailyEncouragement] = useState(dailyEncouragement);

  const handleNext = async () => {
    // Send custom tracking code when returning users opt into reminders
    if (localNotifications && (localEmail || localPhoneNumber)) {
      try {
        await apiRequest('POST', '/api/ghl/webhook', {
          scheduleId: "reminder_optin_" + Date.now(),
          phone: localPhoneNumber || "",
          email: localEmail || "",
          firstName: localFirstName || "Beautiful Mama",
          action: "reminder_optin",
          "Planner Code": "SCHEDULE_REMINDER_ACTIVATED",
          tags: localNotifications ? "schedule_reminders" : ""
        });
        console.log('Reminder opt-in tracked in CRM');
      } catch (error) {
        console.error("Failed to track reminder opt-in:", error);
        // Don't block the user flow if tracking fails
      }
    }

    // Send daily encouragement tracking
    if (localDailyEncouragement && (localEmail || localPhoneNumber)) {
      try {
        await apiRequest('POST', '/api/ghl/webhook', {
          scheduleId: "daily_encouragement_" + Date.now(),
          phone: localPhoneNumber || "",
          email: localEmail || "",
          firstName: localFirstName || "Beautiful Mama",
          action: "daily_encouragement_optin",
          "Planner Code": "DAILY_TEXTS_ACTIVATED",
          tags: "daily_encouragement"
        });
        console.log('Daily encouragement opt-in tracked in CRM');
      } catch (error) {
        console.error("Failed to track daily encouragement opt-in:", error);
        // Don't block the user flow if tracking fails
      }
    }

    onUpdateContact({
      firstName: localFirstName,
      email: localEmail,
      phoneNumber: localPhoneNumber,
      notificationsEnabled: localNotifications,
      dailyEncouragement: localDailyEncouragement
    });
    onNext();
  };

  const isValid = localFirstName.trim() !== "" || localEmail.trim() !== "" || localPhoneNumber.trim() !== "";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="heading-font text-3xl font-bold text-primary mb-4">
          Stay Connected & Encouraged 💕
        </h2>
        <p className="text-muted-foreground text-lg">
          Let's get your contact info so we can support you on this beautiful journey!
        </p>
      </div>

      <Card className="border-2 border-accent bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Heart className="h-6 w-6 text-pink-500" />
            Your Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">
                First Name <span className="text-pink-500">*</span>
              </label>
              <Input
                value={localFirstName}
                onChange={(e) => setLocalFirstName(e.target.value)}
                placeholder="What should we call you, beautiful?"
                className="border-accent focus:ring-accent text-lg p-4"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">
                Email Address
              </label>
              <Input
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
                className="border-accent focus:ring-accent text-lg p-4"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">
                Phone Number
              </label>
              <Input
                value={localPhoneNumber}
                onChange={(e) => setLocalPhoneNumber(e.target.value)}
                placeholder="(555) 123-4567"
                className="border-accent focus:ring-accent text-lg p-4"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              How can we support you?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-card rounded-lg border">
                <Checkbox
                  id="notifications"
                  checked={localNotifications}
                  onCheckedChange={(checked) => setLocalNotifications(checked === true)}
                  className="border-accent data-[state=checked]:bg-accent mt-1"
                />
                <div>
                  <label htmlFor="notifications" className="text-sm font-medium text-primary cursor-pointer">
                    Send me gentle reminders if I fall behind
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send loving nudges to help you stay on track with your schedule
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-card rounded-lg border">
                <Checkbox
                  id="daily-encouragement"
                  checked={localDailyEncouragement}
                  onCheckedChange={(checked) => setLocalDailyEncouragement(checked === true)}
                  className="border-accent data-[state=checked]:bg-accent mt-1"
                />
                <div>
                  <label htmlFor="daily-encouragement" className="text-sm font-medium text-primary cursor-pointer">
                    Send me daily encouragement texts 💕
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receive uplifting messages and scripture to brighten your day
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-primary" />
              <h4 className="text-sm font-semibold text-primary">Why we ask for this</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Your information helps us personalize your experience and send you encouraging reminders. 
              We respect your privacy and will never share your information with third parties.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex space-x-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!isValid}
          className="flex-1 bg-accent hover:bg-accent/90 text-white"
        >
          Continue to Schedule
          <span className="ml-2">✨</span>
        </Button>
      </div>

      {!isValid && (
        <p className="text-center text-sm text-muted-foreground">
          Please enter at least your first name to continue
        </p>
      )}
    </div>
  );
}