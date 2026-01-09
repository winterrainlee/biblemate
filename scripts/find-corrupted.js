/**
 * Find lines with Unicode Replacement Character (U+FFFD)
 * Usage: node scripts/find-corrupted.js [input_file]
 */

import fs from 'fs';
import path from 'path';

const inputFile = process.argv[2];

if (!inputFile) {
    console.error('Usage: node scripts/find-corrupted.js <input_file>');
    process.exit(1);
}

const outputFile = path.join(path.dirname(inputFile), path.basename(inputFile, '.txt') + '-corrupted.txt');

try {
    const content = fs.readFileSync(inputFile, 'utf8');
    const lines = content.split('\n');

    let corruptedCount = 0;
    let extractedLines = [];

    console.log(`🔍 Scanning ${inputFile} for corrupted characters (U+FFFD)...`);

    lines.forEach((line, index) => {
        if (line.includes('\uFFFD')) {
            corruptedCount++;
            console.log(`[Line ${index + 1}] ${line.trim()}`);
            extractedLines.push(`${index + 1}. ${line.trim()}`);
            // Also print substring around corruption for context
            const idx = line.indexOf('\uFFFD');
            const start = Math.max(0, idx - 10);
            const end = Math.min(line.length, idx + 10);
            console.log(`   Context: ...${line.substring(start, end)}...`);
        }
    });

    if (corruptedCount > 0) {
        console.log(`\n❌ Found ${corruptedCount} corrupted lines.`);
        fs.writeFileSync(outputFile, extractedLines.join('\n'), 'utf8');
    } else {
        console.log('\n✅ No corrupted characters found.');
        if (fs.existsSync(outputFile)) {
            fs.writeFileSync(outputFile, '', 'utf8');
        }
    }

} catch (err) {
    console.error(`Error reading ${inputFile}:`, err.message);
}
