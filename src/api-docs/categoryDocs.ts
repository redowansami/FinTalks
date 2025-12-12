/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         categoryId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Stocks"
 *         description:
 *           type: string
 *           maxLength: 500
 *           nullable: true
 *           example: "Investment in stocks and equity markets"
 *         stories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               storyId:
 *                 type: string
 *                 format: uuid
 *                 example: "8624734f-ac45-4aae-8346-149ba1016802"
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "5ab2671f-bbed-4ee8-b085-374b99178f73"
 *               title:
 *                 type: string
 *                 example: "Why I'm Investing in Stocks"
 *               body:
 *                 type: string
 *                 example: "This is my investment journey..."
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-09T04:08:30.208Z"
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-09T04:11:58.783Z"
 *               summary:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               reliabilityScore:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *               predictionComparison:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               summaryUpdatedAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2025-12-09T06:23:54.808Z"
 *       required:
 *         - categoryId
 *         - name
 *
 *     CategoryWithoutStories:
 *       type: object
 *       properties:
 *         categoryId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Stocks"
 *         description:
 *           type: string
 *           maxLength: 500
 *           nullable: true
 *           example: "Investment in stocks and equity markets"
 *       required:
 *         - categoryId
 *         - name
 *
 *     CreateCategoryRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Cryptocurrency"
 *         description:
 *           type: string
 *           maxLength: 500
 *           example: "Digital currencies and blockchain technology"
 *       required:
 *         - name
 *
 *     UpdateCategoryRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Crypto & Blockchain"
 *         description:
 *           type: string
 *           maxLength: 500
 *           example: "Digital currencies, blockchain, and Web3 technology"
 *
 *     CategoryListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Categories fetched successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Category management endpoints
 */

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 *     description: Creates a new category. Requires authentication and admin role. Category names must be unique.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CategoryWithoutStories'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestErrorResponse'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenErrorResponse'
 *       409:
 *         description: Conflict - category name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Category already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     description: Retrieves a list of all available categories sorted alphabetically by name
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryWithoutStories'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

/**
 * @swagger
 * /api/v1/categories/{categoryId}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a category by ID
 *     description: Retrieves a single category by its unique identifier, including associated stories
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the category
 *         example: "123e4567-e89b-12d3-a456-426614174002"
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category fetched successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request - invalid category ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestErrorResponse'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

/**
 * @swagger
 * /api/v1/categories/{categoryId}:
 *   patch:
 *     tags: [Categories]
 *     summary: Update a category
 *     description: Updates an existing category's name and/or description. Requires authentication and admin role. Category names must be unique.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the category
 *         example: "123e4567-e89b-12d3-a456-426614174002"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CategoryWithoutStories'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestErrorResponse'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenErrorResponse'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       409:
 *         description: Conflict - category name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Category already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

/**
 * @swagger
 * /api/v1/categories/{categoryId}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category
 *     description: Deletes a category from the system. Requires authentication and admin role. This will remove the category from all associated stories.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the category to delete
 *         example: "123e4567-e89b-12d3-a456-426614174002"
 *     responses:
 *       204:
 *         description: Category deleted successfully (No content)
 *       400:
 *         description: Bad request - invalid category ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestErrorResponse'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenErrorResponse'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

/**
 * @swagger
 * /api/v1/categories/seed:
 *   post:
 *     tags: [Categories]
 *     summary: Seed initial categories
 *     description: Seeds the database with initial predefined categories (Saving, Stocks, Bonds, Retirement Planning, Debt Management, Real Estate & Mortgages, Taxes, Others). Requires authentication and admin role. Skips categories that already exist.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories seeded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Seeded successfully"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

export {};
