import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { NgStyle } from '@angular/common';
import { ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-ngx-datatable',
  templateUrl: './ngx-datatable.component.html',
  styleUrls: ['./ngx-datatable.component.scss']
})
export class NgxDatatableComponent {
  @ViewChild('myTable') table: any;

  funder = [];
  calculated = [];
  pending = [];
  groups = [];

  editing: any = {};
  rows: any = [];

  ColumnMode = ColumnMode;

  constructor() {
    this.fetch((data : any) => {
      this.rows = data;
    });
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/exampleData.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  getGroupRowHeight(group: any, rowHeight: number) {
    let style = {};

    style = {
      height: group.length * 40 + 'px',
      width: '100%'
    };

    return style;
  }

  checkGroup(event: any, row: any, rowIndex: number, group: any) {
    let groupStatus = 'Pending';
    let expectedPaymentDealtWith = true;

    row.exppayyes = 0;
    row.exppayno = 0;
    row.exppaypending = 0;

    if (event.target.checked) {
      if (event.target.value === '0') {
        // expected payment yes selected
        row.exppayyes = 1;
      } else if (event.target.value === '1') {
        // expected payment yes selected
        row.exppayno = 1;
      } else if (event.target.value === '2') {
        // expected payment yes selected
        row.exppaypending = 1;
      }
    }

    if (group.length === 2) {
      // There are only 2 lines in a group
      // tslint:disable-next-line:max-line-length
      if (
        ['Calculated', 'Funder'].indexOf(group[0].source) > -1 &&
        ['Calculated', 'Funder'].indexOf(group[1].source) > -1
      ) {
        // Sources are funder and calculated
        // tslint:disable-next-line:max-line-length
        if (group[0].startdate === group[1].startdate && group[0].enddate === group[1].enddate) {
          // Start dates and end dates match
          for (let index = 0; index < group.length; index++) {
            if (group[index].source !== row.source) {
              if (event.target.value === '0') {
                // expected payment yes selected
                group[index].exppayyes = 0;
                group[index].exppaypending = 0;
                group[index].exppayno = 1;
              }
            }

            if (group[index].exppayyes === 0 && group[index].exppayno === 0 && group[index].exppaypending === 0) {
              expectedPaymentDealtWith = false;
            }
            console.log('expectedPaymentDealtWith', expectedPaymentDealtWith);
          }
        }
      }
    } else {
      for (let index = 0; index < group.length; index++) {
        if (group[index].exppayyes === 0 && group[index].exppayno === 0 && group[index].exppaypending === 0) {
          expectedPaymentDealtWith = false;
        }
        console.log('expectedPaymentDealtWith', expectedPaymentDealtWith);
      }
    }

    // check if there is a pending selected payment or a row that does not have any expected payment selected
    if (
      group.filter((rowFilter: any) => rowFilter.exppaypending === 1).length === 0 &&
      group.filter((rowFilter: any) => rowFilter.exppaypending === 0 && rowFilter.exppayyes === 0 && rowFilter.exppayno === 0)
        .length === 0
    ) {
      console.log('expected payment dealt with');

      // check if can set the group status
      const numberOfExpPayYes = group.filter((rowFilter: any) => rowFilter.exppayyes === 1).length;
      const numberOfSourceFunder = group.filter((rowFilter: any) => rowFilter.exppayyes === 1 && rowFilter.source === 'Funder')
        .length;
      const numberOfSourceCalculated = group.filter(
        (rowFilter: any) => rowFilter.exppayyes === 1 && rowFilter.source === 'Calculated'
      ).length;
      const numberOfSourceManual = group.filter((rowFilter: any) => rowFilter.exppayyes === 1 && rowFilter.source === 'Manual')
        .length;

      console.log('numberOfExpPayYes', numberOfExpPayYes);
      console.log('numberOfSourceFunder', numberOfSourceFunder);
      console.log('numberOfSourceCalculated', numberOfSourceCalculated);
      console.log('numberOfSourceManual', numberOfSourceManual);

      if (numberOfExpPayYes > 0) {
        if (numberOfExpPayYes === numberOfSourceFunder) {
          groupStatus = 'Funder Selected';
        } else if (numberOfExpPayYes === numberOfSourceCalculated) {
          groupStatus = 'Calculated Selected';
        } else if (numberOfExpPayYes === numberOfSourceManual) {
          groupStatus = 'Manual Selected';
        } else {
          groupStatus = 'Hybrid Selected';
        }
      }
    }

    group[0].groupstatus = groupStatus;
  }

  updateValue(event: any, cell: any, rowIndex: any) {
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  toggleExpandGroup(group: any) {
    console.log('Toggled Expand Group!', group);
    this.table.groupHeader.toggleExpandGroup(group);
  }

  onDetailToggle(event: any) {
    console.log('Detail Toggled', event);
  }
}