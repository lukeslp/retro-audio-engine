# retro-audio-engine

Web Audio API sound synthesizer for retro game sound effects. Generates procedural audio without any external files - phasers, explosions, alerts, victory fanfares, and more.

## Installation

```bash
npm install retro-audio-engine
```

## Quick Start

```typescript
import { audioEngine } from 'retro-audio-engine';

// Play sounds using the default singleton
audioEngine.playLaser();
audioEngine.playExplosion();
audioEngine.playVictory();

// Adjust volume (0-1)
audioEngine.setVolume(0.5);

// Mute/unmute
audioEngine.setEnabled(false);
```

## Features

- **Zero dependencies** - Pure Web Audio API
- **No external files** - All sounds are procedurally generated
- **Lazy initialization** - AudioContext created on first sound (browser-friendly)
- **TypeScript** - Full type definitions included
- **15+ built-in sounds** - Weapons, impacts, alerts, collectibles, game states

## Available Sounds

### Weapons
```typescript
audioEngine.playLaser();      // Sci-fi laser/phaser beam
audioEngine.playPhaser();     // Alias for playLaser
audioEngine.playTorpedo();    // Deep torpedo/missile launch
audioEngine.playMissile();    // Alias for playTorpedo
```

### Impacts
```typescript
audioEngine.playExplosion();  // White noise explosion burst
audioEngine.playHit();        // Short punchy damage sound
audioEngine.playShieldHit();  // Metallic shield deflection
```

### Movement
```typescript
audioEngine.playWarp();       // Hyperspace jump (rising sweep)
audioEngine.playHyperspace(); // Alias for playWarp
audioEngine.playDock();       // Gentle docking/landing
audioEngine.playJump();       // Platform jump/bounce
```

### UI & Alerts
```typescript
audioEngine.playClick();      // UI click/select
audioEngine.playBeep();       // Notification beep
audioEngine.playAlert(3);     // Warning alert (3 pulses)
audioEngine.playCriticalAlert(); // Urgent red alert
```

### Game States
```typescript
audioEngine.playVictory();    // Triumphant fanfare
audioEngine.playLevelComplete(); // Alias for playVictory
audioEngine.playDefeat();     // Sad game over
audioEngine.playGameOver();   // Alias for playDefeat
```

### Collectibles
```typescript
audioEngine.playCoin();       // Coin/pickup jingle
audioEngine.playPickup();     // Alias for playCoin
audioEngine.playPowerUp();    // Power-up shimmer
```

### Custom
```typescript
audioEngine.playTone(440, 0.2, 'sine');  // Custom tone
```

## Creating Multiple Instances

```typescript
import { AudioEngine } from 'retro-audio-engine';

// Create custom instances with different settings
const sfx = new AudioEngine({ volume: 0.5 });
const music = new AudioEngine({ volume: 0.3 });

sfx.playExplosion();
```

## Volume Control

```typescript
// Set volume (0-1)
audioEngine.setVolume(0.5);

// Get current volume
const vol = audioEngine.getVolume();

// Mute all sounds
audioEngine.setEnabled(false);

// Check if enabled
if (audioEngine.isEnabled()) {
  audioEngine.playClick();
}
```

## Browser Autoplay Policy

Modern browsers require user interaction before playing audio. The AudioEngine handles this by:

1. Lazy-initializing the AudioContext on first sound
2. Automatically resuming suspended contexts

For best results, trigger initial sound on user interaction:

```typescript
button.addEventListener('click', () => {
  audioEngine.playClick(); // Safe after user gesture
});
```

You can also manually resume:

```typescript
await audioEngine.resume();
```

## Sound Parameters

Some sounds accept optional parameters:

```typescript
audioEngine.playLaser(0.3);   // Duration in seconds (default: 0.15)
audioEngine.playTorpedo(0.5); // Duration in seconds (default: 0.3)
audioEngine.playAlert(5);     // Number of pulses (default: 3)
audioEngine.playTone(
  880,      // Frequency in Hz
  0.5,      // Duration in seconds
  'square'  // Waveform: 'sine' | 'square' | 'sawtooth' | 'triangle'
);
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import { AudioEngine, AudioEngineOptions } from 'retro-audio-engine';

const options: AudioEngineOptions = {
  volume: 0.5,
  enabled: true
};

const engine = new AudioEngine(options);
```

## Example: Game Integration

```typescript
import { audioEngine } from 'retro-audio-engine';

class Game {
  constructor() {
    // Initialize audio on first user interaction
    document.addEventListener('click', () => {
      audioEngine.playClick();
    }, { once: true });
  }

  onPlayerShoot() {
    audioEngine.playLaser();
  }

  onEnemyHit(killed: boolean) {
    if (killed) {
      audioEngine.playExplosion();
    } else {
      audioEngine.playHit();
    }
  }

  onCollectCoin() {
    audioEngine.playCoin();
  }

  onGameOver(won: boolean) {
    if (won) {
      audioEngine.playVictory();
    } else {
      audioEngine.playDefeat();
    }
  }
}
```

## License

MIT © Luke Steuber
