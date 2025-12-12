import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'FinTalks API',
			version: '1.0.0',
			description: 'FinTalks - Financial blog platform API documentation',
		},
		servers: [
			{
				url: 'http://localhost:3000',
				description: 'Development server',
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
	},
	apis: ['./src/api-docs/*.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
