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

	//return true if first of the nontermenial has changed
	addToFirst(f:Set<Symbol>):boolean{
		let before: number =  this.first.size;
		this.first = new Set([...  this.first, ... f]);
		return before != this.first.size 
	}


	//return true if follow of the nontermenial has changed
	addToFollow(f:Set<Symbol>):boolean{
		let before: number =  this.follow.size;
		this.follow = new Set([...  this.follow, ... f]);
		return before != this.follow.size 
	}

	//return true if follow of the nontermenial has changed add Single
	addToFollowS(f:Symbol):boolean{
		let before: number =  this.follow.size;
		this.follow = new Set([...  this.follow, f]);
		return before != this.follow.size 
	}
}
