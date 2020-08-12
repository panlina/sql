class Expression {
	constructor(type: string);
	type: string;
}

export = Expression;

export class Literal extends Expression {
	constructor(value: Literal["value"]);
	value: string | number | boolean;
}

export class Name extends Expression {
	constructor(identifier: string, qualifier?: string);
	identifier: string;
	qualifier?: string;
}

export class Call extends Expression {
	constructor(expression: Expression, argument: Expression);
	expression: Expression;
	argument: Expression;
}

export class Operation extends Expression {
	constructor(operator: string, left: Expression | undefined, right: Expression | undefined);
	operator: string;
	left: Expression | undefined;
	right: Expression | undefined;
}

export class Union extends Expression {
	constructor(left: Expression, right: Expression, all?: boolean);
	left: Expression;
	right: Expression;
	all?: boolean;
}

export class Select extends Expression {
	constructor(argument: Select);
	with?: {
		name: string;
		value: Expression;
	};
	distinct?: boolean;
	field: (Expression & { as?: string })[];
	from: (Expression & { alias?: string })[];
	where?: Expression;
	order?: Expression;
	direction?: boolean;
	limit?: Expression;
	offset?: Expression;
}

export class Placeholder extends Expression {
	constructor(name: string);
	name: string;
}
