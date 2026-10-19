/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Type, Music, Sparkles, VolumeX, Save, Download, PenTool } from 'lucide-react';

interface BottomToolbarProps {
  onOpenText: () => void;
  onOpenAudio: () => void;
  onOpenEffects: () => void;
  onOpenParticles: () => void;
  onOpenMuteReplace: () => void;
  onOpenCalligraphy: () => void;
  onSaveDraft: () => void;
  onExport: () => void;
  isMuted: boolean;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onOpenText,
  onOpenAudio,
  onOpenEffects,
  onOpenParticles,
  onOpenMuteReplace,
  onOpenCalligraphy,
  onSaveDraft,
  onExport,
  isMuted,
}) => {
  return (
    <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-2.5 shadow-lg">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        
        {/* Button 1: خط الريشة والمخطوطة (Calligraphy & STT) - Highlighted */}
        <button
          onClick={onOpenCalligraphy}
          className="h-12 rounded-xl bg-gradient-to-r from-[#785900]/40 to-[#574300]/30 hover:from-[#785900]/60 hover:to-[#574300]/50 text-[#FFDF9E] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-bold border border-[#FFDF9E]/50 active:scale-[0.98] shadow-sm"
        >
          <PenTool className="w-4 h-4 text-[#FFDF9E]" />
          <span>خط الريشة (STT)</span>
        </button>

        {/* Button 2: إضافة نص (Text) */}
        <button
          onClick={onOpenText}
          className="h-12 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#E3E2E6] hover:text-[#89F8C7] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-semibold border border-[#36373B] active:scale-[0.98]"
        >
          <Type className="w-4 h-4 text-[#FFDF9E]" />
          <span>إضافة نص</span>
        </button>

        {/* Button 3: إدراج صوت (Audio) */}
        <button
          onClick={onOpenAudio}
          className="h-12 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#E3E2E6] hover:text-[#89F8C7] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-semibold border border-[#36373B] active:scale-[0.98]"
        >
          <Music className="w-4 h-4 text-[#89F8C7]" />
          <span>إدراج صوت</span>
        </button>

        {/* Button 4: المؤثرات الدينية (Spiritual Effects) */}
        <button
          onClick={onOpenEffects}
          className="h-12 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#E3E2E6] hover:text-[#89F8C7] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-semibold border border-[#36373B] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-[#89F8C7]" />
          <span>المؤثرات</span>
        </button>

        {/* Button 4.5: مكتبة فلاتر الجسيمات (Particle Overlays) */}
        <button
          onClick={onOpenParticles}
          className="h-12 rounded-xl bg-gradient-to-r from-[#004A33]/40 to-[#122b22]/50 hover:from-[#006C4C]/50 hover:to-[#17382d]/60 text-[#89F8C7] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-bold border border-[#006C4C]/60 active:scale-[0.98] shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-[#FFDF9E]" />
          <span>فلاتر الجسيمات</span>
        </button>

        {/* Button 5: كتم وحجب الصوت (Mute & Replace) */}
        <button
          onClick={onOpenMuteReplace}
          className={`h-12 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-semibold border active:scale-[0.98] ${
            isMuted
              ? 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-600/40'
              : 'bg-[#292A2E] hover:bg-[#333539] text-[#E3E2E6] border-[#36373B]'
          }`}
        >
          <VolumeX className="w-4 h-4 text-amber-400" />
          <span>كتم الصوت</span>
        </button>

        {/* Button 6: حفظ المسودة (Save Draft) */}
        <button
          onClick={onSaveDraft}
          className="h-12 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-semibold shadow-sm active:scale-[0.98]"
        >
          <Save className="w-4 h-4 text-[#89F8C7]" />
          <span>حفظ</span>
        </button>

        {/* Button 7: تصدير FFmpeg (Export) */}
        <button
          onClick={onExport}
          className="h-12 rounded-xl bg-[#89F8C7] hover:bg-[#72dbb0] text-[#002114] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-bold shadow-sm active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>تصدير FFmpeg</span>
        </button>

      </div>
    </div>
  );
};
