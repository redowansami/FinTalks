import { transformToDTO } from './mapper';

interface PaginationResult<T> {
	list: T[];
	nextCursor: string | null;
}

export async function getPaginatedResults<
	TEntity,
	TResponse,
	TQueryParams extends { startAfter?: string; limit: number; orderBy?: string },
>(
	queryParams: TQueryParams,
	findPaginated: (params: TQueryParams & { limit: number }) => Promise<TEntity[]>,
	ResponseDTO: new () => TResponse,
	defaultOrderBy: string,
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
		const orderByField = queryParams.orderBy || defaultOrderBy;
		nextCursor = String(lastItem[orderByField as keyof TResponse]);
	}

	return { list, nextCursor };
}
