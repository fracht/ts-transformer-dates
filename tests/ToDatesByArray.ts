import { toDatesByArray } from '../lib/index';

const inSimple = {
	a: 12_345_000,
};

const expSimple = {
	a: new Date(12_345_000),
};

test('toDatesByArray simple', () => {
	expect(toDatesByArray(inSimple, [['a']])).toStrictEqual(expSimple);
});

const inNested = {
	a: 12_345_000,
	b: {
		c: 54_321_000,
	},
	z: 12_345_000,
};

const expNested = {
	a: new Date(12_345_000),
	b: {
		c: new Date(54_321_000),
	},
	z: 12_345_000,
};

test('toDatesByArray nested', () => {
	expect(toDatesByArray(inNested, [['a'], ['b', 'c']])).toStrictEqual(expNested);
});

const inArray = {
	a: 12_345_000,
	b: [{ c: 54_321_000 }, { c: 12_345_000 }],
	z: [12_345_000, 54_321_000],
};

const expArray = {
	a: 12_345_000,
	b: [{ c: new Date(54_321_000) }, { c: new Date(12_345_000) }],
	z: [new Date(12_345_000), new Date(54_321_000)],
};

test('toDatesByArray arrays', () => {
	expect(toDatesByArray(inArray, [['b', 'c'], ['z']])).toStrictEqual(expArray);
});
