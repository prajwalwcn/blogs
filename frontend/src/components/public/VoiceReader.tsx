"use client";

import * as React from "react";
import { Play, Pause, Square, Volume2, ChevronDown, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceReaderProps {
  text: string;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

export default function VoiceReader({ text }: VoiceReaderProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [speed, setSpeed] = React.useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = React.useState(true);

  const speedMenuRef = React.useRef<HTMLDivElement>(null);

  // Check speechSynthesis support on mount
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setHasSpeechSupport(false);
    }
  }, []);

  // Split text into readable sentences
  const sentences = React.useMemo(() => {
    if (!text) return [];
    return text
      .split(/[.!?।]\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2); // Exclude very short chunks
  }, [text]);

  const sentencesCount = sentences.length;

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle clicking outside of the speed dropdown to close it
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Stop speaking
  const handleStop = React.useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(0);
  }, []);

  // Speak a sentence at a given index
  const speakSentence = React.useCallback(
    (index: number, overrideSpeed?: number) => {
      if (typeof window === "undefined" || !window.speechSynthesis || index >= sentences.length) {
        handleStop();
        return;
      }

      window.speechSynthesis.cancel();

      const sentenceText = sentences[index];
      const utterance = new SpeechSynthesisUtterance(sentenceText);
      
      // Auto detect simple Nepali unicode block and apply Nepali voice locale
      if (/[\u0900-\u097F]/.test(sentenceText)) {
        utterance.lang = "ne-NP";
      } else {
        utterance.lang = "en-US";
      }

      const activeSpeed = overrideSpeed !== undefined ? overrideSpeed : speed;
      utterance.rate = activeSpeed;

      utterance.onend = () => {
        const nextIndex = index + 1;
        if (nextIndex < sentences.length) {
          setCurrentIndex(nextIndex);
          speakSentence(nextIndex);
        } else {
          handleStop();
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== "interrupted") {
          console.error("SpeechSynthesis error:", e);
          handleStop();
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [sentences, speed, handleStop]
  );

  // Play and Pause handlers
  const handlePlayPause = () => {
    if (typeof window === "undefined" || !window.speechSynthesis || sentences.length === 0) return;

    if (isPlaying && !isPaused) {
      // Pause: stop speech and update state
      window.speechSynthesis.cancel();
      setIsPaused(true);
    } else if (isPlaying && isPaused) {
      // Resume: play from recorded index
      setIsPaused(false);
      speakSentence(currentIndex);
    } else {
      // Play: start fresh or resume from top
      setIsPlaying(true);
      setIsPaused(false);
      speakSentence(currentIndex);
    }
  };

  // Adjust rate/speed
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    setShowSpeedMenu(false);
    if (isPlaying && !isPaused) {
      speakSentence(currentIndex, newSpeed);
    }
  };

  if (!hasSpeechSupport || sentences.length === 0) {
    return null;
  }

  // Calculate percentage progress
  const progressPercentage = sentencesCount > 0 ? Math.round((currentIndex / sentencesCount) * 100) : 0;
  
  // Detect if the content looks like Nepali to adapt label
  const isNepali = sentences[0] ? /[\u0900-\u097F]/.test(sentences[0]) : false;
  const labelText = isNepali ? "आलेख सुन्नुहोस्" : "Listen to this article";

  return (
    <div className="w-full bg-[#6F980E] dark:bg-[#1f5284] text-white rounded-lg p-2.5 px-4 shadow-sm select-none my-4 flex items-center justify-between gap-3 relative transition-all duration-300 animate-in fade-in duration-300">
      
      {/* Left: Speaker icon + Text label + Visualizer */}
      <div className="flex items-center gap-2.5">
        <Volume2 className="h-4 w-4 text-white/90 shrink-0" />
        <span className="text-xs sm:text-[13px] font-bold text-white tracking-wide">
          {labelText}
        </span>
        
        {/* Visualizer animation when playing */}
        {isPlaying && !isPaused && (
          <div className="flex items-end gap-0.5 h-3 pb-[1px]">
            <span className="w-[2.5px] bg-white rounded-full animate-bounce h-1.5" style={{ animationDuration: "0.6s" }}></span>
            <span className="w-[2.5px] bg-white rounded-full animate-bounce h-3" style={{ animationDuration: "0.4s", animationDelay: "0.15s" }}></span>
            <span className="w-[2.5px] bg-white rounded-full animate-bounce h-2" style={{ animationDuration: "0.7s", animationDelay: "0.3s" }}></span>
            <span className="w-[2.5px] bg-white rounded-full animate-bounce h-1" style={{ animationDuration: "0.5s", animationDelay: "0.45s" }}></span>
          </div>
        )}
      </div>

      {/* Right: Stop button + Play/Pause button + Speed selector */}
      <div className="flex items-center gap-2 relative">
        
        {/* Stop Button */}
        {isPlaying && (
          <button
            onClick={handleStop}
            className="h-7 w-7 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all shadow-sm active:scale-95"
            title="Stop"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        )}

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="h-7 px-3 rounded bg-white text-[#2665A3] hover:bg-white/95 text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-sm active:scale-97"
        >
          {isPlaying && !isPaused ? (
            <>
              <Pause className="h-3 w-3 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3 fill-current" />
              <span>{isPaused ? "Resume" : "Listen"}</span>
            </>
          )}
        </button>

        {/* Speed Rate Dropdown */}
        <div className="relative" ref={speedMenuRef}>
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="h-7 px-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-0.5 cursor-pointer transition-all"
          >
            <Sliders className="h-3 w-3" />
            <span>{speed}x</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", showSpeedMenu && "rotate-180")} />
          </button>

          {showSpeedMenu && (
            <div className="absolute right-0 bottom-full mb-1.5 w-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden z-30 animate-in fade-in slide-in-from-bottom-2 duration-150 text-zinc-800 dark:text-zinc-200">
              <div className="py-0.5">
                {SPEED_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSpeedChange(opt)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 text-xs font-semibold cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/65 flex items-center justify-between",
                      speed === opt ? "text-brand-orange dark:text-brand-orange font-bold bg-brand-orange/5" : "text-zinc-650 dark:text-zinc-350"
                    )}
                  >
                    <span>{opt.toFixed(2)}x</span>
                    {speed === opt && <span className="h-1 w-1 rounded-full bg-brand-orange" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Thin Bottom Progress Line (Visible only when playing) */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/25 rounded-b-lg overflow-hidden">
          <div
            className="bg-[#F47621] h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

    </div>
  );
}
