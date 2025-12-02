import { transformToDTO } from './mapper';

interface OffsetPaginationResult<T> {
	items: T[];
	page: number;
	nextPage: number | null;
	total?: number;
}

export async function getOffsetPaginatedResults<
	TEntity,
	TResponse,
	TQueryParams extends { page: number; limit: number; orderBy?: string },
>(
	queryParams: TQueryParams,
	findPaginated: (params: TQueryParams & { limit: number }) => Promise<TEntity[]>,
	ResponseDTO: new () => TResponse,
): Promise<OffsetPaginationResult<TResponse>> {
	const entities = await findPaginated({
		...queryParams,
		limit: Number(queryParams.limit) + 1,
	});

	const hasNextPage = entities.length > Number(queryParams.limit);
	const items = entities
		.slice(0, Number(queryParams.limit))
		.map((entity) => transformToDTO(ResponseDTO, entity));

	return {
		items,
		page: queryParams.page,
		nextPage: hasNextPage ? Number(queryParams.page) + 1 : null,
	};
}
