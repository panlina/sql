function* traverse(sql) {
	yield sql;
	switch (sql.type) {
		case 'select':
			if (sql.with)
				yield* traverse(sql.with.value);
			for (var from of sql.from)
				yield* traverse(from);
			if (sql.where)
				yield* traverse(sql.where);
			if (sql.limit)
				yield* traverse(sql.limit);
			if (sql.offset)
				yield* traverse(sql.offset);
			if (sql.order)
				yield* traverse(sql.order);
			for (var field of sql.field)
				yield* traverse(field);
			break;
		case 'union':
			if (sql.left)
				yield* traverse(sql.left);
			if (sql.right)
				yield* traverse(sql.right);
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
