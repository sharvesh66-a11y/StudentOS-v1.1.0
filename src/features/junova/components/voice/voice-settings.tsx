'use client';

/**
 * StudentOS Junova AI — Voice Settings Dialog
 *
 * Lets the user configure TTS voice, rate, pitch, volume, language, and
 * auto-speak. Uses the browser's available voices.
 *
 * @see src/features/junova/hooks/use-voice-preferences.ts
 * @see src/features/junova/hooks/use-speech-synthesis.ts
 */

import { useState, useEffect } from 'react';
import { Volume2, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVoicePreferences } from '../../hooks/use-voice-preferences';
import { useSpeechSynthesis } from '../../hooks/use-speech-synthesis';
import { DEFAULT_VOICE_PREFERENCES } from '../../types';
import { toast } from 'sonner';

export interface VoiceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'it-IT', label: 'Italian' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'ko-KR', label: 'Korean' },
  { code: 'ar-SA', label: 'Arabic' },
  { code: 'ru-RU', label: 'Russian' },
];

export function VoiceSettings({ open, onOpenChange }: VoiceSettingsProps) {
  const { preferences, update } = useVoicePreferences();
  const { voices, speak, isSupported: ttsSupported } = useSpeechSynthesis();
  const [localPrefs, setLocalPrefs] = useState(preferences);

  // Sync local state when Firestore data changes
  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const prefs = localPrefs ?? { ...DEFAULT_VOICE_PREFERENCES, uid: '' };

  const handleSave = async () => {
    await update({
      enabled: prefs.enabled,
      voiceURI: prefs.voiceURI,
      rate: prefs.rate,
      pitch: prefs.pitch,
      volume: prefs.volume,
      language: prefs.language,
      autoSpeak: prefs.autoSpeak,
    });
    toast.success('Voice settings saved');
    onOpenChange(false);
  };

  const handleTestVoice = () => {
    speak(
      `Hello! I'm your AI teacher. This is how I'll sound when I explain concepts to you.`,
      prefs,
    );
  };

  // Filter voices by selected language
  const filteredVoices = voices.filter((v) => v.lang.startsWith(prefs.language.split('-')[0]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Voice Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Enable voice */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label className="text-foreground text-sm font-medium">
                Enable Voice Conversations
              </Label>
              <p className="text-muted-foreground text-xs">
                Allow the AI teacher to speak responses aloud.
              </p>
            </div>
            <Switch
              checked={prefs.enabled}
              onCheckedChange={(checked) => setLocalPrefs({ ...prefs, enabled: checked })}
              aria-label="Enable voice conversations"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="voice-language">Language</Label>
            <Select
              value={prefs.language}
              onValueChange={(value) => setLocalPrefs({ ...prefs, language: value })}
            >
              <SelectTrigger id="voice-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice selection */}
          {ttsSupported && (
            <div className="space-y-2">
              <Label htmlFor="voice-uri">Voice</Label>
              <Select
                value={prefs.voiceURI ?? ''}
                onValueChange={(value) => setLocalPrefs({ ...prefs, voiceURI: value })}
              >
                <SelectTrigger id="voice-uri">
                  <SelectValue placeholder="Default voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default voice</SelectItem>
                  {filteredVoices.map((voice) => (
                    <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filteredVoices.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  No voices available for {prefs.language}. Try a different language.
                </p>
              )}
            </div>
          )}

          {/* Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-sm font-medium">Speech Rate</Label>
              <span className="text-muted-foreground font-mono text-xs">
                {prefs.rate.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[prefs.rate]}
              onValueChange={([v]) => setLocalPrefs({ ...prefs, rate: v })}
              min={0.5}
              max={2.0}
              step={0.1}
              aria-label="Speech rate"
            />
          </div>

          {/* Pitch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-sm font-medium">Pitch</Label>
              <span className="text-muted-foreground font-mono text-xs">
                {prefs.pitch.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[prefs.pitch]}
              onValueChange={([v]) => setLocalPrefs({ ...prefs, pitch: v })}
              min={0}
              max={2.0}
              step={0.1}
              aria-label="Pitch"
            />
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-sm font-medium">
                <Volume2 className="mr-1 inline h-3.5 w-3.5" />
                Volume
              </Label>
              <span className="text-muted-foreground font-mono text-xs">
                {Math.round(prefs.volume * 100)}%
              </span>
            </div>
            <Slider
              value={[prefs.volume]}
              onValueChange={([v]) => setLocalPrefs({ ...prefs, volume: v })}
              min={0}
              max={1.0}
              step={0.05}
              aria-label="Volume"
            />
          </div>

          {/* Auto-speak */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label className="text-foreground text-sm font-medium">Auto-speak AI Responses</Label>
              <p className="text-muted-foreground text-xs">
                Automatically speak the AI teacher&apos;s responses.
              </p>
            </div>
            <Switch
              checked={prefs.autoSpeak}
              onCheckedChange={(checked) => setLocalPrefs({ ...prefs, autoSpeak: checked })}
              aria-label="Auto-speak AI responses"
            />
          </div>

          {/* Test voice */}
          {ttsSupported && prefs.enabled && (
            <Button variant="outline" onClick={handleTestVoice} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Test Voice
            </Button>
          )}

          {/* Browser support warning */}
          {!ttsSupported && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-500">
              Text-to-speech is not supported in this browser. Use Chrome, Edge, or Safari.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
