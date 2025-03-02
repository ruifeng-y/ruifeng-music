// src/modules/database/commands/typeorm-migration-create.ts
import { resolve } from 'path';

import chalk from 'chalk';

import { MigrationCreateOptions } from './types';
const { CommandUtils } = require('typeorm/commands/CommandUtils');
const { PlatformTools } = require('typeorm/platform/PlatformTools');
const { camelCase } = require('typeorm/util/StringUtils');


type HandlerOptions = MigrationCreateOptions & { dir: string };
/**
 * Creates a new migration file.
 * 执行逻辑
 */
export class TypeormMigrationCreate {
    async handler(args: HandlerOptions) {
        try {
            const timestamp = new Date().getTime();
            const directory = args.dir.startsWith('/')
                ? args.dir
                : resolve(process.cwd(), args.dir);
            const fileContent = TypeormMigrationCreate.getTemplate(args.name as any, timestamp);
            const filename = `${timestamp}-${args.name}`;
            const fullPath = `${directory}/${filename}`;
            await CommandUtils.createFile(`${fullPath}.ts`, fileContent);
            console.log(
                `Migration ${chalk.blue(`${fullPath}.ts`)} has been generated successfully.`,
            );
        } catch (err) {
            PlatformTools.logCmdErr('Error during migration creation:', err);
            process.exit(1);
        }
    }

    /**
     * Gets contents of the migration file.
     */
    protected static getTemplate(name: string, timestamp: number): string {
        return `import typeorm = require('typeorm');

class ${camelCase(name, true)}${timestamp} implements typeorm.MigrationInterface {

    public async up(queryRunner: typeorm.QueryRunner): Promise<void> {
    }

    public async down(queryRunner: typeorm.QueryRunner): Promise<void> {
    }

}
`;
    }
}