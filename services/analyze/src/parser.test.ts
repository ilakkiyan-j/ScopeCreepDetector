import { parseConversation } from './parser';
import * as fs from 'fs';
import * as path from 'path';

function runTest() {
  console.log('--- Testing Conversation Parser ---');

  const samplePath = path.join(__dirname, '../../../sample-data/conversations/sample-whatsapp-redesign.txt');
  const sampleContent = fs.readFileSync(samplePath, 'utf-8');

  const messages = parseConversation(sampleContent);

  console.log(`Parsed ${messages.length} messages successfully.`);

  if (messages.length === 0) {
    console.error('FAILED: No messages parsed!');
    process.exit(1);
  }

  // Check first message
  console.log('First Message:', messages[0]);
  if (messages[0].id !== 'msg_001' || messages[0].sender !== 'Client') {
    console.error('FAILED: First message verification failed!');
    process.exit(1);
  }

  // Check multiline / format consistency
  const loginMsg = messages.find((m) => m.content.includes('login page'));
  console.log('Login Page Request Message:', loginMsg);

  if (!loginMsg || loginMsg.sender !== 'Client') {
    console.error('FAILED: Login message verification failed!');
    process.exit(1);
  }

  console.log('✅ ALL PARSER TESTS PASSED!');
}

runTest();
