import { transformToDTO } from './mapper';

interface OffsetPaginationResult<T> {
	list: T[];
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
	findPaginated: (params: TQueryParams) => Promise<TEntity[]>,
	ResponseDTO: new () => TResponse,
): Promise<OffsetPaginationResult<TResponse>> {
	const entities = await findPaginated(queryParams);

	const hasNextPage = entities.length > Number(queryParams.limit);
	const list = entities
		.slice(0, Number(queryParams.limit))
		.map((entity) => transformToDTO(ResponseDTO, entity));

	return {
		list,
		page: queryParams.page,
		nextPage: hasNextPage ? Number(queryParams.page) + 1 : null,
	};
}
