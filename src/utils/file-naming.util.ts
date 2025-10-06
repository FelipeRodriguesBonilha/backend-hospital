import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export function generateStoredFilename(originalname: string) {
    const name = path.parse(originalname).name.replace(/\s/g, '');
    const ext = path.parse(originalname).ext;
    return `${name}-${uuidv4()}${ext}`;
}

export const UPLOAD_FILES_DIR = path.resolve(process.env.UPLOAD_FILES_DIR);