import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, CdkDragEnter, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCheckboxChange } from '@angular/material/checkbox';
import * as XLSX from 'xlsx';
import { ExcelService } from './excel.service';
export interface Object {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
export class Group {
  level: number = 0;
  parent!: Group;
  expanded: boolean = true;
  get visible(): boolean {
    return !this.parent || (this.parent.visible && this.parent.expanded);
  }
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
  @ViewChild('table') table!: ElementRef;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  displayedColumns: string[] = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: any[] = this.displayedColumns.slice();
  columsForFilter: any[] = this.displayedColumns.map((x) => ({
    column: x,
    display: true,
  }));
  dataSource = new MatTableDataSource<Object | Group>([]);
  dataSourceGroup: any;
  showColFilter = false;
  showFilter = false;
  groupByColumns: string[] = [];
  pageSize = 50;
  constructor(
    private excelService:ExcelService
  ) {
    this.dataSource.data = this.addGroups(ELEMENT_DATA, this.groupByColumns);
    this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
  }
  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  applyFilter(event: Event) {
    this.groupByColumns = []; // reset group
    let result: any[] = [];
    let allDataKey = '';
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    ELEMENT_DATA.forEach((value: any) => {
      Object.keys(value).forEach(key => {
        allDataKey += value[key].toString();
      })
      if (allDataKey.toLowerCase().includes(filterValue)) {
        result.push(value);
      }
      allDataKey = '';
    })
    this.dataSource.data = result;
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
    if (this.groupByColumns.findIndex(x => x.includes(event.item.data)) === -1) {
      this.groupByColumns.push(event.item.data);
    }
    this.dataSource.data = this.addGroups(ELEMENT_DATA, this.groupByColumns);
    this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
    console.log(this.dataSource.data);
  }

  removeGroupFilterItem(column: string) {
    this.groupByColumns.splice(this.groupByColumns.findIndex(x => x.includes(column)), 1);
    this.dataSource.data = this.addGroups(ELEMENT_DATA, this.groupByColumns);
    this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
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

  // new template

  customFilterPredicate(data: Object | Group, filter: string): boolean {
    return data instanceof Group ? data.visible : this.getDataRowVisible(data);
  }

  getDataRowVisible(data: Object): boolean {
    const groupRows = this.dataSource.data.filter((row) => {
      if (!(row instanceof Group)) return false;

      let match = true;
      this.groupByColumns.forEach((column) => {
        if (!row[column as keyof Group] || !data[column as keyof Object] || row[column as keyof Group] !== data[column as keyof Object])
          match = false;
      });
      return match;
    });

    if (groupRows.length === 0) return true;
    if (groupRows.length > 1) throw 'Data row is in more than one group!';
    const parent = <Group>groupRows[0]; // </Group> (Fix syntax coloring)

    return parent.visible && parent.expanded;
  }

  groupHeaderClick(row: any) {
    row.expanded = !row.expanded;
    this.dataSource.filter = performance.now().toString(); // hack to trigger filter refresh
  }

  addGroups(data: any[], groupByColumns: string[]): any[] {
    var rootGroup = new Group();
    // console.log('sub ', this.getSublevel(data, 0, groupByColumns, rootGroup))
    return this.getSublevel(data, 0, groupByColumns, rootGroup);
  }

  uniqueBy(a: any, key: any) {
    var seen: any = {};
    return a.filter((item: any) => {
      var k = key(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  }
  getSublevel(
    data: any[],
    level: number,
    groupByColumns: string[],
    parent: Group
  ): any[] {
    // Recursive function, stop when there are no more levels.
    if (level >= groupByColumns.length) return data;

    var groups = this.uniqueBy(
      data.map((row) => {
        var result: any = new Group();
        result.level = level + 1;
        result.parent = parent;
        for (var i = 0; i <= level; i++)
          result[groupByColumns[i]] = row[groupByColumns[i]];
        return result;
      }),
      JSON.stringify
    );
    const currentColumn = groupByColumns[level];

    var subGroups: any[] = [];
    groups.forEach((group: Group) => {
      let rowsInGroup = data.filter(
        (row) => group[currentColumn as keyof Group] === row[currentColumn]
      );
      let subGroup = this.getSublevel(
        rowsInGroup,
        level + 1,
        groupByColumns,
        group
      );
      subGroup.unshift(group);
      subGroups = subGroups.concat(subGroup);
    });
    return subGroups;
  }


  isGroup(index: any, item: any): boolean {
    return item.level;
  }
  paging(event: PageEvent) {
    this.pageSize = event.pageSize;
  }
  exportAsExcel()
    {
      // this.excelService.exportAsExcelFile(this.dataSource.data, 'sample');
    }
}
