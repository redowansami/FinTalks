export abstract class AppError extends Error {
	public abstract readonly statusCode: number;

	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
		Error.captureStackTrace(this, this.constructor);
	}
}
