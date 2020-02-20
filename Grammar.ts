import {Termenial} from "./Termenial"

export class Grammar{
	termenials: Termenial[];

	constructor(specification: string){
		let lines = specification.split("\n");
		this.termenials = [];
		for(let l of lines){		
			//split line on arrow
			l = l.trim();
			if(l.length == 0) continue;
			let tokens = l.split("->");

			//check if the arrow was there
			if(tokens.length != 2){
				throw new Error("Invalid Line: " + l);
			}

			//check for repeat RHS
			let name = tokens[0].trim();			
			for(let t of this.termenials){
				if(t.name === name){
					throw new Error("Repeated termenial");
				}
			}

			//check for regex correctness
			let regEx: RegExp;
			try{
				regEx = new RegExp(tokens[1].trim(),"gy");
			}catch(e){
				throw new Error("Invalid Regex: " + tokens[1]);
			}

			//add the termenial to list
			this.termenials.push(new Termenial(name, regEx));
		}
		this.termenials.push(new Termenial("WHITESPACE", /\s+/gy));
	}
}
