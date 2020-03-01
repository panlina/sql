function selectize(sql) {
	if (sql.type != 'select' && sql.type != 'union')
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
				from: [],
				kind: 'scalar'
			};
	return sql;
}
module.exports = selectize;
