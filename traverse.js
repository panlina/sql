function* traverse(sql) {
	yield sql;
	switch (sql.type) {
		case 'select':
			if (sql.with)
				yield* traverse(sql.with.value);
			if (sql.from)
				yield* traverse(sql.from);
			if (sql.where)
				yield* traverse(sql.where);
			for (var field of sql.field)
				yield* traverse(field);
			break;
		case 'operation':
			if (sql.left)
				yield* traverse(sql.left);
			if (sql.right)
				yield* traverse(sql.right);
			break;
		case 'call':
			for (var argument of sql.argument)
				yield* traverse(argument);
			break;
	}
}
module.exports = traverse;
