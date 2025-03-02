// src/modules/database/decorators/repository.decorator.ts
import { ObjectType } from 'typeorm/common/ObjectType';
import { CUSTOM_REPOSITORY_METADATA } from '../../database/constants';
import { SetMetadata } from '@nestjs/common';


export const CustomRepository = <T>(entity: ObjectType<T>): ClassDecorator =>
    SetMetadata(CUSTOM_REPOSITORY_METADATA, entity);
