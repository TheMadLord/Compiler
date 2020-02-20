import {Grammar} from "./Grammar"
import {Token} from "./Token"

export class Tokenizer{
	gram: Grammar;
	input: string;
	index: number;
	line: number;
	parsed: Token[];

	constructor(lang: Grammar){
		this.gram = lang;		
	}
	
	setInput(str: string){
		this.index = 0;
		this.parsed = [];
		this.input = str;
		this.line = 1;
	}

	next():Token{		
		for(let t of this.gram.termenials){
			t.regex.lastIndex = this.index
			let found =  t.regex.exec(this.input);
			if(found){
				let lexeme = found[0];
				this.index += lexeme.length
				let line: number = this.line
				for(let i = 0; i < lexeme.length; i++){
					if(lexeme.charAt(i) === "\n"){
						this.line += 1;					
					}
				}
				if(t.name === "COMMENT" || t.name === "WHITESPACE"){
					return this.next();
				}
				let token:Token = new Token(t.name, lexeme,line)
				this.parsed.push(token)
				return token;		
			}	
		}
		if(this.index >= this.input.length-1){
			return new Token("$","$",this.line)
		}
	}
}
