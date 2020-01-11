var substitute = require('./substitute');
function decorrelate(sql) {
	liftSelect(sql);
}
function eliminateWith(sql) {
	var value = sql.with.value;
	if (value.with) {
		value.from[0].with = value.with;
		value = value.from[0];
		eliminateWith(value);
	}
	sql.where = substituteRowTableField(sql.where, sql.with.name, value.from[0].alias);
	sql.from.push(...value.from);
	if (value.where)
		sql.where = sql.where ? {
			type: 'operation',
			operator: '&&',
			left: sql.where,
			right: value.where
		} : value.where;
	delete sql.with;
}
function liftSelect(sql) {
	var [field] = sql.field;
	if (field.with) {
		field.from[0].with = field.with;
		field = field.from[0];
		eliminateWith(field);
	}
	sql.from.push(...field.from);
	if (field.where)
		sql.where = sql.where ? {
			type: 'operation',
			operator: '&&',
			left: sql.where,
			right: field.where
		} : field.where;
	sql.field[0] = field.field[0];
}
function substituteRowTableField(sql, a, b) {
	return substitute(sql, sql => {
		if (sql.type == 'select' && sql.from[0].identifier == a)
			sql = {
				type: 'name',
				qualifier: b,
				identifier: sql.field[0].identifier
			};
		return sql;
	});
}
module.exports = decorrelate;
