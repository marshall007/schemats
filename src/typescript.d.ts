/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */
import { TableDefinition, SchemaDefinition, CustomDefinition } from './schemaInterfaces';
import { Options } from './options';
export declare function generateInterface(table: TableDefinition | CustomDefinition, options: Options): string;
export declare function generate(defs: SchemaDefinition[], options: Options): string;
