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
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);

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

      // Initialize preferred voice
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Try to find a male English voice
        const maleVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          voice.name.toLowerCase().includes('male')
        );
        setPreferredVoice(maleVoice || voices[0]);
      };

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
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

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // Configure speech parameters for better cadence
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1.0; // Natural pitch
      utterance.volume = 1.0;

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