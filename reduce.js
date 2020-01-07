var traverse = require('./traverse');
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
		if (sql.from.with) substituteNameQualifier(sql.from.with, sql.from.alias, sql.from.from.alias);
		if (sql.from.where) substituteNameQualifier(sql.from.where, sql.from.alias, sql.from.from.alias);
		sql.from.field.forEach(field => substituteNameQualifier(field, sql.from.alias, sql.from.from.alias));
		return reduce(sql.from);
	}
	function substituteNameQualifier(sql, a, b) {
		for (var sql of traverse(sql))
			if (sql.type == 'name' && sql.qualifier == a)
				sql.qualifier = b;
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
		case 'call':
			sql.argument = sql.argument.map(reduce);
			break;
	}
	return sql;
}
module.exports = reduce;
