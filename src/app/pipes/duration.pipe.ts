import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(value: number): string {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor(value / 60) % 60;
    const seconds = Math.floor(value) % 60;

    const format = (num: number) => num.toString(10).padStart(2, '0');

    let result = `${minutes}:${format(seconds)}`;
    if (hours > 0) {
      result = format(hours) + ':' + result;
    }

    return result;
  }
}
