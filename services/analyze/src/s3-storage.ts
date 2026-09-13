const mockS3Store = new Map<string, string>();

const DEFAULT_REGION = process.env.APP_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'scope-creep-ledger-conversations-dev';

function isMockMode(): boolean {
  return process.env.MOCK_S3 === 'true' || !process.env.AWS_ACCESS_KEY_ID;
}

/**
 * Saves raw uploaded conversation text file (.txt/.csv) to Amazon S3 bucket
 */
export async function saveRawConversationToS3(
  projectId: string,
  rawText: string
): Promise<string> {
  const s3Key = `projects/${projectId}/conversations/raw_export.txt`;

  if (isMockMode()) {
    mockS3Store.set(s3Key, rawText);
    return `s3://${S3_BUCKET_NAME}/${s3Key}`;
  }

  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({ region: DEFAULT_REGION });

    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        Body: rawText,
        ContentType: 'text/plain; charset=utf-8',
      })
    );

    return `s3://${S3_BUCKET_NAME}/${s3Key}`;
  } catch (err: any) {
    console.warn(`[S3 Warning] Failed to upload to S3 (${err.message}). Using local store fallback.`);
    mockS3Store.set(s3Key, rawText);
    return `s3://${S3_BUCKET_NAME}/${s3Key}`;
  }
}

/**
 * Fetches raw uploaded conversation text file from Amazon S3
 */
export async function getRawConversationFromS3(
  projectId: string
): Promise<string | null> {
  const s3Key = `projects/${projectId}/conversations/raw_export.txt`;

  if (isMockMode()) {
    return mockS3Store.get(s3Key) || null;
  }

  try {
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({ region: DEFAULT_REGION });

    const response = await client.send(
      new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
      })
    );

    if (response.Body) {
      return await response.Body.transformToString('utf-8');
    }
    return mockS3Store.get(s3Key) || null;
  } catch (err: any) {
    console.warn(`[S3 Warning] Failed to fetch from S3 (${err.message}). Using local store fallback.`);
    return mockS3Store.get(s3Key) || null;
  }
}
