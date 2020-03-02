import {Grammar} from "./Grammar"
import {Token} from "./Token"

export class Tokenizer{
	gram: Grammar;
	input: string;
	index: number;
	line: number;
	parsed: Token[];
	hasPeeked:boolean;

	constructor(lang: Grammar){
		this.gram = lang;		
	}
	
	setInput(str: string){
		this.index = -1;
		this.parsed = [];
		this.input = str;
		this.hasPeeked = false;

		let i:number = 0;
		let line:number = 0
		while(i < this.input.length){
			let found;
			for(let t of this.gram.termenials){
				t.regex.lastIndex = i
				found =  t.regex.exec(this.input);
				if(found){
					let lexeme = found[0];
					i += lexeme.length
					let tline: number = line
					for(let i = 0; i < lexeme.length; i++){
						if(lexeme.charAt(i) === "\n"){
							line += 1;					
						}
					}
					if(t.name === "COMMENT" || t.name === "WHITESPACE"){
						continue;
					}
					let token:Token = new Token(t, lexeme, tline)
					this.parsed.push(token);
					break;	
				}	
			}
			if(!found){
				throw new Error("failed parsing @ " + i + " " + this.input[i]);
			}
		}
		this.parsed.push(new Token(this.gram.EOL,"$",this.line))
	}
	peek():Token{
		return this.parsed[this.index+1];
	}

	next():Token{
		this.index += 1;
		return this.parsed[this.index];
	}
	
	hasMore(){
		return this.index < this.parsed.length-2;
	}

	previous(){
		return this.parsed[this.index-1];
	}
	
	current(){
		return this.parsed[this.index];
	}
}
