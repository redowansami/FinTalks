/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "An error occurred"
 *       required:
 *         - success
 *         - message
 *
 *     NotFoundErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "NOT FOUND"
 *       required:
 *         - success
 *         - message
 *
 *     UnauthorizedErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Unauthorized access"
 *       required:
 *         - success
 *         - message
 *
 *     BadRequestErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Bad Request"
 *       required:
 *         - success
 *         - message
 *
 *     InternalServerErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Internal Server Error Occurred"
 *       required:
 *         - success
 *         - message
 *
 *     ForbiddenErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Forbidden"
 *       required:
 *         - success
 *         - message
 */

export {};
