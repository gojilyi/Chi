/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  ASSET_MINARET_SUNSET, 
  ASSET_QURAN_LIGHT, 
  ASSET_ARABIC_ORNAMENT 
} from './defaults';
import { ASSET_ANTIQUE_PARCHMENT } from './calligraphyDefaults';
import assetMosqueArches from '../assets/images/islamic_mosque_arches_night_1792364229198.jpg';

export const ASSET_MOSQUE_ARCHES = assetMosqueArches;

export interface ReadyBackgroundItem {
  id: string;
  name: string;
  category: 'mosque' | 'parchment' | 'quran' | 'ornament';
  categoryLabel: string;
  assetPath: string; // assets/backgrounds/...
  imageUrl: string;
  isVideoLoop: boolean;
  recommendedRatio: '9:16' | '16:9' | 'all';
  description: string;
}

export const READY_BACKGROUNDS: ReadyBackgroundItem[] = [
  {
    id: 'bg_mosque_arches',
    name: 'أروقة المسجد التراثي والفوانيس الدافئة',
    category: 'mosque',
    categoryLabel: 'مساجد وأروقة',
    assetPath: 'assets/backgrounds/mosque_arches_night.jpg',
    imageUrl: ASSET_MOSQUE_ARCHES,
    isVideoLoop: false,
    recommendedRatio: '9:16',
    description: 'أعمدة رخامية عتيقة مع فوانيس نحاسية دافئة تناسب الدروس والمواعظ المؤثرة',
  },
  {
    id: 'bg_antique_parchment',
    name: 'المخطوطة العتيقة والشمعة وقلم الريشة',
    category: 'parchment',
    categoryLabel: 'مخطوطات وريشة',
    assetPath: 'assets/backgrounds/antique_parchment_candle.jpg',
    imageUrl: ASSET_ANTIQUE_PARCHMENT,
    isVideoLoop: false,
    recommendedRatio: '9:16',
    description: 'ورقة مخطوطة تراثية مع ضوء شمعة خافت مخصصة لكتابة خط الرقعة التلقائي',
  },
  {
    id: 'bg_minaret_sunset',
    name: 'مئذنة المسجد عند الغروب الذهبي',
    category: 'mosque',
    categoryLabel: 'مساجد وأروقة',
    assetPath: 'assets/backgrounds/minaret_sunset.jpg',
    imageUrl: ASSET_MINARET_SUNSET,
    isVideoLoop: false,
    recommendedRatio: 'all',
    description: 'قبة ومئذنة شامخة مع أشعة نورانية هادئة لمقاطع الريلز والمواعظ',
  },
  {
    id: 'bg_quran_light',
    name: 'المصحف الشريف على الحامل الخشبي العتيق',
    category: 'quran',
    categoryLabel: 'المصاحف الشريفة',
    assetPath: 'assets/backgrounds/quran_rehal_light.jpg',
    imageUrl: ASSET_QURAN_LIGHT,
    isVideoLoop: false,
    recommendedRatio: '16:9',
    description: 'مصحف شريف مفتوح في باحة المسجد مناسب للمحاضرات الكاملة وتفسير الآيات',
  },
  {
    id: 'bg_arabic_ornament',
    name: 'الزخرفة الإسلامية والأرابيسك الذهبي',
    category: 'ornament',
    categoryLabel: 'زخارف إسلامية',
    assetPath: 'assets/backgrounds/gold_arabesque_ornament.jpg',
    imageUrl: ASSET_ARABIC_ORNAMENT,
    isVideoLoop: false,
    recommendedRatio: 'all',
    description: 'نقوش أرابيسك هندسية مذهبة تناسب البطاقات الدعوية والمقاطع المربعة',
  },
];

export const SAMPLE_SHEIKH_LESSONS = [
  {
    id: 'lesson_1',
    title: 'درس: فضائل قيام الليل وثمرات الخلوة بالله',
    sheikh: 'الشيخ العيد',
    durationSec: 16,
    text: 'قِيَامُ اللَّيْلِ مِشْكَاةُ النُّورِ وَسَبِيلُ الْمُتَّقِينَ فِيهِ تَسْكُنُ الْأَرْوَاحُ وَتَطْمَئِنُّ الْقُلُوبُ بِذِكْرِ اللَّهِ',
    words: [
      { id: 'l1', word: 'قِيَامُ', startMs: 300, endMs: 1400 },
      { id: 'l2', word: 'اللَّيْلِ', startMs: 1500, endMs: 2900 },
      { id: 'l3', word: 'مِشْكَاةُ', startMs: 3000, endMs: 4400 },
      { id: 'l4', word: 'النُّورِ', startMs: 4500, endMs: 6000 },
      { id: 'l5', word: 'وَسَبِيلُ', startMs: 6100, endMs: 7600 },
      { id: 'l6', word: 'الْمُتَّقِينَ', startMs: 7700, endMs: 9600 },
      { id: 'l7', word: 'فِيهِ', startMs: 9700, endMs: 10800 },
      { id: 'l8', word: 'تَسْكُنُ', startMs: 10900, endMs: 12200 },
      { id: 'l9', word: 'الْأَرْوَاحُ', startMs: 12300, endMs: 14500 },
    ],
  },
  {
    id: 'lesson_2',
    title: 'تلاوة خاشعة: وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا',
    sheikh: 'الشيخ العيد - سورة الطور',
    durationSec: 14,
    text: 'وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا وَسَبِّحْ بِحَمْدِ رَبِّكَ حِينَ تَقُومُ',
    words: [
      { id: 'l10', word: 'وَاصْبِرْ', startMs: 400, endMs: 1900 },
      { id: 'l11', word: 'لِحُكْمِ', startMs: 2000, endMs: 3500 },
      { id: 'l12', word: 'رَبِّكَ', startMs: 3600, endMs: 5100 },
      { id: 'l13', word: 'فَإِنَّكَ', startMs: 5200, endMs: 6900 },
      { id: 'l14', word: 'بِأَعْيُنِنَا', startMs: 7000, endMs: 9300 },
      { id: 'l15', word: 'وَسَبِّحْ', startMs: 9400, endMs: 11000 },
      { id: 'l16', word: 'بِحَمْدِ', startMs: 11100, endMs: 12500 },
      { id: 'l17', word: 'رَبِّكَ', startMs: 12600, endMs: 13900 },
    ],
  },
  {
    id: 'lesson_3',
    title: 'موعظة الجمعة: الدُّنْيَا ظِلٌّ زَائِلٌ وَالْآخِرَةُ هِيَ دَارُ الْقَرَارِ',
    sheikh: 'الشيخ العيد',
    durationSec: 12,
    text: 'الدُّنْيَا ظِلٌّ زَائِلٌ وَالْآخِرَةُ خَيْرٌ وَأَبْقَى فَاغْنَمْ أَيَّامَكَ فِي طَاعَةِ الرَّحْمَٰنِ',
    words: [
      { id: 'l20', word: 'الدُّنْيَا', startMs: 400, endMs: 1800 },
      { id: 'l21', word: 'ظِلٌّ', startMs: 1900, endMs: 3100 },
      { id: 'l22', word: 'زَائِلٌ', startMs: 3200, endMs: 4800 },
      { id: 'l23', word: 'وَالْآخِرَةُ', startMs: 4900, endMs: 6600 },
      { id: 'l24', word: 'خَيْرٌ', startMs: 6700, endMs: 8100 },
      { id: 'l25', word: 'وَأَبْقَى', startMs: 8200, endMs: 10400 },
    ],
  },
];
