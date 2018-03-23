import { Component } from '@angular/core';
import { process, State } from '@progress/kendo-data-query';
import { sampleProducts } from './products';
import { GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-root',
  template: `
    <kendo-grid
      #grid
      [data]="gridData"
      [pageSize]="state.take"
      [skip]="state.skip"
      [sort]="state.sort"
      [filter]="state.filter"
      [sortable]="true"
      [pageable]="true"
      [filterable]="true"
      [resizable]="true"
      [reorderable]="true"
      (dataStateChange)="dataStateChange($event)"
    >
      <ng-template kendoGridToolbarTemplate>
        <button class="k-button" (click)="saveGridState(grid)">Save current state</button>
      </ng-template>
      <kendo-grid-column *ngFor="let col of columnsConfig"
        [field]="col.field" 
        [title]="col.title" 
        [width]="col._width" 
        [filter]="col.filter" 
        [filterable]="col.filterable"
        [format]="col.format">
      </kendo-grid-column>
    </kendo-grid>

  `,
  styles: []
})
export class AppComponent {
  public state: State = {
    skip: 0,
    take: 5,

    // Initial filter descriptor
    filter: {
      logic: 'and',
      filters: []
    }
  };

  public columnsConfig = [{
    field: 'ProductID',
    title: 'ID',
    filterable: false,
    _width: 40
  }, {
    field: 'ProductName',
    title: 'Product Name'
  }, {
    field: 'FirstOrderedOn',
    title: 'First Ordered On',
    filter: 'date',
    format: '{0:d}',
    _width: 240
  }, {
    field: 'UnitPrice',
    title: 'Unit Price',
    filter: 'numeric',
    format: '{0:c}',
    _width: 180
  }, {
    field: 'Discontinued',
    filter: 'boolean',
    _width: 120
  }];

  constructor() {
    const savedState = JSON.parse(localStorage.getItem('gridSettings'));
    if(savedState) {
      this.state = savedState.state;
      this.columnsConfig = savedState.columns.sort((a, b) => a.orderIndex - b.orderIndex);
      this.gridData = process(sampleProducts, this.state);
    }
  }

  public gridData: GridDataResult = process(sampleProducts, this.state);
  
  public dataStateChange(state: DataStateChangeEvent): void {
      this.state = state;
      this.gridData = process(sampleProducts, this.state);
  }

  public saveGridState(grid) {
    const columns = grid.columns;

    const gridConfig = {
      state: this.state,
      columns: columns.toArray().map(item => {
        return Object.keys(item).filter(propName => !propName.toLowerCase().includes('template')).reduce((acc, curr) => {
          acc[curr] = item[curr]
          return acc;
        }, {});
      })
    }

    console.log(gridConfig);

    localStorage.setItem('gridSettings', JSON.stringify(gridConfig));
  }
}
