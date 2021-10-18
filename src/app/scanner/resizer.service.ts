import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class ResizerService {
  resize(
    imageUrl: string,
    sizes: { height: number; width?: number }[]
  ): Observable<string[]> {
    return new Observable((observer) => {
      const canvas = document.createElement('canvas');
      const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (!ctx) {
        observer.error(new Error('Could not get canvas context'));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      img.onload = () => {
        const resized = sizes.map((size) => {
          canvas.width = size.width ?? (size.height * img.width) / img.height;
          canvas.height = size.height;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/webp');
        });
        observer.next(resized);
        observer.complete();
      };

      img.onerror = (error) => observer.error(error);
    });
  }

  resizeSquare(imageUrl: string, sizes: number[]): Observable<string[]> {
    return this.resize(
      imageUrl,
      sizes.map((size) => ({ width: size, height: size }))
    );
  }
}
