import {Symbol} from "./Symbol"

export class Nontermenial extends Symbol{

	productions: Symbol[][];
	constructor(name: string){
		super(name);
		this.productions = [];
	}

}
