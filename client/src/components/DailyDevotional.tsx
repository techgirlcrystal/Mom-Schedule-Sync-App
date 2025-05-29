import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRandomScripture } from "@/lib/scriptures";
import { getDailyPrayer } from "@/lib/prayers";
import { BookOpen, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DailyDevotional() {
  const { toast } = useToast();
  const todaysScripture = getRandomScripture();
  const todaysPrayer = getDailyPrayer();

  const shareScripture = async () => {
    const text = `"${todaysScripture.verse}" - ${todaysScripture.reference}`;
    
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

  return (
    <Card className="scripture-verse">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Today's Word
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scripture */}
        <div>
          <blockquote className="text-lg italic text-foreground/90 mb-4">
            "{todaysScripture.verse}"
          </blockquote>
          <cite className="text-sm font-semibold text-primary">
            - {todaysScripture.reference}
          </cite>
          <Button
            variant="ghost"
            size="sm"
            onClick={shareScripture}
            className="mt-2 ml-2"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Prayer */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4" fill="currentColor" />
            Today's Prayer
          </h4>
          <p className="text-foreground/80 italic">
            "{todaysPrayer.text}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
