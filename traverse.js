function* traverse(sql) {
	switch (sql.type) {
		case 'select':
			if (sql.with) {
				yield [sql.with.value, new Node(sql, 'with.value'),];
				yield* traverse(sql.with.value);
			}
			if (sql.from) {
				yield [sql.from, new Node(sql, 'from'),];
				yield* traverse(sql.from);
			}
			if (sql.where) {
				yield [sql.where, new Node(sql, 'where'),];
				yield* traverse(sql.where);
			}
			for (var i in sql.field) {
				yield [sql.field[i], new Node(sql, `field[${i}]`)];
				yield* traverse(sql.field[i]);
			}
			break;
		case 'operation':
			if (sql.left) {
				yield [sql.left, new Node(sql, 'left'),];
				yield* traverse(sql.left);
			}
			if (sql.right) {
				yield [sql.right, new Node(sql, 'right'),];
				yield* traverse(sql.right);
			}
			break;
	}
}
class Node {
	constructor(expression, property) {
		this.expression = expression;
		this.property = property;
	}
	get value() {
		return require('lodash.get')(this.expression, this.property);
	}
	set value(value) {
		return require('lodash.set')(this.expression, this.property, value);
	}
}
module.exports = traverse;
