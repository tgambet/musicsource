import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Icons } from '@app/utils/icons.util';

export interface SelectOption {
  name: string;
  value: string;
}

@Component({
  selector: 'app-select',
  template: `
    <div class="trigger">
      <div class="trigger-content" [matMenuTriggerFor]="menu">
        <span>{{ selected.name }}</span>
        <app-icon [path]="icons.menuDown"></app-icon>
      </div>
    </div>
    <mat-menu #menu="matMenu" [hasBackdrop]="true" [overlapTrigger]="true">
      <button
        mat-menu-item
        *ngFor="let option of options"
        [class.selected]="option.value === selected.value"
        (click)="select(option)"
      >
        {{ option.name }}
      </button>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .trigger {
        border-radius: 17px;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 0 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        min-width: 120px;
      }
      .trigger-content {
        height: 34px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
      }
      .trigger span {
        margin-right: 8px;
      }
      .trigger app-icon {
        margin-left: auto;
      }
      button {
        font-size: 16px;
      }
      .selected,
      .selected:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent implements OnInit {
  @Input()
  options!: SelectOption[];

  @Output()
  selectionChange: EventEmitter<string> = new EventEmitter();

  @Input()
  selected!: SelectOption;

  icons = Icons;

  ngOnInit(): void {
    // this.selected = this.options[0].value;
  }

  select(option: SelectOption): void {
    this.selected = option;
    this.selectionChange.emit(option.value);
  }
}
