import { Archive, Message } from "@prisma/client";
import { ReturnMessageDto } from "src/message/__dtos__/return-message.dto";

export class ReturnArchiveDto {
    name: string;
    type: string;
    url: string;
    messageId?: string;
    message?: ReturnMessageDto;

    constructor(
        archive: Archive &
        {
            message?: Message;
        }
    ) {
        this.name = archive.name;
        this.type = archive.type;
        this.url = archive.url;
        this.messageId = archive.messageId;

        this.message = archive.message ? new ReturnMessageDto(archive.message) : undefined;
    }
}