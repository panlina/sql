var traverse = require('./traverse');
function reduceGroup(sql) {
	var select = sql;
	var group = sql.from[0];
	group.field = select.field;
	group.as = select.as;
	return group;
	function substituteKeyValue(sql, a, key, value) {
		for (var sql of traverse(sql))
			if (sql.type == 'name' && sql.qualifier == a)
				sql.qualifier = b;
	}
}
module.exports = reduceGroup;
