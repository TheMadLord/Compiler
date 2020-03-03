export class Symbol {

	name: string;

	constructor(name: string){
		this.name = name;
	}

	toString(){
		return this.name;	
    	}
	
	isNullable():boolean{
		return false;
	}
}
