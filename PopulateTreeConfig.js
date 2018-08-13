var rootConfig = new Node('rootConfig');
                
function Node(value) {

    this.value = value;
    this.children = [];
    this.parent = null;

    this.setParentNode = function (node) {
        this.parent = node;
    }

    this.getParentNode = function () {
        return this.parent;
    }

    this.addChild = function (node) {
        node.setParentNode(this);
        this.children[this.children.length] = node;
    }

    this.getChildren = function () {
        return this.children;
    }

    this.removeChildren = function () {
        this.children = [];
    }
}

var configfile = `
version 15.5
service timestamps debug datetime msec
license udi pid ASR1002-X sn JAE202202GS
archive
 log config
  logging enable
!
spanning-tree extend system-id
!
username admin privilege 15 secret 5 $1$pPJA$uw0vPx9tHhxWLug49BRhO1
username master privilege 15 secret 5 $1$pK/x$nv7VWPHz9rVPBA3SFDG4K1
!
interface Loopback0
 ip address 10.20.30.121 255.255.255.252
!
interface Tunnel0
 description [TDLTE-7tir]
 ip address 192.168.225.1 255.255.255.252
 ip tcp adjust-mss 1360
 keepalive 5 4
 tunnel source 172.19.5.162
 tunnel destination 172.19.5.218
!
interface Tunnel1
 description description [TDLTE-Negin]
 ip address 192.168.225.5 255.255.255.252
 keepalive 5 4
 tunnel source 172.19.5.162
 tunnel destination 172.19.5.62
!
interface Tunnel500
 description MPLS-Negin
 ip address 192.168.49.29 255.255.255.252
 ip tcp adjust-mss 1360
 tunnel source 172.19.8.34
 tunnel destination 172.17.16.34
!
interface GigabitEthernet0/0/0
 no ip address
 negotiation auto
!
interface GigabitEthernet0/0/0.116
 description [TDLTE-Mobin]
 encapsulation dot1Q 116
 ip address 172.19.5.162 255.255.255.224
!
interface GigabitEthernet0/0/0.259
 encapsulation dot1Q 259
 ip address 10.200.0.49 255.255.255.252
!
interface GigabitEthernet0/0/0.901
 description [MPLS-Negin]
 encapsulation dot1Q 901
 ip address 172.19.8.34 255.255.255.252
!
interface GigabitEthernet0/0/1
 no ip address
 shutdown
 negotiation auto
!
interface GigabitEthernet0/0/2
 no ip address
 shutdown
 negotiation auto
!
interface GigabitEthernet0/0/3
 no ip address
 shutdown
 negotiation auto
!
interface GigabitEthernet0/0/4
 no ip address
 shutdown
 negotiation auto
!
interface GigabitEthernet0/0/5
 ip address 10.200.0.18 255.255.255.252
 negotiation auto
!
interface Serial0/1/0.1/1/1/1:0
 description [ATM-1160-Mostazafin Firoozkooh]
 ip unnumbered Loopback0
 encapsulation ppp
!
interface Serial0/1/0.1/1/1/1:1
 description [0195-Tellabs-1M]
 ip address 10.51.3.105 255.255.255.252
 encapsulation ppp
!
interface Serial0/1/0.1/1/1/1:5
 description 0191-64K
 no ip address
 shutdown
!
`;

function GetFirstWordsOfConfig(linesOfConfig) {
    var firstWordsList = [];
    for (var i = 0; i < linesOfConfig.length; i++) {
        var thisLineOfConfig = linesOfConfig[i];
        if (thisLineOfConfig.length == 0) { continue; }
        if (thisLineOfConfig.charAt(0) === "!" || thisLineOfConfig.charAt(0) === " ") { continue; }

        var wordsInThisLine = thisLineOfConfig.split(" ");
        AddThisLineToConfigTree(wordsInThisLine);
        var firstWord = wordsInThisLine[0];
        var isAlreadyInList = false;
        for (var j = 0; j < firstWordsList.length; j++) {
            if (firstWord == firstWordsList[j]) {
                isAlreadyInList = true;
                break;
            }
        }
        if (!isAlreadyInList) {
            firstWordsList.push(firstWord);
        }
    }

    return firstWordsList;
}

function SortFirstListBaseOnSecond(firstWords, preferedItems) {
    var i = 0;
    var index = 0;
    while (i < preferedItems.length) {
        var item = preferedItems[i];
        var j = 0;
        while (j < firstWords.length) {
            if (item == firstWords[j]) {
                var temp = firstWords[index];
                firstWords[index] = item;
                firstWords[j] = temp;
                index++;
                break;
            }
            j++;
        }
        i++;
    }

    return firstWords;

}

function AddThisLineToConfigTree(wordsInThisLine){
    var precededWords = [];
    wordsInThisLine = DivideInterfacesIntoSubString(wordsInThisLine);
    for(var i = 0; i < wordsInThisLine.length; i++){
        AddNode(precededWords, wordsInThisLine[i])
        precededWords.push(wordsInThisLine[i]);
    }
}

function AddNode(precededWords, node) {             // precededParents: words before node in a line of code
    var parent = FindParentOfANode(precededWords, node);
    InsertNodeUnderItsParent(node, parent);
}

function FindParentOfANode(precededNodesList, node){   //FindParentOfANode(["service", "timestamp"], 'log')
    var parent = rootConfig
    var index = 0;    
    while(index < precededNodesList.length){
        var childs = parent.children;
        for(var i = 0; i < childs.length; i++) {
            if(childs[i].value == precededNodesList[index]){
                parent = childs[i];
                index++;
                break;
            }    
        }    
    }
    
    return parent;
}



function InsertNodeUnderItsParent(node, parent){
    var childsOfParent = parent.children;
    var isBetweenChildsAlready = false;
    for(i = 0; i < childsOfParent.length; i++){
        if(node == parent.children[i].value){
            isBetweenChildsAlready = true;
            break;
        }
    }
    if(isBetweenChildsAlready == false) {
        parent.addChild(new Node(node));
    }
    
}

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


var linesOfConfig = configfile.split("\n");
var listOfFirstWords = GetFirstWordsOfConfig(linesOfConfig);
var preferedList = ["interface", "ip", "controller", "line", "hostname", "username", "enable", "access-list", "router", "clock", "license", "version"];
var sortedFirstWords = SortFirstListBaseOnSecond(listOfFirstWords, preferedList);
console.log("salam");


//var childOfEthernet0 = rootConfig.children[2].getChildren();
// InsertNodeUnderItsParent('version', rootConfig);
// var version = rootConfig.children[0];
// InsertNodeUnderItsParent('15.5', version);
// InsertNodeUnderItsParent('service', rootConfig);
// var service = rootConfig.children[1];
// InsertNodeUnderItsParent('timestamps', service);
// var serviceTimestamps = service.children[0];
// InsertNodeUnderItsParent('debug', serviceTimestamps);
// InsertNodeUnderItsParent('log', serviceTimestamps);
//FindParentOfANode(["service", "timestamp"], 'log');


