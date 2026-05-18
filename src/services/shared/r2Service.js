import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

export class R2Service {
  constructor() {
    this._client = null;
  }

  get bucket() {
    return process.env.R2_BUCKET;
  }

  get client() {
    if (!this._client) {
      this._client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });
    }
    return this._client;
  }

  async putObject(key, body, contentType) {
    try {
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }));
    } catch (error) {
      console.error(`[R2Service] putObject error key=${key}:`, error.message);
      throw error;
    }
  }

  async deleteObject(key) {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch (error) {
      console.warn(`[R2Service] deleteObject failed key=${key}:`, error.message);
      return false;
    }
  }

  async headObject(key) {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}

export const r2Service = new R2Service();
