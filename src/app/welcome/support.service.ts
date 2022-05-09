import { Inject, Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class SupportService {
  constructor(
    private platform: Platform,
    @Inject(DOCUMENT) private document: Document
  ) {}

  checkFileSystemSupport(): boolean {
    return (
      (this.document.defaultView &&
        'showDirectoryPicker' in this.document.defaultView) ??
      false
    );
  }

  isAppAvailable(): boolean {
    return localStorage.getItem('scanned') === '1';
  }
}
