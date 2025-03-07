import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceControlsProps {
  onVoiceInput?: (text: string) => void;
  textToSpeak?: string;
  disabled?: boolean;
  voiceType?: "male" | "female";
}

export function VoiceControls({ onVoiceInput, textToSpeak, disabled, voiceType = "male" }: VoiceControlsProps) {
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
        recognition.lang = 'en-GB';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          onVoiceInput?.(transcript);
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

      // Enhanced voice selection with gender preference
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices);

        // Filter voices based on voiceType
        const targetVoices = voices.filter(voice => {
          const isEnglish = voice.lang.startsWith('en');
          const voiceName = voice.name.toLowerCase();
          const isMale = voiceName.includes('male') || voiceName.includes('guy') || voiceName.includes('james');
          const isFemale = voiceName.includes('female') || voiceName.includes('woman') || voiceName.includes('girl');

          if (voiceType === "male") {
            return isEnglish && isMale;
          } else {
            return isEnglish && isFemale;
          }
        });

        // Select the first matching voice or fall back to any English voice
        const selectedVoice = targetVoices[0] || voices.find(voice => voice.lang.startsWith('en'));
        console.log(`Selected ${voiceType} voice:`, selectedVoice?.name);
        setPreferredVoice(selectedVoice || null);
      };

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, [onVoiceInput, toast, voiceType]);

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

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Adjust voice characteristics based on gender
      if (voiceType === "male") {
        utterance.pitch = 0.9;
        utterance.rate = 0.9;
      } else {
        utterance.pitch = 1.1;
        utterance.rate = 1.0;
      }

      utterance.volume = 1.0;

      utterance.onend = () => {
        setIsSpeaking(false);
        window.speechSynthesis.cancel();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        toast({
          title: "Error",
          description: "Failed to speak the text. Please try again.",
          variant: "destructive"
        });
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);

      // Keep speech synthesis active
      const keepAlive = setInterval(() => {
        if (isSpeaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(keepAlive);
        }
      }, 5000);

      return () => clearInterval(keepAlive);
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
      {onVoiceInput && (
        <Button
          onClick={toggleListening}
          disabled={disabled}
          variant={isListening ? "destructive" : "secondary"}
          size="icon"
        >
          <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
        </Button>
      )}
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