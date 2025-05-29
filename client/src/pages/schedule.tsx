import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Clock, CheckCircle, AlertTriangle, Bookmark } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import useScheduleMonitoring from "@/hooks/use-schedule-monitoring";
import DailyDevotional from "@/components/DailyDevotional";

export default function Schedule() {
  const params = useParams();
  const scheduleId = params.scheduleId as string;

  // Debug log to check if scheduleId is being captured
  console.log('Schedule ID from URL:', scheduleId);

  const { data: scheduleData, isLoading, error } = useQuery({
    queryKey: [`/api/schedules/${scheduleId}`],
    enabled: !!scheduleId,
  });

  // Safe access to schedule data
  const schedule = scheduleData ? scheduleData as any : null;

  const { updateTaskProgress, isOnTrack, getTaskStatus } = useScheduleMonitoring(scheduleId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Schedule Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This schedule may have expired or doesn't exist.
            </p>
            <Button onClick={() => window.location.href = "/planner"}>
              Create New Schedule
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedTasks = schedule.progress?.filter(p => p.completed).length || 0;
  const totalTasks = schedule.activities.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    await updateTaskProgress(taskId, completed);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="text-primary text-2xl" fill="currentColor" />
              <div>
                <h1 className="heading-font text-2xl font-bold text-primary">
                  Your Beautiful Day
                </h1>
                <p className="text-sm text-muted-foreground">
                  Schedule ID: {scheduleId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={isOnTrack ? "default" : "destructive"}>
                {isOnTrack ? "On Track" : "Behind Schedule"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Email Notification Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Heart className="h-6 w-6 text-purple-600 mt-1" fill="currentColor" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">
                    📧 Check your email so you can get our stay on task reminders
                  </h3>
                  <p className="text-purple-700 text-sm leading-relaxed">
                    <span className="block text-purple-600 font-medium">
                      (Sometimes emails go to spam - please check your spam folder and mark us as "not spam")
                    </span>
                  </p>
                  <p className="text-purple-800 font-medium text-sm mt-2">
                    - Mother V
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = window.location.href;
                  const title = "My Beautiful Day Schedule";
                  if (navigator.share) {
                    navigator.share({ title, url });
                  } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(url);
                    alert("Schedule link copied! You can bookmark this page or save the link.");
                  }
                }}
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Bookmark className="h-4 w-4 mr-1" />
                Bookmark
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Devotional */}
        <DailyDevotional />

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Progress
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {completedTasks} of {totalTasks} completed
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Keep going, you're doing great! 💕</span>
                {progressPercentage === 100 && (
                  <span className="text-success font-medium">🎉 Day Complete!</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule?.activities?.map((activity: any, index: number) => {
                const taskProgress = schedule?.progress?.find((p: any) => p.taskId === activity.id);
                const isCompleted = taskProgress?.completed || false;
                const status = getTaskStatus(activity);

                return (
                  <div 
                    key={activity.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-success/10 border-success/30' 
                        : 'bg-card hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={(checked) => 
                            handleTaskToggle(activity.id, checked as boolean)
                          }
                          className="w-5 h-5"
                        />
                        <div className={isCompleted ? 'opacity-75' : ''}>
                          <div className="font-medium text-foreground">
                            {activity.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {activity.startTime && activity.endTime
                              ? `${activity.startTime} - ${activity.endTime}`
                              : `Duration: ${activity.time} minutes`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="text-xs">
                          {activity.time} min
                        </Badge>
                        <div className="text-2xl">
                          {activity.icon || "📝"}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      <span className={`
                        ${status === 'completed' ? 'text-success' : ''}
                        ${status === 'behind' ? 'text-destructive' : ''}
                        ${status === 'upcoming' ? 'text-muted-foreground' : ''}
                        ${status === 'current' ? 'text-primary' : ''}
                      `}>
                        {status === 'completed' && '✅ Completed'}
                        {status === 'behind' && '⚠️ Behind schedule'}
                        {status === 'upcoming' && '⏳ Upcoming'}
                        {status === 'current' && '🔄 Current task'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Encouragement */}
        {progressPercentage >= 50 && (
          <Card className="scripture-verse">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-primary mb-2">
                  You're doing amazing! 🌟
                </h3>
                <p className="text-foreground/80 italic">
                  "She is clothed with strength and dignity; she can laugh at the days to come."
                </p>
                <cite className="text-sm font-semibold text-primary block mt-2">
                  - Proverbs 31:25 (KJV)
                </cite>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
