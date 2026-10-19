/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectDraft } from '../types';
import { 
  ASSET_MINARET_SUNSET, 
  ASSET_QURAN_LIGHT, 
  DEFAULT_AUDIO_LIBRARY, 
  DEFAULT_SPIRITUAL_EFFECTS, 
  DEFAULT_TEXT_OVERLAY,
  DEFAULT_PARTICLE_OVERLAYS
} from '../constants/defaults';
import { 
  ASSET_ANTIQUE_PARCHMENT, 
  DEFAULT_CALLIGRAPHY_STORY 
} from '../constants/calligraphyDefaults';

const STORAGE_KEY = 'sheikh_eid_drafts_v2';
const CURRENT_PROJECT_KEY = 'sheikh_eid_active_project_id';

const resolveStoredAssetUrl = (url?: string): string => {
  if (!url) return '';
  if (url.includes('islamic_minaret_sunset')) return ASSET_MINARET_SUNSET;
  if (url.includes('quran_golden_light')) return ASSET_QURAN_LIGHT;
  if (url.includes('antique_parchment_candle')) return ASSET_ANTIQUE_PARCHMENT;
  return url;
};

export class StorageService {
  /**
   * Simulates a local Hive Box (`Box<ProjectDraft> projectsBox = Hive.box('projects')`)
   */
  static getProjects(): ProjectDraft[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        const seeded = this.seedInitialDrafts();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed: ProjectDraft[] = JSON.parse(data);
      return parsed.map((d) => ({
        ...d,
        videoSourceUrl: resolveStoredAssetUrl(d.videoSourceUrl),
        thumbnailUrl: resolveStoredAssetUrl(d.thumbnailUrl),
        particleOverlays: d.particleOverlays || DEFAULT_PARTICLE_OVERLAYS,
      }));
    } catch (err) {
      console.error('Failed to load drafts from storage:', err);
      return this.seedInitialDrafts();
    }
  }

  static getProjectById(id: string): ProjectDraft | null {
    const list = this.getProjects();
    return list.find((p) => p.id === id) || null;
  }

  static saveProject(project: ProjectDraft): void {
    try {
      const list = this.getProjects();
      const existingIdx = list.findIndex((p) => p.id === project.id);
      project.updatedAt = Date.now();
      
      if (existingIdx >= 0) {
        list[existingIdx] = project;
      } else {
        list.unshift(project);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem(CURRENT_PROJECT_KEY, project.id);
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  }

  static deleteProject(id: string): void {
    try {
      const list = this.getProjects().filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      if (localStorage.getItem(CURRENT_PROJECT_KEY) === id) {
        localStorage.removeItem(CURRENT_PROJECT_KEY);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  }

  static duplicateProject(id: string): ProjectDraft | null {
    const original = this.getProjectById(id);
    if (!original) return null;

    const copy: ProjectDraft = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'draft_' + Date.now(),
      title: `${original.title} (نسخة)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.saveProject(copy);
    return copy;
  }

  static getActiveProjectId(): string | null {
    return localStorage.getItem(CURRENT_PROJECT_KEY);
  }

  static setActiveProjectId(id: string): void {
    localStorage.setItem(CURRENT_PROJECT_KEY, id);
  }

  static seedInitialDrafts(): ProjectDraft[] {
    const now = Date.now();
    return [
      {
        id: 'draft_reels_taaha',
        title: 'ريلز: رَبِّ زِدْنِي عِلْمًا',
        aspectRatio: '9:16',
        createdAt: now - 3600000 * 4,
        updatedAt: now - 3600000 * 2,
        duration: 15,
        videoSourceUrl: ASSET_MINARET_SUNSET,
        videoSourceName: 'مشهد المئذنة الذهبي.mp4',
        muteOriginalAudio: true,
        originalAudioVolume: 0,
        replacedAudio: DEFAULT_AUDIO_LIBRARY[0], // Recitation
        replacedAudioVolume: 0.95,
        replacedAudioStartTime: 0,
        textOverlays: [
          {
            ...DEFAULT_TEXT_OVERLAY,
            id: 'txt-1',
            text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
            fontFamily: 'Amiri',
            fontSize: 30,
            hasAyahBrackets: true,
            positionY: 78,
          }
        ],
        imageOverlays: [],
        effects: DEFAULT_SPIRITUAL_EFFECTS,
        thumbnailUrl: ASSET_MINARET_SUNSET,
      },
      {
        id: 'draft_youtube_lecture',
        title: 'يوتيوب: درس الشيخ العيد - فضائل القرآن',
        aspectRatio: '16:9',
        createdAt: now - 86400000 * 2,
        updatedAt: now - 86400000,
        duration: 25,
        videoSourceUrl: ASSET_QURAN_LIGHT,
        videoSourceName: 'مصحف المسجد العتيق.mp4',
        muteOriginalAudio: true,
        originalAudioVolume: 0,
        replacedAudio: DEFAULT_AUDIO_LIBRARY[2], // Nasheed
        replacedAudioVolume: 0.8,
        replacedAudioStartTime: 0,
        textOverlays: [
          {
            id: 'txt-2',
            text: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
            fontFamily: 'Amiri',
            fontSize: 32,
            color: '#FFDF9E',
            hasAyahBrackets: false,
            alignment: 'center',
            positionX: 50,
            positionY: 82,
            startTime: 0,
            endTime: 25,
            animation: 'glow',
          }
        ],
        imageOverlays: [],
        effects: DEFAULT_SPIRITUAL_EFFECTS.map((e) =>
          e.id === 'warm_dawn' ? { ...e, enabled: true } : e
        ),
        thumbnailUrl: ASSET_QURAN_LIGHT,
      },
      {
        id: 'draft_antique_parchment_calligraphy',
        title: 'مخطوطة الريشة: اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',
        aspectRatio: '9:16',
        createdAt: now - 1800000,
        updatedAt: now,
        duration: 12,
        videoSourceUrl: ASSET_ANTIQUE_PARCHMENT,
        videoSourceName: 'مخطوطة_عتيقة_مع_شمعة.jpg',
        muteOriginalAudio: true,
        originalAudioVolume: 0,
        replacedAudio: DEFAULT_AUDIO_LIBRARY[0],
        replacedAudioVolume: 0.95,
        replacedAudioStartTime: 0,
        textOverlays: [],
        imageOverlays: [],
        effects: DEFAULT_SPIRITUAL_EFFECTS,
        calligraphyStory: DEFAULT_CALLIGRAPHY_STORY,
        thumbnailUrl: ASSET_ANTIQUE_PARCHMENT,
      }
    ];
  }
}
