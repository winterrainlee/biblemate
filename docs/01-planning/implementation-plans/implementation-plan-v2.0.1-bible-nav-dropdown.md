# implementation-plan-v2.0.1-bible-nav-dropdown.md

## Goal
- Show Bible book/chapter selectors in BibleViewer even when notes are empty.
- Ensure the books list from `/api/bible/books` is passed to the navigation UI.

## Scope
- Update `client/src/pages/ReadingDashboard.jsx` to pass navigation props to `BibleViewer`.
- No API, DB, or schema changes.

## Plan
1. Pass `books`, `currentBook`, `currentChapter`, `currentVersion` to `BibleViewer`.
2. Pass `onBookChange`, `onChapterChange`, `onVersionChange` handlers to `BibleViewer`.
3. Quick UI sanity check on Bible tab: selectors visible, options populated, chapter change updates content.

## Files
- client/src/pages/ReadingDashboard.jsx
- client/src/components/BibleViewer.jsx (usage only; no change expected)

## Validation
- Open Bible tab and confirm book/chapter dropdowns are visible.
- Confirm 66 books are listed and selecting a book/chapter updates the verses.
- Confirm missing notes do not affect dropdown visibility.

## Risks
- If `/api/bible/books` is failing (auth or server down), the dropdown will still be empty.
