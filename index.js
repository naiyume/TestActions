const concept = require('./concept');
const fs = require('fs');
const otherDirection = require('./otherDirection');
let files = fs.readFileSync('$HOME/files.csv')
for(let i = 0; i < files.length; i++){
    let file = files[i]
    if(file.includes('.csv')){
        concept.readFile('file')
    }
    else if(file.includes('.json')){
        otherDirection.reverseRead()
    }
    i = files.length;
}

