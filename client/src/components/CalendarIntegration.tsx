import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "@shared/schema";
import { Calendar, ExternalLink, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalendarIntegrationProps {
  activities: Activity[];
  scheduleId: string;
  startTime: string;
}

export default function CalendarIntegration({ activities, scheduleId, startTime }: CalendarIntegrationProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const generateGoogleCalendarUrl = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    // Create calendar events for each activity using user's chosen start time
    const events = activities.map((activity, index) => {
      const startDateTime = new Date();
      
      // Parse user's start time properly (handle both 24hr and 12hr formats)
      const [timeStr, period] = startTime.includes('AM') || startTime.includes('PM') 
        ? startTime.split(' ') 
        : [startTime, ''];
      const [hours, minutes] = timeStr.split(':');
      let hour24 = parseInt(hours);
      
      // Convert to 24-hour format if needed
      if (period === 'PM' && hour24 !== 12) hour24 += 12;
      if (period === 'AM' && hour24 === 12) hour24 = 0;
      
      startDateTime.setHours(hour24, parseInt(minutes || '0'), 0, 0);
      
      // Add cumulative time for each activity
      const totalPreviousTime = activities.slice(0, index).reduce((sum, a) => sum + a.time, 0);
      startDateTime.setMinutes(startDateTime.getMinutes() + totalPreviousTime);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + activity.time);
      
      const formatDateTime = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };
      
      return {
        title: `${activity.icon} ${activity.label}`,
        start: formatDateTime(startDateTime),
        end: formatDateTime(endDateTime),
        description: `From your Mom's Daily Planner - Schedule ID: ${scheduleId}`
      };
    });
    
    // Create multiple calendar events
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    return events.map(event => 
      `${baseUrl}&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}`
    );
  };

  const addToGoogleCalendar = async () => {
    setIsCreating(true);
    try {
      // Create individual calendar events for each activity
      const calendarUrls = activities.map((activity, index) => {
        // Use today's date but set to the user's chosen start time
        const today = new Date();
        const [hours, minutes] = startTime.split(':');
        const startDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes), 0, 0);
        
        const totalPreviousTime = activities.slice(0, index).reduce((sum, a) => sum + a.time, 0);
        startDateTime.setMinutes(startDateTime.getMinutes() + totalPreviousTime);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + activity.time);
        
        const formatDateTime = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        };
        
        const eventTitle = `${activity.icon} ${activity.label}`;
        const eventDetails = `From your Mom's Daily Planner - Schedule ID: ${scheduleId}`;
        
        return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
          `&text=${encodeURIComponent(eventTitle)}` +
          `&dates=${formatDateTime(startDateTime)}/${formatDateTime(endDateTime)}` +
          `&details=${encodeURIComponent(eventDetails)}`;
      });
      
      // Open all events with user confirmation
      if (calendarUrls.length > 0) {
        // Show confirmation for multiple events
        const confirmed = window.confirm(
          `This will open ${calendarUrls.length} calendar events (one for each activity). ` +
          `Please allow popups in your browser. Click OK to continue.`
        );
        
        if (confirmed) {
          // Open all events immediately (browsers usually allow multiple popups if user initiated)
          calendarUrls.forEach((url, index) => {
            setTimeout(() => {
              window.open(url, '_blank');
            }, index * 500); // 500ms delay between each
          });
          
          toast({
            title: "Adding Events to Google Calendar! 📅",
            description: `Opening ${calendarUrls.length} calendar events. Each activity will be scheduled at its exact time!`,
          });
        }
      }
      
    } catch (error) {
      toast({
        title: "Calendar Integration Error",
        description: "There was an issue opening Google Calendar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const generateICSFile = () => {
    const today = new Date();
    const events = activities.map((activity, index) => {
      const startDateTime = new Date();
      const [hours, minutes] = startTime.split(':');
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const totalPreviousTime = activities.slice(0, index).reduce((sum, a) => sum + a.time, 0);
      startDateTime.setMinutes(startDateTime.getMinutes() + totalPreviousTime);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + activity.time);
      
      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      return `BEGIN:VEVENT
DTSTART:${formatICSDate(startDateTime)}
DTEND:${formatICSDate(endDateTime)}
SUMMARY:${activity.icon} ${activity.label}
DESCRIPTION:From your Mom's Daily Planner - Schedule ID: ${scheduleId}
UID:${scheduleId}-${activity.id}@momsdailyplanner.com
END:VEVENT`;
    }).join('\n');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mom's Daily Planner//EN
${events}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moms-daily-schedule-${scheduleId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Calendar File Downloaded! 📥",
      description: "Import the .ics file into any calendar app (Outlook, Apple Calendar, etc.)",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-accent" />
          Add to Your Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={addToGoogleCalendar}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {isCreating ? 'Creating Events...' : 'Add Each Activity to Calendar'}
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
          
          <Button
            onClick={generateICSFile}
            variant="outline"
            className="border-accent text-accent hover:bg-accent/10"
          >
            📥 Download Calendar File
          </Button>
        </div>

        <div className="bg-accent/10 p-4 rounded-lg">
          <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Your Schedule Preview
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activities.map((activity, index) => {
              const startDateTime = new Date();
              const [hours, minutes] = startTime.split(':');
              startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              
              const totalPreviousTime = activities.slice(0, index).reduce((sum, a) => sum + a.time, 0);
              startDateTime.setMinutes(startDateTime.getMinutes() + totalPreviousTime);
              
              const endDateTime = new Date(startDateTime);
              endDateTime.setMinutes(endDateTime.getMinutes() + activity.time);
              
              return (
                <div key={activity.id} className="flex items-center justify-between p-2 bg-card rounded border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{activity.icon}</span>
                    <span className="font-medium">{activity.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - 
                      {endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {activity.time} min
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💕 Keep your schedule synced and never miss a blessed moment of your day!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}