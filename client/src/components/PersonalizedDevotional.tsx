import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Share2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PersonalizedDevotional {
  scripture: {
    verse: string;
    reference: string;
    theme: string;
  };
  prayer: {
    text: string;
    theme: string;
  };
  encouragement: string;
}

interface PersonalizedDevotionalProps {
  dayThoughts: string;
}

export default function PersonalizedDevotional({ dayThoughts }: PersonalizedDevotionalProps) {
  const { toast } = useToast();
  const [devotional, setDevotional] = useState<PersonalizedDevotional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPersonalizedContent = async () => {
      if (!dayThoughts.trim()) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiRequest('POST', '/api/devotional/personalized', {
          dayThoughts: dayThoughts.trim()
        });
        
        if (response.ok) {
          const data = await response.json();
          setDevotional(data);
        } else {
          throw new Error('Failed to get personalized devotional');
        }
      } catch (error) {
        console.error('Error getting personalized devotional:', error);
        toast({
          title: "Using Today's Standard Devotional",
          description: "We'll use our daily scripture and prayer for you today.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getPersonalizedContent();
  }, [dayThoughts, toast]);

  const shareScripture = async () => {
    if (!devotional) return;
    
    const text = `"${devotional.scripture.verse}" - ${devotional.scripture.reference}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Daily Scripture",
          text: text
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Scripture Copied!",
          description: "The verse has been copied to your clipboard."
        });
      }
    } catch (error) {
      console.log('Sharing failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="scripture-verse">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <div className="text-center">
              <p className="text-primary font-medium">Finding the perfect word for your heart...</p>
              <p className="text-sm text-muted-foreground mt-1">✨ Personalizing your devotional</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!devotional) {
    // Fallback to default devotional component would go here
    return null;
  }

  return (
    <Card className="scripture-verse border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Your Personal Word Today
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Selected just for you based on what's in your heart
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personalized Encouragement */}
        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
          <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4" fill="currentColor" />
            A Word Just for You
          </h4>
          <p className="text-foreground/90 italic">
            {devotional.encouragement}
          </p>
        </div>

        {/* Scripture */}
        <div>
          <blockquote className="text-lg italic text-foreground/90 mb-4 border-l-4 border-primary pl-4">
            "{devotional.scripture.verse}"
          </blockquote>
          <div className="flex items-center justify-between">
            <cite className="text-sm font-semibold text-primary">
              - {devotional.scripture.reference}
            </cite>
            <Button
              variant="ghost"
              size="sm"
              onClick={shareScripture}
              className="text-primary hover:bg-primary/10"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Prayer */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Your Personal Prayer
          </h4>
          <p className="text-foreground/80 italic">
            "{devotional.prayer.text}"
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💕 God knows exactly what you need to hear today
          </p>
        </div>
      </CardContent>
    </Card>
  );
}