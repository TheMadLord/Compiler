import {Symbol} from "./Symbol"

export class Termenial extends Symbol{

	regex: RegExp
	constructor(name: string, regex:RegExp){
		super(name);
		this.regex = regex;
	}
}
