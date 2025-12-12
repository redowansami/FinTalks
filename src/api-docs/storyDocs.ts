/**
 * @swagger
 * components:
 *   schemas:
 *     Story:
 *       type: object
 *       properties:
 *         storyId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         userId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           example: "Tesla's Q4 Earnings Beat Expectations"
 *         body:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *           example: "Tesla reported record earnings in Q4, beating analyst expectations..."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-12-11T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-12-11T10:00:00Z"
 *         summary:
 *           type: string
 *           nullable: true
 *           example: "Tesla's Q4 earnings exceeded market expectations with strong revenue growth."
 *         reliabilityScore:
 *           type: integer
 *           nullable: true
 *           minimum: 0
 *           maximum: 100
 *           example: 85
 *         predictionComparison:
 *           type: string
 *           nullable: true
 *           example: "Prediction accuracy: 92%"
 *         summaryUpdatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2025-12-11T11:00:00Z"
 *         categories:
 *           type: array
 *           items:
 *              type: object
 *              properties:
 *                categoryId:
 *                  type: string
 *                  format: uuid
 *                  example: "123e4567-e89b-12d3-a456-426614174002"
 *                name:
 *                  type: string
 *                  example: "Stocks"
 *                Description:
 *                  type: string
 *                  example: "Stock market related stories"
 *       required:
 *         - storyId
 *         - userId
 *         - title
 *         - body
 *         - createdAt
 *         - updatedAt
 *
 *     Category:
 *       type: object
 *       properties:
 *         categoryId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         name:
 *           type: string
 *           example: "Technology"
 *       required:
 *         - categoryId
 *         - name
 *
 *     CreateStoryRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           example: "Tesla's Q4 Earnings Beat Expectations"
 *         body:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *           example: "Tesla reported record earnings in Q4, beating analyst expectations..."
 *         categoryIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example: ["123e4567-e89b-12d3-a456-426614174002"]
 *       required:
 *         - title
 *         - body
 *
 *     UpdateStoryRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           example: "Tesla's Q4 Earnings Beat Expectations (Updated)"
 *         body:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *           example: "Updated content about Tesla's earnings..."
 *         categoryIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example: ["123e4567-e89b-12d3-a456-426614174002"]
 *
 *     StoryListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Story'
 *         nextCursor:
 *           type: string
 *           nullable: true
 *           example: "eyJzdG9yeUlkIjoiMTIzZTQ1NjcifQ=="
 *
 */

/**
 * @swagger
 * tags:
 *   - name: Stories
 *     description: Story management endpoints
 */

/**
 * @swagger
 * /api/v1/stories:
 *   post:
 *     tags: [Stories]
 *     summary: Create a new story
 *     description: Creates a new story with optional category associations. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStoryRequest'
 *     responses:
 *       201:
 *         description: Story created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Story'
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

/**
 * @swagger
 * /api/v1/stories:
 *   get:
 *     tags: [Stories]
 *     summary: Get all stories
 *     description: Retrieves a paginated list of stories with optional filtering and sorting
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter stories by title or body
 *         example: "Tesla"
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title]
 *         description: Field to order results by
 *         example: "createdAt"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
 *         example: "Technology"
 *       - in: query
 *         name: startAfter
 *         schema:
 *           type: string
 *         description: Cursor for pagination (story ID to start after)
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of stories to return per page
 *         example: 2
 *     responses:
 *       200:
 *         description: List of stories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoryListResponse'
 *       400:
 *         description: Bad request - invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

/**
 * @swagger
 * /api/v1/stories/{storyId}:
 *   get:
 *     tags: [Stories]
 *     summary: Get a story by ID
 *     description: Retrieves a single story by its unique identifier
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the story
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Story retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Story'
 *       400:
 *         description: Bad request - invalid story ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestErrorResponse'
 *       404:
 *         description: Story not found
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
 * /api/v1/stories/{storyId}:
 *   patch:
 *     tags: [Stories]
 *     summary: Update a story
 *     description: Updates an existing story. Requires authentication and appropriate authorization (story owner or admin).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the story
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStoryRequest'
 *     responses:
 *       200:
 *         description: Story updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Story'
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
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenErrorResponse'
 *       404:
 *         description: Story not found
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
 * /api/v1/stories/{storyId}:
 *   delete:
 *     tags: [Stories]
 *     summary: Delete a story
 *     description: Deletes a story. Requires authentication and admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the story
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       204:
 *         description: Story deleted successfully (No content)
 *       400:
 *         description: Bad request - invalid story ID format
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
 *         description: Story not found
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
 * /api/v1/stories/{storyId}/categories/{categoryId}:
 *   delete:
 *     tags: [Stories]
 *     summary: Remove a category from a story
 *     description: Removes a category association from a story. Requires authentication and appropriate authorization (story owner or admin).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the story
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the category to remove
 *         example: "123e4567-e89b-12d3-a456-426614174002"
 *     responses:
 *       204:
 *         description: Category removed from story successfully (No content)
 *       400:
 *         description: Bad request - invalid ID format
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
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenErrorResponse'
 *       404:
 *         description: Story or category not found
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

export {};
