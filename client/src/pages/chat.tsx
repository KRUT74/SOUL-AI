import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Message } from "@shared/schema";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageInput } from "@/components/chat/message-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { Button } from "@/components/ui/button";
import { Settings, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Chat() {
  const [_, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ["/api/preferences"],
  });

  const messageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messagesLoading || preferencesLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!preferences) {
    setLocation("/settings");
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{preferences.settings.name}</h1>
          <Button variant="ghost" size="icon" onClick={() => setLocation("/settings")}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message: Message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              isUser={message.role === "user"}
            />
          ))}
          {messageMutation.isPending && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-card p-4">
        <MessageInput
          onSend={(content) => messageMutation.mutate(content)}
          disabled={messageMutation.isPending}
        />
      </div>
    </div>
  );
}