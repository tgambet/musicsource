import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SelectOption } from '@app/core/components/select.component';
import { ActivatedRoute, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ScrollerService } from '@app/main/scroller.service';

@Component({
  selector: 'app-library-content',
  template: `
    <a id="top"></a>
    <div class="filters" #filters [class.scrolled-top]="scrolledTop$ | async">
      <app-container>
        <app-select
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
      .filters {
        background-color: #000;
        position: sticky;
        top: 112px;
        z-index: 101;
        display: flex;
        align-items: center;
        padding: 16px 0;
      }
      .filters.scrolled-top {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: -1px;
        box-shadow: rgba(0, 0, 0, 0.4) 0 5px 6px -3px;
      }
      .filters app-container {
        display: flex;
        align-items: center;
      }
      mat-slide-toggle {
        margin-left: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryContentComponent implements OnInit, OnDestroy {
  @ViewChild('filters', { static: true })
  filters!: ElementRef;

  @Input()
  sortOptions!: SelectOption[];

  @Input()
  selectedSortOption!: SelectOption;

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
          tap(() => (this.sortValue = this.selectedSortOption.value)),
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
