import { applyToDates } from '../lib/index';

const inSimple = {
	a: 12_345_000,
};

const expSimple = {
	a: new Date(12_345_000),
};

test('applyToDates simple', () => {
	expect(applyToDates(inSimple, [{ d: ['a'] }])).toStrictEqual(expSimple);
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

test('applyToDates nested', () => {
	expect(applyToDates(inNested, [{ d: ['a'], c: [['b', 1]] }, { d: ['c'] }])).toStrictEqual(expNested);
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

test('applyToDates arrays', () => {
	expect(applyToDates(inArray, [{ d: [], da: ['z'], c: [['b', 1, true]] }, { d: ['c'] }])).toStrictEqual(expArray);
});
