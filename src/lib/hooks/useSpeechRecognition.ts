import { useEffect, useRef, useState, useCallback } from "react";

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition({
  lang = "en-US",
  continuous = false,
  interimResults = false,
  onResult,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (lang !== "en-US") {
      setError("Only English (en-US) is supported at this time.");
      return;
    }
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      setError("Speech Recognition not supported in this browser.");
      return;
    }
    type SpeechRecognitionConstructor = new () => SpeechRecognition;
    const getSpeechRecognition = ():
      | SpeechRecognitionConstructor
      | undefined => {
      if (typeof window === "undefined") return undefined;
      return (
        (window as { SpeechRecognition?: SpeechRecognitionConstructor })
          .SpeechRecognition ||
        (window as { webkitSpeechRecognition?: SpeechRecognitionConstructor })
          .webkitSpeechRecognition
      );
    };
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError("Speech Recognition constructor not found.");
      return;
    }
    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);
      if (onResult) {
        onResult(fullTranscript, !!finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
    // Only re-create if language/continuous/interimResults change
  }, [lang, continuous, interimResults, onResult]);

  const startListening = useCallback(() => {
    setError(null);
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    error,
    toggleListening,
    startListening,
    stopListening,
    resetTranscript,
  };
}
