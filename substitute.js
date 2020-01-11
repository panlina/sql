function substitute(sql, f) {
	return substitute(sql);
	function substitute(sql) {
		sql = f(sql);
		switch (sql.type) {
			case 'select':
				if (sql.with)
					sql.with.value = substitute(sql.with.value);
				sql.from = sql.from.map(substitute);
				if (sql.where)
					sql.where = substitute(sql.where);
				sql.field = sql.field.map(substitute);
				break;
			case 'operation':
				if (sql.left)
					sql.left = substitute(sql.left);
				if (sql.right)
					sql.right = substitute(sql.right);
				break;
			case 'call':
				sql.argument = sql.argument.map(substitute);
				break;
		}
		return sql;
	}
}
module.exports = substitute;
