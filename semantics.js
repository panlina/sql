var grammar = require('./grammar');
var Expression = require('./Expression');
var semantics = grammar.createSemantics().addOperation('parse', {
	number: integer => new Expression.Literal(+integer.sourceString)
});
module.exports = semantics;
