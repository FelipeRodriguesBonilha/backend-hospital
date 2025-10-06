// src/archive/multer-config.ts
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { generateStoredFilename, UPLOAD_FILES_DIR } from 'src/utils/file-naming.util';
import { ALLOWED_FILE_MIME_TYPES, AllowedFileMimeType } from 'src/utils/file-types.constants';

const multerConfig = {
    storage: diskStorage({
        destination: UPLOAD_FILES_DIR,
        filename: (_: any, file: Express.Multer.File, cb: any) => {
            cb(null, generateStoredFilename(file.originalname));
        },
    }),
    fileFilter: (_: any, file: Express.Multer.File, cb: any) => {
        if (ALLOWED_FILE_MIME_TYPES.includes(file.mimetype as AllowedFileMimeType)) {
            cb(null, true);
        } else {
            cb(
                new BadRequestException(
                    `Tipo de arquivo não permitido: ${file.mimetype}. Apenas imagens (JPEG, PNG, GIF, WEBP, BMP, SVG) e PDFs são aceitos.`
                ),
                false
            );
        }
    },
};

export default multerConfig;