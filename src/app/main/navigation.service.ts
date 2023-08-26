import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { concatTap, tapError } from '@app/core/utils';
import { from } from 'rxjs';

@Injectable()
export class NavigationService {
  page?: string;

  regexp = /\/library\/(?<page>.+)/;

  constructor(private router: Router) {}

  register() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart,
        ),
        filter((event) => event.url === '/library'),
        concatTap(() =>
          from(
            this.router.navigateByUrl(`/library/${this.page || 'playlists'}`),
          ),
        ),
        tapError((err) => console.error(err)),
        catchError(() => this.router.navigate(['/library', 'playlists'])),
      )
      .subscribe();

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        filter((event) => this.regexp.test(event.url)),
        map((event) => this.regexp.exec(event.url)?.groups?.page),
        tap((page) => (this.page = page?.replace(/#.+$/, ''))),
      )
      .subscribe();
  }
}
