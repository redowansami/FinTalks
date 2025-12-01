import { plainToInstance } from 'class-transformer';

export const transformToDTO = <T>(dtoClass: new () => T, entity: unknown): T => {
	return plainToInstance(dtoClass, entity, {
		excludeExtraneousValues: true,
	});
};
