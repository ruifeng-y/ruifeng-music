// src/modules/restful/decorators/depends.decorator.ts
import { SetMetadata, Type } from '@nestjs/common';
import { CONTROLLER_DEPENDS } from '../constants';

export const Depends = (...depends: Type<any>[]) => SetMetadata(CONTROLLER_DEPENDS, depends ?? []);