import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { exampleData } from 'src/assets/exampleData';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  data = exampleData;
  displayedColumns = ['position', 'name', 'weight', 'symbol'];
  group = []
  ngOnInit(): void {

  }
  getPagingEvent(e: any) {
    console.log(e);
  } 
}
