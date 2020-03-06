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


class DFAState   {
	label: Set<number>;
	transitions: Map<string, number >;
	constructor( label: Set<number> ){
		this.label = label;
		this.transitions = new Map();
	}
	addTransition( sym: string, stateIndex: number ){
		if( this.transitions.has(sym) )
			throw new Error("Duplicate transition");
		this.transitions.set(sym, stateIndex );
	}
}

	

class Transition{
	val:Symbol;
	dest:any;

	constructor(value:Symbol, dest:any){	
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

function makeNFA_I(langStr: string):Item[]{
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
	return allItems;
}

export function makeNFA(langStr: string):State[]{
	let allItems = makeNFA_I(langStr)
	let ret:State[] = [];
	for(let item of allItems){
		ret.push(new State(item));
	}
	return ret;
}


function computeClosure( item:Item):Set<number>{
	let ret: Set<number> = new Set();
	ret.add(item.id)
	for(let t of item.transitions){
		if(t.val === undefined){
			ret.add(t.dest.id);
		}
	}
	return ret;
}

function getDFAStateFromLabel(label:Set<number>, dfa:DFAState[], toDo: number[]):number{
	for(let i = 0; i < dfa.length; i++){
		let state = dfa[i]
		if(state.label.size !== label.size){
			continue;
		}
		let broke = false;
		for(let i of label){
			if(!state.label.has(i)){
				broke = true;			
				break;
			}
		}
		if(!broke){
			return i	
		}
	}
	let nState = new DFAState(label);
	dfa.push(nState);
	toDo.push(dfa.length-1);
	return dfa.length-1;
}


function processState( q: DFAState, nfa: Item[], dfa: DFAState[], toDo: number[]){
	let r: Map<string, Set<number> > = collectTransitions(q, nfa );
	for( let sym of r.keys() ){
		let labelSet: Set<number> = r.get(sym);
		let q2i = getDFAStateFromLabel(labelSet, dfa, toDo);
		q.addTransition(sym, q2i);
	}
}

function collectTransitions( q: DFAState, nfa: Item[] ){
	let r : Map<string, Set<number> > = new Map();
	for(let nfaStateIndex of q.label){
		let nq:Item = nfa[nfaStateIndex];
		for(let t of nq.transitions){
			if( t.val != undefined ){
				if( !r.has(t.val.name) ){
					r.set(t.val.name,new Set());
				}
				for(let x of nq.transitions){
					if(x.val != undefined && x.val.name == t.val.name){
						let u:Set<number> = new Set([... r.get(t.val.name), ...computeClosure(x.dest)])
						r.set(t.val.name, u);
					}
				}
			}
		}
	}
	return r;
}

export function makeDFA(langStr: string):DFAState[]{
	let nfa:Item[] = makeNFA_I(langStr)	
	
	let dfa : DFAState[] = [];
	dfa.push(new DFAState(computeClosure(nfa[0])));
	let toDo : number[] = [0];	
	while( toDo.length > 0 ){
		let qi = toDo.pop();
		let q = dfa[qi];
		processState( q, nfa, dfa, toDo );
	}
	return dfa;
}



