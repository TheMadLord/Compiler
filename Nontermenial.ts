import {Symbol} from "./Symbol"

export class Nontermenial extends Symbol{

	productions: Symbol[][];
	nullable:boolean;

	constructor(name: string){
		super(name);
		this.productions = [];
		this.nullable = false;
	}

	isNullable():boolean{
		return this.nullable;	
	}

	//return if nullable has been changed
	setNullable(n:boolean):boolean{
		let ret: boolean = n != this.nullable;
		this.nullable = n
		return ret
	}
}
