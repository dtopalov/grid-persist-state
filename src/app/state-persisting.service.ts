import { GridSettings } from './grid-settings.interface';
import { Injectable } from '@angular/core';
import { State } from '@progress/kendo-data-query';

@Injectable()
export class StatePersistingService {
    public get savedStateExists(): boolean {
        return !!this.loadGridSettings('gridSettings');
    }

    public loadGridSettings(token: string): GridSettings|null {
        console.log(token)
        console.log(JSON.parse(localStorage.getItem(token)));
        return JSON.parse(localStorage.getItem(token));
    }

    public saveGridSettings(token: string, gridConfig: GridSettings): void {
        localStorage.setItem(token, JSON.stringify(gridConfig));
    }
}
