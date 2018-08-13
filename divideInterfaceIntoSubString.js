function DivideInterfacesIntoSubString(wordsInThisLine) {
    var thisLineOfCode = [];
    thisLineOfCode.push(wordsInThisLine[0]);

    for (var i = 1; i < wordsInThisLine.length; i++) {
        var word = wordsInThisLine[i];
        var j = 0;
        var findDigit = false;
        while (j < word.length) {
            if (word.charCodeAt(j) >= 48 && word.charCodeAt(j) <= 57) {
                if (word.charCodeAt(j - 1) >= 65 && word.charCodeAt(j - 1) <= 122) {
                    findDigit = true;
                    thisLineOfCode.push(word.substring(0, j));
                    word = word.substring(j, word.length);
                    var indexOfdot = word.indexOf(".");
                    if(indexOfdot == -1) {
                        thisLineOfCode.push(word);
                    }
                    else {
                        thisLineOfCode.push(word.substring(0, indexOfdot));
                        thisLineOfCode.push(word.substring(indexOfdot, word.length));
                    }
                    
                    break;
                }
            }
            j++;

        }

        if(findDigit == false){
            thisLineOfCode.push(word);           
        }
    }
    return thisLineOfCode
}


var line = "controller SONET 0/2/0";
var words = line.split(' ');