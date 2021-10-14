import { NgModule } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { WelcomeComponent } from '@app/welcome/welcome.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
    data: { animation: 'default' },
  },
];

@NgModule({
  declarations: [WelcomeComponent],
  imports: [
    CoreModule,
    RouterModule.forChild(routes),
    // DatabaseModule,
    // ScannerModule,
  ],
  providers: [],
})
export class WelcomeModule {}
