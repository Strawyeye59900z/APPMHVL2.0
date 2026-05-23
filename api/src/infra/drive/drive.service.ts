import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class DriveService {
  private readonly logger = new Logger(DriveService.name);
  private drive: drive_v3.Drive;

  constructor(private config: ConfigService) {
    const credentials = JSON.parse(config.get('GOOGLE_SA_JSON', '{}'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    this.drive = google.drive({ version: 'v3', auth });
  }

  async getOrCreateFolder(name: string, parentId?: string): Promise<string> {
    const query = parentId
      ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
      : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const res = await this.drive.files.list({ q: query, fields: 'files(id)' });
    if (res.data.files?.length) return res.data.files[0].id!;

    const folder = await this.drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : [],
      },
      fields: 'id',
    });
    return folder.data.id!;
  }

  async uploadPhoto(
    buffer: Buffer,
    fileName: string,
    apartmentNumber: string,
  ): Promise<{ id: string; webViewLink: string }> {
    const rootFolderId = this.config.get('GOOGLE_DRIVE_ROOT_FOLDER_ID', '');
    const aptFolderId = await this.getOrCreateFolder(apartmentNumber, rootFolderId || undefined);

    const stream = Readable.from(buffer);
    const res = await this.drive.files.create({
      requestBody: {
        name: fileName,
        parents: [aptFolderId],
      },
      media: { mimeType: 'image/jpeg', body: stream },
      fields: 'id, webViewLink',
    });

    await this.drive.permissions.create({
      fileId: res.data.id!,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return { id: res.data.id!, webViewLink: res.data.webViewLink! };
  }

  async getFileStream(fileId: string) {
    const res = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' },
    );
    const meta = await this.drive.files.get({ fileId, fields: 'name' });
    return { stream: res.data, name: meta.data.name ?? 'photo.jpg' };
  }
}
