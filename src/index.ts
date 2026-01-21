/**
 * retro-audio-engine
 *
 * Web Audio API sound synthesizer for retro game sound effects.
 * Generates procedural audio without any external files - phasers,
 * explosions, alerts, victory fanfares, and more.
 *
 * @example
 * ```ts
 * import { audioEngine } from 'retro-audio-engine';
 *
 * // Play a laser/phaser sound
 * audioEngine.playLaser();
 *
 * // Play an explosion
 * audioEngine.playExplosion();
 *
 * // Adjust volume (0-1)
 * audioEngine.setVolume(0.5);
 *
 * // Disable all sounds
 * audioEngine.setEnabled(false);
 * ```
 *
 * @packageDocumentation
 */

/**
 * Configuration options for creating an AudioEngine instance.
 */
export interface AudioEngineOptions {
  /** Initial volume (0-1). Default: 0.3 */
  volume?: number;
  /** Whether audio is enabled. Default: true */
  enabled?: boolean;
}

/**
 * Web Audio API sound synthesizer for retro game sound effects.
 *
 * Features:
 * - Procedurally generated sounds (no external files needed)
 * - Lazy AudioContext initialization (user gesture friendly)
 * - Volume control and mute toggle
 * - 15+ built-in sound effects
 */
export class AudioEngine {
  private context: AudioContext | null = null;
  private enabled: boolean;
  private volume: number;

  /**
   * Create a new AudioEngine instance.
   *
   * @param options - Configuration options
   */
  constructor(options: AudioEngineOptions = {}) {
    this.volume = options.volume ?? 0.3;
    this.enabled = options.enabled ?? true;
  }

  /**
   * Initialize the AudioContext lazily (required after user gesture).
   * Called automatically by sound methods.
   */
  private initContext(): AudioContext | null {
    if (!this.context) {
      try {
        this.context = new AudioContext();
      } catch {
        console.warn('Web Audio API not supported');
        return null;
      }
    }
    // Resume if suspended (browser autoplay policy)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  /**
   * Enable or disable all sound output.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if audio is currently enabled.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set the master volume.
   *
   * @param volume - Volume level from 0 (silent) to 1 (full)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get the current volume level.
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Resume the AudioContext if suspended.
   * Useful after user interaction.
   */
  async resume(): Promise<void> {
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }

  // ============================================================
  // WEAPON SOUNDS
  // ============================================================

  /**
   * Play a laser/phaser beam sound.
   * A sweeping high-frequency tone that descends.
   *
   * @param duration - Sound duration in seconds. Default: 0.15
   */
  playLaser(duration = 0.15): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      220,
      ctx.currentTime + duration
    );

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  /**
   * Alias for playLaser - sci-fi phaser sound.
   */
  playPhaser(duration = 0.15): void {
    this.playLaser(duration);
  }

  /**
   * Play a torpedo/missile launch sound.
   * Deep bass thump with subtle oscillation.
   *
   * @param duration - Sound duration in seconds. Default: 0.3
   */
  playTorpedo(duration = 0.3): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(80, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      40,
      ctx.currentTime + duration
    );

    gainNode.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  /**
   * Alias for playTorpedo - missile sound.
   */
  playMissile(duration = 0.3): void {
    this.playTorpedo(duration);
  }

  // ============================================================
  // IMPACT SOUNDS
  // ============================================================

  /**
   * Play an explosion sound.
   * White noise burst with rapid decay.
   */
  playExplosion(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const duration = 0.5;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(
      100,
      ctx.currentTime + duration
    );

    gainNode.gain.setValueAtTime(this.volume * 0.8, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(ctx.currentTime);
  }

  /**
   * Play a hit/damage sound.
   * Short, punchy impact with distortion.
   */
  playHit(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const duration = 0.1;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      50,
      ctx.currentTime + duration
    );

    gainNode.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  /**
   * Play a shield hit/deflection sound.
   * Metallic ping with reverb-like decay.
   */
  playShieldHit(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const duration = 0.3;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      200,
      ctx.currentTime + duration
    );

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  // ============================================================
  // MOVEMENT SOUNDS
  // ============================================================

  /**
   * Play a warp/hyperspace jump sound.
   * Rising frequency sweep with harmonic overtones.
   */
  playWarp(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const duration = 0.8;
    const oscillator = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      2000,
      ctx.currentTime + duration * 0.7
    );

    oscillator2.type = 'sawtooth';
    oscillator2.frequency.setValueAtTime(50, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(
      1000,
      ctx.currentTime + duration * 0.7
    );

    gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      this.volume * 0.4,
      ctx.currentTime + duration * 0.3
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
    oscillator2.stop(ctx.currentTime + duration);
  }

  /**
   * Alias for playWarp - hyperspace jump.
   */
  playHyperspace(): void {
    this.playWarp();
  }

  /**
   * Play a docking/landing sound.
   * Gentle descending tone with soft landing.
   */
  playDock(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const duration = 0.4;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      200,
      ctx.currentTime + duration
    );

    gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  // ============================================================
  // UI SOUNDS
  // ============================================================

  /**
   * Play a UI click/select sound.
   * Short, crisp beep.
   */
  playClick(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const duration = 0.05;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);

    gainNode.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  /**
   * Play a UI beep/notification sound.
   * Slightly longer than click with two tones.
   */
  playBeep(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const duration = 0.1;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, ctx.currentTime);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime + duration / 2);

    gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  // ============================================================
  // ALERT SOUNDS
  // ============================================================

  /**
   * Play an alert/warning sound.
   * Pulsing tone that demands attention.
   *
   * @param pulses - Number of alert pulses. Default: 3
   */
  playAlert(pulses = 3): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const pulseDuration = 0.15;
    const pauseDuration = 0.1;

    for (let i = 0; i < pulses; i++) {
      const startTime = ctx.currentTime + i * (pulseDuration + pauseDuration);

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, startTime);
      oscillator.frequency.setValueAtTime(
        880,
        startTime + pulseDuration / 2
      );

      gainNode.gain.setValueAtTime(this.volume * 0.25, startTime);
      gainNode.gain.setValueAtTime(0, startTime + pulseDuration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + pulseDuration);
    }
  }

  /**
   * Play a critical/red alert sound.
   * More urgent version of alert.
   */
  playCriticalAlert(): void {
    this.playAlert(5);
  }

  // ============================================================
  // GAME STATE SOUNDS
  // ============================================================

  /**
   * Play a victory fanfare.
   * Triumphant ascending arpeggio.
   */
  playVictory(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [262, 330, 392, 523]; // C4, E4, G4, C5
    const noteDuration = 0.15;

    notes.forEach((freq, i) => {
      const startTime = ctx.currentTime + i * noteDuration;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(this.volume * 0.25, startTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        startTime + noteDuration * 1.5
      );

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration * 1.5);
    });
  }

  /**
   * Alias for playVictory - level complete sound.
   */
  playLevelComplete(): void {
    this.playVictory();
  }

  /**
   * Play a defeat/game over sound.
   * Descending minor arpeggio.
   */
  playDefeat(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [392, 349, 330, 262]; // G4, F4, E4, C4
    const noteDuration = 0.2;

    notes.forEach((freq, i) => {
      const startTime = ctx.currentTime + i * noteDuration;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(this.volume * 0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        startTime + noteDuration * 1.5
      );

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration * 1.5);
    });
  }

  /**
   * Alias for playDefeat - game over sound.
   */
  playGameOver(): void {
    this.playDefeat();
  }

  // ============================================================
  // COLLECTIBLE SOUNDS
  // ============================================================

  /**
   * Play a coin/pickup collection sound.
   * Quick ascending two-note jingle.
   */
  playCoin(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const frequencies = [988, 1319]; // B5, E6
    const noteDuration = 0.08;

    frequencies.forEach((freq, i) => {
      const startTime = ctx.currentTime + i * noteDuration;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(this.volume * 0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        startTime + noteDuration * 2
      );

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration * 2);
    });
  }

  /**
   * Alias for playCoin - item pickup sound.
   */
  playPickup(): void {
    this.playCoin();
  }

  /**
   * Play a power-up acquired sound.
   * Rising sweep with harmonic shimmer.
   */
  playPowerUp(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const duration = 0.4;
    const oscillator = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      880,
      ctx.currentTime + duration
    );

    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(330, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(
      1320,
      ctx.currentTime + duration
    );

    gainNode.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
    oscillator2.stop(ctx.currentTime + duration);
  }

  // ============================================================
  // MISC SOUNDS
  // ============================================================

  /**
   * Play a jump/bounce sound.
   * Quick ascending note.
   */
  playJump(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const duration = 0.15;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      400,
      ctx.currentTime + duration
    );

    gainNode.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  /**
   * Play a custom tone.
   *
   * @param frequency - Frequency in Hz
   * @param duration - Duration in seconds
   * @param waveform - Oscillator type
   */
  playTone(
    frequency: number,
    duration = 0.2,
    waveform: OscillatorType = 'sine'
  ): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }
}

/**
 * Default singleton instance for easy import.
 *
 * @example
 * ```ts
 * import { audioEngine } from 'retro-audio-engine';
 * audioEngine.playExplosion();
 * ```
 */
export const audioEngine = new AudioEngine();

// OscillatorType is available from the DOM lib:
// 'sine' | 'square' | 'sawtooth' | 'triangle'
