// import { Inject, Injectable } from '@angular/core';
// import { Platform } from '@angular/cdk/platform';
// import { DOCUMENT } from '@angular/common';
//
// @Injectable({
//   providedIn: 'root',
// })
// export class SupportService {
//   constructor(
//     private platform: Platform,
//     @Inject(DOCUMENT) private document: Document
//   ) {}
//
//   checkBrowser() {
//     return (
//       this.checkFileSystemSupport() ||
//       (this.platform.BLINK && !this.platform.ANDROID)
//     );
//   }
//
//   checkFileSystemSupport() {
//     return (
//       this.document.defaultView &&
//       ('chooseFileSystemEntries' in this.document.defaultView ||
//         'showDirectoryPicker' in this.document.defaultView)
//     );
//   }
// }
