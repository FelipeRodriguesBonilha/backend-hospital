export const ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
] as const;

export const ALLOWED_PDF_MIME_TYPE = 'application/pdf' as const;

export const ALLOWED_FILE_MIME_TYPES = [
    ...ALLOWED_IMAGE_MIME_TYPES,
    ALLOWED_PDF_MIME_TYPE,
] as const;

export type AllowedFileMimeType = typeof ALLOWED_FILE_MIME_TYPES[number];
