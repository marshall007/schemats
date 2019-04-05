import { Options } from './options'

export interface ColumnDefinition {
    udtName: string,
    hasDefault: boolean,
    nullable: boolean,
    tsType?: string
}

export interface DbDefinition {
    name: string
}

export interface TableDefinition extends DbDefinition {
    type: 'table'
    columns: {
        [columnName: string]: ColumnDefinition
    }
}

export interface CustomDefinition extends DbDefinition {
    type: 'custom'
    columns: {
        [columnName: string]: ColumnDefinition
    }
}

export interface EnumDefinition extends DbDefinition {
    type: 'enum'
    values: string[]
}

export type SchemaDefinition =
    | TableDefinition
    | CustomDefinition
    | EnumDefinition

export interface Database {
    connectionString: string
    query (queryString: string): Promise<Object[]>
    getDefaultSchema (): string

    getSchema (options: Options): Promise<SchemaDefinition[]>

    getEnumTypes (schemaName: string): Promise<EnumDefinition[]>
    getUserDefinedTypes (schemaName: string): Promise<CustomDefinition[]>
    getTableTypes (schemaName: string): Promise<TableDefinition[]>
}
