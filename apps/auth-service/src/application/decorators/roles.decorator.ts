// apps/auth-service/src/application/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../domain/value-objects/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
