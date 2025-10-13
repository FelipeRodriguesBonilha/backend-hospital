import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from 'src/role/enum/role.enum';
import { LoginPayloadDto } from 'src/auth/__dtos__/login-payload.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector, 
        private readonly jwtService: JwtService, 
        private readonly userService: UserService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { authorization } = context.switchToHttp().getRequest().headers;

        const loginPayload: LoginPayloadDto | undefined = await this.jwtService.verifyAsync(authorization, { secret: process.env.JWT_SECRET }).catch(() => undefined);

        if (!loginPayload) {
            return false;
        }

        if (loginPayload.tokenType && loginPayload.tokenType !== 'access') {
            return false;
        }

        const userRole = await this.userService.getRoleByUserId(loginPayload.id);

        if (!userRole) {
            return false;
        }

        return requiredRoles.some((role) => role === userRole);
    }
}