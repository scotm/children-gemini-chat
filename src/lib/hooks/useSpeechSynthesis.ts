import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechSynthesisOptions {
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
}

export function useSpeechSynthesis({
  onEnd,
  onError,
}: UseSpeechSynthesisOptions = {}) {
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices and select a default
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.startsWith("en"));
      setAvailableVoices(voices);
      let childVoice = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("child") ||
          voice.name.toLowerCase().includes("kid") ||
          voice.name.toLowerCase().includes("junior")
      );
      if (!childVoice) {
        childVoice = voices.find((voice) =>
          voice.name.toLowerCase().includes("female")
        );
      }
      if (childVoice) {
        setSelectedVoice(childVoice);
      } else if (voices.length > 0) {
        setSelectedVoice(voices[0]);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Speak function
  const speak = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) {
        console.warn("Text-to-Speech not supported in this browser.");
        return;
      }
      if (!text.trim()) return;
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice || availableVoices[0] || null;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = (event) => {
        setSpeaking(false);
        if (onError) onError(event);
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, availableVoices, onEnd, onError]
  );

  // Stop function
  const stop = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return {
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    speak,
    speaking,
    stop,
  };
}
