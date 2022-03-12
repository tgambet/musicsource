import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SelectOption } from '@app/core/components/select.component';
import { ActivatedRoute, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ScrollerService } from '@app/main/scroller.service';
import { Filter } from '@app/core/components/filters.component';

@Component({
  selector: 'app-library-content',
  template: `
    <a id="top"></a>
    <div class="controls" [class.scrolled-top]="scrolledTop$ | async">
      <app-container>
        <app-select
          *ngIf="sortOptions.length > 0"
          [options]="sortOptions"
          [selected]="selectedSortOption"
          (selectionChange)="this.sortValue = $event; sort()"
        ></app-select>
        <!--        <mat-slide-toggle-->
        <!--          [checked]="likes"-->
        <!--          (change)="this.likes = $event.checked; sort()"-->
        <!--        >-->
        <!--          Liked only-->
        <!--        </mat-slide-toggle>-->
        <app-filters
          [filters]="filters"
          [selectedIndex]="selectedFilterIndex"
        ></app-filters>
      </app-container>
    </div>
    <app-container>
      <ng-content></ng-content>
    </app-container>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: calc(100vh - 64px - 48px - 72px);
      }
      #top {
        position: relative;
        top: -112px;
        display: block;
      }
      .controls {
        background-color: #000;
        position: sticky;
        top: 112px;
        z-index: 101;
        display: flex;
        align-items: center;
        padding: 16px 0;
      }
      .controls.scrolled-top {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: -1px;
        box-shadow: rgba(0, 0, 0, 0.4) 0 5px 6px -3px;
      }
      .controls app-container {
        display: flex;
        align-items: center;
      }
      app-select {
        margin-right: 0.5rem;
      }
      /*mat-slide-toggle {*/
      /*  margin-left: 16px;*/
      /*}*/
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryContentComponent implements OnInit, OnDestroy {
  @Input()
  filters: Filter[] = [];

  @Input()
  sortOptions: SelectOption[] = [];

  @Input()
  selectedSortOption!: SelectOption;

  @Input()
  selectedFilterIndex: number | null = 0;

  scrolledTop$!: Observable<boolean>;

  subscription = new Subscription();

  sortValue!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private scroller: ScrollerService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.route.queryParamMap
        .pipe(
          tap(
            (params) =>
              (this.selectedSortOption =
                this.sortOptions.find(
                  (o) =>
                    o.value === `${params.get('sort')}_${params.get('dir')}`
                ) || this.sortOptions[0])
          ),
          tap(
            () =>
              this.selectedSortOption &&
              (this.sortValue = this.selectedSortOption.value)
          ),
          tap(() => this.cdr.markForCheck())
        )
        .subscribe()
    );

    this.scrolledTop$ = this.scroller.scroll$.pipe(map((top) => top >= 324));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async sort(): Promise<void> {
    const [sort, dir] = this.sortValue.split('_');
    await this.router.navigate([], {
      queryParams: { sort, dir },
      preserveFragment: true,
    });
  }
}
