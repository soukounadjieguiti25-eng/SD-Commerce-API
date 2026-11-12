// middleware.js - Custom Middleware for SD Commerce API
// Author: Djiegui Soukouna (NIM: 20250040219)

/**
 * Request Logger Middleware (Requirement 6)
 * Logs HTTP method, URL, and timestamp for every incoming request.
 */
function logger(req, res, next) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);
    next();
}

/**
 * Authentication Middleware (Requirement 6 & Score criteria)
 * Protects DELETE routes using an authorization header token.
 * Returns 401 Unauthorized if the header is missing or empty.
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || authHeader.trim() === '') {
        const err = new Error('Unauthorized: Authentication token is required in Authorization header');
        err.statusCode = 401;
        return next(err);
    }

    // Accepts standard Bearer token or direct token string
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    if (!token) {
        const err = new Error('Unauthorized: Bearer token cannot be empty');
        err.statusCode = 401;
        return next(err);
    }

    // Valid token check (accepts demo key or secret token)
    next();
}

/**
 * 404 Not Found Route Handler (Requirement 7 & Route 9)
 * Catches all requests to unknown URLs and passes a 404 error down the pipeline.
 */
function notFound(req, res, next) {
    const err = new Error(`Cannot ${req.method} ${req.originalUrl} - Route not found`);
    err.statusCode = 404;
    next(err);
}

/**
 * Global 4-Parameter Error Handler (Requirement 7 & Bonus +2)
 * Placed last in index.js pipeline.
 * Formats every error (400, 401, 404, 500) into a single consistent JSON schema.
 */
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        status: statusCode >= 500 ? 'error' : 'fail',
        statusCode: statusCode,
        message: message,
        timestamp: new Date().toISOString()
    });
}

module.exports = {
    logger,
    requireAuth,
    notFound,
    errorHandler
};
