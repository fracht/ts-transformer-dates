import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import * as ts3 from 'typescript3';
import * as ts4 from 'typescript4';
import * as ts5 from 'typescript5';
import transformer from '../lib/transformer';

const fixtures = {
	simple: {
		in: require.resolve('./fixtures/simple.ts'),
		out: readFileSync(require.resolve('./fixtures/simple.result.js')),
	},
};

const normalizeOutput = (output: string | Buffer) => output.toString().replace(/\r\n/g, '\n').trim();

// Check with TS3
test.skip('typescript 3.x.x', () => {
	const program = ts3.createProgram([fixtures.simple.in], {
		noEmitOnError: true,
		noImplicitAny: true,
		target: ts3.ScriptTarget.ES2017,
		module: ts3.ModuleKind.ES2015,
		skipLibCheck: true,
		skipDefaultLibCheck: true,
		checkJs: false,
	});

	const compiledFiles: Record<string, string> = {};

	const result = program.emit(
		undefined,
		(fileName, text) => (compiledFiles[basename(fileName)] = normalizeOutput(text)),
	);

	const allDiagnostics = [...ts3.getPreEmitDiagnostics(program), ...result.diagnostics];

	expect(allDiagnostics.length).toBe(0);
	expect(result.emitSkipped).toBe(false);
	expect(compiledFiles).toStrictEqual({
		'simple.js': normalizeOutput(fixtures.simple.out),
	});
});

// Check with TS4
test.skip('typescript 4.x.x', () => {
	const program = ts4.createProgram([fixtures.simple.in], {
		noEmitOnError: true,
		noImplicitAny: true,
		target: ts4.ScriptTarget.ES2017,
		module: ts4.ModuleKind.ES2015,
		moduleResolution: ts4.ModuleResolutionKind.NodeJs,
		skipLibCheck: true,
		skipDefaultLibCheck: true,
		checkJs: false,
	});

	const compiledFiles: Record<string, string> = {};

	const result = program.emit(
		undefined,
		(fileName, text) => (compiledFiles[basename(fileName)] = normalizeOutput(text)),
		undefined,
		undefined,
		{
			before: [
				transformer(program as unknown as ts5.Program) as unknown as ts4.TransformerFactory<ts4.SourceFile>,
			],
		},
	);

	expect(result.diagnostics).toStrictEqual([]);
	expect(result.emitSkipped).toBe(false);
	expect(compiledFiles).toStrictEqual({
		'simple.js': normalizeOutput(fixtures.simple.out),
	});
});

test('typescript 5.x.x', () => {
	const program = ts5.createProgram([fixtures.simple.in], {
		noEmitOnError: true,
		noImplicitAny: true,
		target: ts5.ScriptTarget.ES2017,
		module: ts5.ModuleKind.ES2015,
		moduleResolution: ts5.ModuleResolutionKind.Node10,
		skipLibCheck: true,
		skipDefaultLibCheck: true,
		checkJs: false,
	});

	const compiledFiles: Record<string, string> = {};

	const result = program.emit(
		undefined,
		(fileName, text) => (compiledFiles[basename(fileName)] = normalizeOutput(text)),
		undefined,
		undefined,
		{
			before: [transformer(program)],
		},
	);

	expect(result.diagnostics).toStrictEqual([]);
	expect(result.emitSkipped).toBe(false);
	expect(compiledFiles).toStrictEqual({
		'simple.js': normalizeOutput(fixtures.simple.out),
	});
});
