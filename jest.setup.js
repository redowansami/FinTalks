jest.mock('nodemailer', () => ({
	createTransport: jest.fn(() => ({
		sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
	})),
}));

jest.mock('./src/config/email', () => ({
	__esModule: true,
	default: {
		sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
	},
}));
