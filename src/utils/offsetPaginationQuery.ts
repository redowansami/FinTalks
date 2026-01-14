import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export function buildOffsetPaginationQuery<T extends ObjectLiteral>(
	queryBuilder: SelectQueryBuilder<T>,
	page: number,
	limit: number,
	orderBy?: string,
	orderByField?: string,
): SelectQueryBuilder<T> {
	const offset = (page - 1) * limit;
	const primaryOrderField = orderBy || orderByField;

	if (primaryOrderField) {
		queryBuilder.orderBy(primaryOrderField, 'ASC');
	}

	return queryBuilder.skip(offset).take(limit + 1);
}
