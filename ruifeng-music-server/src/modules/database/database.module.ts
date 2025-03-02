// src/modules/database/database.module.ts
import { DynamicModule, Module, Type, Provider, ModuleMetadata, } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions, } from '@nestjs/typeorm';
import { CUSTOM_REPOSITORY_METADATA } from '../database/constants';
import { DataSource,ObjectType} from 'typeorm';
// import { getDataSourceToken } from '../database/decorators/repository.decorator';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataExistConstraint } from '@/modules/core/constraints/data.exist.constraint';
import { UniqueConstraint } from '@/modules/core/constraints/unique.constraint';
import { UniqueExistContraint } from '@/modules/database/constraints/unique.exist.constraint';
import { UniqueTreeConstraint } from '@/modules/database/constraints/tree.unique.constraint';
import { UniqueTreeExistConstraint } from '@/modules/database/constraints/tree.unique.exist.constraint';
import { Configure } from '../config/configure';
import { DbOptions } from './types';
import { panic } from '../core/helpers';
import { AutoMigrate } from './resolver';

@Module({})
export class DatabaseModule {
    // static  forRoot(configRegister: () => TypeOrmModuleOptions): DynamicModule {
    //     return {
    //         global: true,
    //         module: DatabaseModule,
    //         imports: [TypeOrmModule.forRoot(configRegister())],
    //         // 因为data.exist.constraint这个约束类中注入了nestjs的dataSource，但是只有提供者才能注入提供者，所以我们需要把它注册为DatabaseModule的提供者
    //         providers: [DataExistConstraint, UniqueConstraint,UniqueExistContraint,UniqueTreeConstraint,UniqueTreeExistConstraint],
    //     };
    // }
    static async forRoot(configure: Configure) {
        if (!configure.has('database')) {
            panic({ message: 'Database config not exists or not right!' });
        }
        const { connections } = await configure.get<DbOptions>('database');
        const imports: ModuleMetadata['imports'] = [];
        for (const dbOption of connections) {
            imports.push(TypeOrmModule.forRoot(dbOption as TypeOrmModuleOptions));
        }
        const providers: ModuleMetadata['providers'] = [
            AutoMigrate,
            DataExistConstraint,
            UniqueConstraint,
            UniqueExistContraint,
            UniqueTreeConstraint,
            UniqueTreeExistConstraint,
        ];

        return {
            global: true,
            module: DatabaseModule,
            imports,
            providers,
        };
    }

    static forRepository<T extends Type<any>>(
        repositories: T[],
        dataSourceName?: string,
    ): DynamicModule {
        const providers: Provider[] = [];

        for (const Repo of repositories) {
            const entity = Reflect.getMetadata(CUSTOM_REPOSITORY_METADATA, Repo);

            if (!entity) {
                continue;
            }

            providers.push({
                inject: [getDataSourceToken(dataSourceName)],
                provide: Repo,
                useFactory: (dataSource: DataSource): InstanceType<typeof Repo> => {
                    const base = dataSource.getRepository<ObjectType<any>>(entity);
                    return new Repo(base.target, base.manager, base.queryRunner);
                },
            });
        }
        return {
            exports: providers,
            module: DatabaseModule,
            providers,
        };
    }
}