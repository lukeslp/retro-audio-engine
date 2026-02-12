# retro-audio-engine

Procedural game sound effects via Web Audio API. No external files—phasers, explosions, alerts, victory fanfares synthesized on the fly.

## Installation

```bash
npm install retro-audio-engine
```

## Quick Start

```typescript
import { audioEngine } from 'retro-audio-engine';

audioEngine.playLaser();
audioEngine.playExplosion();
audioEngine.playVictory();

audioEngine.setVolume(0.5);
audioEngine.setEnabled(false); // mute
```

## Sounds

**Weapons**
```typescript
audioEngine.playLaser();      // sci-fi beam
audioEngine.playTorpedo();    // deep launch thump
```

**Impacts**
```typescript
audioEngine.playExplosion();  // white noise burst
audioEngine.playHit();        // punchy damage
audioEngine.playShieldHit();  // metallic deflection
```

**Movement**
```typescript
audioEngine.playWarp();       // hyperspace sweep
audioEngine.playDock();       // gentle landing
audioEngine.playJump();       // platform bounce
```

**UI**
```typescript
audioEngine.playClick();      // select
audioEngine.playBeep();       // notification
audioEngine.playAlert(3);     // warning pulses
```

**Game State**
```typescript
audioEngine.playVictory();    // triumphant fanfare
audioEngine.playDefeat();     // sad game over
audioEngine.playCoin();       // pickup jingle
audioEngine.playPowerUp();    // shimmer
```

**Custom**
```typescript
audioEngine.playTone(440, 0.2, 'sine');
// frequency (Hz), duration (s), waveform
```

## Multiple Instances

```typescript
import { AudioEngine } from 'retro-audio-engine';

const sfx = new AudioEngine({ volume: 0.5 });
const ui = new AudioEngine({ volume: 0.3 });
```

## Browser Autoplay

Browsers block audio until user interaction. The engine handles this automatically—just trigger your first sound from a click handler:

```typescript
button.addEventListener('click', () => {
  audioEngine.playClick();
}, { once: true });
```

Or manually: `await audioEngine.resume();`

## Parameters

```typescript
audioEngine.playLaser(0.3);   // duration in seconds
audioEngine.playAlert(5);     // number of pulses
audioEngine.playTone(880, 0.5, 'square');
// waveforms: 'sine' | 'square' | 'sawtooth' | 'triangle'
```

## Game Integration

```typescript
import { audioEngine } from 'retro-audio-engine';

class Game {
  onShoot() { audioEngine.playLaser(); }
  onHit(killed: boolean) {
    killed ? audioEngine.playExplosion() : audioEngine.playHit();
  }
  onCoin() { audioEngine.playCoin(); }
  onGameOver(won: boolean) {
    won ? audioEngine.playVictory() : audioEngine.playDefeat();
  }
}
```

## License

MIT © Luke Steuber
