import { StatePersistingService } from './state-persisting.service';
import { Component } from '@angular/core';
import { process, State } from '@progress/kendo-data-query';
import { sampleProducts } from './products';
import { GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { GridSettings } from './grid-settings.interface';
import { ColumnSettings } from './column-settings.interface';

@Component({
  selector: 'app-root',
  template: `
    <h4>Dynamic column generation, state and columns config saved and loaded manually</h4>
    <kendo-grid
      #grid
      [data]="gridData1"
      [pageSize]="state1.take"
      [skip]="state1.skip"
      [sort]="state1.sort"
      [filter]="state1.filter"
      [sortable]="true"
      [pageable]="true"
      [filterable]="true"
      [resizable]="true"
      [reorderable]="true"
      (dataStateChange)="dataStateChange($event)"
    >
      <ng-template kendoGridToolbarTemplate>
        <button class="k-button" (click)="saveGridSettings(grid)">Save current state</button>
        <button class="k-button" *ngIf="savedStateExists" (click)="loadGridSettings(1, persistingService.loadGridSettings('gridSettings'))">Load saved state</button>
      </ng-template>
      <kendo-grid-column *ngFor="let col of columnsConfig1"
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
      [data]="gridData2"
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
  public state1: State = {
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

  public gridData1: GridDataResult = process(sampleProducts, this.state1);
  public gridData2: GridDataResult = process(sampleProducts, this.state2);

  public savedStateExists = this.persistingService.savedStateExists;

  public columnsConfig1: ColumnSettings[] = [{
    field: 'ProductID',
    title: 'ID',
    filterable: false,
    _width: 40
  }, {
    field: 'ProductName',
    title: 'Product Name',
    filterable: true,
    _width: 300
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

  public columnsConfig2: ColumnSettings[] = [{
    field: 'ProductID',
    title: 'ID',
    filterable: false,
    width: 40
  }, {
    field: 'ProductName',
    title: 'Product Name',
    filterable: true,
    width: 300
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

  constructor(public persistingService: StatePersistingService) {
    this.loadGridSettings(1, this.persistingService.loadGridSettings('gridSettings'));
    this.loadGridSettings(2, this.persistingService.loadGridSettings('grid2Settings'));
  }  
  
  public dataStateChange(state: DataStateChangeEvent): void {
      this.state1 = state;
      this.gridData1 = process(sampleProducts, this.state1);
  }

  public dataStateChange2(state: DataStateChangeEvent): void {
    this.state2 = state;
    this.gridData2 = process(sampleProducts, this.state2);
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
    });

    this.saveGrid2();
  }

  public saveGridSettings(grid) {
    const columns = grid.columns;

    const gridConfig = {
      state: this.state1,
      columns: columns.toArray().map(item => {
        return Object.keys(item).filter(propName => !propName.toLowerCase().includes('template')).reduce((acc, curr) => ({...acc, ...{[curr]: item[curr]}}), {});
      })
    }

    console.log(gridConfig.columns)
    
    this.persistingService.saveGridSettings('gridSettings', gridConfig);
  }

  public loadGridSettings(token, gridSettings: GridSettings) {
    if(gridSettings) {
      this[`state${token}`] = gridSettings.state;
      this[`columnsConfig${token}`] = gridSettings.columns.sort((a, b) => a.orderIndex - b.orderIndex);
      this[`gridData${token}`] = process(sampleProducts, this[`state${token}`]);
    }
  }

  private saveGrid2() {
    const grid2Config = {
      columns: this.columnsConfig2,
      state: this.state2
    };

    this.persistingService.saveGridSettings('grid2Settings', grid2Config);
  }
}
