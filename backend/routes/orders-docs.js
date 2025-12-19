/**
 * @swagger
 * components:
 *   schemas:
 *     OrderStatus:
 *       type: string
 *       enum: [pending, confirmed, in_progress, ready, out_for_delivery, delivered, completed, cancelled]
 *       example: pending
 *     DeliveryOption:
 *       type: string
 *       enum: [pickup, delivery]
 *       example: pickup
 */

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve a list of orders with optional filtering and pagination. Requires authentication.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/OrderStatus'
 *         description: Filter orders by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Maximum number of orders to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of orders to skip
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   order_number: "ORD-2024-001"
 *                   status: "pending"
 *                   customer_name: "John Doe"
 *                   total_amount: 50.00
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve a specific order by its ID. Users can only access their own orders unless they are admins.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/orders/number/{orderNumber}:
 *   get:
 *     summary: Get order by order number
 *     description: Retrieve an order by its order number. This endpoint is public and used for order tracking.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number (e.g., ORD-2024-001)
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new cake order. Rate limited to prevent abuse.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_name
 *               - customer_phone
 *               - customer_email
 *               - date_needed
 *               - time_needed
 *               - cake_size
 *               - filling
 *               - theme
 *               - delivery_option
 *               - total_amount
 *             properties:
 *               customer_name:
 *                 type: string
 *                 example: "John Doe"
 *               customer_phone:
 *                 type: string
 *                 example: "610-555-1234"
 *               customer_email:
 *                 type: string
 *                 format: email
 *                 example: "customer@example.com"
 *               customer_language:
 *                 type: string
 *                 enum: [en, es]
 *                 default: en
 *               date_needed:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-25"
 *               time_needed:
 *                 type: string
 *                 format: time
 *                 example: "14:00"
 *               cake_size:
 *                 type: string
 *                 example: "medium"
 *               filling:
 *                 type: string
 *                 example: "chocolate"
 *               theme:
 *                 type: string
 *                 example: "birthday"
 *               dedication:
 *                 type: string
 *                 nullable: true
 *                 example: "Happy Birthday!"
 *               delivery_option:
 *                 $ref: '#/components/schemas/DeliveryOption'
 *               delivery_address:
 *                 type: string
 *                 nullable: true
 *                 example: "123 Main St"
 *               delivery_apartment:
 *                 type: string
 *                 nullable: true
 *                 example: "Apt 4B"
 *               delivery_zip_code:
 *                 type: string
 *                 nullable: true
 *                 example: "19020"
 *               total_amount:
 *                 type: number
 *                 format: float
 *                 example: 50.00
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     description: Update the status of an order. Only admins and bakers can update order status.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/OrderStatus'
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
