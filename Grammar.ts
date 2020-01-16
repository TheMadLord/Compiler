export class Grammar{
	constructor(specification: string){
		let specList = [];
		let lines = specification.split("\n");
		for(let l of lines){		
			//split line on arrow
			l = l.trim();
			if(l.length == 0) continue;
			let tokens = l.split("->");

			//check if the arrow was there
			if(tokens.length != 2){
				throw new Error("Invalid Line: " + l);
			}

			//check for repeat RHS
			let termenial = tokens[0].trim();			
			for(let t of specList){
				if(t[0] === termenial){
					throw new Error("Repeated termenial");
				}
			}

			//check for regex correctness
			let regEx;
			try{
				regEx = new RegExp(tokens[1].trim());
			}catch(e){
				throw new Error("Invalid Regex: " + tokens[1]);
			}

			//add pair to the known list
			specList.push([termenial,regEx]);
		
		}
	}
}
