import * as path from 'node:path';
import * as ts from 'typescript';

const indexJs = path.join(__dirname, 'index.js');
const indexTs = path.join(__dirname, 'index.d.ts');

const isToDatesImportExpression = (node: ts.Node): node is ts.ImportDeclaration => {
	if (!ts.isImportDeclaration(node)) {
		return false;
	}
	const module = (node.moduleSpecifier as ts.StringLiteral).text;
	try {
		const modulePath = module.startsWith('.')
			? require.resolve(path.resolve(path.dirname(node.getSourceFile().fileName), module))
			: require.resolve(module);
		return indexJs === modulePath;
	} catch {
		return false;
	}
};

const isToDatesCallExpression = (node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression => {
	if (!ts.isCallExpression(node)) {
		return false;
	}

	const signature = typeChecker.getResolvedSignature(node);
	if (typeof signature === 'undefined') {
		return false;
	}

	const { declaration } = signature;

	return (
		!!declaration &&
		!ts.isJSDocSignature(declaration) &&
		path.join(declaration.getSourceFile().fileName) === indexTs &&
		!!declaration.name &&
		declaration.name.getText() === 'toDates'
	);
};

function unbox(typeNode: ts.TypeNode) {
	while (ts.isArrayTypeNode(typeNode)) {
		typeNode = (typeNode as ts.ArrayTypeNode).elementType;
	}
	return typeNode;
}

function convertDates(
	type: ts.Type,
	typeChecker: ts.TypeChecker,
	prefix: ts.StringLiteral[],
	node: ts.Node,
): ts.ArrayLiteralExpression[] {
	const properties = typeChecker.getPropertiesOfType(type);
	const getTypeOfProperty = (property: ts.Symbol) => {
		const propertyType = unbox((property.valueDeclaration as ts.PropertyDeclaration)?.type as ts.TypeNode);
		return typeChecker.getTypeFromTypeNode(propertyType).getNonNullableType();
	};

	const converted: ts.ArrayLiteralExpression[] = [];
	for (const property of properties) {
		const propertyType = getTypeOfProperty(property);

		if (typeChecker.typeToString(propertyType) === 'Date') {
			converted.push(
				ts.factory.createArrayLiteralExpression([
					...prefix,
					ts.factory.createStringLiteral(property.getName()),
				]),
			);
		}

		if (propertyType.isClassOrInterface()) {
			converted.push(
				...convertDates(
					propertyType,
					typeChecker,
					[...prefix, ts.factory.createStringLiteral(property.getName())],
					node,
				),
			);
		}
	}

	return converted;
}

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
	const typeChecker = program.getTypeChecker();
	const transformerDates = ts.factory.createUniqueName('transformerDates');
	const toDatesByArray = ts.factory.createIdentifier('toDatesByArray');

	return function transformerFactory(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
		const visitor: ts.Visitor = (node) => {
			if (isToDatesImportExpression(node)) {
				const importNode = ts.factory.createVariableStatement(
					undefined,
					ts.factory.createVariableDeclarationList([
						ts.factory.createVariableDeclaration(
							transformerDates,
							undefined,
							undefined,
							ts.factory.createCallExpression(ts.factory.createIdentifier('require'), undefined, [
								ts.factory.createStringLiteral('ts-transformer-dates'),
							]),
						),
					]),
				);
				return importNode;
			}

			if (isToDatesCallExpression(node, typeChecker) && node.typeArguments) {
				const type = typeChecker.getTypeFromTypeNode(unbox(node.typeArguments[0]));
				const toDatesByArrayArguments = [
					node.arguments[0],
					ts.factory.createArrayLiteralExpression(convertDates(type, typeChecker, [], node)),
				];
				if (node.arguments.length > 1) {
					toDatesByArrayArguments.push(node.arguments[1]);
				}
				return ts.factory.createCallExpression(
					ts.factory.createPropertyAccessExpression(transformerDates, toDatesByArray),
					undefined,
					toDatesByArrayArguments,
				);
			}

			return ts.visitEachChild(node, (child) => visitor(child), context);
		};

		return function transform(sourceFile: ts.SourceFile) {
			return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
		};
	};
}
