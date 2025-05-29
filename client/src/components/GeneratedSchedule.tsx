import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Activity, SelfCareResponse } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Plus, 
  Bookmark, 
  Bell, 
  Share2, 
  Download, 
  Calendar, 
  Mail, 
  Code, 
  Copy,
  Star,
  CheckCircle,
  Webhook
} from "lucide-react";
import DailyDevotional from "./DailyDevotional";
import CalendarIntegration from "./CalendarIntegration";

interface GeneratedScheduleProps {
  selectedActivities: Activity[];
  selfCareResponses: SelfCareResponse;
  onScheduleCreated: (scheduleId: string) => void;
  onBack: () => void;
  onStartNew: () => void;
  startTime?: string;
  firstName?: string;
  email?: string;
  phoneNumber?: string;
  notificationsEnabled?: boolean;
  dailyEncouragement?: boolean;
}

export default function GeneratedSchedule({
  selectedActivities,
  selfCareResponses,
  onScheduleCreated,
  onBack,
  onStartNew,
  startTime = "8:00",
  firstName,
  email,
  phoneNumber,
  notificationsEnabled,
  dailyEncouragement
}: GeneratedScheduleProps) {

  const [scheduleId, setScheduleId] = useState<string>("");
  const { toast } = useToast();

  // Generate schedule times based on user's chosen start time
  const generateScheduleTimes = (activities: Activity[]) => {
    // Parse the user's selected start time properly
    const [timeStr, period] = startTime.includes('AM') || startTime.includes('PM') 
      ? startTime.split(' ') 
      : [startTime, ''];
    const [hours, minutes] = timeStr.split(':');
    let hour24 = parseInt(hours);
    const mins = parseInt(minutes || '0');
    
    // Convert to 24-hour format if needed
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    
    let currentTime = (hour24 * 60) + mins;
    
    const formatTime = (totalMinutes: number) => {
      const hrs = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      // Format as 12-hour time
      const hour12 = hrs === 0 ? 12 : hrs > 12 ? hrs - 12 : hrs;
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      return `${hour12}:${mins.toString().padStart(2, '0')} ${ampm}`;
    };
    
    return activities.map(activity => {
      const activityStartTime = formatTime(currentTime);
      currentTime += activity.time;
      const activityEndTime = formatTime(currentTime);
      
      return {
        ...activity,
        startTime: activityStartTime,
        endTime: activityEndTime
      };
    });
  };

  const scheduledActivities = generateScheduleTimes(selectedActivities);

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/schedules', {
        activities: scheduledActivities,
        selfCareResponses,
        startTime,
        totalDuration: selectedActivities.reduce((sum, a) => sum + a.time, 0),
        phone: phoneNumber,
        email,
        firstName: firstName,
        notificationsEnabled,
        dailyEncouragement
      });
      return response.json();
    },
    onSuccess: async (data) => {
      setScheduleId(data.scheduleId);
      onScheduleCreated(data.scheduleId);
      
      // Trigger Go High Level webhook if contact info provided
      console.log('DEBUG: Contact info check:', { firstName, email, phoneNumber });
      if (firstName || email || phoneNumber) {
        try {
          console.log('Sending to Go High Level:', {
            scheduleId: data.scheduleId,
            phone: phoneNumber,
            email,
            name: firstName,
            action: dailyEncouragement ? "schedule_created_with_daily_texts" : "schedule_created"
          });
          
          // Create the schedule link
          const scheduleLink = `${window.location.origin}/schedule/${data.scheduleId}`;
          
          const ghlResponse = await apiRequest('POST', '/api/ghl/webhook', {
            scheduleId: data.scheduleId,
            phone: phoneNumber,
            email,
            firstName: firstName,
            action: dailyEncouragement ? "schedule_created_with_daily_texts" : "schedule_created",
            "Schedule Link": scheduleLink,
            "Planner Code": "SCHEDULE_CREATED"
          });
          
          console.log('Go High Level response:', ghlResponse);
        } catch (error) {
          console.error("Go High Level webhook failed:", error);
        }
      }
      
      toast({
        title: "Schedule Created! 🎉",
        description: firstName ? `${firstName}, your personalized schedule is ready!` : "Your personalized schedule is ready!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create schedule. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Get embed code
  const { data: embedData } = useQuery({
    queryKey: ['/api/embed-code'],
    enabled: !!scheduleId
  });

  useEffect(() => {
    if (selectedActivities.length > 0 && !scheduleId) {
      createScheduleMutation.mutate();
    }
  }, [selectedActivities]);

  const scheduleUrl = scheduleId ? `${window.location.origin}/schedule/${scheduleId}` : '';

  const copyToClipboard = async (text: string, label: string) => {
    try {
      if (!text) {
        toast({
          title: "Error",
          description: "No content to copy.",
          variant: "destructive"
        });
        return;
      }

      // Use fallback method that works more reliably across browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      
      // Select the text
      if (navigator.userAgent.match(/ipad|iphone/i)) {
        // iOS Safari specific handling
        const range = document.createRange();
        range.selectNodeContents(textArea);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        textArea.setSelectionRange(0, 999999);
      } else {
        textArea.select();
      }
      
      // Copy the text
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) {
        throw new Error('Copy command failed');
      }
      
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`
      });
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard. Please copy manually.",
        variant: "destructive"
      });
    }
  };

  const totalTime = selectedActivities.reduce((sum, a) => sum + a.time, 0);
  const totalHours = Math.floor(totalTime / 60);
  const totalMinutes = totalTime % 60;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-font text-2xl font-bold text-primary mb-4">
          Your Beautiful Day ✨
        </h2>
        <p className="text-muted-foreground">
          Your personalized schedule is ready! Complete your info below to get reminders and encouragement.
        </p>
      </div>

      {/* Contact Collection Form */}
      {!scheduleId && (
        <Card className="border-2 border-accent bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Star className="h-5 w-5" />
              Stay Connected & Encouraged
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-primary">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="What should we call you?"
                  className="border-accent focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-primary">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  type="email"
                  className="border-accent focus:ring-accent"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-primary">Phone Number</label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(555) 123-4567"
                className="border-accent focus:ring-accent"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={(checked) => setNotificationsEnabled(checked === true)}
                  className="border-accent data-[state=checked]:bg-accent"
                />
                <label htmlFor="notifications" className="text-sm text-primary">
                  Send me gentle reminders if I fall behind
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="daily-encouragement"
                  checked={dailyEncouragement}
                  onCheckedChange={(checked) => setDailyEncouragement(checked === true)}
                  className="border-accent data-[state=checked]:bg-accent"
                />
                <label htmlFor="daily-encouragement" className="text-sm text-primary">
                  Send me daily encouragement texts 💕
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookmark Instructions */}
      {scheduleUrl && (
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Bookmark className="h-6 w-6 mr-3" />
              <h3 className="text-lg font-semibold">Save This Page!</h3>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Bookmark this page or save the link below to track your progress throughout the day.
            </p>
            <div className="bg-white/20 p-3 rounded text-sm font-mono break-all">
              {scheduleUrl}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => copyToClipboard(scheduleUrl, 'Schedule URL')}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Daily Devotional */}
      <DailyDevotional />

      {/* Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Today's Schedule</span>
            <Badge variant="outline">
              {scheduledActivities.length} tasks • {totalHours > 0 && `${totalHours}h `}{totalMinutes}m
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledActivities.map((activity, index) => (
              <div 
                key={activity.id}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{activity.icon}</div>
                    <div>
                      <div className="font-medium text-foreground">{activity.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.startTime} - {activity.endTime}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{activity.time} min</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Encouragement */}
      <Card className="scripture-verse">
        <CardContent className="pt-6">
          <div className="text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-primary mb-2">
              Daily Encouragement
            </h3>
            <p className="text-foreground/80 italic mb-2">
              "You're doing an amazing job, mama! Remember that every small step counts, and God sees your faithful heart in all you do."
            </p>
            <cite className="text-sm font-semibold text-primary">
              "And let us not be weary in well doing: for in due season we shall reap, if we faint not." - Galatians 6:9 (KJV)
            </cite>
          </div>
        </CardContent>
      </Card>

      {/* Actions & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-accent" />
              Stay on Track
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminders"
                  checked={notificationsEnabled}
                  onCheckedChange={(checked) => setNotificationsEnabled(checked as boolean)}
                />
                <label htmlFor="reminders" className="text-sm">
                  Send reminders if I'm behind
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="encouragement" />
                <label htmlFor="encouragement" className="text-sm">
                  Daily encouragement texts
                </label>
              </div>
            </div>
            
            {notificationsEnabled && (
              <Input
                type="tel"
                placeholder="Your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-sm"
              />
            )}
          </CardContent>
        </Card>

        {/* Share & Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Share2 className="h-5 w-5 text-accent" />
              Share & Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => {
                const scheduleText = scheduledActivities.map(activity => 
                  `${activity.startTime} - ${activity.endTime}: ${activity.icon} ${activity.label}`
                ).join('\n');
                const mailtoLink = `mailto:${email}?subject=My Beautiful Day Schedule&body=Here's my personalized schedule for today:%0A%0A${encodeURIComponent(scheduleText)}%0A%0AFrom Mom's Daily Planner`;
                window.open(mailtoLink);
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Schedule
            </Button>
            {scheduleId && (
              <CalendarIntegration 
                activities={scheduledActivities}
                scheduleId={scheduleId}
                startTime={startTime}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Embed Code */}
      {embedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-accent" />
              Embed on Your Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Copy this code to embed the planner on your website:
            </p>
            <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-xs overflow-x-auto">
              {embedData.embedCode}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => copyToClipboard(embedData.embedCode, 'Embed code')}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </Button>
          </CardContent>
        </Card>
      )}

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
          onClick={onStartNew}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Plan Another Day
        </Button>
      </div>
    </div>
  );
}
