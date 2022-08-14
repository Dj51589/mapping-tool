export interface IDbType {
    dbName: string;
    type: string;
}


export interface ITable {
    dbName: string;
    tableName: string;
}

export interface ITblColumns {
    dbName: string;
    tableName: string;
    columnName: string;
    dataType: string;
    isNullable: string;
    selected: boolean;
}