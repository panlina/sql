function tabulize(sql) {
	if (sql.type != 'select' && sql.type != 'union')
		if (sql.type != 'name' || sql.kind == 'scalar')
			sql = {
				type: 'select',
				field: [sql],
				from: []
			};
	return sql;
}
module.exports = tabulize;
