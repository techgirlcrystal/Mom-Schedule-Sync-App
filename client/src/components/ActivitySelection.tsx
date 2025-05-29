import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity } from "@shared/schema";
import { presetActivities } from "@/lib/activities";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";

interface ActivitySelectionProps {
  selectedActivities: Activity[];
  onAddActivity: (activity: Activity) => void;
  onRemoveActivity: (activityId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ActivitySelection({
  selectedActivities,
  onAddActivity,
  onRemoveActivity,
  onNext,
  onBack
}: ActivitySelectionProps) {
  const [customActivity, setCustomActivity] = useState("");
  const [customTime, setCustomTime] = useState("30");

  const handlePresetActivity = (preset: typeof presetActivities[0]) => {
    const isSelected = selectedActivities.some(a => a.activity === preset.activity);
    
    if (isSelected) {
      const existing = selectedActivities.find(a => a.activity === preset.activity);
      if (existing) {
        onRemoveActivity(existing.id);
      }
    } else {
      onAddActivity({
        id: Date.now().toString(),
        activity: preset.activity,
        label: preset.label,
        time: preset.time,
        icon: preset.icon
      });
    }
  };

  const handleCustomActivity = () => {
    if (customActivity.trim()) {
      onAddActivity({
        id: Date.now().toString(),
        activity: 'custom',
        label: customActivity.trim(),
        time: parseInt(customTime),
        icon: "📝",
        custom: true
      });
      setCustomActivity("");
      setCustomTime("30");
    }
  };

  const totalTime = selectedActivities.reduce((sum, activity) => sum + activity.time, 0);
  const totalHours = Math.floor(totalTime / 60);
  const totalMinutes = totalTime % 60;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-font text-2xl font-bold text-primary mb-4">
          What's on your heart today?
        </h2>
        <p className="text-muted-foreground mb-3">
          Select activities or add your own to create your personalized schedule.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium text-sm">
            💡 Tip: Put your things in order from the first to last thing you need to do!
          </p>
        </div>
      </div>

      {/* Preset Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Add (tap to select):</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {presetActivities.map((preset) => {
              const isSelected = selectedActivities.some(a => a.activity === preset.activity);
              
              return (
                <button
                  key={preset.activity}
                  onClick={() => handlePresetActivity(preset)}
                  className={`activity-card p-4 rounded-lg text-center transition-all duration-200 border-2 ${
                    isSelected
                      ? 'selected border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <div className="text-2xl mb-2">{preset.icon}</div>
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-sm opacity-70">{preset.time} min</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Add Custom Activity:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customActivity">What do you need to do?</Label>
            <Input
              id="customActivity"
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              placeholder="e.g., Grocery shopping, Bible study, Laundry..."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="customTime">How long will it take?</Label>
            <Select value={customTime} onValueChange={setCustomTime}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3+ hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleCustomActivity}
            disabled={!customActivity.trim()}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add to Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Selected Activities */}
      {selectedActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Day So Far:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {selectedActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{activity.icon}</span>
                    <span className="font-medium">{activity.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{activity.time} min</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveActivity(activity.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between font-semibold">
                <span>Total Time:</span>
                <span>
                  {totalHours > 0 && `${totalHours}h `}
                  {totalMinutes > 0 && `${totalMinutes}m`}
                  {totalTime === 0 && "0 minutes"}
                </span>
              </div>
            </div>
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
          onClick={onNext}
          disabled={selectedActivities.length === 0}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
