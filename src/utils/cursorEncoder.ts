export class CursorEncoder {
	static encode(id: string): string {
		return id.replace(/-/g, '');
	}

	static decode(cursor: string): string {
		return `${cursor.slice(0, 8)}-${cursor.slice(8, 12)}-${cursor.slice(12, 16)}-${cursor.slice(16, 20)}-${cursor.slice(20)}`;
	}
}
