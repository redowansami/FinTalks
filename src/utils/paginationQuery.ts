import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export function buildCursorPaginationQuery<T extends ObjectLiteral>(
	queryBuilder: SelectQueryBuilder<T>,
	cursorField: string,
	cursorValue: string | undefined,
	limit: number,
	orderBy?: string,
): SelectQueryBuilder<T> {
	if (orderBy) {
		queryBuilder.orderBy(orderBy, 'ASC');
	}

	if (cursorValue) {
		queryBuilder.andWhere(`${cursorField} > :cursorValue`, { cursorValue });
	}

	return queryBuilder.addOrderBy(cursorField, 'ASC').limit(limit);
}
