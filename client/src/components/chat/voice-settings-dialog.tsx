import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface VoiceSettingsDialogProps {
  currentVoice: "male" | "female";
  onVoiceChange: (voice: "male" | "female") => void;
}

export function VoiceSettingsDialog({ currentVoice, onVoiceChange }: VoiceSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<"male" | "female">(currentVoice);

  const handleSave = () => {
    onVoiceChange(selectedVoice);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Voice Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedVoice}
            onValueChange={(value) => setSelectedVoice(value as "male" | "female")}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" className="border-white/20" />
              <Label htmlFor="male" className="text-white">Male Voice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" className="border-white/20" />
              <Label htmlFor="female" className="text-white">Female Voice</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
