export class ExamsReportDto {
    providerId: string;
    providerName: string;
    hospitalName: string;
    totalExams: number;
    lastPatientName: string | null;
    lastExamDate: Date | null;
}
