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
          canvas.width = size.width ?? (img.width / img.height) * size.height;
          canvas.height = size.height;
          let width;
          let height;
          let dx = 0;
          if (img.width > img.height) {
            width = (canvas.width * img.width) / img.height;
            height = canvas.height;
            dx = -(width - canvas.width) / 2;
          } else {
            width = canvas.width;
            height = (canvas.height * img.height) / img.width;
          }
          ctx.drawImage(img, dx - 1, -1, width + 2, height + 2);
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
