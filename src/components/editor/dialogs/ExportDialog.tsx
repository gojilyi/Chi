/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  Download, 
  Terminal, 
  Play, 
  Sparkles, 
  Film, 
  Music, 
  Image as ImageIcon,
  Layers,
  Settings2
} from 'lucide-react';
import { ProjectDraft, ExportFormatType, ExportResolutionType } from '../../../types';
import { FFmpegGenerator } from '../../../services/ffmpegGenerator';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  draft: ProjectDraft;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  draft,
}) => {
  if (!isOpen) return null;

  const [selectedFormat, setSelectedFormat] = useState<ExportFormatType>('mp4');
  const [selectedResolution, setSelectedResolution] = useState<ExportResolutionType>('1080p');
  const [selectedFps, setSelectedFps] = useState<number>(30);

  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedDart, setCopiedDart] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const ffmpegData = FFmpegGenerator.generate(draft, {
    format: selectedFormat,
    resolution: selectedResolution,
    fps: selectedFps,
  });

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(ffmpegData.command);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleCopyDart = () => {
    navigator.clipboard.writeText(ffmpegData.dartCode);
    setCopiedDart(true);
    setTimeout(() => setCopiedDart(false), 2000);
  };

  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    setIsDone(false);

    let p = 0;
    const interval = setInterval(() => {
      p += 14;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setIsExporting(false);
        setIsDone(true);
      }
      setExportProgress(p);
    }, 200);
  };

  // Determine downloadable URL
  const getDownloadUrl = () => {
    if (selectedFormat === 'mp3') {
      return draft.replacedAudio?.audioUrl || draft.videoSourceUrl;
    }
    return draft.videoSourceUrl;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-[#2B2C30] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#89F8C7]/20 border border-[#89F8C7]/40 flex items-center justify-center text-[#89F8C7]">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E3E2E6] flex items-center gap-2">
                <span>تصدير الفيديو بصيغ وجودات متعددة</span>
                <span className="text-[10px] bg-[#006C4C] text-white px-2 py-0.5 rounded-full font-sans">
                  {selectedFormat.toUpperCase()}
                </span>
              </h3>
              <p className="text-xs text-[#8E9192]">
                تصدير بصيغ MP4، WebM، MOV، GIF، MP3 مع كود Flutter وأمر FFmpeg Kit جاهز
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#292A2E] text-[#8E9192] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* SECTION 1: Select Export Format (الصيغ المختلفة) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#E3E2E6] flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#89F8C7]" />
                <span>اختر صيغة التصدير المطلوبة:</span>
              </span>
              <span className="text-[11px] text-[#8E9192]">
                متوافقة مع كل الأجهزة والمنصات
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* MP4 */}
              <button
                onClick={() => {
                  setSelectedFormat('mp4');
                  setIsDone(false);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  selectedFormat === 'mp4'
                    ? 'bg-[#006C4C]/25 border-[#89F8C7] text-white shadow-sm ring-1 ring-[#89F8C7]/40'
                    : 'bg-[#202226] border-[#2B2C30] text-[#C4C7C8] hover:border-[#3D3F43]'
                }`}
              >
                <Film className="w-4 h-4 text-[#89F8C7]" />
                <span className="text-xs font-bold">MP4</span>
                <span className="text-[10px] text-[#8E9192]">فيديو قياسي H.264</span>
              </button>

              {/* WebM */}
              <button
                onClick={() => {
                  setSelectedFormat('webm');
                  setIsDone(false);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  selectedFormat === 'webm'
                    ? 'bg-[#006C4C]/25 border-[#89F8C7] text-white shadow-sm ring-1 ring-[#89F8C7]/40'
                    : 'bg-[#202226] border-[#2B2C30] text-[#C4C7C8] hover:border-[#3D3F43]'
                }`}
              >
                <Film className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold">WebM</span>
                <span className="text-[10px] text-[#8E9192]">ويب سريع VP9</span>
              </button>

              {/* MOV */}
              <button
                onClick={() => {
                  setSelectedFormat('mov');
                  setIsDone(false);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  selectedFormat === 'mov'
                    ? 'bg-[#006C4C]/25 border-[#89F8C7] text-white shadow-sm ring-1 ring-[#89F8C7]/40'
                    : 'bg-[#202226] border-[#2B2C30] text-[#C4C7C8] hover:border-[#3D3F43]'
                }`}
              >
                <Film className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold">MOV</span>
                <span className="text-[10px] text-[#8E9192]">Apple ProRes</span>
              </button>

              {/* GIF */}
              <button
                onClick={() => {
                  setSelectedFormat('gif');
                  setIsDone(false);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  selectedFormat === 'gif'
                    ? 'bg-[#006C4C]/25 border-[#89F8C7] text-white shadow-sm ring-1 ring-[#89F8C7]/40'
                    : 'bg-[#202226] border-[#2B2C30] text-[#C4C7C8] hover:border-[#3D3F43]'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">GIF</span>
                <span className="text-[10px] text-[#8E9192]">صورة متحركة للآيات</span>
              </button>

              {/* MP3 */}
              <button
                onClick={() => {
                  setSelectedFormat('mp3');
                  setIsDone(false);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  selectedFormat === 'mp3'
                    ? 'bg-[#006C4C]/25 border-[#89F8C7] text-white shadow-sm ring-1 ring-[#89F8C7]/40'
                    : 'bg-[#202226] border-[#2B2C30] text-[#C4C7C8] hover:border-[#3D3F43]'
                }`}
              >
                <Music className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">MP3</span>
                <span className="text-[10px] text-[#8E9192]">صوت نقي فقط</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: Resolution & Frame Rate Settings (الدقة ومعدل الإطارات) */}
          {selectedFormat !== 'mp3' && (
            <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#E3E2E6] flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-[#89F8C7]" />
                  <span>دقة الفيديو ومعدل الإطارات:</span>
                </span>
                <span className="text-[#89F8C7] font-mono text-[11px]">
                  المقاس: {draft.aspectRatio} · المدة: {draft.duration}s
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Resolution buttons */}
                <div className="flex items-center gap-1.5 bg-[#121316] p-1 rounded-xl border border-[#2B2C30]">
                  <button
                    onClick={() => setSelectedResolution('1080p')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                      selectedResolution === '1080p'
                        ? 'bg-[#006C4C] text-white'
                        : 'text-[#8E9192] hover:text-white'
                    }`}
                  >
                    1080p Full HD
                  </button>
                  <button
                    onClick={() => setSelectedResolution('720p')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                      selectedResolution === '720p'
                        ? 'bg-[#006C4C] text-white'
                        : 'text-[#8E9192] hover:text-white'
                    }`}
                  >
                    720p HD (سريع)
                  </button>
                  <button
                    onClick={() => setSelectedResolution('4k')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                      selectedResolution === '4k'
                        ? 'bg-[#006C4C] text-white'
                        : 'text-[#8E9192] hover:text-white'
                    }`}
                  >
                    4K Ultra HD
                  </button>
                </div>

                {/* FPS selector */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#121316] rounded-xl border border-[#2B2C30]">
                  <span className="text-[#8E9192]">معدل الإطارات:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedFps(30)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                        selectedFps === 30 ? 'bg-[#006C4C] text-white' : 'text-[#8E9192]'
                      }`}
                    >
                      30 FPS
                    </button>
                    <button
                      onClick={() => setSelectedFps(60)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                        selectedFps === 60 ? 'bg-[#006C4C] text-white' : 'text-[#8E9192]'
                      }`}
                    >
                      60 FPS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Action Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#006C4C]/25 to-[#121316] border border-[#006C4C]/40 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#89F8C7]" />
                  <span>بدء معالجة وتصدير الملف بصيغة {selectedFormat.toUpperCase()}</span>
                </h4>
                <p className="text-xs text-[#8E9192] mt-0.5">
                  رندرة المشاهد والمؤثرات الصوتية والقرآنية بدقة {selectedResolution}
                </p>
              </div>

              {!isExporting && !isDone && (
                <button
                  onClick={handleStartExport}
                  className="px-5 py-2.5 rounded-xl bg-[#89F8C7] hover:bg-[#72dbb0] text-[#002114] text-xs font-bold transition-all shadow-md active:scale-[0.98] flex items-center gap-2 shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>بدء التصدير الآن</span>
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#89F8C7] font-medium animate-pulse">
                    جاري معالجة الإطارات وتوليد ملف {ffmpegData.outputFilename}...
                  </span>
                  <span className="font-mono text-[#89F8C7]">{exportProgress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#121316] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#006C4C] to-[#89F8C7] transition-all duration-200"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Done Banner */}
            {isDone && (
              <div className="p-4 rounded-xl bg-[#006C4C]/30 border border-[#89F8C7]/50 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs text-[#89F8C7] font-semibold">
                  <Check className="w-4 h-4" />
                  <span>اكتملت المعالجة بصيغة {selectedFormat.toUpperCase()} بنجاح! جاهز للتنزيل المباشر</span>
                </div>
                <a
                  href={getDownloadUrl()}
                  download={ffmpegData.outputFilename}
                  className="px-4 py-2 rounded-xl bg-[#89F8C7] text-[#002114] text-xs font-bold hover:bg-white transition-all shadow flex items-center gap-1.5 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل ملف {selectedFormat.toUpperCase()}</span>
                </a>
              </div>
            )}
          </div>

          {/* Explanation of Filter Pipeline */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#E3E2E6] block">
              خطة المعالجة المجمعة (Filter Pipeline لـ {selectedFormat.toUpperCase()}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ffmpegData.explanationSteps.map((step, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#121316] border border-[#2B2C30]">
                  <div className="font-semibold text-[#89F8C7] mb-0.5">{step.title}</div>
                  <div className="text-[#8E9192] text-[11px] leading-relaxed">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* The Exact FFmpeg Command Line */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#E3E2E6] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#89F8C7]" />
                <span>أمر FFmpeg Kit المباشر لصيغة {selectedFormat.toUpperCase()}:</span>
              </span>
              <button
                onClick={handleCopyCommand}
                className="inline-flex items-center gap-1 text-[11px] text-[#89F8C7] hover:text-white transition-colors"
              >
                {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCommand ? 'تم النسخ!' : 'نسخ الأمر'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-[#0F1012] border border-[#2B2C30] text-[11px] font-mono text-[#C4C7C8] overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {ffmpegData.command}
            </pre>
          </div>

          {/* Flutter Dart Code Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#E3E2E6]">
                كود Dart لحزمة ffmpeg_kit_flutter:
              </span>
              <button
                onClick={handleCopyDart}
                className="inline-flex items-center gap-1 text-[11px] text-[#89F8C7] hover:text-white transition-colors"
              >
                {copiedDart ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDart ? 'تم النسخ!' : 'نسخ كود Dart'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-[#0F1012] border border-[#2B2C30] text-[11px] font-mono text-[#89F8C7] overflow-x-auto leading-relaxed max-h-48 overflow-y-auto">
              {ffmpegData.dartCode}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2B2C30] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-white text-xs font-semibold transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
