import { env } from '../utils/envParser';
import { AI_ERROR_MESSAGES } from '../constants/aiConstants';

export interface SummarizerResponse {
	summary: string;
	aiPrediction: string;
	comparison: string;
	reliabilityScore: number;
}

interface OpenRouterResponse {
	choices?: Array<{
		message?: {
			content?: string;
		};
	}>;
	error?: {
		code?: string;
		message?: string;
	};
}

class SummarizerService {}

export default new SummarizerService();
