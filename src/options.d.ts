import { SchemaDefinition, Database } from './schemaInterfaces';
declare enum SQLVersion {
    POSTGRES = 1,
    MYSQL = 2,
    UNKNOWN = 3
}
export declare type OptionValues = {
    camelCase: boolean;
    connectionString: string;
    noHeader: boolean;
    output: string;
    schema: string;
    table: string | string[];
};
export declare class Options implements OptionValues {
    camelCase: boolean;
    connectionString: string;
    noHeader: boolean;
    output: string;
    schema: string;
    table: string[];
    private db;
    constructor(options: OptionValues);
    static fromArgv(): Options;
    static getDatabase(connection: string): Database;
    static getSQLVersion(connection: string): SQLVersion;
    getSchema(): Promise<SchemaDefinition[]>;
    generate(): Promise<string>;
    getTypes<T extends SchemaDefinition>(definitions: SchemaDefinition[], filter: T['type']): T[];
    transformTypeName(typename: string): string;
    transformColumnName(columnName: string): string;
}
export {};
