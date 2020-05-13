var grammar = require('./grammar');
var Expression = require('./Expression');
var semantics = grammar.createSemantics().addOperation('parse', {
	number: (integer, dot, decimal) => new Expression.Literal(+(integer.sourceString + dot.sourceString)),
	string: (open, x, close) => new Expression.Literal(x.children.map(char => char.parse()).join('')),
	char_literal: x => x.sourceString,
	char_escaped: (backslash, x) => escape[x.sourceString],
	identifier: (_, x) => x.sourceString,
	ExpressionName: (qualifier, dot, identifier) => new Expression.Name(identifier.parse(), qualifier.children[0] ? qualifier.children[0].parse() : null),
	ExpressionAtom_parentheses: (open, expression, close) => expression.parse(),
	ExpressionAdd_add: binary,
	ExpressionMultiply_multiply: binary,
	ExpressionAddUnary_add: unary,
	ExpressionRelation_relation: binary,
	ExpressionNot_not: unary,
	ExpressionAnd_and: binary,
	ExpressionOr_or: binary
});
function binary(left, operator, right) {
	return new Expression.Operation(
		operator.sourceString,
		left.parse(),
		right.parse()
	);
}
function unary(operator, operand) {
	if (operator.isTerminal())
		return new Expression.Operation(
			operator.sourceString,
			undefined,
			operand.parse()
		);
	else {
		[operator, operand] = [operand, operator];
		return new Expression.Operation(
			operator.sourceString,
			operand.parse(),
			undefined
		);
	}
}
var escape = {
	'"': '"',
	'\\': '\\',
	b: '\b',
	f: '\f',
	n: '\n',
	r: '\r',
	t: '\t',
	v: '\v'
};
module.exports = semantics;
