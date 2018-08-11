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
service timestamps log datetime msec

service password-encryption

username pol privilege 2 secret 5 $1$LcxX$lFwq4pM2GT5XGAKOukTRU1
!
vrf definition Mgmt-intf
 !
 address-family ipv4
 exit-address-family

controller SONET 0/1/0
 threshold sf-ber 3

multilink bundle-name authenticated
!!
license udi pid ASR1002-X sn JAE202202LC
archive
 log config

interface Loopback0
 ip address 10.20.30.121 255.255.255.252
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

function AddThisLineToConfigTree(wordsInThisLine) {
    var i = 0;
    while(i < wordsInThisLine.length){
        console.log("line " + wordsInThisLine + " length: " + wordsInThisLine.length);
        i++;
    }
}

var linesOfConfig = configfile.split("\n");
var listOfFirstWords = GetFirstWordsOfConfig(linesOfConfig);
var preferedList = ["interface", "ip", "controller", "line", "hostname", "username", "enable", "access-list", "router", "clock", "license", "version"];
var sortedFirstWords = SortFirstListBaseOnSecond(listOfFirstWords, preferedList);

