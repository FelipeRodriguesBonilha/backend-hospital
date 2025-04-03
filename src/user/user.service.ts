import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './__dtos__/create-user.dto';
import { UpdateUserDto } from './__dtos__/update-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const createdUser = await this.prisma.user.create({
            data: createUserDto,
        });

        return createdUser;
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany();

        return users;
    }

    async findById(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { role: true }
        });

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const updatedRoom = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });

        return updatedRoom;
    }

    async remove(id: string): Promise<User> {
        const deletedUser = await this.prisma.user.delete({
            where: { id },
        });

        return deletedUser;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async getRolesByUserId(userId: string): Promise<string[]> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true }
        });

        if (!user || !user.role) {
            return [];
        }

        return [user.role.name];
    }

}
