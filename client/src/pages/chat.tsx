import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Message, Preferences } from "@shared/schema";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageInput } from "@/components/chat/message-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserMenu } from "@/components/user-menu";
import { useAuth } from "@/hooks/use-auth";
import { VoiceSettingsDialog } from "@/components/chat/voice-settings-dialog";

export default function Chat() {
  const [_, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [voiceType, setVoiceType] = useState<"male" | "female">("male");

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", user?.id],
    enabled: !!user
  });

  const { data: preferences, isLoading: preferencesLoading } = useQuery<Preferences>({
    queryKey: ["/api/preferences", user?.id],
    enabled: !!user
  });

  const messageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", { content });
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      console.error("Message error:", error);
    }
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleVoiceChange = (newVoice: "male" | "female") => {
    setVoiceType(newVoice);
    toast({
      title: "Voice Updated",
      description: `Voice type changed to ${newVoice}`,
    });
  };

  if (messagesLoading || preferencesLoading) {
    return <div className="flex h-screen items-center justify-center bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600">Loading...</div>;
  }

  if (!preferences?.settings) {
    setLocation("/settings");
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600">
      <header className="border-b bg-white/10 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/home")} className="text-white hover:bg-white/20">
              <Home className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setLocation("/home")} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <h1 className="text-lg font-semibold text-white">{preferences.settings.name}</h1>
          <div className="flex gap-2">
            <VoiceSettingsDialog currentVoice={voiceType} onVoiceChange={handleVoiceChange} />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              isUser={message.role === "user"}
              voiceType={message.role === "assistant" ? voiceType : undefined}
            />
          ))}
          {messageMutation.isPending && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-white/10 backdrop-blur-sm p-4">
        <MessageInput
          onSend={(content) => messageMutation.mutate(content)}
          disabled={messageMutation.isPending}
        />
      </div>
    </div>
  );
}