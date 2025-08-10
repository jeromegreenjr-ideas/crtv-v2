import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const STORAGE_BUCKET = process.env.STORAGE_BUCKET as string | undefined;
const STORAGE_REGION = process.env.STORAGE_REGION as string | undefined;
const STORAGE_KEY = process.env.STORAGE_KEY as string | undefined;
const STORAGE_SECRET = process.env.STORAGE_SECRET as string | undefined;
const PUBLIC_CDN_BASE = process.env.PUBLIC_CDN_BASE as string | undefined; // e.g., https://cdn.example.com

export function isStorageConfigured(): boolean {
  return Boolean(STORAGE_BUCKET && STORAGE_REGION && STORAGE_KEY && STORAGE_SECRET);
}

function getClient() {
  if (!isStorageConfigured()) throw new Error('Storage is not configured');
  return new S3Client({
    region: STORAGE_REGION!,
    credentials: {
      accessKeyId: STORAGE_KEY!,
      secretAccessKey: STORAGE_SECRET!,
    },
  });
}

export async function createUploadUrl(params: {
  key: string; // path/filename.ext
  contentType: string;
  expiresSeconds?: number;
}): Promise<{ uploadUrl: string; publicUrl?: string; key: string }>
{
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: STORAGE_BUCKET!,
    Key: params.key,
    ContentType: params.contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: params.expiresSeconds ?? 900 });
  const publicUrl = PUBLIC_CDN_BASE ? `${PUBLIC_CDN_BASE.replace(/\/$/, '')}/${params.key}` : undefined;
  return { uploadUrl, publicUrl, key: params.key };
}


