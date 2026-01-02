import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export function buildCursorPaginationQuery<T extends ObjectLiteral>(
	queryBuilder: SelectQueryBuilder<T>,
	cursorField: string,
	cursorValue: string | undefined,
	limit: number,
	orderBy?: string,
): SelectQueryBuilder<T> {
	const primaryOrderField = orderBy || cursorField;

	queryBuilder.orderBy(primaryOrderField, 'ASC');

	if (cursorValue) {
		queryBuilder.andWhere(`${primaryOrderField} > :cursorValue`, { cursorValue });
	}

	if (orderBy && orderBy !== cursorField) {
		queryBuilder.addOrderBy(cursorField, 'ASC');
	}

	return queryBuilder.take(limit);
}
