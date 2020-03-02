
declare var require:any;
let fs = require("fs");

import {Token} from "./Token"
import {Grammar} from "./Grammar"
import {Tokenizer} from "./Tokenizer"
import {Termenial} from "./Termenial"	
interface OpData{
	precedence: number;
	l_assoc: boolean;
	operandCount: number;
}

export function parse(input:string){
	//create Grammar
	let gramStr : string = fs.readFileSync("grammar.txt","utf8");
	let grammar : Grammar = new Grammar(gramStr);
	//create Tokenizer
	let tokenMaker : Tokenizer = new Tokenizer(grammar);
	tokenMaker.setInput(input);
	//do shuntingyard
	let operands:treeNode[] = [];
	let operators:Token[] = [];
	let operatorDictionary: Record<string, OpData> = {
		"LP":{precedence: -1, l_assoc: true, operandCount: 0},
		"COMMA":{precedence: 0, l_assoc: true, operandCount: 2	},
		"ADDOP":{precedence: 1, l_assoc: true, operandCount: 2},
		"MULOP":{precedence: 2, l_assoc: true, operandCount: 2},
		"BITNOT":{precedence: 3, l_assoc: false, operandCount: 1},
		"NEGATE":{precedence: 4, l_assoc: false, operandCount: 1},
		"POWOP": {precedence: 5, l_assoc: false, operandCount: 2},
		"func-call": {precedence: 6, l_assoc: true, operandCount: 2}
	}
	let negate:Termenial = new Termenial("NEGATE",/-/); 
	let func_call:Termenial = new Termenial("func-call",/•/); 
	while(tokenMaker.hasMore()){
		let token:Token = tokenMaker.next();
		let prev:Token = tokenMaker.previous();
		if(token.lexeme === "-"){		
			if(prev  === undefined|| (prev.sym === "LP") || (prev.sym in operatorDictionary)){
				token = new Token(negate, token.lexeme, token.line);
			}
		}
		if (token.sym === "LP"){
			operators.push(token)
			continue;	
		}		
		if(token.sym in operatorDictionary){

			let A:boolean = operatorDictionary[token.sym].l_assoc;
			let C:number = operatorDictionary[token.sym].precedence
			let D:number = operatorDictionary[token.sym].operandCount
			if(!A && (D === 1)){
				operators.push(token)
				continue;					
			}
        		while(true){
				if(operators.length === 0){
					break;
				}
				let other:string = operators[operators.length-1].sym
				let B:number = operatorDictionary[other].precedence
				D =  operatorDictionary[operators[operators.length-1].sym].operandCount;
				if((A && B >= C) || (!A && B > C)){
			                doOperation(operands,operators,D);
			        }else{
 			               break;
				}        			
			}
			operators.push(token)
		}else if (token.sym === "RP"){
			if(prev.sym === "LP"){
				operands.push(undefined)
				operators.pop();
			}else{
				while(operators[operators.length-1].sym != "LP"){
					let D:number = operatorDictionary[operators[operators.length-1].sym].operandCount
					doOperation(operands,operators, D);
				}
				operators.pop();
			}
		}else{
			operands.push(new treeNode(token));
			if(token.sym === "ID" && tokenMaker.peek().sym === "LP"){
				operators.push(new Token(func_call, "", token.line));
			}
		}
	}
	while(operators.length != 0){
		let D:number = operatorDictionary[operators[operators.length-1].sym].operandCount
		doOperation(operands, operators, D)
	}
	return operands[0];
}

function printTree(tn: treeNode, tab:string){
	if(tn != undefined){
		console.log(tab + "{"+tn.sym +", "+ tn.token.lexeme+"}");
		for(let c of tn.children){
			printTree(c, tab+"\t");
		}
	}else{
		console.log(tab + "{"+tn+"}");
	}
}	


function doOperation(operands:treeNode[], operators:Token[], operandCount:number){
	let op:Token = operators.pop();
	let tn: treeNode = new treeNode(op);
	for(let i:number = 0; i < operandCount; i++){
		let c:treeNode = operands.pop()
		tn.children.push(c);
	}
	tn.children.reverse();
	if(op.sym === "func-call" && tn.children[1] === undefined){
		tn.children.pop();
	}
	operands.push(tn)
}

class treeNode{
	children: treeNode[];
	sym: string;
	token: Token;

	constructor(token:Token){
		this.token = token;
		this.sym = token.sym;
		this.children = [];
	}	

	toString(){
		return this.sym
	}	
}

