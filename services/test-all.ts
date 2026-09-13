import { execSync } from 'child_process';

const testFiles = [
  'services/analyze/src/parser.test.ts',
  'services/analyze/src/classifier.test.ts',
  'services/analyze/src/handler.test.ts',
  'services/ledger/src/ledger-service.test.ts',
  'services/change-order/src/change-order-service.test.ts',
  'services/analyze/src/s3-storage.test.ts',
];

console.log('====================================================');
console.log('   SCOPE CREEP LEDGER — MASTER BACKEND TEST SUITE   ');
console.log('====================================================\n');

let passedCount = 0;

for (const file of testFiles) {
  console.log(`\n▶ Running test: ${file}`);
  try {
    const output = execSync(`npx tsx ${file}`, { encoding: 'utf-8' });
    console.log(output.trim());
    passedCount++;
  } catch (err: any) {
    console.error(`❌ FAILED: ${file}`);
    console.error(err.stdout || err.message);
    process.exit(1);
  }
}

console.log('\n====================================================');
console.log(`   🎉 ALL ${passedCount}/${testFiles.length} BACKEND TEST SUITES PASSED CLEANLY!  `);
console.log('====================================================\n');
