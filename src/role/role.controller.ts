import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/role/enum/role.enum';
import { ReturnRoleDto } from './__dtos__/return-role';
import { RoleService } from './role.service';
import { UserId } from 'src/decorators/userId.decorator';

@Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Get()
  async findAll(@UserId() userId: string): Promise<ReturnRoleDto[]> {
    return (await this.roleService.findAll(userId)).map((role) => new ReturnRoleDto(role));
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ReturnRoleDto> {
    return new ReturnRoleDto(await this.roleService.findById(id));
  }
}
