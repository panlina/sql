var operator = require('./operator');
function generate(sql) {
	switch (sql.type) {
		case 'select':
			var field = sql.field.map(sql => {
				var s = generate(sql);
				if (sql.type == 'select')
					s = `(${s})`;
				if (sql.as)
					s += ` ${sql.as}`;
				return s;
			});
			var select = `select ${field.join(',')}`;
			if (sql.from.length) {
				var from = sql.from.map(sql => {
					var s = generate(sql);
					if (sql.type == 'select')
						s = `(${s})`;
					if (sql.alias)
						s += ` ${sql.alias}`;
					return s;
				});
				select += ` from ${from.join(',')}`;
			}
			if (sql.where) {
				var where = generate(sql.where);
				if (sql.where.type == 'select')
					where = `(${where})`;
				select += ` where ${where}`;
			}
			if (sql.group) {
				var group = generate(sql.group);
				if (sql.group.type == 'select')
					group = `(${group})`;
				select += ` group by ${group}`;
			}
			if (sql.having) {
				var having = generate(sql.having);
				if (sql.having.type == 'select')
					having = `(${having})`;
				select += ` having by ${having}`;
			}
			if (sql.order) {
				var order = generate(sql.order);
				if (sql.order.type == 'select')
					order = `(${order})`;
				select += ` order by ${order}`;
			}
			if (sql.limit) {
				var limit = generate(sql.limit);
				if (sql.limit.type == 'select')
					limit = `(${limit})`;
				select += ` limit ${limit}`;
			}
			if (sql.offset) {
				var offset = generate(sql.offset);
				if (sql.offset.type == 'select')
					offset = `(${offset})`;
				select += ` offset ${offset}`;
			}
			if (sql.with)
				select = `with ${sql.with.name} as (${generate(sql.with.value)}) ${select}`;
			return select;
		case 'union':
			var left = generate(sql.left);
			var right = generate(sql.right);
			if (sql.right.type == 'union')
				right = `(${right})`;
			return `${left} union ${right}`;
		case 'operation':
			if (sql.left) {
				var left = generate(sql.left);
				if (sql.left.type == 'operation' && operatorPrecedence(sql.left) > operatorPrecedence(sql) || sql.left.type == 'select')
					left = `(${left})`;
			}
			if (sql.right) {
				var right = generate(sql.right);
				if (sql.right.type == 'operation' && operatorPrecedence(sql.right) >= operatorPrecedence(sql) || sql.right.type == 'select')
					right = `(${right})`;
			}
			return `${left || ''}${sql.operator}${right || ''}`;
			function operatorPrecedence(expression) {
				return operator.resolve(
					expression.operator,
					!!expression.left,
					!!expression.right
				).precedence;
			}
		case 'call':
			return `${generate(sql.callee)}(${sql.argument.map(argument => {
				if (argument.type == 'select')
					argument = `(${argument})`;
				return generate(argument);
			}).join(',')})`;
		case 'name':
			var name = sql.identifier;
			if (sql.qualifier)
				name = `${sql.qualifier}.${name}`;
			return name;
		case 'literal':
			return JSON.stringify(sql.value);
	}
}
module.exports = generate;
