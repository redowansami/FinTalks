import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export const applyFuzzySearch = <T extends ObjectLiteral>(
	queryBuilder: SelectQueryBuilder<T>,
	searchFields: Record<string, string | undefined>,
): SelectQueryBuilder<T> => {
	const conditions: string[] = [];
	const parameters: Record<string, string> = {};
	let index = 0;

	Object.entries(searchFields).forEach(([field, value]) => {
		if (value && value.trim()) {
			const paramName = field.replace(/\./g, '_');
			const paramValue = value.trim();
			const uniqueParamName = `${paramName}_${index}`;

			conditions.push(
				`(${field} ILIKE :${uniqueParamName}_like OR similarity(${field}, :${uniqueParamName}_sim) > 0.3)`,
			);
			parameters[`${uniqueParamName}_like`] = `%${paramValue}%`;
			parameters[`${uniqueParamName}_sim`] = paramValue;
			index++;
		}
	});

	if (conditions.length > 0) {
		queryBuilder.andWhere(`(${conditions.join(' OR ')})`, parameters);
	}

	return queryBuilder;
};

export const applyDateRange = <T extends ObjectLiteral>(
	queryBuilder: SelectQueryBuilder<T>,
	dateField: string,
	startDate?: string,
	endDate?: string,
): SelectQueryBuilder<T> => {
	if (startDate) {
		const paramName = `${dateField.replace('.', '_')}_start`;
		queryBuilder.andWhere(`${dateField} >= :${paramName}`, {
			[paramName]: startDate,
		});
	}

	if (endDate) {
		const paramName = `${dateField.replace('.', '_')}_end`;
		queryBuilder.andWhere(`${dateField} <= :${paramName}`, {
			[paramName]: endDate,
		});
	}

	return queryBuilder;
};
