import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService
  ) { }

  async findAll(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany();

    return roles;
  }

  async findById(id: string): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    return role;
  }
}
