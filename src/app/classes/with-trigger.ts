import { MatMenuTrigger } from '@angular/material/menu';

export class WithTrigger {
  trigger?: MatMenuTrigger;

  closeMenu() {
    if (this.trigger) {
      this.trigger.closeMenu();
      this.trigger = undefined;
    }
  }

  menuOpened(trigger: MatMenuTrigger) {
    if (this.trigger && this.trigger !== trigger) {
      this.trigger.closeMenu();
    }
    this.trigger = trigger;
  }
}
