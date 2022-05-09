import { Injectable } from '@angular/core';
import { AudioService } from '@app/player/audio.service';
import AudioMotionAnalyzer from 'audiomotion-analyzer';

@Injectable()
export class AnalyzerService {
  private container?: HTMLElement;
  private audioMotion: AudioMotionAnalyzer = this.audio.audioMotion;

  constructor(private audio: AudioService) {
    this.audioMotion.canvas.style.objectFit = 'contain';
    this.audioMotion.canvas.style.height = '100%';
    this.audioMotion.canvas.style.width = '100%';
    this.audioMotion.setOptions({ useCanvas: true });
    window.addEventListener('resize', () => {
      this.audioMotion.setCanvasSize(
        this.container?.offsetWidth || 100,
        this.container?.offsetHeight || 100
      );
    });
  }

  setContainer(container?: HTMLElement): void {
    if (!container) {
      return;
    }
    this.container = container;
    container.appendChild(this.audioMotion.canvas);
    setTimeout(() =>
      this.audioMotion.setCanvasSize(
        container.offsetWidth,
        container.offsetHeight
      )
    );
    this.audioMotion.toggleAnalyzer(true);
  }

  setCoverColors(cover?: string): void {
    if (!cover) {
      this.audioMotion.registerGradient('gradient', {
        bgColor: 'black',
        colorStops: ['white', 'white'],
      });
      this.audioMotion.setOptions({ gradient: 'gradient' });
      return;
    }

    import('node-vibrant')
      .then((vibrant) => vibrant.default.from(cover).getPalette())
      .then((palette) => [
        palette.DarkMuted?.hex || 'white',
        palette.DarkVibrant?.hex || 'white',
        palette.Vibrant?.hex || 'white',
        palette.LightVibrant?.hex || 'white',
      ])
      .then(([dm, dv, v, lv]) => {
        this.audioMotion.registerGradient('gradient', {
          bgColor: 'black',
          colorStops: [lv, v, dv, dm],
        });
        this.audioMotion.setOptions({ gradient: 'gradient' });
      });
  }
}
