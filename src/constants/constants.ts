export const HTTP_STATUS = {
	CREATED: 201,
	OK: 200,
	BAD_REQUEST: 400,
	NOT_FOUND: 404,
};

export const HTTP_MESSAGES = {
	USER_CREATED: 'User created',
	USER_DELETED: 'User deleted',
	USER_NOT_FOUND: 'User not found',
	FAILED_CREATE_USER: 'Failed to create user',
	FAILED_GET_USERS: 'Failed to get users',
	FAILED_FETCH_USER: 'Failed to fetch user',
	FAILED_UPDATE_USER: 'Failed to update user',
	FAILED_DELETE_USER: 'Failed to delete user',
	VALIDATION_FAILED: 'Validation failed',
};

export const LENTGH_CONSTRAINTS = {
	USERNAME_MIN: 3,
	USERNAME_MAX: 10,
	NAME_MIN: 3,
	NAME_MAX: 25,
	PASSWORD_MIN: 6,
	PASSWORD_MAX: 15,
};

export const VALIDATION_MESSAGES = {
	USERNAME_MIN: 'Username should be at least 3 characters long',
	USERNAME_MAX: 'Username must be at most 10 characters',
	NAME_MIN: 'Name should be at least 3 characters long',
	NAME_MAX: 'Name must be at most 25 characters',
	INVALID_EMAIL: 'Invalid email address',
	INVALID_USER_ID: 'Invalid user ID format',
};
