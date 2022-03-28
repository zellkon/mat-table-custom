import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/material.module';
import { ResizeColumnDirective } from './resizeColumn.directive';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ExcelService } from './excel.service';

@NgModule({
  declarations: [	
    AppComponent,
    ResizeColumnDirective
   ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule
  ],
  providers: [ExcelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
