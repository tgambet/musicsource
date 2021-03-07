import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Router,
  UrlTree,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MainGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (localStorage.getItem('scanned') === '1') {
      return true;
    }
    return this.router.createUrlTree(['/welcome']);
  }

  canActivateChild(): boolean | UrlTree {
    return this.canActivate();
  }
}
