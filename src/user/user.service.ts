import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HospitalService } from 'src/hospital/hospital.service';
import { PrismaService } from 'src/prisma.service';
import { Role } from 'src/role/enum/role.enum';
import { RoleService } from 'src/role/role.service';
import { RoomUserService } from 'src/room-user/room-user.service';
import { RoomService } from 'src/room/room.service';
import { createPasswordHashed } from 'src/utils/password';
import { CreateUserDto } from './__dtos__/create-user.dto';
import { UpdateUserDto } from './__dtos__/update-user.dto';
import { UpdateProfileDto } from './__dtos__/update-profile.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly hospitalService: HospitalService,
        private readonly roomUserService: RoomUserService,

        @Inject(forwardRef(() => RoleService))
        private readonly roleService: RoleService,

        @Inject(forwardRef(() => RoomService))
        private readonly roomService: RoomService,
    ) { }

    async create(createUserDto: CreateUserDto, userId: string) {
        const [requesterUser, emailExists, roleToUser] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    role: true,
                },
            }),
            this.findByEmail(createUserDto.email),
            this.roleService.findById(createUserDto.roleId),
        ]);

        const isAdminGeral = requesterUser.role?.name === Role.AdministradorGeral;
        const isAdminHospital = requesterUser.role?.name === Role.AdministradorHospital;

        if (emailExists) throw new BadRequestException('E-mail já cadastrado!');
        if (!roleToUser) throw new BadRequestException('Papel de usuário inválido!');

        if (isAdminHospital) {
            if (requesterUser.hospitalId !== createUserDto.hospitalId) throw new ForbiddenException('AdministradorHospital só pode criar usuários para o próprio hospital!');
            if (roleToUser.name === Role.AdministradorGeral) throw new ForbiddenException('AdministradorHospital não pode criar AdministradorGeral!');
        } else if (!isAdminGeral) throw new ForbiddenException('Somente AdministradorGeral e AdministradorHospital podem criar usuários!');

        if (isAdminGeral && roleToUser.name === Role.AdministradorGeral && createUserDto.hospitalId) throw new BadRequestException('Usuários com papel AdministradorGeral não devem ter hospitalId associado!');

        const passwordHashed = await createPasswordHashed(createUserDto.password);

        return await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: passwordHashed,
            },
            include: {
                hospital: true,
                role: true,
            },
        });
    }

    async findAll(userId: string, name?: string, page = 1, limit = 10) {
        const requesterUser = await this.findByIdWithoutAccessControl(userId);
        const isAdminGeral = requesterUser.role.name === Role.AdministradorGeral;

        if (!isAdminGeral) throw new ForbiddenException('Você não tem permissão para acessar todos os usuários!');

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive',
                    },
                },
                include: {
                    hospital: true,
                    role: true,
                },
                skip,
                take: limit,
            }),
            this.prisma.user.count({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive',
                    },
                },
            }),
        ]);

        return {
            data: users,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByHospital(
        hospitalId: string,
        userId: string,
        name?: string,
        roles?: string[],
        page = 1,
        limit = 10
    ) {
        const [requesterUser, hospital] = await Promise.all([
            this.findByIdWithoutAccessControl(userId),
            this.hospitalService.findById(hospitalId),
        ]);

        if (!hospital) throw new NotFoundException('Hospital não encontrado!');

        const userRole = requesterUser.role.name as Role;

        const permission: Record<Role, Role[]> = {
            [Role.AdministradorGeral]: [Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico],
            [Role.AdministradorHospital]: [Role.AdministradorHospital, Role.Recepcionista, Role.Medico],
            [Role.Recepcionista]: [Role.Recepcionista, Role.Medico],
            [Role.Medico]: [Role.Recepcionista, Role.Medico],
        };

        const permittedRoles = permission[userRole];
        const rolesArray = roles ? (Array.isArray(roles) ? roles : [roles]) : [];
        const rolesToFilter = rolesArray.length > 0 ? rolesArray : permittedRoles;
        const invalidRoles = rolesToFilter.filter((r) => !permittedRoles.includes(r as Role));

        if (invalidRoles.length > 0)
            throw new ForbiddenException(`Você não tem permissão para buscar os papéis: ${invalidRoles.join(', ')}`);

        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) &&
            requesterUser.hospitalId !== hospitalId) {
            throw new ForbiddenException('Este tipo de usuário só pode acessar usuários do seu hospital!');
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    hospitalId,
                    name: { contains: name, mode: 'insensitive' },
                    role: { name: { in: rolesToFilter } },
                },
                include: { hospital: true, role: true },
                skip,
                take: limit,
            }),
            this.prisma.user.count({
                where: {
                    hospitalId,
                    name: { contains: name, mode: 'insensitive' },
                    role: { name: { in: rolesToFilter } },
                },
            }),
        ]);

        return {
            data: users,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(id: string, userId: string) {
        const [targetUser, requesterUser] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id },
                include: {
                    role: true,
                    hospital: true,
                },
            }),

            this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    role: true,
                    hospital: true,
                },
            }),
        ]);

        if (!targetUser) throw new NotFoundException('Usuário alvo não encontrado!');
        if (!requesterUser) throw new NotFoundException('Usuário solicitante não encontrado!');

        if (requesterUser.role.name === Role.AdministradorGeral) {
            return targetUser;
        }

        if (requesterUser.role.name === Role.AdministradorHospital) {
            if (requesterUser.hospitalId !== targetUser.hospitalId) throw new ForbiddenException('Você só pode acessar usuários do seu hospital!');

            return targetUser;
        }

        if (requesterUser.id !== id) throw new ForbiddenException('Você só pode acessar seu próprio usuário!');

        return targetUser;
    }

    async update(id: string, updateUserDto: UpdateUserDto, userId: string) {
        const [targetUser, requesterUser, emailExists, roleToUpdate] = await Promise.all([
            this.findByIdWithoutAccessControl(id),
            this.findByIdWithoutAccessControl(userId),
            this.findByEmail(updateUserDto.email),
            this.roleService.findById(updateUserDto.roleId),
        ]);

        if (!targetUser) throw new NotFoundException('Usuário alvo não encontrado!');
        if (!requesterUser) throw new NotFoundException('Usuário solicitante não encontrado!');
        if (!roleToUpdate) throw new BadRequestException('Papel informado é inválido!');
        if (emailExists && emailExists.id !== id) throw new BadRequestException('E-mail já cadastrado!');

        const userRole = requesterUser.role.name as Role;

        const userToUpdateRole = roleToUpdate.name as Role;

        if (![Role.AdministradorGeral, Role.AdministradorHospital].includes(userRole)) throw new ForbiddenException('Você não tem permissão para atualizar este usuário!');

        if ([Role.AdministradorHospital].includes(userRole)) {
            if (requesterUser.hospitalId !== targetUser.hospitalId) throw new ForbiddenException('Você só pode atualizar usuários do seu hospital!');

            if (targetUser.role.name === Role.AdministradorGeral) throw new ForbiddenException('AdministradorHospital não pode atualizar AdministradorGeral!');

            if (
                ![
                    Role.AdministradorHospital,
                    Role.Medico,
                    Role.Recepcionista
                ].includes(userToUpdateRole)
            ) throw new ForbiddenException('AdministradorHospital só pode atualizar para os papéis AdministradorHospital, Médico e Recepcionista!');

            if (updateUserDto.hospitalId) {
                throw new ForbiddenException('Você não pode alterar o hospital do usuário!');
            }
        } else if (![Role.AdministradorGeral].includes(userRole)) throw new ForbiddenException('Somente AdministradorGeral e AdministradorHospital podem atualizar usuários!');

        if ([Role.AdministradorGeral].includes(userRole) && roleToUpdate.name === Role.AdministradorGeral && updateUserDto.hospitalId) throw new BadRequestException('Usuários com papel AdministradorGeral não devem ter hospitalId associado!');

        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            include: {
                hospital: true,
                role: true,
            },
        });
    }

    async updateProfile(updateProfileDto: UpdateProfileDto, userId: string) {
        const emailExists = await this.findByEmail(updateProfileDto.email);

        if (emailExists && emailExists.id !== userId) {
            throw new BadRequestException('E-mail já cadastrado!');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: updateProfileDto,
            include: { hospital: true, role: true },
        });
    }

    async remove(id: string, userId: string) {
        const [targetUser, requesterUser] = await Promise.all([
            this.findByIdWithoutAccessControl(id),
            this.findByIdWithoutAccessControl(userId),
        ]);

        const isAdminGeral = requesterUser.role.name === Role.AdministradorGeral;
        const isAdminHospital = requesterUser.role.name === Role.AdministradorHospital;

        if (!targetUser) throw new NotFoundException('Usuário alvo não encontrado!');
        if (!requesterUser) throw new NotFoundException('Usuário solicitante não encontrado!');
        if (!isAdminGeral && !isAdminHospital) throw new ForbiddenException('Você não tem permissão para remover este usuário!');

        if (isAdminHospital) {
            if (requesterUser.hospitalId !== targetUser.hospitalId) throw new ForbiddenException('Você só pode remover usuários do seu hospital!');
            if (targetUser.role.name === Role.AdministradorGeral) throw new ForbiddenException('AdministradorHospital não pode remover AdministradorGeral!');
        }

        return this.prisma.user.delete({
            where: { id },
            include: {
                hospital: true,
                role: true,
            },
        });
    }

    async findAllUsersInRoom(roomId: string, userId: string) {
        const [requesterUser, room] = await Promise.all([
            this.findByIdWithoutAccessControl(userId),
            this.roomService.findById(roomId, userId),
        ]);

        if (requesterUser.hospitalId !== room.hospitalId) throw new ForbiddenException('Você não pertence ao hospital desta sala!');

        return this.roomUserService.findAllUsersInRoom(roomId);
    }

    async userAlreadyInRoom(roomId: string, userId: string) {
        const [requesterUser, room] = await Promise.all([
            this.findByIdWithoutAccessControl(userId),
            this.roomService.findById(roomId, userId),
        ]);

        if (requesterUser.hospitalId !== room.hospitalId) throw new ForbiddenException('Você não pertence ao hospital desta sala!');

        return this.roomUserService.userAlreadyInRoom(roomId, userId);
    }

    async findUsersNotInRoom(roomId: string, hospitalId: string, userId: string, ) {
        await Promise.all([
            this.findByIdWithoutAccessControl(userId),
            this.roomService.findById(roomId, userId),
        ]);

        return this.roomUserService.findUsersNotInRoom(roomId, hospitalId);
    }

    async findByIdWithoutAccessControl(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                hospital: true
            },
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado!');
        }

        return user;
    }

    async findByEmail(email: string) {
        return await this.prisma.user.findUnique({
            where: { email },
            include: {
                hospital: true,
                role: true
            }
        });
    }

    async findByHospitalAdminsRooms(hospitalId: string) {
        return this.prisma.user.findMany({
            where: {
                hospitalId,
                adminRooms: {
                    some: {
                        hospitalId,
                    },
                },
            },
            include: {
                hospital: true,
                adminRooms: true,
                role: true,
            },
        });
    }

    async updatePassword(id: string, newPasswordHashed: string) {
        return await this.prisma.user.update({
            where: { id: id },
            data: {
                password: newPasswordHashed,
                passwordResetTokenVersion: { increment: 1 },
            },
            include: {
                hospital: true,
                role: true,
            },
        });
    }

    async getRoleByUserId(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: id },
            include: {
                hospital: true,
                role: true
            }
        });

        return user.role.name;
    }
}
