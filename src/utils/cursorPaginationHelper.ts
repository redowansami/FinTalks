import { StoryResponseDTO } from 'dtos/storyDTO';
import { transformToDTO } from './mapper';

interface PaginationResult<T> {
	list: T[];
	nextCursor: string | null;
}

export interface CursorData {
	timestamp: string;
	id: string;
}

export function encodeCursor(timestamp: Date, id: string): string {
	const cursorData: CursorData = {
		timestamp: timestamp.toISOString(),
		id,
	};
	const jsonString = JSON.stringify(cursorData);
	return Buffer.from(jsonString).toString('base64');
}

export function decodeCursor(cursor: string): CursorData | null {
	try {
		const jsonString = Buffer.from(cursor, 'base64').toString('utf-8');
		return JSON.parse(jsonString) as CursorData;
	} catch {
		return null;
	}
}

export async function getPaginatedResults<
	TEntity,
	TResponse,
	TQueryParams extends { startAfter?: string; limit: number; orderBy?: string },
>(
	queryParams: TQueryParams,
	findPaginated: (params: TQueryParams & { limit: number }) => Promise<TEntity[]>,
	ResponseDTO: new () => TResponse,
): Promise<PaginationResult<TResponse>> {
	const cursor = queryParams.startAfter;

	const entities = await findPaginated({
		...queryParams,
		startAfter: cursor,
		limit: Number(queryParams.limit) + 1,
	});

	const hasMore = entities.length > Number(queryParams.limit);
	const list = entities
		.slice(0, Number(queryParams.limit))
		.map((entity) => transformToDTO(ResponseDTO, entity));

	let nextCursor: string | null = null;
	if (hasMore) {
		const lastItem = list[list.length - 1];
		const createdAt = (lastItem as StoryResponseDTO).createdAt;
		const id = (lastItem as StoryResponseDTO).storyId || (lastItem as any).id;

		if (createdAt && id) {
			nextCursor = encodeCursor(new Date(createdAt), String(id));
		}
	}

	return { list, nextCursor };
}
