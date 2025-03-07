export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
          <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
          <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
