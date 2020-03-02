
declare var require:any;
let fs = require("fs");
import {parse} from "./Parser";

function main(){
    let ok = testWithFile("tests.txt",false);
    if(ok)
        console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-Basic tests OK [+100]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
    else
        return;
        
    ok = testWithFile("tests.txt",true);
    if(ok)
        console.log("-=-=-=-=-=-=-=-=-=-=-Bonus tests OK [+25]-=-=-=-=-=-=-=-=-=-=-");
    else
        return;
        
}
        
function testWithFile(fname:string, doBonus: boolean ): boolean{
    let data:string = fs.readFileSync(fname,"utf8");
    let tests: any = JSON.parse(data);
    let numTests=0;
    
    for(let i=0;i<tests.length;++i){
        
        let name: string = tests[i]["name"];
        let expected: any = tests[i]["tree"];
        let bonus: boolean = tests[i]["bonus"];
        let input: string = tests[i]["input"];
        
        if( bonus !== doBonus )
            continue;

        let actual: any;
        
        try{
            actual = parse(input);
        } catch(e){
            actual = undefined;
        }
        if( !treesAreSame( actual, expected ) ){
            console.log("Test "+name+" failed: Tree mismatch");
            return false;
        } 
            
        ++numTests;

    }
    console.log(numTests+" tests OK");
    return true;
}

function treesAreSame( n1: any, n2:any ){
    if( n1 === undefined && n2 === undefined )
        return true;
        
    if( n1 === undefined && n2 !== undefined ){
        return false;
    }
    if( n2 === undefined && n1 !== undefined ){
        return false;
    }
    if( n1["sym"] != n2["sym"] ){
        return false;
    }
    if( n1["children"].length != n2["children"].length ){
        return false;
    }
    for(let i=0;i<n1["children"].length;++i){
        if(!treesAreSame( n1["children"][i], n2["children"][i] ) )
            return false;
    }
    return true;
}
    
    
    


main();
