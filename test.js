function SortFirstListBaseOnSecond(firstWords, preferedItems) {
    var i = 0;
    var index = 0;
    while(i < preferedItems.length){
        var item = preferedItems[i];
        var j = 0;
        while(j < firstWords.length){
            if(item == firstWords[j]){
                //console.log(item, firstWords[j])
                var temp = firstWords[index];
                firstWords[index] = item;
                firstWords[j] = temp;
                index++;
                break;
            }
            j++;
            //console.log(item + " : " + firstWords[j]);                
        }
        i++;
    }
    console.log(firstWords);
    return firstWords;
    //console.log(firstWords);
}

var listOfFirstWords = ["version", "multilink", "controller", "vrf", "interface", "ip", "snmp-server", "line"];
var preferedList = ["interface", "ip", "controller", "line"];
var sortedFirstWords = SortFirstListBaseOnSecond(listOfFirstWords, preferedList);
