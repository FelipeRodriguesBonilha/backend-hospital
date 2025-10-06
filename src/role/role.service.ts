import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { Role } from './enum/role.enum';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) { }

  async findAll(userId: string) {
    const requesterUser = await this.userService.findByIdWithoutAccessControl(userId);

    const userRole = requesterUser.role.name as Role;

    const permission: Record<Role, Role[]> = {
      [Role.AdministradorGeral]: [Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico],
      [Role.AdministradorHospital]: [Role.AdministradorHospital, Role.Recepcionista, Role.Medico],
      [Role.Recepcionista]: [Role.Recepcionista, Role.Medico],
      [Role.Medico]: [Role.Recepcionista, Role.Medico],
    };

    const permittedRoles = permission[userRole] || [];

    return this.prisma.role.findMany({
      where: { name: { in: permittedRoles } },
    });
  }

  async findById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    return role;
  }
}
