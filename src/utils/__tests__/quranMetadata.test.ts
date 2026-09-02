import { HIZB_LIST, SURAHS_LIST } from '../../data/quranMetadata';

export function runQuranMetadataTests(): { passed: boolean; details: string[] } {
  const results: string[] = [];
  let allPassed = true;

  // Test 1: Exactly 60 Hizbs exist
  if (HIZB_LIST.length === 60) {
    results.push('✓ Test 1 Passed: Exactly 60 Hizbs defined');
  } else {
    results.push(`✗ Test 1 Failed: Expected 60 Hizbs, got ${HIZB_LIST.length}`);
    allPassed = false;
  }

  // Test 2: Exactly 114 Surahs exist
  if (SURAHS_LIST.length === 114) {
    results.push('✓ Test 2 Passed: Exactly 114 Surahs defined');
  } else {
    results.push(`✗ Test 2 Failed: Expected 114 Surahs, got ${SURAHS_LIST.length}`);
    allPassed = false;
  }

  // Test 3: Daily Target Hizbs 1 to 5 exist
  const firstFive = HIZB_LIST.filter(h => h.hizbNumber >= 1 && h.hizbNumber <= 5);
  if (firstFive.length === 5) {
    results.push('✓ Test 3 Passed: Daily target 1 to 5 Hizbs valid');
  } else {
    results.push('✗ Test 3 Failed: Missing target Hizbs');
    allPassed = false;
  }

  return { passed: allPassed, details: results };
}
