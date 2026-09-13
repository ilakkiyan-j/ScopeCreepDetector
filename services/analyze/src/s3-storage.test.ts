import { saveRawConversationToS3, getRawConversationFromS3 } from './s3-storage';
import * as fs from 'fs';
import * as path from 'path';

async function runS3StorageTest() {
  console.log('--- Testing S3 Raw Conversation Storage ---');

  const projectId = 'proj_s3_test_001';
  const samplePath = path.join(__dirname, '../../../sample-data/conversations/sample-whatsapp-redesign.txt');
  const rawText = fs.readFileSync(samplePath, 'utf-8');

  // 1. Upload
  const s3Uri = await saveRawConversationToS3(projectId, rawText);
  console.log(`Uploaded Raw Export to: ${s3Uri}`);

  if (!s3Uri.includes(projectId)) {
    console.error('FAILED: S3 URI does not contain project ID!');
    process.exit(1);
  }

  // 2. Download
  const fetchedText = await getRawConversationFromS3(projectId);
  console.log(`Retrieved ${fetchedText?.length || 0} characters from S3.`);

  if (!fetchedText || fetchedText !== rawText) {
    console.error('FAILED: Retrived text does not match uploaded text!');
    process.exit(1);
  }

  console.log('✅ ALL S3 STORAGE TESTS PASSED SUCCESSFULLY!');
}

runS3StorageTest().catch((err) => {
  console.error('S3 storage test error:', err);
  process.exit(1);
});
