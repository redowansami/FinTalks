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

class SummarizerService {
	private readonly SUMMARIZATION_PROMPT_TEMPLATE = `You are an AI assistant summarizing content for a financial blogging website.

Your goals:
1. Create a clear, objective, neutral summary of the story.
   - MUST be shorter than the original.
   - MAX 300 words.
   - Avoid hype, exaggeration, or emotional tone.

2. Identify whether the story contains any unusual, unreliable, or questionable elements, such as:
   - Sensational or hype-driven claims ("5x soon", "guaranteed return", "buy now")
   - Emotionally manipulative language
   - Overconfident predictions without data
   - Misleading statements or unverified assumptions
   - Strong financial advice without evidence

3. Generate your OWN data-driven assessment or prediction based strictly on analysis, not hype.

4. Compare your assessment with the author's tone and claims. Highlight differences clearly.

5. Assign a reliability score from 0% to 100%.
   - Bad signals (hype, exaggeration, emotional or aggressive tone) → lower score
   - Good signals (fundamentals, data, rational analysis) → higher score

Return EXACT JSON:
{
  "summary": "...",
  "aiPrediction": "...",
  "comparison": "...",
  "reliabilityScore": 0-100
}

Escape ALL quotes inside JSON values.
Do NOT use backticks.

Content to analyze:
\${content}`;

	private readonly MAX_RETRIES = env.AI_SUMMARIZATION_MAX_RETRIES;
	private readonly TIMEOUT_MS = env.AI_SUMMARIZATION_TIMEOUT_MS;
	private readonly API_KEY = env.OPENROUTER_API_KEY;
	private readonly MODEL = env.OPENROUTER_MODEL;
	private readonly FALLBACK_MODEL = env.OPENROUTER_FALLBACK_MODEL;

	async generateStorySummary(content: string): Promise<SummarizerResponse> {
		if (!this.API_KEY) {
			throw new Error(AI_ERROR_MESSAGES.API_KEY_NOT_SET);
		}

		const prompt = this.SUMMARIZATION_PROMPT_TEMPLATE.replace('${content}', content);
		const response = await this.callOpenRouterWithRetry(prompt);
		return response;
	}

	private async callOpenRouterWithRetry(prompt: string): Promise<SummarizerResponse> {
		let lastError: unknown = null;

		try {
			return await this.attemptSummarization(prompt, this.MODEL);
		} catch (error) {
			lastError = error;
		}

		if (this.FALLBACK_MODEL && this.MODEL !== this.FALLBACK_MODEL) {
			try {
				console.warn('Primary model failed, attempting fallback model...');
				return await this.attemptSummarization(prompt, this.FALLBACK_MODEL);
			} catch (error) {
				lastError = error;
			}
		}

		throw lastError || new Error(AI_ERROR_MESSAGES.SUMMARIZATION_FAILED);
	}

	private async attemptSummarization(prompt: string, model: string): Promise<SummarizerResponse> {
		let lastError: unknown = null;

		for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
			const response = await this.fetchWithTimeout(
				'https://openrouter.ai/api/v1/chat/completions',
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${this.API_KEY}`,
						'HTTP-Referer': env.BACKEND_URL,
						'X-Title': 'FinTalks Financial Blog',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: model,
						messages: [{ role: 'user', content: prompt }],
					}),
				},
				this.TIMEOUT_MS,
			);

			const data = (await response.json()) as OpenRouterResponse;

			if (data.error) {
				const code = data.error.code;
				if (code === '429' || code === 'rate_limit_exceeded') {
					lastError = new Error(
						`${AI_ERROR_MESSAGES.RATE_LIMITED_PREFIX}: ${data.error.message}`,
					);
					if (attempt < this.MAX_RETRIES - 1) {
						await this.exponentialBackoff(attempt);
					}
					continue;
				}
				throw new Error(
					`${AI_ERROR_MESSAGES.SUMMARIZATION_FAILED}: ${data.error.message || AI_ERROR_MESSAGES.UNKNOWN_ERROR}`,
				);
			}

			const text = data.choices?.[0]?.message?.content;
			if (!text)
				throw new Error(
					`${AI_ERROR_MESSAGES.SUMMARIZATION_FAILED}: ${AI_ERROR_MESSAGES.EMPTY_RESPONSE}`,
				);

			return this.extractAndParseJson(text);
		}

		throw (
			lastError ||
			new Error(
				`${AI_ERROR_MESSAGES.SUMMARIZATION_FAILED}: ${AI_ERROR_MESSAGES.FAILED_RETRIES}`,
			)
		);
	}

	private extractAndParseJson(raw: string): SummarizerResponse {
		let jsonText = raw.trim();

		const mdMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
		if (mdMatch) {
			jsonText = mdMatch[1].trim();
		}

		const objMatch = jsonText.match(/\{[\s\S]*\}/);
		if (objMatch) {
			jsonText = objMatch[0];
		}

		jsonText = this.sanitizeJson(jsonText);

		try {
			return JSON.parse(jsonText);
		} catch {
			throw new Error(AI_ERROR_MESSAGES.JSON_PARSE_FAILED);
		}
	}

	private sanitizeJson(text: string): string {
		return text
			.replace(/```/g, '')
			.replace(/[“”]/g, '"')
			.replace(/[‘’]/g, "'")
			.replace(/,\s*([}\]])/g, '$1')
			.replace(/([^\\])"/g, '$1"')

			.trim();
	}

	private async fetchWithTimeout(
		url: string,
		options: RequestInit,
		timeoutMs: number,
	): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		try {
			return await fetch(url, { ...options, signal: controller.signal });
		} finally {
			clearTimeout(timeoutId);
		}
	}

	private async exponentialBackoff(attempt: number): Promise<void> {
		const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
		return new Promise((resolve) => setTimeout(resolve, delay));
	}
}

export default new SummarizerService();
