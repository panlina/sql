var assert = require('assert');

var parse = require('../parse');
var Expression = require('../Expression');
it('parse', function () {
	var sql = parse('1.1');
	assert.deepEqual(sql, new Expression.Literal(1.1));
	var sql = parse('"abc\\n"');
	assert.deepEqual(sql, new Expression.Literal("abc\n"));
	var sql = parse('a');
	assert.deepEqual(sql, new Expression.Name('a'));
	var sql = parse('a.`b`');
	assert.deepEqual(sql, new Expression.Name('b', 'a'));
	var sql = parse('f(1+2,3)');
	assert.deepEqual(sql,
		new Expression.Call(
			new Expression.Name('f'),
			[
				new Expression.Operation(
					'+',
					new Expression.Literal(1),
					new Expression.Literal(2)
				),
				new Expression.Literal(3)
			]
		)
	);
	var sql = parse('1+2<3&&!0');
	assert.deepEqual(sql,
		new Expression.Operation(
			'&&',
			new Expression.Operation(
				'<',
				new Expression.Operation(
					'+',
					new Expression.Literal(1),
					new Expression.Literal(2)
				),
				new Expression.Literal(3)
			),
			new Expression.Operation(
				'!',
				undefined,
				new Expression.Literal(0)
			)
		)
	);
	var sql = parse('(1+2)*3');
	assert.deepEqual(sql,
		new Expression.Operation(
			'*',
			new Expression.Operation(
				'+',
				new Expression.Literal(1),
				new Expression.Literal(2)
			),
			new Expression.Literal(3)
		)
	);
	var sql = parse('select 0');
	assert.deepEqual(sql,
		new Expression.Select({
			distinct: false,
			field: [new Expression.Literal(0)],
			from: []
		})
	);
	var sql = parse('select t.*,s.a from t,s');
	assert.deepEqual(sql,
		new Expression.Select({
			distinct: false,
			field: [new Expression.Name('*', 't'), new Expression.Name('a', 's')],
			from: [new Expression.Name('t'), new Expression.Name('s')]
		})
	);
	var sql = parse('with a as 0 select distinct 0,1 from a _0 where 0 order by 0 asc limit 0 offset 0');
	assert.deepEqual(sql,
		new Expression.Select({
			with: { name: 'a', value: new Expression.Literal(0) },
			distinct: true,
			field: [new Expression.Literal(0), new Expression.Literal(1)],
			from: [Object.assign(new Expression.Name('a'), { alias: '_0' })],
			where: new Expression.Literal(0),
			order: new Expression.Literal(0),
			direction: false,
			limit: new Expression.Literal(0),
			offset: new Expression.Literal(0)
		})
	);
	var sql = parse('(select 0) union (select 1)');
	assert.deepEqual(sql,
		new Expression.Union(
			new Expression.Select({
				distinct: false,
				field: [new Expression.Literal(0)],
				from: []
			}),
			new Expression.Select({
				distinct: false,
				field: [new Expression.Literal(1)],
				from: []
			}),
			false
		)
	);
	var sql = parse("%a%+%b%");
	assert.deepEqual(sql,
		new Expression.Operation(
			'+',
			new Expression.Placeholder('a'),
			new Expression.Placeholder('b')
		)
	);
	var n = new Expression.Literal(0);
	var sql = require('../sql')`${n}+1`;
	assert.deepEqual(sql,
		new Expression.Operation(
			'+',
			n,
			new Expression.Literal(1)
		)
	);
	var n = new Expression.Literal(0);
	var sql = require('../sql')`${n}`;
	assert.deepEqual(sql, n);
});
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
	var sql = require('../sql')`
		select * from (
			select * from t _0
			where 0
		) _1
		limit 10
	`;
	assert.equal(generate(reduce(sql)), "select * from t _0 where 0 limit 10");
});
it('reduce', function () {
	var sql = require('../sql')`
		select * from (
			select * from t _0
			limit 10
		) _1
		where 0
	`;
	assert.equal(generate(reduce(sql)), "select * from (select * from t _0 limit 10) _1 where 0");
});
var decorrelate = require('../decorrelate');
it('decorrelate', function () {
	var sql = require('../sql')`
		select (
			select _1.* from s _1
			where _1.id = _0.s
		) from t _0
	`;
	decorrelate(sql);
	assert.equal(generate(sql), "select _1.* from t _0,s _1 where _1.id=_0.s");
});
