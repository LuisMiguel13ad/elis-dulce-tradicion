/**
 * Order Search and Filter Routes
 * Handles search, filtering, and sorting with full-text search
 */

import express from 'express';
import pool from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();

/**
 * Search orders with filters and sorting
 * GET /api/v1/orders/search
 */
router.get(
  '/search',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      q, // search query
      status, // comma-separated statuses
      paymentStatus, // comma-separated payment statuses
      deliveryOption, // pickup, delivery, or all
      cakeSize, // comma-separated sizes
      dateFrom, // YYYY-MM-DD
      dateTo, // YYYY-MM-DD
      dateNeededFilter, // today, this_week, this_month, custom
      sortField = 'created_at', // field to sort by
      sortDirection = 'desc', // asc or desc
      page = 1,
      limit = 20,
    } = req.query;

    const client = await pool.connect();

    try {
      // Build WHERE conditions
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      // Full-text search
      if (q && q.trim().length > 0) {
        const searchQuery = q.trim();
        
        // Use PostgreSQL full-text search with tsvector
        conditions.push(
          `(
            search_vector @@ plainto_tsquery('english', $${paramIndex}) OR
            order_number ILIKE $${paramIndex + 1} OR
            customer_name ILIKE $${paramIndex + 2} OR
            customer_phone ILIKE $${paramIndex + 3} OR
            customer_email ILIKE $${paramIndex + 4} OR
            dedication ILIKE $${paramIndex + 5}
          )`
        );
        const searchPattern = `%${searchQuery}%`;
        params.push(searchQuery, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        paramIndex += 6;
      }

      // Status filter
      if (status) {
        const statuses = String(status).split(',').map(s => s.trim());
        if (statuses.length > 0) {
          const placeholders = statuses.map((_, i) => `$${paramIndex + i}`).join(',');
          conditions.push(`status IN (${placeholders})`);
          params.push(...statuses);
          paramIndex += statuses.length;
        }
      }

      // Payment status filter
      if (paymentStatus) {
        const paymentStatuses = String(paymentStatus).split(',').map(s => s.trim());
        if (paymentStatuses.length > 0) {
          const placeholders = paymentStatuses.map((_, i) => `$${paramIndex + i}`).join(',');
          conditions.push(`payment_status IN (${placeholders})`);
          params.push(...paymentStatuses);
          paramIndex += paymentStatuses.length;
        }
      }

      // Delivery option filter
      if (deliveryOption && deliveryOption !== 'all') {
        conditions.push(`delivery_option = $${paramIndex}`);
        params.push(deliveryOption);
        paramIndex++;
      }

      // Cake size filter
      if (cakeSize) {
        const sizes = String(cakeSize).split(',').map(s => s.trim());
        if (sizes.length > 0) {
          const placeholders = sizes.map((_, i) => `$${paramIndex + i}`).join(',');
          conditions.push(`cake_size IN (${placeholders})`);
          params.push(...sizes);
          paramIndex += sizes.length;
        }
      }

      // Date range filter
      if (dateFrom) {
        conditions.push(`date_needed >= $${paramIndex}`);
        params.push(dateFrom);
        paramIndex++;
      }
      if (dateTo) {
        conditions.push(`date_needed <= $${paramIndex}`);
        params.push(dateTo);
        paramIndex++;
      }

      // Date needed filter (quick filters)
      if (dateNeededFilter && dateNeededFilter !== 'all') {
        const today = new Date();
        let fromDate, toDate;

        switch (dateNeededFilter) {
          case 'today':
            fromDate = today.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
          case 'this_week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            fromDate = weekStart.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
          case 'this_month':
            fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
              .toISOString()
              .split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
        }

        if (fromDate) {
          conditions.push(`date_needed >= $${paramIndex}`);
          params.push(fromDate);
          paramIndex++;
        }
        if (toDate) {
          conditions.push(`date_needed <= $${paramIndex}`);
          params.push(toDate);
          paramIndex++;
        }
      }

      // Build WHERE clause
      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Validate sort field
      const validSortFields = [
        'date_needed',
        'created_at',
        'order_number',
        'total_amount',
        'customer_name',
      ];
      const sortFieldValid = validSortFields.includes(String(sortField))
        ? String(sortField)
        : 'created_at';
      const sortDirectionValid =
        String(sortDirection).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
      const countResult = await client.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Calculate pagination
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
      const offset = (pageNum - 1) * limitNum;

      // Build main query
      const query = `
        SELECT 
          o.*,
          p.square_payment_id,
          p.amount as payment_amount,
          p.status as payment_status_detail
        FROM orders o
        LEFT JOIN payments p ON o.id = p.order_id
        ${whereClause}
        ORDER BY o.${sortFieldValid} ${sortDirectionValid}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(limitNum, offset);

      const result = await client.query(query, params);

      // Highlight search terms in results (simple approach)
      const highlightedResults = result.rows.map((order) => {
        if (q && q.trim().length > 0) {
          const searchTerm = q.trim();
          const highlight = (text) => {
            if (!text) return text;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
          };

          return {
            ...order,
            _highlighted: {
              customer_name: highlight(order.customer_name),
              order_number: highlight(order.order_number),
              dedication: highlight(order.dedication),
            },
          };
        }
        return order;
      });

      return sendSuccess(res, {
        data: highlightedResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        filters: {
          query: q || null,
          status: status ? String(status).split(',') : null,
          paymentStatus: paymentStatus ? String(paymentStatus).split(',') : null,
          deliveryOption: deliveryOption || null,
          cakeSize: cakeSize ? String(cakeSize).split(',') : null,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
        },
        sort: {
          field: sortFieldValid,
          direction: sortDirectionValid.toLowerCase(),
        },
      });
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    } finally {
      client.release();
    }
  })
);

export default router;
