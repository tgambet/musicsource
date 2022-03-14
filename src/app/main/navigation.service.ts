import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, map, tap } from 'rxjs/operators';

@Injectable()
export class NavigationService {
  page?: string;

  regexp = /\/library\/(?<page>.+)(#.+)/;

  constructor(private router: Router) {}

  register() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart
        ),
        filter((event) => event.url === '/library'),
        tap(() =>
          this.router.navigate(
            ['/library', ...(this.page ? this.page.split('/') : ['playlists'])],
            {
              preserveFragment: true,
            }
          )
        )
      )
      .subscribe();

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        filter((event) => this.regexp.test(event.url)),
        map((event) => this.regexp.exec(event.url)?.groups?.page),
        tap((page) => (this.page = page))
      )
      .subscribe();
  }
}
