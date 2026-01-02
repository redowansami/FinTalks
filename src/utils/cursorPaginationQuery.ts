import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { decodeCursor } from './cursorPaginationHelper';

export function buildCursorPaginationQuery<T extends ObjectLiteral>(
	queryBuilder: SelectQueryBuilder<T>,
	idField: string,
	cursorValue: string | undefined,
	limit: number,
	orderBy?: string,
): SelectQueryBuilder<T> {
	const primaryOrderField = orderBy || 'createdAt';
	const secondaryOrderField = idField;

	queryBuilder.orderBy(primaryOrderField, 'DESC');
	queryBuilder.addOrderBy(secondaryOrderField, 'DESC');

	if (cursorValue) {
		const decodedCursor = decodeCursor(cursorValue);
		if (decodedCursor) {
			const { timestamp, id } = decodedCursor;
			queryBuilder.andWhere(
				`(${primaryOrderField} < :timestamp OR (${primaryOrderField} = :timestamp AND ${secondaryOrderField} < :id))`,
				{
					timestamp: new Date(timestamp),
					id,
				},
			);
		}
	}

	return queryBuilder.take(limit);
}
