class Expression {
	constructor(type) {
		this.type = type;
	}
}

class Literal extends Expression {
	constructor(value) {
		super('literal');
		this.value = value;
	}
}

class Name extends Expression {
	constructor(identifier, qualifier) {
		super('name');
		this.identifier = identifier;
		this.qualifier = qualifier;
	}
}

class Operation extends Expression {
	constructor(operator, left, right) {
		super('operation');
		this.operator = operator;
		this.left = left;
		this.right = right;
	}
}

class Union extends Expression {
	constructor(left, right, all) {
		super('union');
		this.left = left;
		this.right = right;
		this.all = all;
	}
}

class Select extends Expression {
	constructor(argument) {
		super('select');
		this.with = argument.with;
		this.distinct = argument.distinct;
		this.field = argument.field;
		this.from = argument.from;
		this.where = argument.where;
		this.order = argument.order;
		this.direction = argument.direction;
		this.limit = argument.limit;
		this.offset = argument.offset;
	}
}

module.exports = Expression;
module.exports.Literal = Literal;
module.exports.Name = Name;
module.exports.Operation = Operation;
module.exports.Union = Union;
module.exports.Select = Select;
