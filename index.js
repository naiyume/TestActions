const concept = require('./concept');
const fs = require('fs');
const otherDirection = require('./otherDirection');
let files = fs.readFileSync('files.csv')
console.log(files)
/*
for(let i = 0; i < files.length; i++){
    let file = files[i]
    if(file.indexOf('.csv') != -1){
        concept.readFile('file')
    }
    else if(file.indexOf('.json') != -1){
        otherDirection.reverseRead()
    }
    i = files.length;
}
*/
