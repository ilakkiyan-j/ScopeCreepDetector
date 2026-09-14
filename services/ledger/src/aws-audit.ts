import * as fs from 'fs';
import * as path from 'path';

// Read .env using built-in fs module (no external dotenv package required)
const envFile = path.join(__dirname, '../../../.env');
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  });
}

import { listProjects, saveProject, getProject } from './ledger-service';

async function runAwsAudit() {
  console.log('====================================================');
  console.log('   AWS RESOURCES & BEDROCK AI CONNECTIVITY AUDIT   ');
  console.log('====================================================\n');

  const region = process.env.APP_AWS_REGION || process.env.AWS_REGION || 'ap-southeast-2';
  const accessKeyId =
    process.env.APP_AWS_ACCESS_KEY_ID || process.env.APP_AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  console.log('Environment configuration:');
  console.log('  Region:', region);
  console.log('  Access Key ID:', accessKeyId ? `${accessKeyId.substring(0, 8)}...` : '❌ MISSING');
  console.log('  Secret Key:', secretAccessKey ? 'PRESENT' : '❌ MISSING');
  console.log('  MOCK_DYNAMODB:', process.env.MOCK_DYNAMODB);
  console.log('  MOCK_BEDROCK:', process.env.MOCK_BEDROCK);

  console.log('\n--- 1. Testing DynamoDB Project Retrieval ---');
  try {
    const projects = await listProjects();
    console.log(`✅ listProjects() returned ${projects.length} project(s):`);
    projects.forEach((p) => console.log(`   - [${p.id}] "${p.name}" (Client: ${p.clientName}, Owner: ${p.userId})`));
  } catch (err: any) {
    console.error('❌ DynamoDB Scan Error:', err.message);
  }

  console.log('\n--- 2. Testing Bedrock Claude 3 Haiku AI Classifier ---');
  try {
    const { classifyMessages } = await import('../../analyze/src/classifier');
    const results = await classifyMessages(
      [
        { id: 'm1', timestamp: '10:00', sender: 'Client', content: 'Can we add a login page for users?' },
      ],
      'Homepage redesign only.',
      { mockMode: false }
    );
    console.log('✅ Bedrock Claude 3 Haiku Classification Result:');
    console.log(JSON.stringify(results, null, 2));
  } catch (err: any) {
    console.error('❌ Bedrock AI Error:', err.message);
  }
}

runAwsAudit().catch((err) => console.error('Audit script failed:', err));
