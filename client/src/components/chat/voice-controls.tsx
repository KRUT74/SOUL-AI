import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceControlsProps {
  onVoiceInput: (text: string) => void;
  textToSpeak?: string;
  disabled?: boolean;
}

export function VoiceControls({ onVoiceInput, textToSpeak, disabled }: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          onVoiceInput(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          toast({
            title: "Error",
            description: "Failed to recognize speech. Please try again.",
            variant: "destructive",
          });
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }
  }, [onVoiceInput, toast]);

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Error",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const speak = () => {
    if (!textToSpeak) return;

    if (window.speechSynthesis) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast({
          title: "Error",
          description: "Failed to speak the text. Please try again.",
          variant: "destructive",
        });
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Error",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={toggleListening}
        disabled={disabled}
        variant={isListening ? "destructive" : "secondary"}
        size="icon"
      >
        <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
      </Button>
      {textToSpeak && (
        <Button
          onClick={speak}
          disabled={disabled}
          variant="secondary"
          size="icon"
        >
          {isSpeaking ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
