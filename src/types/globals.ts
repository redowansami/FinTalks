declare global {
	namespace Express {
		interface Request {
			validatedReq: any;
		}
	}
}
