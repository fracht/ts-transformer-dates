type Converter = (v: string | number) => Date;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare function toDates<T extends object>(value: any, converter?: Converter): T;

interface Type {
	d?: string[];
	da?: string[];
	c?: [string, number, boolean?][];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyToDates(value: any, types: Type[], index = 0) {
	const { d, da, c } = types[index];

	if (d) {
		for (const dateField of d) {
			const dateFieldValue = value[dateField];
			if (undefined !== dateFieldValue && null !== dateFieldValue) {
				value[dateField] = new Date(dateFieldValue);
			}
		}
	}

	if (da) {
		for (const arrayField of da) {
			const dateArray = value[arrayField];
			if (undefined !== dateArray && null !== dateArray) {
				if (Array.isArray(dateArray)) {
					for (const [index_, element] of dateArray.entries()) {
						if (undefined !== element && null !== element) {
							dateArray[index_] = new Date(element);
						}
					}
				} else {
					throw new TypeError(`Array is expected in field ${arrayField}`);
				}
			}
		}
	}

	// eslint-disable-next-line unicorn/no-array-for-each
	c?.forEach(([fieldName, typeIndex, isArray]: [string, number, boolean?]) => {
		const fieldValue = value[fieldName];
		if (undefined !== fieldValue && null !== fieldValue) {
			if (isArray) {
				if (Array.isArray(fieldValue)) {
					for (const element of fieldValue) {
						applyToDates(element, types, typeIndex);
					}
				} else {
					throw new TypeError(`Array is expected in field ${fieldName}`);
				}
			} else {
				applyToDates(fieldValue, types, typeIndex);
			}
		}
	});

	return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toDatesByArray(value: any, paths: string[][], converter: Converter = (v) => new Date(v)): any {
	for (const path of paths) {
		convertPath(value, path, converter);
	}
	return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertPath(contextValue: any, path: string[], converter: Converter) {
	let index = 0;
	// eslint-disable-next-line unicorn/no-null
	let parent = null;
	let object = contextValue;

	while (object && !Array.isArray(object) && index < path.length) {
		parent = object;
		object = object[path[index++]];
	}

	if (object || typeof object === 'string') {
		if (Array.isArray(object)) {
			const subPath = path.slice(index);
			for (const [index, value] of object.entries()) {
				object[index] = convertPath(value, subPath, converter);
			}
		} else if (index === path.length) {
			// eslint-disable-next-line unicorn/no-null
			const converted = object ? converter(object) : null;
			if (parent) {
				parent[path[index - 1]] = converted;
			} else {
				return converted;
			}
		}
	}
	return contextValue;
}
