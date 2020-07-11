import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ImageForgeModule } from '../../projects/image-forge/src/lib/image-forge.module';

import { AppComponent } from './app.component';
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, ImageForgeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
