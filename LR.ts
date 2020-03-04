import {Grammar} from "./Grammar"
import {Symbol} from "./Symbol"
import {Nontermenial} from "./Nontermenial"
class State {
	item: any;
	transitions: Map<string, number[]>;

	constructor(i:Item){
		this.item = i;
		this.transitions = new Map();
		for(let t of i.transitions){
			let name = ""
			if(t.val){
				name = t.val.name
			}
			if(!this.transitions.has(name)){
				this.transitions.set(name, []);
			}
			this.transitions.get(name).push(t.dest.id);
		}
	}
}

class Transition{
	val:Symbol;
	dest:Item;

	constructor(value:Symbol, dest:Item){	
		this.val = value;
		this.dest = dest;
	}
}

class Item {
	dpos:number
	production: Symbol[];
	transitions: Transition[];
	lhs: Symbol;
	id:number
	str:string;
	
	constructor(lhs:Symbol ,prod: Symbol[], dp:number, id:number){
		this.dpos = dp;
		this.production = prod;
		this.lhs = lhs
		this.str = lhs.name  + " → ";
		this.transitions  = []
		this.id = id;
		for(let i:number = 0; i< prod.length; i++){
			if(i === dp){
				this.str += " •";
			}
			this.str += " " + prod[i];
		}
		if(dp === prod.length){
			this.str += " " + " • ";
		}
	}

	toString(){
		return this.str;
	}
}


export function makeNFA(langStr: string):State[]{
	console.log(langStr)
	let lang:Grammar = new Grammar(langStr);
	let allItems:Item[] = [];
	let fakeStart:Nontermenial = new Nontermenial("S'");
	fakeStart.productions.push([lang.nontermenials[0]])
	lang.nontermenials = [fakeStart, ... lang.nontermenials];
	for(let nt of lang.nontermenials){	
		for(let prod of nt.productions){
			let prev:Item
			for(let i:number  = 0;  i <= prod.length; i++){
				let curr = new Item(nt, prod, i, allItems.length);
				allItems.push(curr);
				if(prev){
					prev.transitions.push(new Transition(prod[i-1], curr));
				}
				prev = curr;
			}
		}
	}
	//create lambda transitions
	for(let item of allItems){
		let sym = item.production[item.dpos]
		if(sym instanceof Nontermenial){
			for(let item2 of allItems){
				if(item2.lhs === sym && item2.dpos === 0){
					item.transitions.push(new Transition(undefined, item2));
				}
			}
		}
	}
	let ret:State[] = [];
	for(let item of allItems){
		ret.push(new State(item));
	}
	return ret;
}
