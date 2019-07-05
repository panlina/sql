function generate(sql) {
	switch (sql.type) {
		case 'select':
			var select = `select ${sql.field.map(generate).join(',')}`;
			if (sql.from)
				select += ` from (${generate(sql.from)})`;
			return select;
		case 'binary':
			return `(${generate(sql.left)})${sql.operator}(${generate(sql.right)})`;
		case 'unary':
			return `${sql.operator}(${generate(sql.operand)})`;
		case 'name':
			return sql.identifier;
		case 'literal':
			return JSON.stringify(sql.value);
	}
}
module.exports = generate;
