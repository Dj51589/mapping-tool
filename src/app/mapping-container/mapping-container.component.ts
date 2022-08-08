import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { URI } from '../common/uri';
import { ApiCallsService } from '../services/api-calls.service';
import * as _ from 'lodash';
import { IDbType } from '../common/interface';

@Component({
  selector: 'app-mapping-container',
  templateUrl: './mapping-container.component.html',
  styleUrls: ['./mapping-container.component.scss']
})

export class MappingContainerComponent implements OnInit {
  sourceDB: IDbType[] = [];
  destinationDB: IDbType[] = [];
  sourceTables = [];
  destinationTables = [];
  sourceTblCols = [];
  destinationTblCols = [];

  panelOpenState = 'matching';
  dataSource: any;
  selected = 'option2';
  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  ELEMENT_DATA  = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, type: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, type: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, type: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, type: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, type: 'B'},
    {position: 6, name: 'Carbon', weight: 12.0107, type: 'C'},
    {position: 7, name: 'Nitrogen', weight: 14.0067, type: 'N'},
    {position: 8, name: 'Oxygen', weight: 15.9994, type: 'O'},
    {position: 9, name: 'Fluorine', weight: 18.9984, type: 'F'},
    {position: 10, name: 'Neon', weight: 20.1797, type: 'Ne'},
  ];

  displayedColumns: string[] = ['name', 'type'];
  
  constructor(private remote: ApiCallsService) { }

  ngOnInit(): void {
    this.dataSource = this.ELEMENT_DATA;
    this.getDbs();
  }

  getDbs = () => {
    this.remote
      .get(URI.getDbs)
      .subscribe((_response: any) => {
        const response: IDbType[] = _response;
        if (response && response.length > 0) {
          this.sourceDB = _.filter(response, {type: 'Src'});
          this.destinationDB = _.filter(response, {type: 'Dest'});
        }
      });
  };

}
