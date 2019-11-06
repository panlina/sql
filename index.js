var operator = require('./operator');
function generate(sql) {
	switch (sql.type) {
		case 'select':
			var select = `select ${sql.field.map(generate).join(',')}`;
			if (sql.from) {
				var from = generate(sql.from);
				if (sql.from.type == 'select')	// "select * from (a) a" is invalid
					from = `(${from})`;
				if (sql.from.alias)
					from += ` ${sql.from.alias}`;
				select += ` from ${from}`;
			}
			if (sql.where) {
				var where = generate(sql.where);
				if (sql.where.type == 'select')
					where = `(${where})`;
				select += ` where ${where}`;
			}
			if (sql.with)
				select = `with ${sql.with.name} as (${generate(sql.with.value)}) ${select}`;
			return select;
		case 'binary':
			var left = generate(sql.left);
			if ((sql.left.type == 'binary' || sql.left.type == 'unary') && operator[sql.left.operator] >= operator[sql.operator] || sql.left.type == 'select')
				left = `(${left})`;
			var right = generate(sql.right);
			if ((sql.right.type == 'binary' || sql.right.type == 'unary') && operator[sql.right.operator] >= operator[sql.operator] || sql.right.type == 'select')
				right = `(${right})`;
			return `${left}${sql.operator}${right}`;
		case 'unary':
			return `${sql.operator}(${generate(sql.operand)})`;
		case 'name':
			return sql.identifier;
		case 'literal':
			return JSON.stringify(sql.value);
	}
}
module.exports = generate;
