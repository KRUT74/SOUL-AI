import { VoiceControls } from "./voice-controls";

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
}

export function MessageBubble({ content, isUser }: MessageBubbleProps) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-lg px-4 py-2 max-w-[80%] ${
          isUser
            ? "bg-white/20 text-white"
            : "bg-white/10 text-white"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        {!isUser && (
          <div className="mt-2 flex justify-end">
            <VoiceControls textToSpeak={content} />
          </div>
        )}
      </div>
    </div>
  );
}