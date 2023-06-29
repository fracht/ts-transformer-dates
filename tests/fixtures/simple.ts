import { toDates } from '../../lib';

interface Result {
	value: string;
	date: Date;
	anotherDate: Date;
}

const result = toDates<Result>({
	value: 'asdf',
	date: 1_578_799_545_000,
	anotherDate: '2020-01-12T03:25:45.000Z',
});
