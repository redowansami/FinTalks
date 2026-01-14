import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export const applyFuzzySearch = <T extends ObjectLiteral>(
	queryBuilder: SelectQueryBuilder<T>,
	searchFields: Record<string, string | undefined>,
): SelectQueryBuilder<T> => {
	const conditions: string[] = [];
	const parameters: Record<string, string> = {};

	Object.entries(searchFields).forEach(([field, value]) => {
		if (value && value.trim()) {
			const paramValue = value.trim();

			conditions.push(`${field} ILIKE :${field}`);
			parameters[field] = `%${paramValue}%`;
		}
	});

	if (conditions.length > 0) {
		queryBuilder.andWhere(`(${conditions.join(' OR ')})`, parameters);
	}

	return queryBuilder;
};
