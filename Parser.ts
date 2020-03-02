declare var require:any;
let fs = require("fs");

import {Token} from "./Token"
import {Grammar} from "./Grammar"
import {Tokenizer} from "./Tokenizer"
import {Termenial} from "./Termenial"	

export function parse(input:string){
	//create Grammar
	let gramStr : string = fs.readFileSync("grammar.txt","utf8");
	let grammar : Grammar
	grammar = new Grammar(gramStr);
	//create Tokenizer
	let tokenMaker : Tokenizer = new Tokenizer(grammar);
	tokenMaker.setInput(input);
	let ret:treeNode;
	ret = parse_S(tokenMaker);
	return ret;
}


//S -> stmt-list
function parse_S(tokenMaker : Tokenizer){
	let ret:treeNode = new treeNode("S");
	ret.children.push(parse_stmt_list(tokenMaker));
	return ret;
}

//stmt-list -> stmt stmt-list | LAMBDA	
//follows is EOL or }
function parse_stmt_list(tokenMaker : Tokenizer){
	let peek: Token =  tokenMaker.peek();
	let ret:treeNode = new treeNode("stmt-list")
	if(peek.sym != "RBR" && peek.sym != "$"){
		ret.children.push(parse_stmt(tokenMaker));
		ret.children.push(parse_stmt_list(tokenMaker));
	}
	return ret;
}

//stmt -> loop | cond | assign SEMI | func-call SEMI | LBR stmt-list RBR | var-decl SEMI
function parse_stmt(tokenMaker : Tokenizer){
	let peek: Token =  tokenMaker.peek();
	let ret:treeNode = new treeNode("stmt")
	if(peek.sym === "WHILE"){
		ret.children.push(parse_loop(tokenMaker));
	}else if(peek.sym === "IF"){
		ret.children.push(parse_cond(tokenMaker));
	}else if(peek.sym === "ID"){
		let peek2: Token = tokenMaker.peek2();
		if(peek2.sym === "LP"){
			ret.children.push(parse_func_call(tokenMaker));
		}else{
			ret.children.push(parse_assign(tokenMaker));
		}
		ret.children.push(new treeNode(tokenMaker.expect("SEMI")));
	}else if(peek.sym === "LBR"){
		ret.children.push(new treeNode(tokenMaker.expect("LBR")));
		ret.children.push(parse_stmt_list(tokenMaker));
		ret.children.push(new treeNode(tokenMaker.expect("RBR")));
	}else{
		ret.children.push(parse_var_decl(tokenMaker));
		ret.children.push(new treeNode(tokenMaker.expect("SEMI")));
	}
	return ret;
}

//loop -> WHILE LP expr RP stmt
function parse_loop(tokenMaker : Tokenizer){
	let ret:treeNode = new treeNode("loop")
	ret.children.push(new treeNode(tokenMaker.expect("WHILE")));
	ret.children.push(new treeNode(tokenMaker.expect("LP")));
	ret.children.push(parse_expr(tokenMaker));
	ret.children.push(new treeNode(tokenMaker.expect("RP")));
	ret.children.push(parse_stmt(tokenMaker));
	return ret;
}

//cond -> IF LP expr RP stmt | IF LP expr RP stmt ELSE stmt
function parse_cond(tokenMaker : Tokenizer){
	let ret:treeNode = new treeNode("cond")
	ret.children.push(new treeNode(tokenMaker.expect("IF")));
	ret.children.push(new treeNode(tokenMaker.expect("LP")));
	ret.children.push(parse_expr(tokenMaker));
	ret.children.push(new treeNode(tokenMaker.expect("RP")));
	ret.children.push(parse_stmt(tokenMaker));
	
	let peek:Token = tokenMaker.peek();
	if(peek.sym === "ELSE"){
		ret.children.push(new treeNode(tokenMaker.expect("ELSE")));
		ret.children.push(parse_stmt(tokenMaker));	
	} 
	return ret;
}

//assign -> ID EQ expr
function parse_assign(tokenMaker : Tokenizer){
	let ret:treeNode = new treeNode("assign");
	ret.children.push(new treeNode(tokenMaker.expect("ID")));
	ret.children.push(new treeNode(tokenMaker.expect("EQ")));
	ret.children.push(parse_expr(tokenMaker));
	return ret;	
}

//expr -> NUM | ID
function parse_expr(tokenMaker : Tokenizer){
	let ret:treeNode = new treeNode("expr");
	let peek: Token = tokenMaker.peek();
	if(peek.sym === "NUM"){
		ret.children.push(new treeNode(tokenMaker.expect("NUM")));
	}else{
		ret.children.push(new treeNode(tokenMaker.expect("ID")));
	}
	return ret;
}

//func-call -> ID LP param-list RP
function parse_func_call(tokenMaker : Tokenizer){
	let ret:treeNode = new treeNode("func-call");
	ret.children.push(new treeNode(tokenMaker.expect("ID")));
	ret.children.push(new treeNode(tokenMaker.expect("LP")));
	ret.children.push(parse_param_list(tokenMaker));
	ret.children.push(new treeNode(tokenMaker.expect("RP")));
	return ret;
}

//param-list -> LAMBDA | expr | expr CMA param-list’
function parse_param_list(tokenMaker : Tokenizer){
	let ret:treeNode = new treeNode("param-list");
	let peek:Token = tokenMaker.peek();
	if(peek.sym != "RP"){
		ret.children.push(parse_expr(tokenMaker));
		peek = tokenMaker.peek();
		if( peek.sym === "CMA"){
			ret.children.push(new treeNode(tokenMaker.expect("CMA")));
			ret.children.push(parse_param_list_prime(tokenMaker));
		}
	}
	return ret;
}

//param-list’ -> expr CMA param-list’ | expr
function parse_param_list_prime(tokenMaker : Tokenizer){
	let ret:treeNode = new treeNode("param-list'");
	ret.children.push(parse_expr(tokenMaker));
	let peek:Token = tokenMaker.peek();
	if( peek.sym === "CMA"){
		ret.children.push(new treeNode(tokenMaker.expect("CMA")));
		ret.children.push(parse_param_list_prime(tokenMaker));
	}
	return ret;
}

//var-decl -> TYPE var-list
function parse_var_decl(tokenMaker : Tokenizer){
	let ret:treeNode = new treeNode("var-decl");
	ret.children.push(new treeNode(tokenMaker.expect("TYPE")));
	ret.children.push(parse_var_list(tokenMaker));
	return ret;
}

//var-list -> ID | ID CMA var-list
function parse_var_list(tokenMaker : Tokenizer){
	let ret:treeNode = new treeNode("var-list");
	ret.children.push(new treeNode(tokenMaker.expect("ID")));
	let peek:Token = tokenMaker.peek();
	if( peek.sym === "CMA"){
		ret.children.push(new treeNode(tokenMaker.expect("CMA")));
		ret.children.push(parse_var_list(tokenMaker));
	}
	return ret;
}
	
function printTree(tn: treeNode, tab:string){
	if(tn != undefined){
		console.log(tab + "{"+tn.sym+"}");
		for(let c of tn.children){
			printTree(c, tab+"\t");
		}
	}else{
		console.log(tab + "{"+tn+"}");
	}
}	

class treeNode{
	children: treeNode[];
	sym: string;
	token: Token;
	
	constructor(token:any){
		if(token instanceof Token){
			this.token = token;
			this.sym = token.sym;
		}else{
			this.sym = token;
		}
		this.children = [];
	}

	toString(){
		return this.sym
	}	
}
