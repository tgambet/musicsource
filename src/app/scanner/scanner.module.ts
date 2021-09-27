import { NgModule } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { ScanComponent } from '@app/scanner/scan.component';
import { EffectsModule } from '@ngrx/effects';
import { ScannerEffects } from '@app/scanner/store';
import { ScannerFacade } from '@app/scanner/store/scanner.facade';

@NgModule({
  declarations: [ScanComponent],
  imports: [CoreModule, EffectsModule.forFeature([ScannerEffects])],
  providers: [ScannerFacade],
})
export class ScannerModule {}
