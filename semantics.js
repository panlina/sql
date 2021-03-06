var grammar = require('./grammar');
var Expression = require('./Expression');
var semantics = grammar.createSemantics().addOperation('parse', {
	number: (integer, dot, decimal) => +(integer.sourceString + dot.sourceString),
	string: (open, x, close) => x.children.map(char => char.parse()).join(''),
	char_literal: x => x.sourceString,
	char_escaped: (backslash, x) => escape[x.sourceString],
	identifier_literal: (_, x) => x.sourceString,
	identifier_escaped: x => x.parse(),
	ExpressionName: (qualifier, dot, identifier) => new Expression.Name(identifier.parse(), qualifier.children[0] ? qualifier.children[0].parse() : null),
	ExpressionNumber: number => new Expression.Literal(number.parse()),
	ExpressionString: string => new Expression.Literal(string.parse()),
	ExpressionAtom_parentheses: (open, expression, close) => expression.parse(),
	ExpressionAtom_placeholder: (open, name, close) => new Expression.Placeholder(name.parse()),
	ExpressionCall_call: (expression, open, argument, close) => new Expression.Call(expression.parse(), argument.asIteration().parse()),
	ExpressionAdd_add: binary,
	ExpressionMultiply_multiply: binary,
	ExpressionAddUnary_add: unary,
	ExpressionRelation_relation: binary,
	ExpressionNot_not: unary,
	ExpressionAnd_and: binary,
	ExpressionOr_or: binary,
	ExpressionUnion_union: (left, _union, _all, right) => new Expression.Union(
		left.parse(),
		right.parse(),
		!!_all.children[0]
	),
	ExpressionSelectField_expression: (field, as) => as.sourceString ? Object.assign(field.parse(), { as: as.children[0].parse() }) : field.parse(),
	ExpressionSelectField_star: (qualifier, dot, star) => new Expression.Name('*', qualifier.children[0] ? qualifier.children[0].parse() : null),
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
