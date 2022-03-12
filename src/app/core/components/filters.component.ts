import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Icons } from '@app/core/utils';

export interface Filter {
  label: string;
  path: string;
}

@Component({
  selector: 'app-filters',
  template: `
    <mat-chip-list aria-label="Fish selection">
      <mat-chip
        *ngFor="let filter of filters; let index = index"
        [selected]="selectedIndex === index"
        (click)="selectedIndex = index"
        [color]="'accent'"
        [routerLink]="['../', filter.path]"
        [preserveFragment]="true"
      >
        {{ filter.label }}
      </mat-chip>
    </mat-chip-list>
    <mat-chip
      class="clear"
      (click)="selectedIndex = null"
      [color]="'accent'"
      *ngIf="selectedIndex !== null && filters.length > 0"
      [selected]="true"
      title="Clear filters"
      [routerLink]="['../']"
      [preserveFragment]="true"
    >
      <app-icon [path]="icons.close" [size]="24"></app-icon>
    </mat-chip>
  `,
  styles: [
    `
      :host {
        display: flex;
      }
      mat-chip {
        min-height: 36px;
        border-radius: 18px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-weight: 400;
        font-size: 16px;
        cursor: pointer;
      }
      .clear {
        padding-left: 5px;
        padding-right: 5px;
        margin-left: 0.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersComponent {
  @Input() filters!: Filter[];

  @Input()
  selectedIndex: number | null = null;

  icons = Icons;

  test($event: any) {
    console.log($event);
  }
}
