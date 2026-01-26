/**
 * Authentication routes for access password protection
 * Only active when ACCESS_PASSWORD environment variable is set
 */

import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Simple session storage (in-memory, resets on server restart)
const sessions = new Map();

/**
 * Calculate milliseconds remaining until the next midnight
 */
function getMsUntilMidnight() {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0); // 00:00:00 of the next day
    return nextMidnight.getTime() - now.getTime();
}

/**
 * Generate a random session token
 */
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if authentication is required
 */
export function isAuthRequired() {
    return !!process.env.ACCESS_PASSWORD;
}

/**
 * Validate session token
 */
export function isValidSession(token) {
    if (!token) return false;
    const session = sessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
        sessions.delete(token);
        return false;
    }
    return true;
}


/**
 * Authentication middleware
 */
export function authMiddleware(req, res, next) {
    // [NEW] Skip auth for localhost (Local Development)
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    if (isLocal) {
        return next();
    }

    // Skip if no password set
    if (!isAuthRequired()) {
        return next();
    }

    // Skip auth routes
    if (req.path.startsWith('/api/auth')) {
        return next();
    }

    // Skip health check
    if (req.path === '/api/health') {
        return next();
    }

    // Check session cookie
    const token = req.cookies?.session_token;
    if (isValidSession(token)) {
        return next();
    }

    // Unauthorized
    return res.status(401).json({
        ok: false,
        error: 'Authentication required',
        authRequired: true
    });
}

/**
 * GET /api/auth/status
 * Check if authentication is required and current status
 */
router.get('/status', (req, res) => {
    // [NEW] Skip auth for localhost
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    const authRequired = isLocal ? false : isAuthRequired();

    const token = req.cookies?.session_token;
    const authenticated = authRequired ? isValidSession(token) : true;

    res.json({
        ok: true,
        authRequired,
        authenticated
    });
});

/**
 * POST /api/auth/login
 * Verify password and create session
 */
router.post('/login', express.json(), (req, res) => {
    const { password } = req.body;
    const correctPassword = process.env.ACCESS_PASSWORD;

    if (!correctPassword) {
        return res.json({ ok: true, message: 'No password required' });
    }

    if (password !== correctPassword) {
        return res.status(401).json({ ok: false, error: 'Incorrect password' });
    }

    // Create session
    const token = generateSessionToken();
    const duration = getMsUntilMidnight();
    const expiresAt = Date.now() + duration;

    sessions.set(token, {
        createdAt: Date.now(),
        expiresAt: expiresAt
    });

    // Set cookie
    res.cookie('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: duration
    });

    res.json({ ok: true, message: 'Logged in successfully' });
});

/**
 * POST /api/auth/logout
 * Clear session
 */
router.post('/logout', (req, res) => {
    const token = req.cookies?.session_token;
    if (token) {
        sessions.delete(token);
    }
    res.clearCookie('session_token');
    res.json({ ok: true, message: 'Logged out successfully' });
});

export default router;
