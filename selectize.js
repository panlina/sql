function selectize(sql) {
	if (sql.type != 'select')
		if (sql.type == 'name' && sql.kind != 'scalar')
			sql = {
				type: 'select',
				field: [{ type: 'name', identifier: '*' }],
				from: [sql]
			};
		else
			sql = {
				type: 'select',
				field: [sql],
				from: []
			};
	return sql;
}
module.exports = selectize;
