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

      // Enhanced voice selection with improved gender detection
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices);

        // Improved voice detection criteria
        const targetVoices = voices.filter(voice => {
          const isEnglish = voice.lang.startsWith('en');
          const voiceName = voice.name.toLowerCase();

          // Enhanced male voice detection
          const isMale = voiceName.includes('male') || 
                        voiceName.includes('guy') || 
                        voiceName.includes('david') ||
                        voiceName.includes('thomas') ||
                        voiceName.includes('james') ||
                        voiceName.includes('john') ||
                        voiceName.includes('peter') ||
                        (voiceName.includes('google') && voiceName.includes('uk') && !voiceName.includes('female'));

          // Female voice detection
          const isFemale = voiceName.includes('female') || 
                          voiceName.includes('woman') || 
                          voiceName.includes('girl') ||
                          voiceName.includes('victoria') ||
                          voiceName.includes('elizabeth');

          if (voiceType === "male") {
            return isEnglish && isMale && !isFemale;
          } else {
            return isEnglish && isFemale;
          }
        });

        // Log matching voices for debugging
        console.log(`Found ${targetVoices.length} matching ${voiceType} voices:`, 
          targetVoices.map(v => v.name));

        // Select the first matching voice or fall back to any English voice
        const selectedVoice = targetVoices[0] || voices.find(voice => 
          voice.lang.startsWith('en') && 
          ((voiceType === "male" && !voice.name.toLowerCase().includes('female')) ||
           (voiceType === "female" && voice.name.toLowerCase().includes('female')))
        );

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
        utterance.pitch = 0.8;  // Lower pitch for male voice
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