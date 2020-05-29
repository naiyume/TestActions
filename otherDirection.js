const fs = require('fs');
function getFiles(){
    let fileList = [];
    files = fs.readdirSync('.');
    files.forEach(function(file) {
        if(file.match(/[0-9]{9}.json/) != null){
        fileList.push(file);
        }
    });
    return fileList;
}
function reverseRead(){
    Array.prototype.unique = function() {
        var a = this.concat();
        for(var i=0; i<a.length; ++i) {
            for(var j=i+1; j<a.length; ++j) {
                if(a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
    
        return a;
    };
    let fileList = getFiles()
    let jsonList = []
    let jsonIndex = {}
    for(let i = 0; i < fileList.length; i++){
        let currFile = fileList[i];
        let currFileContents = fs.readFileSync(currFile );
        let currJSON = JSON.parse(currFileContents)
        jsonList.push(currJSON)
        jsonIndex[currJSON['conceptId']] = i
    }
    
    let referenced = [];
    let clean = [];
    for(let i = 0; i < jsonList.length; i++){
        let currFile = jsonList[i];
        let keys = Object.keys(currFile);
        for(let j = 0; j < keys.length; j++){
            let nextObj = currFile[keys[j]]
            if(keys[j].includes('Source')){
                if(!clean.includes(i)){
                    clean.push(i)
                }
            }
            if(Array.isArray(nextObj)){
                //iterate through array and look for json
                let toReplace = []
                for(let k = 0; k < nextObj.length; k++){
                    let toCheck = nextObj[k]
                    
                    if(toCheck.match(/[0-9]{9}.json/) != null){
                        let cId = toCheck.substring(0,9);
                        toReplace.push(jsonList[jsonIndex[cId]])
                        if(!referenced.includes(jsonIndex[cId])){
                            referenced.push(jsonIndex[cId])
                        }
                    }
                    
                }
                if(toReplace.length > 0){
                    currFile[keys[j]] = toReplace;
                }
            }
            else if(typeof nextObj == 'string'){
                if(nextObj.match(/[0-9]{9}.json/) != null){
                    let cId = nextObj.substring(0,9);
                    currFile[keys[j]] = jsonList[jsonIndex[cId]];
                    if(!referenced.includes(jsonIndex[cId])){
                        referenced.push(jsonIndex[cId])
                    }
                }
                //check if string is JSON
            }
            else{
                let currKeys = Object.keys(nextObj)
                let toReplace = {};
                for(let k = 0; k < currKeys.length; k++){
                    if(currKeys[k].match(/[0-9]{9}.json/)){
                        let cId = currKeys[k].substring(0,9);
                        toReplace[nextObj[currKeys[k]]] = jsonList[jsonIndex[cId]];
                        if(!referenced.includes(jsonIndex[cId])){
                            referenced.push(jsonIndex[cId])
                        }
                    }
                }
                if(Object.keys(nextObj).length > 0){
                    currFile[keys[j]] = toReplace;
                }
                //check object for JSON
            }
        }
    }
    for(let i = 0; i < jsonList.length; i++){
        if(!referenced.includes(i)){
            if(!clean.includes(i)){
                clean.push(i)
            }
        }
    }


    let finalMatrix = []
    let finalHeader = []
    let finalConcepts = []
    let maxes = []
    //change to make it recursive
    for(let i = 0; i < clean.length; i ++){
        let conceptSeen = [jsonList[clean[i]]['conceptId']]
        let final = {}
        recurseRead(jsonList[clean[i]],final, '', conceptSeen)
        finalMatrix.push(final)

        //finalHeader.concat(Object.keys(final)).unique()



        let keys = Object.keys(final)
        let finalArr = []
        let max = 0;
        for(let j = 0; j < keys.length; j++){
            if(!finalHeader.includes(keys[j]) && !finalConcepts.includes(keys[j])){
                if(!keys[j].includes('conceptId')){
                    if(!keys[j].includes('subcollection') && !keys[j].includes('subcollections')){
                        finalHeader.push(keys[j])
                    }
                }
                else{
                    finalConcepts.push(keys[j])
                }
            }

            if(final[keys[j]].length > max){
                max = final[keys[j]].length
            }
        }

        maxes.push(max)
        
        //console.log(finalArr)


    }
    /*
    let toExcel = "";
    toExcel += keys.map(function(value){
        if(value.indexOf(',') != -1){
            return "\"" + value + "\"";
        }
        else if(value == '0'){
            return ''
        }
        else{
            return value;
        }
    }).join(",");
    for(let j = 0; j < finalArr.length; j++){
        toExcel += '\n'
        toExcel += finalArr[j].map(function(value){
            if(value.indexOf(',') != -1){
                return "\"" + value + "\"";
            }
            else{
                return value;
            }
        }).join(",");
    }
    //console.log(toExcel)
    fs.writeFileSync('testOutput1.csv', toExcel)
*/
    //
    //reorder the finalHeader
    //console.log(finalConcepts)
    //try while organizing data: if key == subcollection, use single key from thing
    let first = false;
    for(let i = 0; i < finalHeader.length; i++){
        let found = false;
        for(let j = 0; j < finalConcepts.length; j++){    
            if(finalConcepts[j].includes(finalHeader[i])){
                finalHeader.splice(i,0,finalConcepts[j])
                i += 1;
                j = finalConcepts.length
                found =true
            }
        }
        if(found == false && first == false){
            finalHeader.splice(i,0,'conceptId')
            i += 1;
            first = true;
        }
        
    }
    //console.log(finalHeader)



    let toExcel = ''
    toExcel += finalHeader.map(function(value){
        if(value.indexOf('conceptId') != -1){
            return 'conceptId'
        }
        if(value.indexOf(',') != -1){
            return "\"" + value + "\"";
        }
        else if(value == '0'){
            return ''
        }
        else{
            return value;
        }
    }).join(",");
    //console.log(finalMatrix[1])
    for(let i =0 ; i < finalMatrix.length; i++){
       
        let max = maxes[i]
        let finalArr = [];
        let currItem = finalMatrix[i] 
    
        for(let k = 0; k < max; k++){
            let toInsert = []
            for(let j = 0; j < finalHeader.length; j++){

                toInsert.push('')

            }
            finalArr.push(toInsert);
        }
        for(let j = 0; j < finalHeader.length; j++){
            let currKey = finalHeader[j]
            
            if(currItem.hasOwnProperty(currKey)){
                let currArr = currItem[currKey]
                if(currKey != '0'){
                    for(let k = 0; k < currArr.length; k++){
                        finalArr[k][j] = currArr[k]
                    }
                }
            }
        }
        for(let j = 0; j < finalArr.length; j++){
            toExcel += '\n'
            toExcel += finalArr[j].map(function(value){
                if(value.indexOf(',') != -1){
                    return "\"" + value + "\"";
                }
                else{
                    return value;
                }
            }).join(",");
        }

    }    
        
    


    fs.writeFileSync('testOutput1.csv', toExcel)
    console.log(finalMatrix)
    
    //console.log(toExcel)
    //console.log(finalConcepts)
}

function recurseRead(curr,final, key, conceptSeen, isSource){
    let keys = Object.keys(curr)
    let toPrint = []

    if(curr.hasOwnProperty('conceptId') && key != ''){
        let nextObj = curr['conceptId']
        if(key == 'subcollections' || key == 'subcollection'){
            let found = -1;
            let firstWithoutconceptId = -1;
            for(let i = 0; i < keys.length; i++){
                if(final.hasOwnProperty('conceptId' + keys[i]) && keys[i] != '' && keys[i] != 'subcollections'&& keys[i] != 'subcollection' && found == -1){
                    found = i;
                }
                if(!keys[i].includes('conceptId') && firstWithoutconceptId == -1 && keys[i] != 'subcollections'&& keys[i] != 'subcollection'){
                    firstWithoutconceptId = i
                }
            }
            let toChange = ''
            if(found == -1){
                toChange = keys[firstWithoutconceptId]
            }
            else{
                toChange = keys[found]
            }
            
            if(final.hasOwnProperty('conceptId' + toChange)){
                if(!final['conceptId' + toChange].includes(nextObj)){
                    final['conceptId' + toChange].push(nextObj)
                }
            }
            else{
                final['conceptId' + toChange] = [nextObj]
            }
        }
        else{
            if(final.hasOwnProperty('conceptId' + key)){
                if(!final['conceptId' + key].includes(nextObj)){
                    final['conceptId' + key].push(nextObj)
                }
            }
            else{
                final['conceptId' + key] = [nextObj]

            }
        }
    }
    
    for(let j = 0; j < keys.length; j++){
        let nextObj = curr[keys[j]]
        if(Array.isArray(nextObj)){
            let arr = []
            for(let k = 0; k <nextObj.length; k++){
                if(typeof nextObj[k] != 'string'){
                    if(!conceptSeen.includes(nextObj[k]['conceptId'])){
                        conceptSeen.push(nextObj['conceptId'])
                        if(!key.includes('Source')){
                            let returned = recurseRead(nextObj[k], final, keys[j], conceptSeen)
                            arr.push(returned)
                        }
                    }
                }
                else{
                    //console.log(JSON.stringify(nextObj))
                }
                
            }
            //console.log(keys[j])
            //console.log(arr)
        }

        else if(typeof nextObj == 'string'){
            if(keys[j] != 'conceptId' && key != 'conceptId'){
                if(key == '' || key == 'subcollection'){
                    if(final.hasOwnProperty(keys[j])){
                        if(!final[keys[j]].includes(nextObj)){
                            final[keys[j]].push(nextObj)
                        }
                    }
                    else{
                        final[keys[j]] = [nextObj]
                    }
                    //toPrint.push(keys[j] + ':' + nextObj)
                    //console.log(keys[j] + ': ' + nextObj)
                }
                else{
                    if(final.hasOwnProperty(key)){
                        if(!final[key].includes(nextObj)){
                            final[key].push(nextObj)
                        }
                        
                    }
                    else{
                        final[key] = [nextObj]
                    }
                    //toPrint.push(key + ':' + nextObj)
                    //console.log(key + ': ' + nextObj)
                }
            }

            else if(keys[j] == 'conceptId' && key == ''){
                if(final.hasOwnProperty('conceptId' + key)){
                    if(!final['conceptId' + key].includes(nextObj)){
                        final['conceptId' + key].push(nextObj)
                    }
                }
                else{
                    final['conceptId' + key] = [nextObj]
                }
            }
        
        }


        else{
            if(!nextObj.hasOwnProperty('conceptId') || !conceptSeen.includes(nextObj['conceptId'])){
                if(nextObj.hasOwnProperty('conceptId')){
                    conceptSeen.push(nextObj['conceptId'])
                    recurseRead(nextObj, final, keys[j], conceptSeen)
                }
                else{
                    let kList = Object.keys(nextObj);
                    
                    for(let k = 0; k < kList.length; k++){

                        if(nextObj[kList[k]].hasOwnProperty('variableName') && !nextObj[kList[k]]['variableName'].includes('=')){
                            nextObj[kList[k]]['variableName'] = kList[k] + '=' + nextObj[kList[k]]['variableName']
                        }
                        recurseRead(nextObj[kList[k]], final, keys[j], conceptSeen)
                    }
                }
            }

        }

    }
    //console.log(toPrint)

}

module.exports = {
    reverseRead: reverseRead
}