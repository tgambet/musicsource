import { NgModule } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { EffectsModule } from '@ngrx/effects';
import { HelperFacade } from '@app/helper/helper.facade';
import { HelperEffects } from '@app/helper/helper.effects';

@NgModule({
  declarations: [],
  imports: [CoreModule, EffectsModule.forFeature([HelperEffects])],
  providers: [HelperFacade],
  exports: [],
})
export class HelperModule {}
