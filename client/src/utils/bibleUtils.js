
/**
 * Bible related utility functions
 */

/**
 * Generates a string summary of reading logs (e.g., "창세기 1-3장, 5장")
 * @param {Array} readingLogs 
 * @param {Array} books 
 * @returns {Array} Array of strings like ["📖 창세기 1-3장", "📖 마태복음 1장"]
 */
export const getReadingSummary = (readingLogs, books) => {
    if (!readingLogs || readingLogs.length === 0) return [];

    // 1. Group chapters by book
    const bookGroups = readingLogs.reduce((acc, log) => {
        if (!acc[log.book]) acc[log.book] = new Set();
        const from = log.chapter_from || log.chapter;
        const to = log.chapter_to || log.chapter;
        for (let c = from; c <= to; c++) {
            acc[log.book].add(c);
        }
        return acc;
    }, {});

    // 2. Format consecutive chapters into ranges
    return Object.entries(bookGroups).map(([bookId, chaptersSet]) => {
        const bookName = books?.find(b => b.id === bookId)?.name || bookId;
        const chapters = Array.from(chaptersSet).sort((a, b) => a - b);

        const ranges = [];
        if (chapters.length > 0) {
            let start = chapters[0];
            let prev = chapters[0];

            for (let i = 1; i <= chapters.length; i++) {
                const curr = chapters[i];
                if (curr !== prev + 1) {
                    ranges.push(start === prev ? `${start}장` : `${start}-${prev}장`);
                    start = curr;
                }
                prev = curr;
            }
        }

        return `${bookName} ${ranges.join(', ')}`;
    });
};
