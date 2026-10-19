/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private replacedGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private customAudioElement: HTMLAudioElement | null = null;
  private currentCustomUrl: string | null = null;
  private currentVolume: number = 0.8;
  private pendingPlayPromise: Promise<void> | null = null;

  public initContext() {
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.replacedGain = this.ctx.createGain();
          this.replacedGain.connect(this.masterGain);
          this.masterGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  playReplacedTrack(
    preset: string = 'spiritual_drone',
    volume: number = 0.8,
    customUrl?: string,
    startTime: number = 0
  ) {
    this.initContext();
    this.currentVolume = volume;

    // If user provided a custom audio URL (uploaded MP3 / audio file)
    if (customUrl) {
      this.playCustomAudio(customUrl, volume, startTime, preset);
      return;
    }

    // Stop custom audio if switching to preset
    this.stopCustomAudio();
    this.playSynthesizedPreset(preset, volume);
  }

  private playCustomAudio(
    url: string,
    volume: number,
    startTime: number = 0,
    fallbackPreset: string = 'spiritual_drone'
  ) {
    // Stop any running synth oscillators
    this.stopOscillators();

    if (!this.customAudioElement) {
      this.customAudioElement = new Audio();
      this.customAudioElement.preload = 'auto';
      this.customAudioElement.crossOrigin = 'anonymous';
    }

    const audio = this.customAudioElement;
    audio.volume = Math.max(0, Math.min(1, volume));

    // Handle src update
    if (this.currentCustomUrl !== url || audio.src !== url) {
      this.currentCustomUrl = url;
      audio.src = url;
      audio.load();
    }

    // Handle seeking to current time
    if (startTime > 0 && Number.isFinite(startTime)) {
      try {
        audio.currentTime = startTime;
      } catch {
        // Will set on canplay
      }
    }

    this.isPlaying = true;

    // Setup error fallback
    audio.onerror = () => {
      console.warn('Custom audio playback failed on url:', url, '- falling back to synth');
      if (this.isPlaying) {
        this.playSynthesizedPreset(fallbackPreset, volume);
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      this.pendingPlayPromise = playPromise;
      playPromise
        .then(() => {
          this.pendingPlayPromise = null;
        })
        .catch((err) => {
          this.pendingPlayPromise = null;
          console.warn('Audio play request interrupted or prevented by browser:', err);
          // If browser blocked unmuted autoplay, try synth or keep state
          if (err.name === 'NotAllowedError') {
            const resumeOnInteraction = () => {
              if (this.isPlaying && this.customAudioElement) {
                this.customAudioElement.play().catch(() => {});
              }
              window.removeEventListener('click', resumeOnInteraction);
              window.removeEventListener('keydown', resumeOnInteraction);
            };
            window.addEventListener('click', resumeOnInteraction, { once: true });
            window.addEventListener('keydown', resumeOnInteraction, { once: true });
          }
        });
    }
  }

  private playSynthesizedPreset(preset: string, volume: number) {
    this.stopOscillators();
    if (!this.ctx || !this.replacedGain) return;

    this.isPlaying = true;
    this.replacedGain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);

    // Peaceful synthesized spiritual soundscape (pure Web Audio chords / drone)
    // Scale: Peaceful D minor / Bayati spiritual aura (D3, A3, F3, E3, D4)
    const baseFreqs =
      preset === 'adhan_harmony'
        ? [146.83, 220.0, 261.63, 293.66] // D3, A3, C4, D4
        : preset === 'choral_peace'
        ? [130.81, 196.0, 261.63, 329.63] // C3, G3, C4, E4
        : [146.83, 220.0, 174.61, 293.66]; // D3, A3, F3, D4 (Bayati serenity)

    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.replacedGain) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Soft sine wave for meditative/spiritual warmth
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Gentle subtle vibrato/breathing effect
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.1, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      oscGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.12 / baseFreqs.length, this.ctx.currentTime + 1.2);

      osc.connect(oscGain);
      oscGain.connect(this.replacedGain);
      osc.start();

      this.activeOscillators.push(osc, lfo);
    });
  }

  seek(timeInSeconds: number) {
    if (this.customAudioElement && Number.isFinite(timeInSeconds)) {
      try {
        this.customAudioElement.currentTime = Math.max(0, timeInSeconds);
      } catch (err) {
        console.warn('Audio seek error:', err);
      }
    }
  }

  setReplacedVolume(volume: number) {
    this.currentVolume = volume;
    if (this.customAudioElement) {
      this.customAudioElement.volume = Math.max(0, Math.min(1, volume));
    }
    if (this.ctx && this.replacedGain) {
      this.replacedGain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);
    }
  }

  pause() {
    this.isPlaying = false;
    this.stopOscillators();
    if (this.customAudioElement) {
      if (this.pendingPlayPromise) {
        this.pendingPlayPromise
          .then(() => {
            this.customAudioElement?.pause();
          })
          .catch(() => {});
      } else {
        this.customAudioElement.pause();
      }
    }
  }

  stop() {
    this.isPlaying = false;
    this.stopOscillators();
    this.stopCustomAudio();
  }

  private stopOscillators() {
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeOscillators = [];
  }

  private stopCustomAudio() {
    if (this.customAudioElement) {
      if (this.pendingPlayPromise) {
        this.pendingPlayPromise
          .then(() => {
            if (this.customAudioElement) {
              this.customAudioElement.pause();
              this.customAudioElement.currentTime = 0;
            }
          })
          .catch(() => {});
      } else {
        this.customAudioElement.pause();
        this.customAudioElement.currentTime = 0;
      }
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getCurrentTime(): number {
    return this.customAudioElement ? this.customAudioElement.currentTime : 0;
  }

  getDuration(): number {
    return this.customAudioElement?.duration && Number.isFinite(this.customAudioElement.duration)
      ? this.customAudioElement.duration
      : 0;
  }
}

export const audioEngine = new AudioEngine();
