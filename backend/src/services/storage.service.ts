import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || 'mediconnect-files';
    this.s3Client = new S3Client({
      endpoint: process.env.AWS_ENDPOINT || 'http://localhost:9000',
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string,
    folder: string = 'uploads',
  ): Promise<string> {
    try {
      const key = `${folder}/${Date.now()}-${filename}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimetype,
      });

      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully: ${key}`);
      return key;
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error('Error getting file URL:', error);
      throw new Error('Failed to get file URL');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  async uploadMedicalDocument(
    file: Buffer,
    filename: string,
    userId: string,
  ): Promise<string> {
    return this.uploadFile(
      file,
      filename,
      'application/pdf',
      `medical-docs/${userId}`,
    );
  }

  async uploadProfileImage(
    file: Buffer,
    filename: string,
    userId: string,
  ): Promise<string> {
    return this.uploadFile(file, filename, 'image/jpeg', `profiles/${userId}`);
  }

  async uploadPrescription(
    file: Buffer,
    filename: string,
    userId: string,
  ): Promise<string> {
    return this.uploadFile(
      file,
      filename,
      'application/pdf',
      `prescriptions/${userId}`,
    );
  }
}
