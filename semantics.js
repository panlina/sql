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
	ExpressionOr_or: binary,
	ExpressionSelectField: (field, as) => as.sourceString ? Object.assign(field.parse(), { as: as.children[0].parse() }) : field.parse(),
	ExpressionSelectTable: (table, alias) => alias.sourceString ? Object.assign(table.parse(), { alias: alias.children[0].parse() }) : table.parse(),
	ExpressionSelect: (_with, withName, _as, withValue, _select, distinct, field, _from, from, _where, where, _order, _by, order, direction, _limit, limit, _offset, offset) => new Expression.Select({
		with: _with.children[0] ? { name: withName.children[0].parse(), value: withValue.children[0].parse() } : null,
		distinct: !!distinct.sourceString,
		field: field.asIteration().parse(),
		from: _from.children[0] ? from.children[0].asIteration().parse() : [],
		where: _where.children[0] ? where.children[0].parse() : null,
		order: _order.children[0] ? order.children[0].parse() : null,
		direction: { 'asc': false, 'desc': true }[direction.children[0] && direction.children[0].sourceString],
		limit: _limit.children[0] ? limit.children[0].parse() : null,
		offset: _offset.children[0] ? offset.children[0].parse() : null
	})
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
