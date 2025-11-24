export class UserNotFoundException extends Error {
	public status: number;

	constructor() {
		super('User not found');

		Object.setPrototypeOf(this, new.target.prototype); // <— FIX

		this.name = 'UserNotFoundException';
		this.status = 404;
	}
}
