import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Activity, SelfCareResponse } from "@shared/schema";
import { ArrowLeft, ArrowRight, Heart, Lightbulb } from "lucide-react";

interface SelfCareCheckProps {
  selectedActivities: Activity[];
  selfCareResponses: SelfCareResponse;
  onUpdateResponses: (responses: SelfCareResponse) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SelfCareCheck({
  selectedActivities,
  selfCareResponses,
  onUpdateResponses,
  onNext,
  onBack
}: SelfCareCheckProps) {
  const [meTimeType, setMeTimeType] = useState(selfCareResponses.meTimeType || "");
  const [feeling, setFeeling] = useState(selfCareResponses.feeling || "");
  const [wellness, setWellness] = useState<string[]>(selfCareResponses.wellness || []);

  const hasMeTime = selectedActivities.some(a => 
    a.activity === 'me-time' || a.label.toLowerCase().includes('me time')
  );

  useEffect(() => {
    onUpdateResponses({
      meTimeType,
      feeling,
      wellness
    });
  }, [meTimeType, feeling, wellness, onUpdateResponses]);

  const handleWellnessChange = (value: string, checked: boolean) => {
    setWellness(prev => 
      checked 
        ? [...prev, value]
        : prev.filter(item => item !== value)
    );
  };

  const meTimeOptions = [
    { value: "prayer", label: "Prayer & Reflection", icon: "🙏" },
    { value: "bath", label: "Relaxing Bath", icon: "🛁" },
    { value: "reading", label: "Reading", icon: "📚" },
    { value: "walk", label: "Peaceful Walk", icon: "🚶‍♀️" },
  ];

  const wellnessOptions = [
    { value: "meals", label: "Eat nutritious meals" },
    { value: "hydration", label: "Stay hydrated" },
    { value: "prayer", label: "Connect with God" },
    { value: "movement", label: "Move your body" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-font text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <Heart className="text-pink-500" fill="currentColor" />
          Let's talk about you 💕
        </h2>
        <p className="text-muted-foreground">
          Taking care of yourself isn't selfish—it's essential for being the best mom you can be.
        </p>
      </div>

      <div className="space-y-6">
        {/* Me Time Check */}
        {hasMeTime && (
          <Card>
            <CardHeader>
              <div className="relative rounded-lg overflow-hidden mb-4 h-48 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-3">🧘‍♀️💆‍♀️</div>
                  <h3 className="text-lg font-semibold text-primary">Self-Care Moment</h3>
                  <p className="text-muted-foreground">You deserve this time</p>
                </div>
              </div>
              
              <CardTitle className="flex items-center gap-2 text-primary">
                <Heart className="text-pink-500" fill="currentColor" />
                Self-Care Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-foreground">
                I noticed you added "Me Time" to your schedule. That's wonderful! Tell me more:
              </p>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  What kind of me time are you planning?
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {meTimeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMeTimeType(option.value)}
                      className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                        meTimeType === option.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="mr-2 text-lg">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  How are you feeling about taking this time for yourself?
                </Label>
                <RadioGroup value={feeling} onValueChange={setFeeling}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="excited" id="excited" />
                      <Label htmlFor="excited">Excited and peaceful about it</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="guilty" id="guilty" />
                      <Label htmlFor="guilty">A little guilty, but I know I need it</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rushed" id="rushed" />
                      <Label htmlFor="rushed">Worried I won't have enough time</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* General Wellness Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Heart className="text-red-400" />
              Quick Wellness Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">
                Have you planned time to:
              </Label>
              <div className="space-y-3">
                {wellnessOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={wellness.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleWellnessChange(option.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-foreground/80 italic flex items-start gap-2">
                <Lightbulb className="text-accent h-4 w-4 mt-0.5 flex-shrink-0" />
                Remember: Taking care of yourself isn't selfish—it's essential. You can't pour from an empty cup! 💕
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          Create My Schedule
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
