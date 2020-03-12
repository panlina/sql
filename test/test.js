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
it('generate', function () {
	var union = {
		type: 'union',
		all: true,
		left: { type: 'select', field: [{ type: 'literal', value: 0, as: '' }], from: [] },
		right: { type: 'select', field: [{ type: 'literal', value: 1, as: '' }], from: [] }
	};
	var exists = {
		type: 'operation',
		operator: 'exists',
		right: { type: 'select', field: [{ type: 'literal', value: 0, as: '' }], from: [] }
	};
	var e = {
		type: 'select',
		with: { name: 'a', value: union },
		field: [{ type: 'name', identifier: '*' }],
		from: [
			{ type: 'name', identifier: 't', alias: '_0' },
			{ type: 'name', identifier: 's', alias: '_1' }
		],
		where: exists,
		order: { type: 'literal', value: 0 },
		direction: true,
		limit: { type: 'literal', value: 0 },
		offset: { type: 'literal', value: 10 }
	}
	assert.equal(generate(e), 'with a as (select 0 `` union all select 1 ``) select * from t _0,s _1 where exists(select 0 ``) order by 0 desc limit 0 offset 10');
});
var reduce = require('../reduce');
it('reduce', function () {
	var sql = {
		type: 'select',
		field: [{ type: 'name', identifier: '*' }],
		from: [{ type: 'name', identifier: 't', alias: '_0' }],
		where: { type: 'literal', value: 0 }
	};
	sql = {
		type: 'select',
		field: [{ type: 'name', identifier: '*' }],
		from: [Object.assign(sql, { alias: '_1' })],
		limit: { type: 'literal', value: 10 }
	};
	assert.equal(generate(reduce(sql)), "select * from t _0 where 0 limit 10");
});
it('reduce', function () {
	var sql = {
		type: 'select',
		field: [{ type: 'name', identifier: '*' }],
		from: [{ type: 'name', identifier: 't', alias: '_0' }],
		limit: { type: 'literal', value: 10 }
	};
	sql = {
		type: 'select',
		field: [{ type: 'name', identifier: '*' }],
		from: [Object.assign(sql, { alias: '_1' })],
		where: { type: 'literal', value: 0 }
	};
	assert.equal(generate(reduce(sql)), "select * from (select * from t _0 limit 10) _1 where 0");
});
var decorrelate = require('../decorrelate');
it('decorrelate', function () {
	var sql = {
		type: 'select',
		field: [{
			type: 'select',
			field: [{ type: 'name', qualifier: '_1', identifier: '*' }],
			from: [{ type: 'name', identifier: 's', alias: '_1' }],
			where: {
				type: 'operation',
				operator: '=',
				left: {
					type: 'name',
					qualifier: '_1',
					identifier: 'id'
				},
				right: {
					type: 'name',
					qualifier: '_0',
					identifier: 's'
				}
			}
		}],
		from: [{ type: 'name', identifier: 't', alias: '_0' }]
	};
	decorrelate(sql);
	assert.equal(generate(sql), "select _1.`*` from t _0,s _1 where _1.id=_0.s");
});
