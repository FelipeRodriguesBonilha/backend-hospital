import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';import { UserId } from 'src/decorators/userId.decorator';
import { Role } from 'src/role/enum/role.enum';
import { ReportService } from './report.service';

@Roles(Role.AdministradorHospital)
@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Get('chat')
    async chatReport(
        @UserId() userId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ) {
        return this.reportService.getChatReport(
            userId,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
            parseInt(page, 10),
            parseInt(limit, 10),
        );
    }

    @Get('exams')
    async examsReport(
        @UserId() userId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ) {
        return this.reportService.getExamsReport(
            userId,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
            parseInt(page, 10),
            parseInt(limit, 10),
        );
    }
}