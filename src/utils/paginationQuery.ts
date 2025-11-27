import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export function buildCursorPaginationQuery<T extends ObjectLiteral>(
	queryBuilder: SelectQueryBuilder<T>,
	cursorField: string,
	cursorValue: string | undefined,
	limit: number,
): SelectQueryBuilder<T> {
	if (cursorValue) {
		queryBuilder.andWhere(`${cursorField} > :cursorValue`, { cursorValue });
	}

	return queryBuilder.orderBy(cursorField, 'ASC').limit(limit);
}
