var transformerDates_1 = require("ts-transformer-dates");
const result = transformerDates_1.toDatesByArray({
    value: 'asdf',
    date: 1578799545000,
    anotherDate: '2020-01-12T03:25:45.000Z',
}, [["date"], ["anotherDate"]]);
export {};
