import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/material.module';
import { ResizeColumnDirective } from './mat-datatable/resizeColumn.directive';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableComponent } from './ngx-datatable/ngx-datatable.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatDatatableComponent } from './mat-datatable/mat-datatable.component';
@NgModule({
  declarations: [			
    AppComponent,
    ResizeColumnDirective,
    NgxDatatableComponent,
      MatDatatableComponent
   ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule,
    NgxDatatableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
