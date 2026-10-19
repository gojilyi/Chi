/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Check, 
  Copy, 
  Mic, 
  Music, 
  Layers, 
  Type, 
  Upload, 
  ExternalLink,
  Flame,
  Film,
  Terminal,
  Smartphone,
  Monitor
} from 'lucide-react';
import { 
  READY_BACKGROUNDS, 
  ReadyBackgroundItem, 
  SAMPLE_SHEIKH_LESSONS 
} from '../../constants/autoLectureDefaults';
import { generateASS, generateSRT } from '../../constants/calligraphyDefaults';
import { audioEngine } from '../../services/audioEngine';

interface AutoLectureMakerScreenProps {
  onOpenInEditor: (bgUrl: string, title: string, words: any[], audioUrl?: string) => void;
}

export const AutoLectureMakerScreen: React.FC<AutoLectureMakerScreenProps> = ({
  onOpenInEditor,
}) => {
  const [selectedBg, setSelectedBg] = useState<ReadyBackgroundItem>(READY_BACKGROUNDS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLesson, setSelectedLesson] = useState(SAMPLE_SHEIKH_LESSONS[0]);
  const [fontFamily, setFontFamily] = useState<'Aref Ruqaa' | 'Amiri' | 'Cairo'>('Aref Ruqaa');
  const [highlightColor, setHighlightColor] = useState<string>('#FFDF9E');
  const [fontSize, setFontSize] = useState<number>(36);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');

  // Custom text and upload states
  const [isCustomTextMode, setIsCustomTextMode] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>(SAMPLE_SHEIKH_LESSONS[0].text);
  const [customLessonTitle, setCustomLessonTitle] = useState<string>(SAMPLE_SHEIKH_LESSONS[0].title);
  const [customDuration, setCustomDuration] = useState<number>(SAMPLE_SHEIKH_LESSONS[0].durationSec);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [uploadedAudioName, setUploadedAudioName] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportDone, setIsExportDone] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  const duration = selectedLesson.durationSec;
  const playIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleApplyCustomText = () => {
    const rawWords = customText.trim().split(/\s+/).filter(Boolean);
    if (rawWords.length === 0) return;

    const wordDurationMs = Math.max(800, Math.floor((customDuration * 1000) / rawWords.length));
    const generatedWords = rawWords.map((w, idx) => ({
      id: `w_${Date.now()}_${idx}`,
      word: w,
      startMs: idx * wordDurationMs + 200,
      endMs: (idx + 1) * wordDurationMs,
    }));

    const newLesson = {
      id: `custom_lesson_${Date.now()}`,
      title: customLessonTitle || 'درس الشيخ المخصص',
      sheikh: 'الشيخ العيد',
      durationSec: customDuration,
      text: customText,
      words: generatedWords,
    };

    setSelectedLesson(newLesson);
    setCurrentTime(0);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    audioEngine.seek(newTime);
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setCustomLessonTitle(`تسجيل: ${fileNameWithoutExt}`);
      setUploadedAudioName(file.name);

      const processAudio = (audioDur: number, finalSrc: string) => {
        setCustomAudioUrl(finalSrc);
        setCustomDuration(audioDur);
        const rawWords = customText.trim().split(/\s+/).filter(Boolean);
        const wordDurationMs = Math.max(500, Math.floor((audioDur * 1000) / (rawWords.length || 1)));
        const generatedWords = rawWords.map((w, idx) => ({
          id: `w_up_${idx}`,
          word: w,
          startMs: idx * wordDurationMs + 200,
          endMs: (idx + 1) * wordDurationMs,
        }));
        setSelectedLesson({
          id: `audio_${Date.now()}`,
          title: `تسجيل: ${fileNameWithoutExt}`,
          sheikh: 'الشيخ العيد',
          durationSec: audioDur,
          text: customText,
          words: generatedWords,
        });
        setCurrentTime(0);
        setIsPlaying(true);
      };

      const tempAudio = new Audio();
      tempAudio.src = blobUrl;
      tempAudio.onloadedmetadata = () => {
        const audioDur = Math.round(tempAudio.duration) || 15;
        if (file.size < 12 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            processAudio(audioDur, dataUrl || blobUrl);
          };
          reader.onerror = () => {
            processAudio(audioDur, blobUrl);
          };
          reader.readAsDataURL(file);
        } else {
          processAudio(audioDur, blobUrl);
        }
      };

      tempAudio.onerror = () => {
        processAudio(15, blobUrl);
      };
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newBgItem: ReadyBackgroundItem = {
        id: `custom_bg_${Date.now()}`,
        name: `خلفية خاصة: ${file.name}`,
        category: 'mosque',
        categoryLabel: 'مخصصة',
        assetPath: `assets/backgrounds/${file.name}`,
        imageUrl: url,
        isVideoLoop: file.type.startsWith('video'),
        recommendedRatio: 'all',
        description: 'خلفية تم رفعها من جهازك',
      };
      setSelectedBg(newBgItem);
    }
  };

  // Filter backgrounds
  const filteredBackgrounds = selectedCategory === 'all'
    ? READY_BACKGROUNDS
    : READY_BACKGROUNDS.filter((b) => b.category === selectedCategory);

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      audioEngine.playReplacedTrack(
        'spiritual_drone',
        0.95,
        customAudioUrl || undefined,
        currentTime
      );
      playIntervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            audioEngine.seek(0);
            return 0; // loop
          }
          return Math.min(duration, prev + 0.1);
        });
      }, 100);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
      audioEngine.pause();
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
      audioEngine.pause();
    };
  }, [isPlaying, duration, customAudioUrl]);

  // Synchronized Canvas Rendering with Karaoke Text
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let animT = 0;

    const render = () => {
      animT += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw looping background
      const img = bgImageRef.current;
      const isImgReady = Boolean(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
      let drawn = false;

      if (isImgReady && img) {
        try {
          ctx.drawImage(img, 0, 0, w, h);
          drawn = true;
        } catch {
          drawn = false;
        }
      }

      if (!drawn) {
        ctx.fillStyle = '#12161A';
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Subtle Dark overlay & vignette for high legibility
      const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.85);
      vig.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
      vig.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // 3. Ambient warm particle float
      ctx.fillStyle = 'rgba(255, 223, 140, 0.6)';
      for (let i = 0; i < 20; i++) {
        const px = ((Math.sin(i * 45 + animT * 0.5) * 0.5 + 0.5) * w);
        const py = ((i * 35 + animT * 15) % h);
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Render Word-Level Karaoke Calligraphy
      const currentMs = currentTime * 1000;
      const words = selectedLesson.words;
      const fontFace = fontFamily === 'Aref Ruqaa' ? `'Aref Ruqaa', cursive` : `'${fontFamily}', serif`;

      ctx.save();
      ctx.font = `bold ${fontSize * (w / 420)}px ${fontFace}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Shadow for calligraphy
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      const centerY = h * 0.65;
      const spaceW = ctx.measureText(' ').width;

      // Calculate total text width to center properly in RTL
      const measuredWords = words.map((w) => ({
        ...w,
        width: ctx.measureText(w.word).width,
      }));
      const totalTextWidth = measuredWords.reduce((acc, curr) => acc + curr.width, 0) + (words.length - 1) * spaceW;

      let currentX = (w + totalTextWidth) / 2; // Start from right side of centered block

      measuredWords.forEach((wordObj) => {
        const isActive = currentMs >= wordObj.startMs && currentMs <= wordObj.endMs;
        const isPast = currentMs > wordObj.endMs;

        if (isActive) {
          // Highlight with glowing gold
          ctx.fillStyle = highlightColor;
          ctx.shadowColor = 'rgba(255, 223, 158, 0.95)';
          ctx.shadowBlur = 18;
        } else if (isPast) {
          // Spoken word: warm parchment white
          ctx.fillStyle = '#E3E2E6';
          ctx.shadowBlur = 8;
        } else {
          // Upcoming word: soft dim white
          ctx.fillStyle = 'rgba(227, 226, 230, 0.45)';
          ctx.shadowBlur = 3;
        }

        ctx.fillText(wordObj.word, currentX - wordObj.width / 2, centerY);
        currentX -= (wordObj.width + spaceW);
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedBg, currentTime, selectedLesson, fontFamily, highlightColor, fontSize, aspectRatio]);

  // Generate .ass and FFmpeg command
  const assSubtitles = generateASS(selectedLesson.words, fontFamily);
  const ffmpegCommand = `ffmpeg -loop 1 -i "${selectedBg.assetPath}" -i "assets/audio/sheikh_lesson.mp3" \\
  -vf "ass='assets/subtitles/lesson_karaoke.ass':fontsdir='assets/fonts'" \\
  -c:v libx264 -tune stillimage -preset medium -crf 20 \\
  -c:a aac -b:a 192k -shortest -pix_fmt yuv420p output_auto_lesson.mp4`;

  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    setIsExportDone(false);

    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setIsExporting(false);
        setIsExportDone(true);
      }
      setExportProgress(p);
    }, 200);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hidden background image for canvas painter */}
      <img
        ref={bgImageRef}
        src={selectedBg.imageUrl}
        alt={selectedBg.name}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E2024] via-[#1A1C1E] to-[#121316] border border-[#2B2C30] rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#121316] border border-[#2B2C30] text-xs text-[#89F8C7] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#006C4C]" />
            <span>نظام المونتاج الذكي المتزامن مع الصوت</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E3E2E6] font-cairo">
            صناعة الدروس التلقائية (Auto Lesson Maker)
          </h1>
          <p className="text-xs sm:text-sm text-[#8E9192] mt-1 max-w-2xl leading-relaxed">
            اختر خلفية من المكتبة الجاهزة، وأدرج صوت درس الشيخ؛ وسيقوم النظام بتكرار الخلفية تلقائياً ورسم النص بخط الرقعة مع تأثير الكاريوكي المتغير لحظياً مع نطق الكلمات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenInEditor(selectedBg.imageUrl, selectedLesson.title, selectedLesson.words, customAudioUrl || undefined)}
            className="px-4 py-2.5 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0 active:scale-[0.98]"
          >
            <span>فتح في المحرر المتقدم</span>
          </button>
        </div>
      </div>

      {/* Workspace Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Center: Interactive Preview & Audio Controls (5 cols) */}
        <div className="lg:col-span-5 bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-md flex flex-col items-center space-y-4">
          
          <div className="w-full flex items-center justify-between text-xs text-[#8E9192] pb-2 border-b border-[#2B2C30]">
            <span className="font-bold text-[#E3E2E6] flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#89F8C7]" />
              <span>معاينة الدرس مع كاريوكي الكلمات</span>
            </span>
            <div className="flex items-center gap-1 font-mono text-[#89F8C7]">
              <span>{currentTime.toFixed(1)}s</span>
              <span>/</span>
              <span>{duration}s</span>
            </div>
          </div>

          {/* Video Preview Canvas */}
          <div 
            className="relative bg-black rounded-xl overflow-hidden border border-[#36373B] shadow-inner flex items-center justify-center"
            style={{
              width: aspectRatio === '9:16' ? '280px' : '420px',
              maxWidth: '100%',
              height: aspectRatio === '9:16' ? '498px' : '236px',
            }}
          >
            <canvas
              ref={canvasRef}
              width={aspectRatio === '9:16' ? 450 : 800}
              height={aspectRatio === '9:16' ? 800 : 450}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => setIsPlaying(!isPlaying)}
            />

            {!isPlaying && (
              <div 
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-[#006C4C]/90 text-white flex items-center justify-center shadow-lg border border-[#89F8C7]/40 group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Transport Bar */}
          <div className="w-full space-y-2 pt-1">
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSeek(0)}
                  className="p-1.5 rounded-lg bg-[#292A2E] text-[#8E9192] hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-1.5 rounded-lg bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل المعاينة'}</span>
                </button>
              </div>

              {/* Aspect Ratio Switch */}
              <div className="flex items-center gap-1 p-0.5 bg-[#121316] rounded-lg border border-[#2B2C30]">
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                    aspectRatio === '9:16' ? 'bg-[#006C4C] text-white font-bold' : 'text-[#8E9192]'
                  }`}
                >
                  9:16
                </button>
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                    aspectRatio === '16:9' ? 'bg-[#006C4C] text-white font-bold' : 'text-[#8E9192]'
                  }`}
                >
                  16:9
                </button>
              </div>
            </div>
          </div>

          {/* Fast Export CTA */}
          <div className="w-full pt-2">
            {!isExporting && !isExportDone && (
              <button
                onClick={handleStartExport}
                className="w-full h-11 rounded-xl bg-[#89F8C7] hover:bg-[#72dbb0] text-[#002114] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>دمج وتصدير الدرس التلقائي الآن</span>
              </button>
            )}

            {isExporting && (
              <div className="p-3 bg-[#121316] rounded-xl border border-[#2B2C30] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#89F8C7]">جاري تكرار الخلفية وحرق الكاريوكي...</span>
                  <span className="font-mono text-[#89F8C7]">{exportProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#202226] overflow-hidden">
                  <div
                    className="h-full bg-[#006C4C] transition-all duration-150"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            {isExportDone && (
              <div className="p-3 bg-[#006C4C]/30 border border-[#89F8C7]/40 rounded-xl flex items-center justify-between">
                <span className="text-xs text-[#89F8C7] font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>اكتمل الدمج بنجاح!</span>
                </span>
                <a
                  href={selectedBg.imageUrl}
                  download="sheikh_eid_auto_lesson.mp4"
                  className="px-3 py-1.5 rounded-lg bg-[#89F8C7] text-[#002114] text-xs font-bold hover:bg-white transition-colors"
                >
                  تنزيل الفيديو
                </a>
              </div>
            )}
          </div>

        </div>

        {/* Right: Step-by-Step Configuration Panels (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: Ready-made Backgrounds Grid View (المتطلب 1) */}
          <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white text-[11px] font-mono flex items-center justify-center">
                    1
                  </span>
                  <span>مكتبة الخلفيات الجاهزة (Grid View من assets/backgrounds)</span>
                </h3>
                <p className="text-[11px] text-[#8E9192]">
                  اختر خلفية ثابتة أو فيديو صامت لتكراره تلقائياً ليطابق مدة الصوت
                </p>
              </div>

              {/* Category Pills & Upload Background */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'mosque', label: 'مساجد' },
                  { id: 'parchment', label: 'مخطوطات' },
                  { id: 'quran', label: 'مصاحف' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                      selectedCategory === c.id
                        ? 'bg-[#006C4C] text-white font-bold'
                        : 'bg-[#121316] text-[#8E9192] hover:text-[#E3E2E6]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}

                <button
                  onClick={() => bgInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] border border-[#36373B] transition-colors flex items-center gap-1"
                  title="رفع صورة أو فيديو من جهازك"
                >
                  <Upload className="w-3 h-3" />
                  <span>رفع خلفية</span>
                </button>
                <input
                  ref={bgInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleCustomBgUpload}
                />
              </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredBackgrounds.map((bg) => {
                const isSelected = selectedBg.id === bg.id;
                return (
                  <div
                    key={bg.id}
                    onClick={() => setSelectedBg(bg)}
                    className={`rounded-xl border overflow-hidden cursor-pointer transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#89F8C7] ring-2 ring-[#006C4C] shadow-lg scale-[1.02]'
                        : 'border-[#2B2C30] hover:border-[#46484C]'
                    }`}
                  >
                    <div className="relative h-28 bg-[#121316] overflow-hidden">
                      <img
                        src={bg.imageUrl}
                        alt={bg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-[#89F8C7]">
                        {bg.categoryLabel}
                      </span>
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#006C4C]/25 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-[#006C4C] text-white flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-[#17191C]">
                      <h4 className="text-xs font-bold text-[#E3E2E6] truncate" title={bg.name}>
                        {bg.name}
                      </h4>
                      <p className="text-[10px] text-[#8E9192] truncate mt-0.5">
                        {bg.assetPath}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Sheikh Audio Lesson & Synchronized Text (المتطلب 2) */}
          <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white text-[11px] font-mono flex items-center justify-center">
                    2
                  </span>
                  <span>تزامن النص مع صوت الشيخ (Speech-to-Text & Karaoke .ass)</span>
                </h3>
                <p className="text-[11px] text-[#8E9192]">
                  اختر درساً جاهزاً، أو ارفع تسجيلاً، أو عدل النص يدوياً ليتزامن مع الكاريوكي
                </p>
              </div>

              {/* Upload audio action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] text-xs font-semibold border border-[#36373B] flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صوت الشيخ (MP3)</span>
                </button>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleCustomAudioUpload}
                />

                <button
                  onClick={() => setIsCustomTextMode(!isCustomTextMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    isCustomTextMode 
                      ? 'bg-[#006C4C] text-white border-[#89F8C7]' 
                      : 'bg-[#121316] text-[#C4C7C8] border-[#2B2C30] hover:text-white'
                  }`}
                >
                  <Type className="w-3.5 h-3.5 text-[#FFDF9E]" />
                  <span>{isCustomTextMode ? 'إغلاق المحرر' : 'تعديل النص يدوياً'}</span>
                </button>
              </div>
            </div>

            {/* Uploaded Audio Info Card */}
            {uploadedAudioName && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#006C4C]/25 to-[#122B22]/40 border border-[#89F8C7]/40 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#006C4C] text-white flex items-center justify-center">
                    <Music className="w-4 h-4 text-[#89F8C7]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#89F8C7] flex items-center gap-2">
                      <span>🎵 تسجيل صوت الشيخ المرفوع: {uploadedAudioName}</span>
                      <span className="text-[10px] bg-[#006C4C] text-white px-1.5 py-0.2 rounded font-sans">
                        نشط
                      </span>
                    </div>
                    <div className="text-[11px] text-[#C4C7C8] mt-0.5">
                      المدة: {customDuration} ثانية · الصوت قيد العمل ويتزامن مباشرة مع كاريوكي الكلمات
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#006C4C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#00573c] transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'إيقاف' : 'تشغيل الصوت'}</span>
                </button>
              </div>
            )}

            {/* Custom Text Editing Box */}
            {isCustomTextMode && (
              <div className="p-4 rounded-xl bg-[#121316] border border-[#006C4C]/60 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#89F8C7] font-semibold">
                  <span>محرر نص الدرس والتوقيت التلقائي للكاريوكي</span>
                  <span className="text-[10px] text-[#8E9192]">يتم تقسيم الكلمات وتوزيع توقيتها تلقائياً</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customLessonTitle}
                    onChange={(e) => setCustomLessonTitle(e.target.value)}
                    placeholder="عنوان الدرس أو الموعظة"
                    className="w-full bg-[#1A1C1E] border border-[#2B2C30] rounded-lg p-2 text-xs text-[#E3E2E6] outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8E9192] whitespace-nowrap">المدة (ثوانٍ):</span>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(Math.max(5, parseInt(e.target.value) || 15))}
                      className="w-20 bg-[#1A1C1E] border border-[#2B2C30] rounded-lg p-2 text-xs text-[#89F8C7] font-mono outline-none"
                    />
                  </div>
                </div>

                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="اكتب الآية الكريمة أو مقطع موعظة الشيخ هنا..."
                  rows={3}
                  className="w-full bg-[#1A1C1E] border border-[#2B2C30] rounded-lg p-2.5 text-xs text-[#E3E2E6] font-ruqaa text-base outline-none resize-none"
                />

                <button
                  onClick={handleApplyCustomText}
                  className="px-4 py-2 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
                >
                  <Check className="w-3.5 h-3.5 text-[#89F8C7]" />
                  <span>تطبيق النص وتحديث الكاريوكي المتزامن</span>
                </button>
              </div>
            )}

            {/* Lesson Selector Radio Cards */}
            <div className="space-y-2">
              {SAMPLE_SHEIKH_LESSONS.map((lesson) => {
                const isSelected = selectedLesson.id === lesson.id;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setCustomText(lesson.text);
                      setCustomLessonTitle(lesson.title);
                      setCustomDuration(lesson.durationSec);
                      setCurrentTime(0);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#006C4C]/20 border-[#006C4C]'
                        : 'bg-[#121316] border-[#2B2C30] hover:border-[#3E4045]'
                    }`}
                  >
                    <div className="truncate">
                      <span className="text-xs font-bold text-[#E3E2E6] block truncate">
                        {lesson.title}
                      </span>
                      <span className="font-ruqaa text-sm text-[#FFDF9E] block truncate mt-0.5">
                        "{lesson.text}"
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-[#89F8C7] bg-[#202226] px-2 py-0.5 rounded">
                        {lesson.durationSec}s
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                        isSelected ? 'bg-[#006C4C] text-white' : 'bg-[#202226] text-[#8E9192]'
                      }`}>
                        {isSelected ? 'محدد' : 'اختيار'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Typography & Karaoke Color Tuning */}
          <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white text-[11px] font-mono flex items-center justify-center">
                  3
                </span>
                <span>تخصيص الخط العربي ولون الكاريوكي عند النطق</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#8E9192] block mb-1">نوع الخط المخطوط:</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as any)}
                  className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl p-2.5 text-xs text-[#E3E2E6] outline-none"
                >
                  <option value="Aref Ruqaa">خط الرقعة التراثي (Aref Ruqaa)</option>
                  <option value="Amiri">خط النسخ القرآني (Amiri)</option>
                  <option value="Cairo">خط القاهرة الحديث (Cairo)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#8E9192] block mb-1">لون الكلمة عند نطقها:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={highlightColor}
                    onChange={(e) => setHighlightColor(e.target.value)}
                    className="w-9 h-9 rounded-xl bg-transparent border border-[#2B2C30] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-[#FFDF9E] font-bold">
                    {highlightColor === '#FFDF9E' ? 'ذهبي دافئ' : highlightColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#8E9192] block mb-1">
                  حجم الخط ({fontSize}px):
                </label>
                <input
                  type="range"
                  min="24"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg mt-3"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: Smart FFmpeg Command & Dart Function (المتطلب 3) */}
          <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#89F8C7]" />
                  <span>دالة الدمج الذكي وأمر FFmpeg Kit المتولد</span>
                </h3>
                <p className="text-[11px] text-[#8E9192]">
                  تكرار الخلفية (-loop 1) + دمج الصوت + حرق كاريوكي .ass مع خط الرقعة
                </p>
              </div>

              <button
                onClick={handleCopyCmd}
                className="inline-flex items-center gap-1.5 text-xs text-[#89F8C7] hover:text-white transition-colors"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'تم النسخ!' : 'نسخ الأمر'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-[#0F1012] border border-[#2B2C30] text-[11px] font-mono text-[#89F8C7] overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {ffmpegCommand}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
