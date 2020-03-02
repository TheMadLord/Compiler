import {Termenial} from "./Termenial"
import {Nontermenial} from "./Nontermenial"
import {Symbol} from "./Symbol"

export class Grammar{
	termenials: Termenial[];
	nontermenials: Nontermenial[];

	EOL: Symbol;

	constructor(specification: string){
		let lines = specification.split("\n");
		this.termenials = [];
		let i = 0; 
		for(i; i < lines.length; i++){		
			//split line on arrow
			let l:string = lines[i].trim();
			if(l.length == 0) break;
			let tokens:string[] = l.split("->");

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
		//add defualt whitespace termenial
		this.termenials.push(new Termenial("WHITESPACE", /\s+/gy));
		this.EOL = new Termenial("$", /$/);
		//pasrse nonterminals
		this.nontermenials = [];
		let preProds:any[] = [];
		i++;
		for(i; i < lines.length; i++){
			//split line on arrow
			let l:string = lines[i].trim();
			if(l.length == 0) break;
			let tokens:string[] = l.split("->");
			//check if the arrow was there
			if(tokens.length != 2){
				throw new Error("Invalid Line: " + l);
			}
			let name:string =  tokens[0].trim();
			for(let t of this.termenials){
				if(t.name === name){
					throw new Error(name + "is declared as both a termenial and Non-Termential");
				}
			}
			let isDouble = false;
			for(let t of preProds){
				if(t[0].name === name){
					isDouble = true;
					t[1] += " | " + tokens[1];	
				}
			}
			if(isDouble){continue;}
			let nt:Nontermenial = new Nontermenial(name) 
			preProds.push([nt, tokens[1]]);	
			this.nontermenials.push(nt);
		}
		//resolve strings to productions
		let symbols: Symbol[] = (<Symbol[]>this.nontermenials).concat(this.termenials)
		for(let prodGroup of preProds){
			let prods:string[] = prodGroup[1].split("|");
			for(let p of prods){
				let production:Symbol[] = []
				for(let sym of p.split(" ")){
					if(sym.length === 0){continue;}
					if(sym === "LAMBDA"){
						continue;
					}
					let found: boolean = false;
					for(let s of symbols){
						if(s.name === sym){
							found = true;
							production.push(s);
							break;
						}
					}
					if(!found){
						throw new Error("Invalid symbol <" + sym + "> in production " + p + " for " + prodGroup[0].name);
					}
				}
				prodGroup[0].productions.push(production);
			} 
		}
		//check for contectedness
		let reachable:Set<Symbol> = new Set();
		reachable.add(this.nontermenials[0]);
		while(true){
			let i = reachable.size;
			reachable.forEach((r)=>{
				if(r instanceof Nontermenial){
					let nt = <Nontermenial>r
					for(let prod of nt.productions){
						for(let s of prod){
							reachable.add(s);
						} 
					}
				}
			});
			if(i === reachable.size){break;}
		}
		//minus 1 here becuase WHITESPACE symbol is never reachable
		if(reachable.size != symbols.length-1){
			let unreachable: string = "";
			for(let sym of symbols){
				if(!reachable.has(sym)){
				 	unreachable += " " + sym.name		
				}		
			}
			throw new Error("Langauge includes unreachable symbols" + unreachable);
		}	
	}
}
