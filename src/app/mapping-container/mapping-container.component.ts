import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { URI } from '../common/uri';
import { ApiCallsService } from '../services/api-calls.service';
import * as _ from 'lodash';
import { IDbType, ITable, ITblColumns } from '../common/interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mapping-container',
  templateUrl: './mapping-container.component.html',
  styleUrls: ['./mapping-container.component.scss']
})

export class MappingContainerComponent implements OnInit {
  isLoader = false;
  sourceDB: IDbType[] = [];
  destinationDB: IDbType[] = [];
  sourceTables: ITable[] = [];
  destinationTables: ITable[] = [];
  sourceTblCols: ITblColumns[] = [];
  destinationTblCols: ITblColumns[] = [];
  matchedCols: ITblColumns[] = [];
  sourceUnMatchedCols: ITblColumns[] = [];
  destinationUnMatchedCols: ITblColumns[] = [];

  sourceColToMap: ITblColumns | null = null;
  destinationColsToMap: ITblColumns[] = [];

  srcDB: string = '';
  destDB: string = '';
  srcTbl: string = '';
  destTbl: string = '';

  panelOpenState = 'matching';
  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];
  displayedColumns: string[] = ['columnName', 'dataType'];

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

  constructor(private remote: ApiCallsService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getDbs();
  }

  getDbs = () => {
    this.isLoader = true;
    this.remote
      .get(URI.getDbs)
      .subscribe((_response: any) => {
        const response: IDbType[] = _response;
        if (response && response.length > 0) {
          this.sourceDB = _.filter(response, { type: 'Src' });
          this.destinationDB = _.filter(response, { type: 'Dest' });

          this.srcDB = this.sourceDB[0].dbName;
          this.destDB = this.destinationDB[0].dbName;

          this.getTable(this.sourceDB[0].dbName, 'src');
          this.getTable(this.destinationDB[0].dbName, 'dest');
        }
      });
  };

  getTable = (dbName: string, type: string) => {
    if (dbName) {
      this.isLoader = true;
      this.remote
        .get(`${URI.getTables}?dbname=${dbName}`)
        .subscribe((_response: any) => {
          const response: ITable[] = _response;
          if (response && response.length > 0) {
            if (type === 'src') {
              this.sourceTables = response;
              this.srcTbl = this.sourceTables[0].tableName;
            } else {
              this.destinationTables = response;
              this.destTbl = this.destinationTables[0].tableName;
            }
          } else {
            if (type === 'src') {
              this.sourceTables = [];
              this.srcTbl = '';
            } else {
              this.destinationTables = [];
              this.destTbl = '';
            }
          }
          this.getColumns(dbName, response && response.length > 0 ? response[0].tableName : '', type);
        });
    } else {
      if (type === 'src') {
        this.sourceTables = [];
        this.srcTbl = '';
        this.sourceTblCols = [];
      } else {
        this.destinationTables = [];
        this.destTbl = '';
        this.destinationTblCols = [];
      }
      this.matchedCols = [];
      this.sourceUnMatchedCols = [];
      this.destinationUnMatchedCols = [];
    }
  }

  getColumns = (dbName: string, tblName: string, type: string) => {
    this.isLoader = true;
    this.matchedCols = [];
    this.sourceUnMatchedCols = [];
    this.destinationUnMatchedCols = [];
    if (dbName && tblName) {
      this.remote
        .get(`${URI.getColumns}?dbname=${dbName}&tblname=${tblName}`)
        .subscribe((_response: any) => {
          const response: ITblColumns[] = _response;
          if (type === 'src') {
            this.sourceTblCols = response && response.length > 0 ? response : [];
          } else {
            this.destinationTblCols = response && response.length > 0 ? response : [];
          }
          this.isLoader = false;

          if (this.sourceTblCols.length > 0 && this.destinationTblCols.length > 0) {
            this.getMatchedColumns();
          }
        });
    } else {
      this.isLoader = false;
      if (type === 'src') {
        this.sourceTblCols = [];
      } else {
        this.destinationTblCols = [];
      }
    }
  }

  getMatchedColumns = () => {
    this.matchedCols = [];
    this.sourceUnMatchedCols = [];
    this.destinationUnMatchedCols = [];
    this.remote
      .get(`${URI.getMapping}?tblname=${this.destTbl}`)
      .subscribe((response: any) => {
        this.matchedCols = [];
        this.sourceUnMatchedCols = [];
        this.destinationUnMatchedCols = [];
        _.each(this.sourceTblCols, (source: ITblColumns) => {
          const filteredItem = _.filter(response, { srcColumn: source.columnName })[0];
          if (filteredItem) {
            this.matchedCols.push(source);
          } else {
            this.sourceUnMatchedCols.push(source);
          }
        });
        this.destinationUnMatchedCols = _.cloneDeep(this.destinationTblCols);
      });
  };

  setDestMapColumns = () => {
    const selectedDestMapCols = _.filter(this.destinationUnMatchedCols, { selected: true });
    this.destinationColsToMap = [];
    if (selectedDestMapCols.length > 0) {
      this.destinationColsToMap = selectedDestMapCols;
    }
  }

  mapColumns = () => {
    if (!this.sourceColToMap) {
      this.toastr.warning('Select source column to map');
    } else if (this.destinationColsToMap.length === 0) {
      this.toastr.warning('Select destination column(s) to map with');
    } else {
      const destCols: {columnName: string, columnDataType: string}[] = [];
      _.each(this.destinationColsToMap, (col: ITblColumns) => {
        destCols.push({
          columnName: col.columnName,
          columnDataType: col.dataType
        })
      });
      const payload = {
        sourceDB: this.srcDB,
        sourceTbl: this.srcTbl,
        sourceCol: this.sourceColToMap.columnName,
        sourceColType: this.sourceColToMap.dataType,
        destinationDB: this.destDB,
        destinationTbl: this.destTbl,
        destinationCols: destCols,
      };
      console.log('*** mapping payload ***', payload);
      this.isLoader = true;
      this.remote
        .send(URI.mapColumns, payload)
        .subscribe(response => {
          this.isLoader = false;
          this.toastr.success('mapping done');
          this.getColumns(this.srcDB, this.srcTbl, 'src');
          this.getColumns(this.destDB, this.destTbl, 'dest');
        });
    }
  }

}
