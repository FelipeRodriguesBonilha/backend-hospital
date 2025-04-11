import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from 'src/user/enum/role.enum';
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

        const userRoles = await this.userService.getRolesByUserId(loginPayload.id);

        if (!userRoles || userRoles.length === 0) {
            return false;
        }

        return userRoles.some((role) => requiredRoles.includes((role) as Role));
    }
}