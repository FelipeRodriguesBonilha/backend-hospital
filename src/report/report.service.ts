import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/role/enum/role.enum';

@Injectable()
export class ReportService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
    ) { }

    async getChatReport(
        userId: string,
        startDate?: Date,
        endDate?: Date,
        page = 1,
        limit = 10,
    ) {
        const requesterUser = await this.userService.findByIdWithoutAccessControl(userId);
        const hospital = await this.prisma.hospital.findUnique({
            where: { id: requesterUser.hospitalId },
        });

        if (!hospital) throw new NotFoundException('Hospital não encontrado!');

        const userRole = requesterUser.role.name as Role;

        if (userRole !== Role.AdministradorHospital) {
            throw new ForbiddenException('Você não tem permissão para acessar relatórios!');
        }

        const skip = (page - 1) * limit;

        const allMessages = await this.prisma.message.groupBy({
            by: ['senderId'],
            where: {
                room: { hospitalId: hospital.id },
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });

        const pagedMessages = allMessages.slice(skip, skip + limit);

        const report = await Promise.all(
            pagedMessages.map(async m => {
                const user = await this.userService.findByIdWithoutAccessControl(m.senderId);
                const hospital = await this.prisma.hospital.findUnique({ where: { id: user.hospitalId } })

                return {
                    userId: m.senderId,
                    userName: user.name,
                    hospitalName: hospital.companyName,
                    messagesCount: m._count.id,
                };
            }),
        );

        return {
            data: report,
            total: allMessages.length,
            page,
            limit,
            totalPages: Math.ceil(allMessages.length / limit),
        };
    }

    async getExamsReport(
        userId: string,
        startDate?: Date,
        endDate?: Date,
        page = 1,
        limit = 10,
    ) {
        const requesterUser = await this.userService.findByIdWithoutAccessControl(userId);
        const requesterHospital = await this.prisma.hospital.findUnique({
            where: { id: requesterUser.hospitalId },
        });

        if (!requesterHospital) throw new NotFoundException('Hospital não encontrado!');

        const userRole = requesterUser.role.name as Role;

        if (userRole !== Role.AdministradorHospital) {
            throw new ForbiddenException('Você não tem permissão para acessar relatórios!');
        }

        const skip = (page - 1) * limit;

        const allExams = await this.prisma.exam.groupBy({
            by: ['providerId'],
            where: {
                hospitalId: requesterHospital.id,
                createdAt: {
                    ...(startDate ? { gte: startDate } : {}),
                    ...(endDate ? { lte: endDate } : {}),
                },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });

        const pagedExams = allExams.slice(skip, skip + limit);

        const report = await Promise.all(
            pagedExams.map(async e => {
                const provider = await this.userService.findByIdWithoutAccessControl(e.providerId);

                const lastExam = await this.prisma.exam.findFirst({
                    where: { providerId: e.providerId, hospitalId: requesterHospital.id },
                    orderBy: { createdAt: 'desc' },
                    include: { patient: true },
                });

                const providerHospital = await this.prisma.hospital.findUnique({
                    where: { id: provider.hospitalId },
                });

                return {
                    providerId: e.providerId,
                    providerName: provider.name,
                    hospitalName: providerHospital?.companyName || 'N/A',
                    totalExams: e._count.id,
                    lastPatientName: lastExam?.patient?.name || null,
                    lastExamDate: lastExam?.createdAt || null,
                };
            }),
        );

        return {
            data: report,
            total: allExams.length,
            page,
            limit,
            totalPages: Math.ceil(allExams.length / limit),
        };
    }
}