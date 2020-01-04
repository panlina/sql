var traverse = require('./traverse');
function reduce(sql) {
	if (
		sql.type == 'select' &&
		sql.from[0] &&
		sql.from[0].type == 'select' &&
		!(
			sql.with && sql.from[0].with ||
			sql.where && sql.from[0].where
		)
	) {
		sql.from[0].with = sql.with || sql.from[0].with;
		sql.from[0].where = sql.where || sql.from[0].where;
		sql.from[0].field = sql.field[0].identifier != '*' ? sql.field : sql.from[0].field
		if (sql.from[0].with) substituteNameQualifier(sql.from[0].with, sql.from[0].alias, sql.from[0].from[0].alias);
		if (sql.from[0].where) substituteNameQualifier(sql.from[0].where, sql.from[0].alias, sql.from[0].from[0].alias);
		sql.from[0].field.forEach(field => substituteNameQualifier(field, sql.from[0].alias, sql.from[0].from[0].alias));
		return reduce(sql.from[0]);
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
			sql.from = sql.from.map(reduce);
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
