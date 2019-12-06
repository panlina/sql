function reduce(sql) {
	if (
		sql.type == 'select' &&
		sql.from &&
		sql.from.type == 'select' &&
		!(
			sql.with && sql.from.with ||
			sql.where && sql.from.where
		)
	) {
		sql.from.with = sql.with || sql.from.with;
		sql.from.where = sql.where || sql.from.where;
		sql.from.field = sql.field[0].identifier != '*' ? sql.field : sql.from.field
		return reduce(sql.from);
	}
	switch (sql.type) {
		case 'select':
			if (sql.with)
				sql.with.value = reduce(sql.with.value);
			if (sql.from)
				sql.from = reduce(sql.from);
			if (sql.where)
				sql.where = reduce(sql.where);
			sql.field = sql.field.map(reduce);
			break;
		case 'operation':
			if (sql.left)
				sql.left = reduce(sql.left);
			if (sql.right)
				sql.right = reduce(sql.right);
			break;
	}
	return sql;
}
module.exports = reduce;
