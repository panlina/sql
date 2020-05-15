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

class Select extends Expression {
	constructor(field, from, where) {
		super('select');
		this.field = field;
		this.from = from;
		this.where = where;
	}
}

module.exports = Expression;
module.exports.Literal = Literal;
module.exports.Name = Name;
module.exports.Operation = Operation;
module.exports.Select = Select;
