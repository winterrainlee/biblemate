// Verify OSIS mapping - check 66 books and 1189 chapters
const mapping = require('../server/data/osis-mapping.json');

const books = Object.keys(mapping);
const totalChapters = Object.values(mapping).reduce((sum, book) => sum + book.chapters, 0);

console.log('=== OSIS Mapping Verification ===');
console.log('Total books:', books.length);
console.log('Total chapters:', totalChapters);
console.log('Expected: 66 books, 1189 chapters');
console.log('');
console.log('Books match:', books.length === 66 ? '✅ PASS' : '❌ FAIL');
console.log('Chapters match:', totalChapters === 1189 ? '✅ PASS' : '❌ FAIL');
