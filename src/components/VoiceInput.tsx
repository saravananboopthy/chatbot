import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Howl } from 'howler';

interface VoiceInputProps {
  onVoiceInput: (text: string) => void;
  isActive?: boolean;
}

const startSound = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'],
  volume: 0.5
});

const stopSound = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'],
  volume: 0.5
});

// Language mapping for speech recognition
const speechLanguages: { [key: string]: string } = {
  en: 'en-US',
  es: 'es-ES',
  hi: 'hi-IN',
  ta: 'ta-IN',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  ar: 'ar-SA'
};

export default function VoiceInput({ onVoiceInput, isActive = true }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const { t, i18n } = useTranslation();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && isActive) {
      onVoiceInput(transcript);
      resetTranscript();
    }
  }, [transcript, onVoiceInput, isActive]);

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let animationFrame: number;

    const updateAudioLevel = () => {
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
      }
      animationFrame = requestAnimationFrame(updateAudioLevel);
    };

    if (isListening && isActive) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioContext = new AudioContext();
          analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          analyser.fftSize = 256;
          dataArray = new Uint8Array(analyser.frequencyBinCount);
          updateAudioLevel();
          startSound.play();
        })
        .catch(err => console.error('Error accessing microphone:', err));
    }

    return () => {
      if (audioContext) {
        audioContext.close();
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (isListening) {
        stopSound.play();
      }
    };
  }, [isListening, isActive]);

  const toggleListening = () => {
    if (!isActive) return;
    
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      resetTranscript();
      stopSound.play();
    } else {
      const language = speechLanguages[i18n.language] || 'en-US';
      SpeechRecognition.startListening({ 
        continuous: true,
        language: language
      });
      setIsListening(true);
      startSound.play();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  if (!isMicrophoneAvailable) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-red-400 text-sm"
      >
        {t('microphoneNotAvailable')}
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={toggleListening}
        disabled={!isActive}
        className={`p-4 rounded-full transition-all duration-300 relative ${
          !isActive 
            ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
            : isListening 
              ? 'bg-red-500 text-white' 
              : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        whileHover={isActive ? { scale: 1.1 } : {}}
        whileTap={isActive ? { scale: 0.9 } : {}}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <MicOff size={24} className="animate-pulse" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="not-listening"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {isListening && isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/10 min-w-[200px]"
        >
          <div className="flex items-center space-x-2">
            <Volume2 size={16} className="text-white/60" />
            <div className="h-1 bg-white/20 rounded-full flex-1">
              <motion.div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-white/60 mt-1 text-center">
            {t('speakNow')}
          </p>
        </motion.div>
      )}
    </div>
  );
}