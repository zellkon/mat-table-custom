import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, CdkDragEnter, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCheckboxChange } from '@angular/material/checkbox';
import * as _ from 'lodash';
export interface Object {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
const ELEMENT_DATA: Object[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 1, name: 'Helium', weight: 4.0026, symbol: 'H' },
  { position: 2, name: 'Lithium', weight: 6.941, symbol: 'L' },
  { position: 3, name: 'Beryllium', weight: 9.0122, symbol: 'B' },
  { position: 4, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 5, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 5, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 6, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 7, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 8, name: 'Neon', weight: 20.1797, symbol: 'N' },
];
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  displayedColumns: string[] = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: any[] = this.displayedColumns.slice();
  columsForFilter: any[] = this.displayedColumns.map(x => ({ column: x, display: true }));
  dataSource: MatTableDataSource<Object>;
  groupFilterItems: string[] = [];
  showColFilter = false;
  showFilter = false;
  constructor() {
    this.dataSource = new MatTableDataSource(ELEMENT_DATA);
  }
  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addColumn() {
    const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
    this.columnsToDisplay.push(this.displayedColumns[randomColumn]);
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  // dragNdrop

  dragCol(event: CdkDragStart) {
    console.log(event);
  }

  dropCol(event: CdkDragDrop<any>) {
    if (event) {
      moveItemInArray(this.columnsToDisplay, event.previousIndex, event.currentIndex);
    }
  }
  dropGroup(event: CdkDragDrop<any>) {
    if (this.groupFilterItems.findIndex(x => x.includes(event.item.data)) === -1) {
      this.groupFilterItems.push(event.item.data);
      console.log(this.groupByMultipleField(this.dataSource.data, this.groupFilterItems));
    }
  }
  removeGroupFilterItem(column: string) {
    this.groupFilterItems.splice(this.groupFilterItems.findIndex(x => x.includes(column)), 1);
  }
  // resize Col by Directive
  checkedColumn(column: string): boolean {
    return this.columnsToDisplay.find(x => x.includes(column)) ? true : false;
  }

  colFilter(event: MatCheckboxChange, index: number) {
    this.columsForFilter[index].display = event.checked;
  }

  reloadTableWithFilter() {
    this.columnsToDisplay = this.columsForFilter.filter(x => x.display === true).map(result => result.column);
  }
  resetFilterCol() {
    this.columsForFilter = this.displayedColumns.map(x => ({ column: x, display: true }));
  }
  // func Group By Key for Data

  groupBySingleField(data: any, field: any) {
    return data.reduce((acc: any, val: any) => {
      const rest = Object.keys(val).reduce((newObj: any, key) => {
        if (key !== field) {
          newObj[key] = val[key]
        }
        return newObj;
      }, {});
      if (acc[val[field]]) {
        acc[val[field]].push(rest);
      } else {
        ;
        acc[val[field]] = [rest];
      }
      return acc;
    }, {})
  }

  groupByMultipleField(data: any, ...fields: any) {
    if (fields.length === 0) return;
    let newData: any = {};
    const [field] = fields;
    newData = this.groupBySingleField(data, field);
    const remainingFields = fields.slice(1);
    if (remainingFields.length > 0) {
      Object.keys(newData).forEach((key) => {
        newData[key] = this.groupByMultipleField(newData[key], ...remainingFields)
      })
    }
    return newData;
  }

  test(data: any) {
    console.log(data);
  }
}
