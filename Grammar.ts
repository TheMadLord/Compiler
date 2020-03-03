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
		let WS:Termenial;
		//console.log(specification);
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
			let newTerm = new Termenial(name, regEx);
			if(name === "WHITESPACE"){
				WS = newTerm
			}
			this.termenials.push(newTerm);
		}
		//add defualt whitespace termenial if None was found
		if(!WS){
			WS = new Termenial("WHITESPACE", /\s+/gy)
			this.termenials.push(WS);
		}
		this.EOL = new Termenial("$", /$/);
		while(lines[i].length === 0){
			i++
		};
				
		//pasrse nonterminals
		this.nontermenials = [];
		let preProds:any[] = [];
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
					if(sym === "lambda"){
						prodGroup[0].nullable  = true;
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
		let reachable:Set<Symbol> = this.computeReachable(); 
		if(reachable.size != symbols.length){
			let unreachable: string = "";
			for(let sym of symbols){
				if(!reachable.has(sym)){
				 	unreachable += " " + sym.name		
				}		
			}
			throw new Error("Langauge includes unreachable symbols" + unreachable);
		}
		//Compute Nullable
		this.computeNullable();
		this.computeFirst();
		this.computeFollow();
	}

	computeNullable(){
		let changed = true;
		while(changed){
			changed = false;
			for(let sym of this.nontermenials){
				if(sym.isNullable()){
					continue;
				}
				for(let p of sym.productions){
					let pNull = true
					for(let s of p){
						if(!s.isNullable()){
							pNull = false;
							break;
						}
					}
					if(pNull){
						changed = sym.setNullable(true) || changed
						continue;
					}				
				}
			}
		}
	}

	computeReachable():Set<Symbol>{
		let reachable:Set<Symbol> = new Set();
		reachable.add(this.nontermenials[0]);
		for(let t of this.termenials){
			if(t.name === "WHITESPACE" || t.name === "COMMENT"){
				reachable.add(t);
			}
		}
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
		return reachable;
	}

	computeFirst(){
		let changed = true;
		while(changed){
			changed = false;
			for(let sym of this.nontermenials){
				for(let p of sym.productions){
					for(let s of p){
						changed = sym.addToFirst(s.first) || changed;
						if(!s.isNullable()){
							break;
						}
					}				
				}
			}
		}
	}


	computeFollow(){
		this.nontermenials[0].addToFollowS(this.EOL)
		let changed = true;
		while(changed){
			changed = false;
			for(let nt of this.nontermenials){
				for(let p of nt.productions){
					for(let i:number = 0; i < p.length; i++){
						if(p[i] instanceof Nontermenial){
							let sym:Nontermenial = <Nontermenial>p[i];
							let exited = false;
							for(let j:number = i + 1; j < p.length && !exited; j++){
								changed = sym.addToFollow(p[j].first) || changed
								if(!p[j].isNullable()){
									exited = true;
								}
							}
							if(!exited){
								changed = sym.addToFollow(nt.follow) || changed
							}
						}
					}
				}
			}
		}
	}

	getFirst():Map<string, Set<string>>{
		let ret:Map<string, Set<string>> =  new Map();
		let symbols: Symbol[] = (<Symbol[]>this.nontermenials).concat(this.termenials)
		for(let sym of symbols){
			if("WHITESPACE" === sym.name){
				continue;
			}
			let f: Set<string> = new Set();
			for(let s of sym.first){
				f.add(s.name);
			}
			ret.set(sym.name, f);
		}
		return ret;
	}
	
	getNullable():Set<string>{
		let symbols: Symbol[] = (<Symbol[]>this.nontermenials).concat(this.termenials)
		let ret: Set<string> =  new Set();
		for(let sym of symbols){
			if(sym.isNullable()){
				ret.add(sym.name);
			}
		}
		return ret;	
	}

	getFollow():Map<string, Set<string>>{
		let ret:Map<string, Set<string>> =  new Map();
		for(let sym of this.nontermenials){
			let f: Set<string> = new Set();
			for(let s of sym.follow){
				f.add(s.name);
			}
			ret.set(sym.name, f);
		}
		return ret;
	}
}


