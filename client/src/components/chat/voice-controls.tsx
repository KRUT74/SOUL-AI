import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceControlsProps {
  onVoiceInput?: (text: string) => void;
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
        recognition.lang = 'en-GB'; // Set to British English

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

      // Enhanced voice selection with British voices prioritization
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices);

        // First try to find British English male voices
        const britishVoice = voices.find(voice =>
          voice.lang.startsWith('en-GB') && (
            // British voice identifiers
            voice.name.toLowerCase().includes('male') ||
            voice.name.toLowerCase().includes('british') ||
            voice.name.toLowerCase().includes('uk') ||
            // Common British names
            voice.name.toLowerCase().includes('arthur') ||
            voice.name.toLowerCase().includes('charles') ||
            voice.name.toLowerCase().includes('george') ||
            voice.name.toLowerCase().includes('harry') ||
            voice.name.toLowerCase().includes('james') ||
            voice.name.toLowerCase().includes('william') ||
            // British regional indicators
            voice.name.toLowerCase().includes('london') ||
            voice.name.toLowerCase().includes('england') ||
            // General British indicators
            (voice.name.toLowerCase().includes('male') && voice.lang === 'en-GB')
          )
        );

        if (britishVoice) {
          console.log('Selected British voice:', britishVoice.name);
          setPreferredVoice(britishVoice);
        } else {
          console.log("No suitable British voice found, falling back to general English voices");
          // Fallback to any English male voice
          const englishVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            voice.name.toLowerCase().includes('male')
          );
          if (englishVoice) {
            console.log('Selected English voice:', englishVoice.name);
            setPreferredVoice(englishVoice);
          } else {
            // Final fallback to any English voice
            const anyEnglishVoice = voices.find(voice => voice.lang.startsWith('en'));
            setPreferredVoice(anyEnglishVoice || voices[0]);
          }
        }
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

      // Ensure any ongoing speech is cancelled
      window.speechSynthesis.cancel();

      // Split text into smaller chunks at sentence boundaries
      const chunks = textToSpeak.match(/[^.!?]+[.!?]+/g) || [textToSpeak];
      let currentChunkIndex = 0;

      const speakNextChunk = () => {
        if (currentChunkIndex < chunks.length) {
          const chunk = chunks[currentChunkIndex];
          const utterance = new SpeechSynthesisUtterance(chunk);

          // Configure speech parameters for a more distinct British voice
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          // Adjusted voice parameters for British character
          utterance.rate = 0.80;  // Slower rate for more natural speech
          utterance.pitch = 1.0; // Neutral pitch for more natural sound
          utterance.volume = 1.0;

          utterance.onend = () => {
            currentChunkIndex++;
            if (currentChunkIndex < chunks.length) {
              // Longer pause between sentences for more natural rhythm
              setTimeout(speakNextChunk, 500);
            } else {
              setIsSpeaking(false);
              window.speechSynthesis.cancel(); // Final cleanup
            }
          };

          utterance.onerror = () => {
            setIsSpeaking(false);
            toast({
              title: "Error",
              description: "Failed to speak the text. Please try again.",
              variant: "destructive"
            });
          };

          window.speechSynthesis.speak(utterance);
        }
      };

      setIsSpeaking(true);
      speakNextChunk();

      // Keep speech synthesis active with longer keep-alive interval
      const keepAlive = setInterval(() => {
        if (isSpeaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(keepAlive);
        }
      }, 5000);

      // Cleanup interval when speech ends
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