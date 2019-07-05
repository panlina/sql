function generate(sql) {
	switch (sql.type) {
		case 'select':
			var select = `select ${sql.field.map(generate).join(',')}`;
			if (sql.from)
				select += ` from (${generate(sql.from)})`;
			return select;
		case 'name':
			return sql.identifier;
	}
}
module.exports = generate;
