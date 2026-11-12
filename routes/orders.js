// routes/orders.js - Orders Resource Router (+5 Bonus Resource)
// Author: Djiegui Soukouna (NIM: 20250040219)
// SD Commerce - Secondary Resource: /orders

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware');

// =========================================================================
// DATA: In-memory JavaScript Array for Orders
// Schema: id, productId, customerName, quantity, unitPrice, totalPrice, status
// =========================================================================
let orders = [
    {
        id: 1,
        productId: 1,
        customerName: "Alex Morgan",
        quantity: 2,
        unitPrice: 129.99,
        totalPrice: 259.98,
        status: "completed",
        orderDate: "2026-11-10T10:15:00.000Z"
    },
    {
        id: 2,
        productId: 3,
        customerName: "Sarah Connor",
        quantity: 1,
        unitPrice: 249.00,
        totalPrice: 249.00,
        status: "processing",
        orderDate: "2026-11-12T14:30:00.000Z"
    }
];

// Auto-increment counter for order IDs
let nextOrderId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;

/**
 * 1. ROOT ORDERS PATH: router.route('/')
 * GET  /orders -> List all orders
 * POST /orders -> Create a new customer order (Auto ID, 400 validation, returns 201)
 */
router.route('/')
    .get(async (req, res) => {
        res.status(200).json({
            success: true,
            resource: 'orders',
            count: orders.length,
            data: orders
        });
    })
    .post(async (req, res) => {
        const { productId, customerName, quantity, unitPrice } = req.body;

        // Validation: Required fields check
        if (!productId || !customerName || quantity === undefined || unitPrice === undefined) {
            const err = new Error('Missing required fields: productId, customerName, quantity, and unitPrice are mandatory');
            err.statusCode = 400;
            throw err;
        }

        const parsedQuantity = parseInt(quantity, 10);
        const parsedUnitPrice = Number(unitPrice);

        if (isNaN(parsedQuantity) || parsedQuantity <= 0 || isNaN(parsedUnitPrice) || parsedUnitPrice < 0) {
            const err = new Error('Invalid input: quantity must be positive integer and unitPrice must be non-negative');
            err.statusCode = 400;
            throw err;
        }

        const newOrder = {
            id: nextOrderId++,
            productId: parseInt(productId, 10),
            customerName: String(customerName).trim(),
            quantity: parsedQuantity,
            unitPrice: parsedUnitPrice,
            totalPrice: parseFloat((parsedQuantity * parsedUnitPrice).toFixed(2)),
            status: 'processing',
            orderDate: new Date().toISOString()
        };

        orders.push(newOrder);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: newOrder
        });
    });

/**
 * 2. PARAMETERIZED ORDERS PATH: router.route('/:id')
 * GET    /orders/:id -> View single order
 * DELETE /orders/:id -> Delete/Cancel order (protected with requireAuth)
 */
router.route('/:id')
    .get(async (req, res) => {
        const orderId = parseInt(req.params.id, 10);
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            const err = new Error(`Order with ID ${req.params.id} not found`);
            err.statusCode = 404;
            throw err;
        }

        res.status(200).json({
            success: true,
            data: order
        });
    })
    .delete(requireAuth, async (req, res) => {
        const orderId = parseInt(req.params.id, 10);
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            const err = new Error(`Order with ID ${req.params.id} not found`);
            err.statusCode = 404;
            throw err;
        }

        const deletedOrder = orders.splice(orderIndex, 1)[0];

        res.status(200).json({
            success: true,
            message: `Order with ID ${orderId} cancelled and removed successfully`,
            data: deletedOrder
        });
    });

module.exports = router;
