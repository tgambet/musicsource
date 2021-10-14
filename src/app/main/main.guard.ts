import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, UrlTree } from '@angular/router';

@Injectable()
export class MainGuard implements CanActivate, CanActivateChild {
  canActivate(): boolean | UrlTree {
    // if (localStorage.getItem('scanned') === '1') {
    return true;
    // }
    // return this.router.createUrlTree(['/welcome']);
  }

  canActivateChild(): boolean | UrlTree {
    return this.canActivate();
  }
}
