export const RATE_LIMIT_CONFIG = {
	DEFAULT: {
		WINDOW_MS: 15 * 60 * 1000,
		MAX: 900,
		MESSAGE: 'Too many requests from this IP, please try again later.',
	},
	LOGIN: {
		WINDOW_MS: 5 * 60 * 1000,
		MAX: 10,
		MESSAGE: 'Too many login attempts. Please try again after 10 minutes.',
	},
	SIGNUP: {
		WINDOW_MS: 60 * 60 * 1000,
		MAX: 10,
		MESSAGE: 'Too many signup attempts. Please try again after 1 hour.',
	},
	RESEND_EMAIL: {
		WINDOW_MS: 5 * 60 * 1000,
		MAX: 3,
		MESSAGE: 'Too many email resend attempts. Please try again after 5 minutes.',
	},
	CREATE_STORY: {
		WINDOW_MS: 60 * 60 * 1000,
		MAX: 20,
		MESSAGE: 'Too many stories created. Please try again after 1 hour.',
	},
	UPDATE_STORY: {
		WINDOW_MS: 60 * 60 * 1000,
		MAX: 20,
		MESSAGE: 'Too many story updates. Please try again after 1 hour.',
	},
};
