import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Activity } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function useScheduleMonitoring(scheduleId: string) {
  const [isOnTrack, setIsOnTrack] = useState(true);
  const { toast } = useToast();

  // Query schedule status
  const { data: statusData } = useQuery({
    queryKey: [`/api/schedules/${scheduleId}/status`],
    enabled: !!scheduleId,
    refetchInterval: 60000, // Check every minute
  });

  // Update task progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const response = await apiRequest('POST', `/api/schedules/${scheduleId}/progress`, {
        taskId,
        completed,
        completedAt: completed ? new Date().toISOString() : null
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate schedule data and status
      queryClient.invalidateQueries({ queryKey: [`/api/schedules/${scheduleId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/schedules/${scheduleId}/status`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task progress. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Monitor schedule status
  useEffect(() => {
    if (statusData && statusData.activities) {
      const now = new Date();
      let behindCount = 0;
      
      // Check each activity to see if user is behind
      statusData.activities.forEach((activity: any) => {
        if (!activity.startTime) return;
        
        const taskProgress = statusData.progress?.find((p: any) => p.taskId === activity.id);
        if (taskProgress?.completed) return; // Skip completed tasks
        
        // Parse 12-hour format time properly
        const [timeStr, period] = activity.startTime.includes('AM') || activity.startTime.includes('PM') 
          ? activity.startTime.split(' ') 
          : [activity.startTime, ''];
        const [hours, minutes] = timeStr.split(':');
        let hour24 = parseInt(hours);
        
        // Convert to 24-hour format
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        
        const taskStart = new Date();
        taskStart.setHours(hour24, parseInt(minutes || '0'), 0, 0);
        
        // Only count as behind if more than 15 minutes past start time
        const timeDiff = now.getTime() - taskStart.getTime();
        if (timeDiff > 15 * 60 * 1000) {
          behindCount++;
        }
      });
      
      const wasBehind = !isOnTrack;
      const nowOnTrack = behindCount === 0;
      
      setIsOnTrack(nowOnTrack);
      
      // Send notification if user just fell behind
      if (!wasBehind && !nowOnTrack && behindCount > 0) {
        toast({
          title: "Behind Schedule ⏰",
          description: `You're behind on ${behindCount} task(s). Don't worry, you've got this! 💪`,
          variant: "destructive"
        });
      }
    }
  }, [statusData, isOnTrack, toast]);

  const updateTaskProgress = async (taskId: string, completed: boolean) => {
    updateProgressMutation.mutate({ taskId, completed });
  };

  const getTaskStatus = (activity: Activity): 'completed' | 'behind' | 'current' | 'upcoming' => {
    if (!statusData || !activity.startTime) return 'upcoming';
    
    const taskProgress = statusData.progress?.find((p: any) => p.taskId === activity.id);
    
    if (taskProgress?.completed) return 'completed';
    
    const now = new Date();
    
    // Parse 12-hour format time properly (e.g., "3:00 PM")
    const [timeStr, period] = activity.startTime.includes('AM') || activity.startTime.includes('PM') 
      ? activity.startTime.split(' ') 
      : [activity.startTime, ''];
    const [hours, minutes] = timeStr.split(':');
    let hour24 = parseInt(hours);
    
    // Convert to 24-hour format
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    
    const taskStart = new Date();
    taskStart.setHours(hour24, parseInt(minutes || '0'), 0, 0);
    
    const timeDiff = now.getTime() - taskStart.getTime();
    const minutesDiff = Math.abs(timeDiff) / (1000 * 60);
    
    // If task start time has passed by more than 15 minutes, it's behind
    if (timeDiff > 15 * 60 * 1000) return 'behind';
    
    // If within 15 minutes of start time (before or after), it's current
    if (minutesDiff <= 15) return 'current';
    
    return 'upcoming';
  };

  return {
    updateTaskProgress,
    isOnTrack,
    statusData,
    getTaskStatus,
    isUpdating: updateProgressMutation.isPending
  };
}
