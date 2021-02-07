import { Options } from './options';
import { TableDefinition, Database, SchemaDefinition, EnumDefinition, CustomDefinition } from './schemaInterfaces';
export declare class PostgresDatabase implements Database {
    connectionString: string;
    private db;
    constructor(connectionString: string);
    private static mapTableDefinitionsToType;
    private static toTSType;
    query(queryString: string): Promise<any>;
    getEnumTypes(schemaName?: string): Promise<EnumDefinition[]>;
    getUserDefinedTypes(schemaName: string): Promise<CustomDefinition[]>;
    getTableTypes(schemaName: string): Promise<TableDefinition[]>;
    getSchema(options: Options): Promise<SchemaDefinition[]>;
    private toTableDefinitions;
}
