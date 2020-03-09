var assert = require('assert');
var generate = require('../generate');
it('generate', function () {
	var sql = {
		type: 'operation',
		operator: '/',
		left: {
			type: 'operation',
			operator: '*',
			left: {
				type: 'operation',
				operator: '+',
				left: { type: 'literal', value: 0 },
				right: { type: 'literal', value: 1 }
			},
			right: {
				type: 'operation',
				operator: '+',
				right: { type: 'literal', value: 2 }
			},
		},
		right: { type: 'name', identifier: 'a', qualifier: 't' }
	};
	sql = {
		type: 'operation',
		operator: '&&',
		left: {
			type: 'operation',
			operator: 'in',
			left: sql,
			right: { type: 'name', identifier: 'b' }
		},
		right: {
			type: 'operation',
			operator: '!',
			right: { type: 'literal', value: false }
		}
	};
	sql = {
		type: 'call',
		callee: { type: 'name', identifier: 'if' },
		argument: [
			sql,
			{
				type: 'select',
				field: [{ type: 'name', identifier: '*' }],
				from: [{ type: 'name', identifier: 't', alias: '_0' }]
			},
			{ type: 'literal', value: 'a\\\nc' }
		]
	};
	sql = {
		type: 'select',
		field: [Object.assign(sql, { as: '' })],
		from: []
	};
	assert.equal(generate(sql), 'select if((0+1)*+2/t.a in b&&!false,(select * from t _0),\"a\\\\\\nc\") ``');
});
