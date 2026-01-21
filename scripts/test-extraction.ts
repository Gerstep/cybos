#!/usr/bin/env bun
/**
 * Test script for Granola extraction
 * Runs extraction against sample test data
 */

import { extractGranolaCalls } from './extract-granola';
import { existsSync, rmSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const TEST_CACHE_PATH = './docs/Granola-parsing-feature/test-data/sample-cache.json';
const TEST_OUTPUT_PATH = './test-output/calls';

function getExpectedNames(cachePath: string): { creator?: string; attendee?: string } {
  try {
    const outer = JSON.parse(readFileSync(cachePath, 'utf-8'));
    const inner = JSON.parse(outer.cache || '{}');
    const documents = inner?.state?.documents || {};
    const firstDoc = documents['test-id-1'] || Object.values(documents)[0];
    if (!firstDoc) return {};

    const creator = firstDoc?.people?.creator?.name;
    const attendees = firstDoc?.people?.attendees || [];
    const attendee =
      attendees[0]?.details?.person?.name?.fullName || attendees[0]?.name;

    return { creator, attendee };
  } catch {
    return {};
  }
}

console.log('🧪 Running Granola Extraction Tests\n');

// Clean up previous test output
if (existsSync(TEST_OUTPUT_PATH)) {
  console.log('🧹 Cleaning up previous test output...');
  rmSync(TEST_OUTPUT_PATH, { recursive: true, force: true });
}

// Run extraction
console.log('📊 Running extraction against test data...\n');

const result = await extractGranolaCalls({
  cachePath: TEST_CACHE_PATH,
  outputPath: TEST_OUTPUT_PATH
});

console.log('\n📈 Test Results:');
console.log(`✓ New calls extracted: ${result.newCalls}`);
console.log(`✓ Errors: ${result.errors.length}`);
console.log(`✓ Total calls: ${result.totalCalls}`);

if (result.errors.length > 0) {
  console.log('\n❌ Errors encountered:');
  result.errors.forEach(err => console.log(`  - ${err}`));
}

// Verify output structure
console.log('\n🔍 Verifying output structure...\n');

const checks = [
  { path: TEST_OUTPUT_PATH, name: 'Output directory' },
  { path: join(TEST_OUTPUT_PATH, 'INDEX.md'), name: 'INDEX.md' },
  { path: join(TEST_OUTPUT_PATH, '2025-01-15_acme-corp-seed-round-discussion'), name: 'First call folder' },
  { path: join(TEST_OUTPUT_PATH, '2025-01-15_acme-corp-seed-round-discussion/metadata.json'), name: 'metadata.json' },
  { path: join(TEST_OUTPUT_PATH, '2025-01-15_acme-corp-seed-round-discussion/transcript.txt'), name: 'transcript.txt' },
  { path: join(TEST_OUTPUT_PATH, '2025-01-15_acme-corp-seed-round-discussion/notes.md'), name: 'notes.md' },
  { path: join(TEST_OUTPUT_PATH, '2025-01-14_weekly-team-sync'), name: 'Second call folder' }
];

let allChecksPass = true;

for (const check of checks) {
  const exists = existsSync(check.path);
  const status = exists ? '✓' : '✗';
  console.log(`${status} ${check.name}`);
  if (!exists) allChecksPass = false;
}

// Verify INDEX.md content
console.log('\n📋 INDEX.md content:');
if (existsSync(join(TEST_OUTPUT_PATH, 'INDEX.md'))) {
  const indexContent = readFileSync(join(TEST_OUTPUT_PATH, 'INDEX.md'), 'utf-8');
  console.log(indexContent);

  // Check for expected content
  const hasAcmeCorp = indexContent.includes('Acme Corp');
  const hasWeeklySync = indexContent.includes('Weekly Team Sync');
  const hasJohnSmith = indexContent.includes('John Smith');

  console.log('\n✓ Content checks:');
  console.log(`  ${hasAcmeCorp ? '✓' : '✗'} Contains "Acme Corp"`);
  console.log(`  ${hasWeeklySync ? '✓' : '✗'} Contains "Weekly Team Sync"`);
  console.log(`  ${hasJohnSmith ? '✓' : '✗'} Contains "John Smith"`);

  if (!hasAcmeCorp || !hasWeeklySync || !hasJohnSmith) {
    allChecksPass = false;
  }
}

// Verify transcript parsing
console.log('\n💬 Sample transcript content:');
const transcriptPath = join(TEST_OUTPUT_PATH, '2025-01-15_acme-corp-seed-round-discussion/transcript.txt');
if (existsSync(transcriptPath)) {
  const transcript = readFileSync(transcriptPath, 'utf-8');
  const lines = transcript.split('\n').slice(0, 4); // First 4 lines
  lines.forEach(line => console.log(`  ${line}`));

  // Check speaker names were inferred
  const { creator, attendee } = getExpectedNames(TEST_CACHE_PATH);
  const creatorName = creator || 'Creator';
  const attendeeName = attendee || 'Attendee';
  const hasCreator = transcript.includes(`[${creatorName}]`);
  const hasAttendee = transcript.includes(`[${attendeeName}]`);

  console.log('\n✓ Speaker inference:');
  console.log(`  ${hasCreator ? '✓' : '✗'} Creator name: ${creatorName}`);
  console.log(`  ${hasAttendee ? '✓' : '✗'} Attendee name: ${attendeeName}`);

  if (!hasCreator || !hasAttendee) {
    allChecksPass = false;
  }
}

// Verify notes parsing
console.log('\n📝 Sample notes content:');
const notesPath = join(TEST_OUTPUT_PATH, '2025-01-15_acme-corp-seed-round-discussion/notes.md');
if (existsSync(notesPath)) {
  const notes = readFileSync(notesPath, 'utf-8');
  const lines = notes.split('\n').slice(0, 10); // First 10 lines
  lines.forEach(line => console.log(`  ${line}`));

  // Check TipTap parsing worked
  const hasHeading = notes.includes('# Key Discussion Points');
  const hasBullet = notes.includes('- Raising $5M');
  const hasAISection = notes.includes('# AI-Enhanced Notes');

  console.log('\n✓ TipTap parsing:');
  console.log(`  ${hasHeading ? '✓' : '✗'} Heading parsed`);
  console.log(`  ${hasBullet ? '✓' : '✗'} Bullet list parsed`);
  console.log(`  ${hasAISection ? '✓' : '✗'} AI notes included`);

  if (!hasHeading || !hasBullet || !hasAISection) {
    allChecksPass = false;
  }
}

// Test incremental behavior
console.log('\n🔁 Testing incremental extraction...');
const secondRun = await extractGranolaCalls({
  cachePath: TEST_CACHE_PATH,
  outputPath: TEST_OUTPUT_PATH
});

console.log(`✓ Second run extracted: ${secondRun.newCalls} calls (should be 0)`);
if (secondRun.newCalls !== 0) {
  console.log('✗ Incremental extraction failed - re-extracted existing calls');
  allChecksPass = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allChecksPass) {
  console.log('✅ All tests passed!');
  console.log('\nTest output available at: ./test-output/calls/');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}
