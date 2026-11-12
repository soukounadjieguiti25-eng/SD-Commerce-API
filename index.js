// index.js - Server Entry Point for SD Commerce API
// Author: Djiegui Soukouna (NIM: 20250040219)
// Theme: Online Shop REST API (SD Commerce)

const express = require('express');
const { logger, notFound, errorHandler } = require('./middleware');

// Route modules (Requirement 5 & Bonus +5)
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================================================
// 1. GLOBAL MIDDLEWARE PIPELINE
// (Why this order: logger first to capture all requests, then body parsing)
// =========================================================================
// Request Logger (Requirement 6)
app.use(logger);

// Built-in JSON body parser (Requirement 3)
app.use(express.json());

// =========================================================================
// 2. ROOT & WELCOME ROUTE
// (Requirement 3 & Table Route 1)
// =========================================================================
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        project: 'SD Commerce API',
        theme: 'Online Shop REST API',
        author: 'Djiegui Soukouna',
        nim: '20250040219',
        message: 'Welcome to the SD Commerce REST API platform.',
        endpoints: {
            products: '/products',
            orders: '/orders (Bonus Resource)',
            wildcard: '/files/*path'
        }
    });
});

// =========================================================================
// 3. EXPRESS 5 NAMED WILDCARD ROUTE
// (Requirement 4 & Table Route 8)
// Matches paths starting with /files/ and captures wildcard as an array
// =========================================================================
app.get('/files/*path', (req, res) => {
    const rawPath = req.params.path || '';
    const segments = Array.isArray(rawPath)
        ? rawPath
        : rawPath.split('/').filter(Boolean);

    res.status(200).json({
        success: true,
        wildcard: rawPath,
        segments: segments
    });
});

// =========================================================================
// 4. MODULAR RESOURCE ROUTERS
// (Requirement 5: mounted with app.use)
// =========================================================================
// Main Resource: /products
app.use('/products', productsRouter);

// Secondary Resource (+5 Bonus): /orders
app.use('/orders', ordersRouter);

// =========================================================================
// 5. 404 NOT FOUND HANDLER
// (Requirement 7 & Table Route 9: catches any unmatched route)
// =========================================================================
app.use(notFound);

// =========================================================================
// 6. 4-PARAMETER GLOBAL ERROR HANDLER
// (Requirement 7 & Bonus +2: must be the LAST app.use in index.js)
// =========================================================================
app.use(errorHandler);

// =========================================================================
// SERVER START
// =========================================================================
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`SD Commerce API is running on port ${PORT}`);
    console.log(`Base URL: http://localhost:${PORT}`);
    console.log(`Author: Djiegui Soukouna (NIM: 20250040219)`);
    console.log(`=================================================`);
});

module.exports = app;
