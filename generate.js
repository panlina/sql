var operator = require('./operator');
function generate(sql) {
	switch (sql.type) {
		case 'select':
			var field = sql.field.map(field => {
				var s = generate(field);
				if (field.type == 'select' || field.type == 'union')
					s = `(${s})`;
				if (field.as != undefined)
					s += ` ${identifier(field.as)}`;
				return s;
			});
			var select = field.join(',');
			if (sql.distinct)
				select = `distinct ${select}`;
			var select = `select ${select}`;
			if (sql.from.length) {
				var from = sql.from.map(from => {
					var s = generate(from);
					if (from.type == 'select' || from.type == 'union')
						s = `(${s})`;
					if (from.alias)
						s += ` ${identifier(from.alias)}`;
					return s;
				});
				select += ` from ${from.join(',')}`;
			}
			if (sql.where) {
				var where = generate(sql.where);
				if (sql.where.type == 'select' || sql.where.type == 'union')
					where = `(${where})`;
				select += ` where ${where}`;
			}
			if (sql.order) {
				var order = generate(sql.order);
				if (sql.order.type == 'select' || sql.order.type == 'union')
					order = `(${order})`;
				select += ` order by ${order}`;
				if (sql.direction != undefined)
					select += ` ${{ false: "asc", true: "desc" }[sql.direction]}`;
			}
			if (sql.limit) {
				var limit = generate(sql.limit);
				if (sql.limit.type == 'select' || sql.limit.type == 'union')
					limit = `(${limit})`;
				select += ` limit ${limit}`;
			}
			if (sql.offset) {
				var offset = generate(sql.offset);
				if (sql.offset.type == 'select' || sql.offset.type == 'union')
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
			var op = sql.all ? 'union all' : 'union';
			return `${left} ${op} ${right}`;
		case 'operation':
			if (sql.left) {
				var left = generate(sql.left);
				if (sql.left.type == 'operation' && operatorPrecedence(sql.left) > operatorPrecedence(sql) || sql.left.type == 'select' || sql.left.type == 'union')
					left = `(${left})`;
			}
			if (sql.right) {
				var right = generate(sql.right);
				if (sql.right.type == 'operation' && operatorPrecedence(sql.right) >= operatorPrecedence(sql) || sql.right.type == 'select' || sql.right.type == 'union')
					right = `(${right})`;
			}
			var op = sql.operator;
			if (op == 'in')
				op = ` ${op} `;
			return `${left || ''}${op}${right || ''}`;
			function operatorPrecedence(expression) {
				return operator.resolve(
					expression.operator,
					!!expression.left,
					!!expression.right
				).precedence;
			}
		case 'call':
			return `${generate(sql.callee)}(${sql.argument.map(argument => {
				var $argument = generate(argument);
				if (argument.type == 'select' || argument.type == 'union')
					$argument = `(${$argument})`;
				return $argument;
			}).join(',')})`;
		case 'name':
			var name = sql.identifier;
			if (sql.qualifier)
				name = `${identifier(sql.qualifier)}.${identifier(name)}`;
			return name;
		case 'literal':
			return JSON.stringify(sql.value);
	}
	function identifier(s) {
		if (!/^[a-z_$][\w_$]*$/i.test(s))
			s = `\`${s}\``;
		return s;
	}
}
module.exports = generate;
