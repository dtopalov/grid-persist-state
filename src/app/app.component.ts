import { Component } from '@angular/core';
import { process, State } from '@progress/kendo-data-query';
import { sampleProducts } from './products';
import { GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-root',
  template: `
    <h4>Dynamic column generation, state and columns config saved and loaded manually</h4>
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
        <button class="k-button" *ngIf="savedStateExists" (click)="loadGridState()">Load saved state</button>
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
    <h4>Latest state and columns config saved automatically in event handlers</h4>
    <kendo-grid
      [data]="grid2Data"
      [pageSize]="state2.take"
      [skip]="state2.skip"
      [sort]="state2.sort"
      [filter]="state2.filter"
      [sortable]="true"
      [pageable]="true"
      [filterable]="true"
      [resizable]="true"
      [reorderable]="true"
      (columnReorder)="onReorder($event)"
      (columnResize)="onResize($event)"
      (dataStateChange)="dataStateChange2($event)"
    >
      <kendo-grid-column *ngFor="let col of columnsConfig2"
        [field]="col.field" 
        [title]="col.title" 
        [width]="col.width" 
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

  public state2: State = {
    skip: 0,
    take: 5,

    // Initial filter descriptor
    filter: {
      logic: 'and',
      filters: []
    }
  };

  public gridData: GridDataResult = process(sampleProducts, this.state);
  public grid2Data: GridDataResult = process(sampleProducts, this.state2);

  public savedStateExists = !!localStorage.getItem('gridSettings');

  public columnsConfig = [{
    field: 'ProductID',
    title: 'ID',
    filterable: false,
    _width: 40
  }, {
    field: 'ProductName',
    title: 'Product Name',
    filterable: true
  }, {
    field: 'FirstOrderedOn',
    title: 'First Ordered On',
    filter: 'date',
    format: '{0:d}',
    _width: 240,
    filterable: true
  }, {
    field: 'UnitPrice',
    title: 'Unit Price',
    filter: 'numeric',
    format: '{0:c}',
    _width: 180,
    filterable: true
  }, {
    field: 'Discontinued',
    filter: 'boolean',
    _width: 120,
    filterable: true
  }];

  public columnsConfig2 = [{
    field: 'ProductID',
    title: 'ID',
    filterable: false,
    width: 40
  }, {
    field: 'ProductName',
    title: 'Product Name',
    filterable: true,
    width: undefined
  }, {
    field: 'FirstOrderedOn',
    title: 'First Ordered On',
    filter: 'date',
    format: '{0:d}',
    width: 240,
    filterable: true
  }, {
    field: 'UnitPrice',
    title: 'Unit Price',
    filter: 'numeric',
    format: '{0:c}',
    width: 180,
    filterable: true
  }, {
    field: 'Discontinued',
    filter: 'boolean',
    width: 120,
    filterable: true
  }];

  constructor() {
    this.loadGridState();
    this.loadGrid2State();
  }  
  
  public dataStateChange(state: DataStateChangeEvent): void {
      this.state = state;
      this.gridData = process(sampleProducts, this.state);
  }

  public dataStateChange2(state: DataStateChangeEvent): void {
    this.state2 = state;
    this.grid2Data = process(sampleProducts, this.state2);
    this.saveGrid2();
}

  public onReorder(e) {
    const reorderedColumn = this.columnsConfig2.splice(e.oldIndex, 1);
    this.columnsConfig2.splice(e.newIndex, 0, ...reorderedColumn);
    this.saveGrid2();
  }

  public onResize(e) {
    e.forEach(item => {
      this.columnsConfig2.find(col => col.field === item.column.field).width = item.newWidth;
      this.saveGrid2();
    });
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

    localStorage.setItem('gridSettings', JSON.stringify(gridConfig));
  }

  public loadGridState() {
    const savedState = JSON.parse(localStorage.getItem('gridSettings'));
    if(savedState) {
      this.state = savedState.state;
      this.columnsConfig = savedState.columns.sort((a, b) => a.orderIndex - b.orderIndex);
      this.gridData = process(sampleProducts, this.state);
    }
  }

  public loadGrid2State() {
    const savedState = JSON.parse(localStorage.getItem('grid2Settings'));
    if(savedState) {
      this.state2 = savedState.state;
      this.columnsConfig2 = savedState.columns.sort((a, b) => a.orderIndex - b.orderIndex);
      this.grid2Data = process(sampleProducts, this.state2);
    }
  }

  private saveGrid2() {
    const grid2Config = {
      columns: this.columnsConfig2,
      state: this.state2
    };

    localStorage.setItem('grid2Settings', JSON.stringify(grid2Config));
  }
}
