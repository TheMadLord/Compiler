export class Symbol {

	name: string;
	first: Set<Symbol>
	follow: Set<Symbol>

	constructor(name: string){
		this.name = name;		
		this.first = new Set();
		this.follow = new Set();
	}

	toString(){
		return this.name;	
    	}
	
	isNullable():boolean{
		return false;
	}
}
