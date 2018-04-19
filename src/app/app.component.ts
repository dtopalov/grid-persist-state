import { StatePersistingService } from './state-persisting.service';
import { Component } from '@angular/core';
import { process, State } from '@progress/kendo-data-query';
import { sampleProducts } from './products';
import { GridDataResult, DataStateChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { GridSettings } from './grid-settings.interface';
import { ColumnSettings } from './column-settings.interface';

@Component({
  selector: 'my-app',
  template: `
    <h4>Dynamic column generation, state and columns config saved and loaded manually</h4>
    <kendo-grid
      #grid
      [data]="grid1Settings.gridData"
      [pageSize]="grid1Settings.state.take"
      [skip]="grid1Settings.state.skip"
      [sort]="grid1Settings.state.sort"
      [filter]="grid1Settings.state.filter"
      [sortable]="true"
      [pageable]="true"
      [filterable]="true"
      [resizable]="true"
      [reorderable]="true"
      (dataStateChange)="dataStateChange($event)"
    >
      <ng-template kendoGridToolbarTemplate>
        <button class="k-button" (click)="saveGridSettings(grid)">Save current state</button>
        <button
            class="k-button"
            *ngIf="savedStateExists"
            (click)="grid1Settings = mapGridSettings(persistingService.get('gridSettings'))">Load saved state</button>
      </ng-template>
      <kendo-grid-column *ngFor="let col of grid1Settings.columnsConfig"
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
      [data]="grid2Settings.gridData"
      [pageSize]="grid2Settings.state.take"
      [skip]="grid2Settings.state.skip"
      [sort]="grid2Settings.state.sort"
      [filter]="grid2Settings.state.filter"
      [sortable]="true"
      [pageable]="true"
      [filterable]="true"
      [resizable]="true"
      [reorderable]="true"
      (columnReorder)="onReorder($event)"
      (columnResize)="onResize($event)"
      (dataStateChange)="dataStateChange2($event)"
    >
      <kendo-grid-column *ngFor="let col of grid2Settings.columnsConfig"
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
  public grid1Settings: GridSettings = {
    state: {
      skip: 0,
      take: 5,

      // Initial filter descriptor
      filter: {
        logic: 'and',
        filters: []
      }
    },
    gridData: process(sampleProducts, {
      skip: 0,
      take: 5,
      // Initial filter descriptor
      filter: {
        logic: 'and',
        filters: []
      }
    }),
    columnsConfig: [{
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
    }]
  };

  public grid2Settings: GridSettings = {
    state: {
      skip: 0,
      take: 5,

      // Initial filter descriptor
      filter: {
        logic: 'and',
        filters: []
      }
    },
    gridData: process(sampleProducts, {
      skip: 0,
      take: 5,

      // Initial filter descriptor
      filter: {
        logic: 'and',
        filters: []
      }
    }),
    columnsConfig: [{
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
    }]
  }

  public get savedStateExists(): boolean {
    return !!this.persistingService.get('gridSettings');
  }

  constructor(public persistingService: StatePersistingService) {
    const grid1Settings: GridSettings = this.persistingService.get('gridSettings');
    const grid2Settings: GridSettings = this.persistingService.get('grid2Settings');

    if (grid1Settings !== null) {
      this.grid1Settings = this.mapGridSettings(grid1Settings);
    }

    if (grid2Settings !== null) {
      this.grid2Settings = this.mapGridSettings(grid2Settings);
    }
  }

  public dataStateChange(state: State): void {
      this.grid1Settings.state = state;
      this.grid1Settings.gridData = process(sampleProducts, state);
  }

  public dataStateChange2(state: State): void {
    this.grid2Settings.state = state;
    this.grid2Settings.gridData = process(sampleProducts, state);
    this.saveGrid2();
  }

  public onReorder(e: any): void {
    const reorderedColumn = this.grid2Settings.columnsConfig.splice(e.oldIndex, 1);
    this.grid2Settings.columnsConfig.splice(e.newIndex, 0, ...reorderedColumn);
    this.saveGrid2();
  }

  public onResize(e: any): void {
    e.forEach(item => {
      this.grid2Settings.columnsConfig.find(col => col.field === item.column.field).width = item.newWidth;
    });

    this.saveGrid2();
  }

  public saveGridSettings(grid: GridComponent): void {
    const columns = grid.columns;

    const gridConfig = {
      state: this.grid1Settings.state,
      columnsConfig: columns.toArray().map(item => {
        return Object.keys(item)
          .filter(propName => !propName.toLowerCase()
            .includes('template'))
            .reduce((acc, curr) => ({...acc, ...{[curr]: item[curr]}}), {});
      })
    };

    this.persistingService.set('gridSettings', gridConfig);
  }

  public mapGridSettings(gridSettings: GridSettings): GridSettings {
    const state = gridSettings.state;

    return {
      state,
      columnsConfig: gridSettings.columnsConfig.sort((a, b) => a.orderIndex - b.orderIndex),
      gridData: process(sampleProducts, state)
    };
  }

  private saveGrid2(): void {
    const grid2Config = {
      columnsConfig: this.grid2Settings.columnsConfig,
      state: this.grid2Settings.state
    };

    this.persistingService.set('grid2Settings', grid2Config);
  }
}
