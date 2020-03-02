import {Symbol} from "./Symbol"

export class Token {
    sym: string;
    symbol: Symbol
    lexeme: string;
    line: number;

    constructor(sym:Symbol, lexeme:string, line:number){
        this.sym = sym.name;
	this.symbol = sym;
        this.lexeme = lexeme;
        this.line = line;
    }

    toString(){
        //let sym = this.sym.padStart(20,' ');
        //let line = ""+this.line;
        //line = line.padEnd(4,' ');
        return `[${this.sym} ${this.line} ${this.lexeme}]`;
    }
}
