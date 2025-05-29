import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Mail, User, Phone, LogIn, UserPlus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LoginStepProps {
  onLogin: (userData: {
    firstName: string;
    email: string;
    phoneNumber: string;
    isReturning: boolean;
  }) => void;
}

export default function LoginStep({ onLogin }: LoginStepProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  const { toast } = useToast();

  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Send contact information to Go High Level immediately when they sign up
      console.log('Sending new user to Go High Level:', {
        firstName: firstName,
        email,
        phone: phoneNumber,
        action: "user_signup"
      });
      
      const ghlResponse = await apiRequest('POST', '/api/ghl/webhook', {
        scheduleId: "signup_" + Date.now(),
        phone: phoneNumber,
        email,
        firstName: firstName,
        action: "user_signup"
      });
      
      console.log('Go High Level signup response:', ghlResponse);
      
      toast({
        title: "Welcome to your planner! 🎉",
        description: "Your information has been saved securely."
      });
      
    } catch (error) {
      console.error("Failed to save contact to Go High Level:", error);
      // Don't block the user flow if Go High Level fails
    }
    
    // Continue with login after a brief delay
    setTimeout(() => {
      onLogin({
        firstName,
        email,
        phoneNumber,
        isReturning: false
      });
      setIsLoading(false);
    }, 800);
  };

  const handleReturningUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, this would look up the user by email
    // For now, we'll simulate finding their info
    setTimeout(() => {
      // Extract first name from email (simple simulation)
      const emailPart = loginEmail.split('@')[0];
      const simulatedFirstName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
      
      onLogin({
        firstName: simulatedFirstName,
        email: loginEmail,
        phoneNumber: "", // They can add this later if they want text updates
        isReturning: true
      });
      setIsLoading(false);
    }, 800);
  };

  const isNewUserValid = firstName.trim() !== "" && email.trim() !== "";
  const isReturningUserValid = loginEmail.trim() !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/20 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4">
            <Heart className="h-16 w-16 text-pink-500 mx-auto mb-4" />
          </div>
          <h1 className="heading-font text-4xl font-bold text-primary mb-2">
            Welcome Beautiful! 💕
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's create your personalized daily planner
          </p>
        </div>

        <Card className="border-2 border-accent bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-primary">
              Let's Get Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  New User
                </TabsTrigger>
                <TabsTrigger value="returning" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Welcome Back
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="new" className="mt-6">
                <form onSubmit={handleNewUserSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-primary mb-2 block flex items-center gap-2">
                      <User className="h-4 w-4" />
                      First Name <span className="text-pink-500">*</span>
                    </label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="What should we call you?"
                      className="border-accent focus:ring-accent text-lg p-4"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-primary mb-2 block flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address <span className="text-pink-500">*</span>
                    </label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      type="email"
                      className="border-accent focus:ring-accent text-lg p-4"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-primary mb-2 block flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number (Optional)
                    </label>
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="border-accent focus:ring-accent text-lg p-4"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Add now or later to receive encouraging text updates! 💕
                    </p>
                  </div>

                  <Button 
                    type="submit"
                    disabled={!isNewUserValid || isLoading}
                    className="w-full bg-accent hover:bg-accent/90 text-white text-lg p-4 h-auto"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating your experience...
                      </div>
                    ) : (
                      <>
                        Start My Beautiful Day ✨
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="returning" className="mt-6">
                <form onSubmit={handleReturningUserSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-primary mb-2 block flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Your Email Address
                    </label>
                    <Input
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      type="email"
                      className="border-accent focus:ring-accent text-lg p-4"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll find your account and welcome you back! 💕
                    </p>
                  </div>

                  <Button 
                    type="submit"
                    disabled={!isReturningUserValid || isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white text-lg p-4 h-auto"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Welcome back...
                      </div>
                    ) : (
                      <>
                        Welcome Back Beautiful! 💕
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="bg-accent/10 p-4 rounded-lg mt-6">
              <p className="text-xs text-muted-foreground text-center">
                Your information helps us personalize your experience and send you encouraging reminders. 
                We respect your privacy! 🌟
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Ready to plan a day filled with purpose and joy? 💕
          </p>
        </div>
      </div>
    </div>
  );
}