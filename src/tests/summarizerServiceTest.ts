import summarizerService, { SummarizerResponse } from '../services/summarizerService';
import { AI_ERROR_MESSAGES } from '../constants/aiConstants';
import { env } from '../utils/envParser';

jest.mock('../utils/envParser');

const mockEnv = env as jest.Mocked<typeof env>;

global.fetch = jest.fn();

describe('SummarizerService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockEnv.AI_SUMMARIZATION_MAX_RETRIES = 3;
		mockEnv.AI_SUMMARIZATION_TIMEOUT_MS = 10000;
		mockEnv.OPENROUTER_API_KEY = 'test-api-key';
		mockEnv.OPENROUTER_MODEL = 'primary-model';
		mockEnv.OPENROUTER_FALLBACK_MODEL = 'fallback-model';
		mockEnv.BACKEND_URL = 'http://test.com';
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('generateStorySummary', () => {
		it('should throw error if API key is not set', async () => {
			const originalApiKey = (summarizerService as any).API_KEY;
			(summarizerService as any).API_KEY = '';

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				AI_ERROR_MESSAGES.API_KEY_NOT_SET,
			);

			(summarizerService as any).API_KEY = originalApiKey;
		});

		it('should successfully generate summary with valid response', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 85,
			};

			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: JSON.stringify(mockResponse) } }],
				}),
			});

			const result = await summarizerService.generateStorySummary('test content');

			expect(result).toEqual(mockResponse);
			expect(global.fetch).toHaveBeenCalledTimes(1);
		});

		it('should handle JSON wrapped in markdown code blocks', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 75,
			};

			const wrappedResponse = '```json\n' + JSON.stringify(mockResponse) + '\n```';

			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: wrappedResponse } }],
				}),
			});

			const result = await summarizerService.generateStorySummary('test content');

			expect(result).toEqual(mockResponse);
		});

		it('should handle JSON without markdown wrapper', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 90,
			};

			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [
						{
							message: {
								content: 'Some text before ' + JSON.stringify(mockResponse),
							},
						},
					],
				}),
			});

			const result = await summarizerService.generateStorySummary('test content');

			expect(result).toEqual(mockResponse);
		});

		it('should fallback to secondary model if primary fails', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary from fallback',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 80,
			};

			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: jest.fn().mockResolvedValue({
						error: { code: '500', message: 'Primary model error' },
					}),
				})
				.mockResolvedValueOnce({
					json: jest.fn().mockResolvedValue({
						choices: [{ message: { content: JSON.stringify(mockResponse) } }],
					}),
				});

			const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

			const result = await summarizerService.generateStorySummary('test content');

			expect(result).toEqual(mockResponse);
			expect(global.fetch).toHaveBeenCalledTimes(2);
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'Primary model failed, attempting fallback model...',
			);

			consoleWarnSpy.mockRestore();
		});

		it('should throw error if both primary and fallback models fail', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					error: { code: '500', message: 'Model error' },
				}),
			});

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				'Model error',
			);
			expect(global.fetch).toHaveBeenCalledTimes(2);
		});

		it('should attempt fallback when primary model fails', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					error: { code: '500', message: 'Model error' },
				}),
			});

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow();
			expect(global.fetch).toHaveBeenCalledTimes(2);
		});

		it('should retry on rate limit errors', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 85,
			};

			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: jest.fn().mockResolvedValue({
						error: { code: '429', message: 'Rate limited' },
					}),
				})
				.mockResolvedValueOnce({
					json: jest.fn().mockResolvedValue({
						choices: [{ message: { content: JSON.stringify(mockResponse) } }],
					}),
				});

			jest.useFakeTimers();

			const promise = summarizerService.generateStorySummary('test content');

			await jest.advanceTimersByTimeAsync(1000);

			const result = await promise;

			expect(result).toEqual(mockResponse);
			expect(global.fetch).toHaveBeenCalledTimes(2);

			jest.useRealTimers();
		});

		it('should retry on rate_limit_exceeded errors', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 85,
			};

			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: jest.fn().mockResolvedValue({
						error: { code: 'rate_limit_exceeded', message: 'Rate limit exceeded' },
					}),
				})
				.mockResolvedValueOnce({
					json: jest.fn().mockResolvedValue({
						choices: [{ message: { content: JSON.stringify(mockResponse) } }],
					}),
				});

			jest.useFakeTimers();

			const promise = summarizerService.generateStorySummary('test content');

			await jest.advanceTimersByTimeAsync(1000);

			const result = await promise;

			expect(result).toEqual(mockResponse);

			jest.useRealTimers();
		});

		it('should exhaust retries on persistent rate limit', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					error: { code: '429', message: 'Rate limited' },
				}),
			});

			const originalSetTimeout = global.setTimeout;
			global.setTimeout = ((fn: any) => {
				fn();
				return 0 as any;
			}) as any;

			try {
				await expect(
					summarizerService.generateStorySummary('test content'),
				).rejects.toThrow(AI_ERROR_MESSAGES.RATE_LIMITED_PREFIX);
			} finally {
				global.setTimeout = originalSetTimeout;
			}
		});

		it('should throw error if response has no content', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: {} }],
				}),
			});

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				AI_ERROR_MESSAGES.EMPTY_RESPONSE,
			);
		});

		it('should throw error if response has empty choices', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [],
				}),
			});

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				AI_ERROR_MESSAGES.EMPTY_RESPONSE,
			);
		});

		it('should throw error if response has no choices', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({}),
			});

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				AI_ERROR_MESSAGES.EMPTY_RESPONSE,
			);
		});

		it('should throw error if JSON parsing fails', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: 'invalid json {{}' } }],
				}),
			});

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				AI_ERROR_MESSAGES.JSON_PARSE_FAILED,
			);
		});

		it('should handle API errors with message', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					error: { code: '400', message: 'Bad request' },
				}),
			});

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				'Bad request',
			);
		});

		it('should handle API errors without message', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					error: { code: '500' },
				}),
			});

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				AI_ERROR_MESSAGES.UNKNOWN_ERROR,
			);
		});

		it('should handle fetch abort signal', async () => {
			(global.fetch as jest.Mock).mockImplementation((url, options) => {
				expect(options.signal).toBeDefined();
				return Promise.resolve({
					json: jest.fn().mockResolvedValue({
						choices: [
							{
								message: {
									content: JSON.stringify({
										summary: 'Test',
										aiPrediction: 'Test',
										comparison: 'Test',
										reliabilityScore: 85,
									}),
								},
							},
						],
					}),
				});
			});

			const result = await summarizerService.generateStorySummary('test content');
			expect(result).toBeDefined();
		});

		it('should sanitize JSON with smart quotes', async () => {
			const mockResponse = {
				summary: 'Test "summary"',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 85,
			};

			const responseWithSmartQuotes = JSON.stringify(mockResponse).replace(/"/g, '"');

			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: responseWithSmartQuotes } }],
				}),
			});

			const result = await summarizerService.generateStorySummary('test content');

			expect(result.summary).toBeDefined();
		});

		it('should sanitize JSON with trailing commas', async () => {
			const invalidJson = `{
				"summary": "Test",
				"aiPrediction": "Test",
				"comparison": "Test",
				"reliabilityScore": 85,
			}`;

			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: invalidJson } }],
				}),
			});

			const result = await summarizerService.generateStorySummary('test content');

			expect(result.summary).toBe('Test');
		});

		it('should make correct API request with headers', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 85,
			};

			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: JSON.stringify(mockResponse) } }],
				}),
			});

			await summarizerService.generateStorySummary('test content');

			const callArgs = (global.fetch as jest.Mock).mock.calls[0];
			const options = callArgs[1];

			expect(callArgs[0]).toBe('https://openrouter.ai/api/v1/chat/completions');
			expect(options.method).toBe('POST');
			expect(options.headers).toHaveProperty('Authorization');
			expect(options.headers['HTTP-Referer']).toBe('http://test.com');
			expect(options.headers['X-Title']).toBe('FinTalks Financial Blog');
			expect(options.headers['Content-Type']).toBe('application/json');
			expect(options.body).toContain('test content');
			expect(options.signal).toBeDefined();
		});

		it('should use correct model in API request', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 85,
			};

			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: JSON.stringify(mockResponse) } }],
				}),
			});

			await summarizerService.generateStorySummary('test content');

			const callArgs = (global.fetch as jest.Mock).mock.calls[0];
			const body = JSON.parse(callArgs[1].body);

			expect(body.model).toBeDefined();
			expect(body.model).toBeTruthy();
			expect(body.messages[0].role).toBe('user');
			expect(body.messages[0].content).toContain('test content');
		});

		it('should use fallback model in second attempt', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 85,
			};

			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: jest.fn().mockResolvedValue({
						error: { code: '500', message: 'Error' },
					}),
				})
				.mockResolvedValueOnce({
					json: jest.fn().mockResolvedValue({
						choices: [{ message: { content: JSON.stringify(mockResponse) } }],
					}),
				});

			jest.spyOn(console, 'warn').mockImplementation();

			await summarizerService.generateStorySummary('test content');

			const firstCall = (global.fetch as jest.Mock).mock.calls[0];
			const secondCall = (global.fetch as jest.Mock).mock.calls[1];
			const firstBody = JSON.parse(firstCall[1].body);
			const secondBody = JSON.parse(secondCall[1].body);

			expect(secondBody.model).toBeDefined();
			expect(secondBody.model).not.toBe(firstBody.model);
		});

		it('should handle exponential backoff correctly', async () => {
			mockEnv.AI_SUMMARIZATION_MAX_RETRIES = 3;

			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 85,
			};

			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: jest.fn().mockResolvedValue({
						error: { code: '429', message: 'Rate limited' },
					}),
				})
				.mockResolvedValueOnce({
					json: jest.fn().mockResolvedValue({
						error: { code: '429', message: 'Rate limited' },
					}),
				})
				.mockResolvedValueOnce({
					json: jest.fn().mockResolvedValue({
						choices: [{ message: { content: JSON.stringify(mockResponse) } }],
					}),
				});

			jest.useFakeTimers();

			const promise = summarizerService.generateStorySummary('test content');

			await jest.advanceTimersByTimeAsync(1000);
			await jest.advanceTimersByTimeAsync(2000);

			const result = await promise;

			expect(result).toEqual(mockResponse);
			expect(global.fetch).toHaveBeenCalledTimes(3);

			jest.useRealTimers();
		});

		it('should cap exponential backoff at 30 seconds', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 85,
			};

			const rateLimitResponse = {
				json: jest.fn().mockResolvedValue({
					error: { code: '429', message: 'Rate limited' },
				}),
			};

			const successResponse = {
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: JSON.stringify(mockResponse) } }],
				}),
			};

			(global.fetch as jest.Mock)
				.mockResolvedValueOnce(rateLimitResponse)
				.mockResolvedValueOnce(rateLimitResponse)
				.mockResolvedValueOnce(rateLimitResponse)
				.mockResolvedValueOnce(rateLimitResponse)
				.mockResolvedValueOnce(successResponse);

			jest.useFakeTimers();

			const promise = summarizerService.generateStorySummary('test content');

			await jest.advanceTimersByTimeAsync(1000);
			await jest.advanceTimersByTimeAsync(2000);
			await jest.advanceTimersByTimeAsync(4000);
			await jest.advanceTimersByTimeAsync(8000);

			const result = await promise;

			expect(result).toEqual(mockResponse);

			jest.useRealTimers();
		}, 30000);

		it('should handle markdown code blocks without json specifier', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 85,
			};

			const wrappedResponse = '```\n' + JSON.stringify(mockResponse) + '\n```';

			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: wrappedResponse } }],
				}),
			});

			const result = await summarizerService.generateStorySummary('test content');

			expect(result).toEqual(mockResponse);
		});

		it('should extract JSON object from mixed content', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Test summary',
				aiPrediction: 'Test prediction',
				comparison: 'Test comparison',
				reliabilityScore: 75,
			};

			const mixedContent = `Here is your response:
			
			${JSON.stringify(mockResponse)}
			
			Hope this helps!`;

			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: mixedContent } }],
				}),
			});

			const result = await summarizerService.generateStorySummary('test content');

			expect(result).toEqual(mockResponse);
		});

		it('should throw error when max retries exhausted without lastError', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: '' } }],
				}),
			});

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				AI_ERROR_MESSAGES.EMPTY_RESPONSE,
			);
		});

		it('should throw JSON parse error when no JSON object found in response', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: 'This is just plain text without JSON' } }],
				}),
			});

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				AI_ERROR_MESSAGES.JSON_PARSE_FAILED,
			);
		});

		it('should throw FAILED_RETRIES error when MAX_RETRIES is 0', async () => {
			const originalMaxRetries = (summarizerService as any).MAX_RETRIES;
			(summarizerService as any).MAX_RETRIES = 0;

			(global.fetch as jest.Mock).mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					choices: [{ message: { content: '{"summary":"test"}' } }],
				}),
			});

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				AI_ERROR_MESSAGES.FAILED_RETRIES,
			);

			(summarizerService as any).MAX_RETRIES = originalMaxRetries;
		});

		it('should use fallback model when primary model fails', async () => {
			const mockResponse: SummarizerResponse = {
				summary: 'Fallback summary',
				aiPrediction: 'Fallback prediction',
				comparison: 'Fallback comparison',
				reliabilityScore: 70,
			};

			const attemptSpy = jest.spyOn(summarizerService as any, 'attemptSummarization');

			attemptSpy
				.mockRejectedValueOnce(new Error('Primary model failed'))
				.mockResolvedValueOnce(mockResponse);

			const result = await summarizerService.generateStorySummary('test content');

			expect(result).toEqual(mockResponse);
			expect(attemptSpy).toHaveBeenCalledTimes(2);

			const firstCallModel = attemptSpy.mock.calls[0][1];
			const secondCallModel = attemptSpy.mock.calls[1][1];
			expect(firstCallModel).toBeDefined();
			expect(secondCallModel).toBeDefined();
			expect(firstCallModel).not.toBe(secondCallModel);

			attemptSpy.mockRestore();
		});

		it('should throw error when both primary and fallback models fail with attemptSummarization', async () => {
			const attemptSpy = jest.spyOn(summarizerService as any, 'attemptSummarization');

			attemptSpy
				.mockRejectedValueOnce(new Error('Primary failed'))
				.mockRejectedValueOnce(new Error('Fallback failed'));

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				'Fallback failed',
			);

			expect(attemptSpy).toHaveBeenCalledTimes(2);

			attemptSpy.mockRestore();
		});

		it('should skip fallback when FALLBACK_MODEL equals MODEL', async () => {
			const originalModel = (summarizerService as any).MODEL;
			const originalFallbackModel = (summarizerService as any).FALLBACK_MODEL;

			(summarizerService as any).MODEL = 'same-model';
			(summarizerService as any).FALLBACK_MODEL = 'same-model';

			const attemptSpy = jest.spyOn(summarizerService as any, 'attemptSummarization');
			attemptSpy.mockRejectedValueOnce(new Error('Model failed'));

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				'Model failed',
			);

			expect(attemptSpy).toHaveBeenCalledTimes(1);

			attemptSpy.mockRestore();

			(summarizerService as any).MODEL = originalModel;
			(summarizerService as any).FALLBACK_MODEL = originalFallbackModel;
		});

		it('should throw SUMMARIZATION_FAILED when lastError is falsy', async () => {
			const originalModel = (summarizerService as any).MODEL;
			const originalFallbackModel = (summarizerService as any).FALLBACK_MODEL;

			(summarizerService as any).MODEL = 'same-model';
			(summarizerService as any).FALLBACK_MODEL = 'same-model';

			const attemptSpy = jest.spyOn(summarizerService as any, 'attemptSummarization');
			attemptSpy.mockRejectedValueOnce(null);

			await expect(summarizerService.generateStorySummary('test content')).rejects.toThrow(
				AI_ERROR_MESSAGES.SUMMARIZATION_FAILED,
			);

			attemptSpy.mockRestore();

			(summarizerService as any).MODEL = originalModel;
			(summarizerService as any).FALLBACK_MODEL = originalFallbackModel;
		});
	});
});
