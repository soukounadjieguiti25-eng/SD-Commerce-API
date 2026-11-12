// routes/products.js - Products Resource Router
// Author: Djiegui Soukouna (NIM: 20250040219)
// SD Commerce - Main Resource: /products

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware');

// =========================================================================
// DATA: In-memory JavaScript Array (Requirement 2: >= 5 items, id + >= 4 fields)
// Fields: id (number), name (string), category (string), price (number), stock (number), rating (number)
// =========================================================================
let products = [
    {
        id: 1,
        name: "Pro Wireless Mechanical Keyboard",
        category: "electronics",
        price: 129.99,
        stock: 45,
        rating: 4.8
    },
    {
        id: 2,
        name: "Ultra Precision Gaming Mouse",
        category: "electronics",
        price: 69.50,
        stock: 80,
        rating: 4.7
    },
    {
        id: 3,
        name: "Studio Noise-Cancelling Headphones",
        category: "audio",
        price: 249.00,
        stock: 30,
        rating: 4.9
    },
    {
        id: 4,
        name: "Ergonomic Memory Foam Wrist Rest",
        category: "accessories",
        price: 24.99,
        stock: 120,
        rating: 4.5
    },
    {
        id: 5,
        name: "USB-C Aluminum Dual 4K Dock",
        category: "accessories",
        price: 89.95,
        stock: 15,
        rating: 4.6
    }
];

// Counter for auto-generating product IDs (never typed by the user)
let nextProductId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

// =========================================================================
// ROUTE MATCHING ORDER:
// Specific routes MUST be placed BEFORE parameterized routes (/:id)
// to prevent Express from treating literals like 'search' or 'category' as an id.
// =========================================================================

/**
 * 1. BONUS ROUTE: Query String Search (+3 Bonus)
 * GET /products/search?title=... (also supports ?name=...)
 */
router.get('/search', async (req, res) => {
    const searchTerm = req.query.title || req.query.name;

    if (!searchTerm || searchTerm.trim() === '') {
        const err = new Error('Query parameter "title" or "name" is required for searching');
        err.statusCode = 400;
        throw err;
    }

    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    res.status(200).json({
        success: true,
        query: searchTerm,
        count: filtered.length,
        data: filtered
    });
});

/**
 * 2. EXPRESS 5 OPTIONAL ROUTE: Category Filter (Requirement 4 & Table Route 7)
 * GET /products/category{/:name}
 * Express 5 uses { } for optional path segments.
 * - Without :name (/products/category): returns all products
 * - With :name (/products/category/electronics): returns products in that category
 */
router.get('/category{/:name}', async (req, res) => {
    const categoryName = req.params.name;

    if (!categoryName) {
        // No category parameter provided: return all items
        return res.status(200).json({
            success: true,
            filter: 'all',
            count: products.length,
            data: products
        });
    }

    const filtered = products.filter(product =>
        product.category.toLowerCase() === categoryName.toLowerCase()
    );

    res.status(200).json({
        success: true,
        category: categoryName,
        count: filtered.length,
        data: filtered
    });
});

/**
 * 3. ROOT PRODUCTS PATH: router.route('/') (Requirement 5)
 * GET  /products -> List all products
 * POST /products -> Add a new product (Auto ID, 400 on missing fields, returns 201)
 */
router.route('/')
    .get(async (req, res) => {
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    })
    .post(async (req, res) => {
        const { name, category, price, stock, rating } = req.body;

        // Validation: Required fields check
        if (!name || !category || price === undefined || stock === undefined) {
            const err = new Error('Missing required fields: name, category, price, and stock are mandatory');
            err.statusCode = 400;
            throw err;
        }

        // Validation: Type check
        const parsedPrice = Number(price);
        const parsedStock = Number(stock);
        if (isNaN(parsedPrice) || parsedPrice < 0 || isNaN(parsedStock) || parsedStock < 0) {
            const err = new Error('Invalid input: price and stock must be non-negative numbers');
            err.statusCode = 400;
            throw err;
        }

        // Auto-generate ID (Requirement 2)
        const newProduct = {
            id: nextProductId++,
            name: String(name).trim(),
            category: String(category).trim().toLowerCase(),
            price: parsedPrice,
            stock: parsedStock,
            rating: rating !== undefined ? Number(rating) : 5.0
        };

        products.push(newProduct);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    });

/**
 * 4. PARAMETERIZED ROUTE: router.route('/:id') (Requirement 4 & 5)
 * GET    /products/:id -> Get single product (throws 404 if not found)
 * PUT    /products/:id -> Update product (throws 404 if not found, 400 on bad data)
 * DELETE /products/:id -> Protected with requireAuth (throws 404 if not found, returns 200)
 */
router.route('/:id')
    .get(async (req, res) => {
        const productId = parseInt(req.params.id, 10);
        const product = products.find(p => p.id === productId);

        if (!product) {
            const err = new Error(`Product with ID ${req.params.id} not found`);
            err.statusCode = 404;
            throw err;
        }

        res.status(200).json({
            success: true,
            data: product
        });
    })
    .put(async (req, res) => {
        const productId = parseInt(req.params.id, 10);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            const err = new Error(`Product with ID ${req.params.id} not found`);
            err.statusCode = 404;
            throw err;
        }

        const { name, category, price, stock, rating } = req.body;

        // If body is completely empty, reject
        if (!name && !category && price === undefined && stock === undefined && rating === undefined) {
            const err = new Error('No update fields provided');
            err.statusCode = 400;
            throw err;
        }

        // Update fields if provided with validation
        if (name !== undefined) products[productIndex].name = String(name).trim();
        if (category !== undefined) products[productIndex].category = String(category).trim().toLowerCase();
        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                const err = new Error('Invalid price: must be a non-negative number');
                err.statusCode = 400;
                throw err;
            }
            products[productIndex].price = parsedPrice;
        }
        if (stock !== undefined) {
            const parsedStock = Number(stock);
            if (isNaN(parsedStock) || parsedStock < 0) {
                const err = new Error('Invalid stock: must be a non-negative number');
                err.statusCode = 400;
                throw err;
            }
            products[productIndex].stock = parsedStock;
        }
        if (rating !== undefined) {
            products[productIndex].rating = Number(rating);
        }

        res.status(200).json({
            success: true,
            message: `Product with ID ${productId} updated successfully`,
            data: products[productIndex]
        });
    })
    .delete(requireAuth, async (req, res) => {
        const productId = parseInt(req.params.id, 10);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            const err = new Error(`Product with ID ${req.params.id} not found`);
            err.statusCode = 404;
            throw err;
        }

        const deletedProduct = products.splice(productIndex, 1)[0];

        res.status(200).json({
            success: true,
            message: `Product with ID ${productId} deleted successfully`,
            data: deletedProduct
        });
    });

module.exports = router;
