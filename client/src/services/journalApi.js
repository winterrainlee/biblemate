/**
 * Journal API Service
 * V2.0 묵상일지 관련 API 호출
 */

const API_BASE = '/api';

// ============ Verse Notes (구절별 묵상) ============

/**
 * 날짜별 구절 묵상 조회
 * @param {string} date - YYYY-MM-DD 형식
 */
export async function getVerseNotesByDate(date) {
    const response = await fetch(`${API_BASE}/verse-notes?date=${date}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch verse notes');
    return response.json();
}

/**
 * 모든 구절 묵상 조회 (통계용)
 */
export async function getAllVerseNotes() {
    const response = await fetch(`${API_BASE}/verse-notes`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch all verse notes');
    return response.json();
}

/**
 * 구절 묵상 저장 (UPSERT)
 * @param {Object} data - { date, book, chapter, verse, content }
 */
export async function saveVerseNote(data) {
    const response = await fetch(`${API_BASE}/verse-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save verse note');
    return response.json();
}

/**
 * 구절 묵상 삭제
 * @param {number} id - 묵상 ID
 */
export async function deleteVerseNote(id) {
    const response = await fetch(`${API_BASE}/verse-notes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete verse note');
    return response.json();
}

/**
 * 해당 장의 모든 묵상 조회
 */
export async function getVerseNotesByChapter(book, chapter) {
    const response = await fetch(`${API_BASE}/verse-notes/${book}/${chapter}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch chapter verse notes');
    return response.json();
}

/**
 * 묵상이 존재하는 구절 목록 조회
 */
export async function getVerseNoteExists(book, chapter) {
    const response = await fetch(`${API_BASE}/verse-notes/chapter/${book}/${chapter}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch verse note exists');
    return response.json();
}

// ============ Free Notes (자유 묵상) ============

/**
 * 모든 자유 묵상 조회 (통계용)
 */
export async function getAllFreeNotes() {
    const response = await fetch(`${API_BASE}/free-notes`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch all free notes');
    return response.json();
}

/**
 * 날짜별 자유 묵상 조회
 * @param {string} date - YYYY-MM-DD 형식
 */
export async function getFreeNote(date) {
    const response = await fetch(`${API_BASE}/free-notes/${date}`, {
        credentials: 'include'
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch free note');
    return response.json();
}

/**
 * 자유 묵상 저장 (UPSERT)
 * @param {Object} data - { date, content }
 */
export async function saveFreeNote(data) {
    const response = await fetch(`${API_BASE}/free-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save free note');
    return response.json();
}

/**
 * 자유 묵상 삭제
 * @param {string} date - YYYY-MM-DD 형식
 */
export async function deleteFreeNote(date) {
    const response = await fetch(`${API_BASE}/free-notes/${date}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete free note');
    return response.json();
}

// ============ Prayers (오늘의 기도) ============

/**
 * 날짜별 기도 조회
 * @param {string} date - YYYY-MM-DD 형식
 */
export async function getPrayer(date) {
    const response = await fetch(`${API_BASE}/prayers/${date}`, {
        credentials: 'include'
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch prayer');
    return response.json();
}

/**
 * 기도 저장 (UPSERT)
 * @param {Object} data - { date, content }
 */
export async function savePrayer(data) {
    const response = await fetch(`${API_BASE}/prayers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save prayer');
    return response.json();
}

/**
 * 기도 삭제
 * @param {string} date - YYYY-MM-DD 형식
 */
export async function deletePrayer(date) {
    const response = await fetch(`${API_BASE}/prayers/${date}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete prayer');
    return response.json();
}

// ============ Reading Logs (읽기 기록) ============

/**
 * 날짜별 읽기 기록 조회
 * @param {string} date - YYYY-MM-DD 형식
 */
export async function getReadingLogsByDate(date) {
    const response = await fetch(`${API_BASE}/reading-logs?date=${date}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch reading logs');
    return response.json();
}
