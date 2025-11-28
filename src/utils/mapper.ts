import { plainToInstance } from 'class-transformer';
import { ZodType } from 'zod';

export const transformToDTO = <T>(dtoClass: new () => T, entity: unknown): T => {
	return plainToInstance(dtoClass, entity, {
		excludeExtraneousValues: true,
	});
};

export const parseWithSchema = <T>(schema: ZodType, data: unknown): T => {
	return schema.parse(data) as T;
};
