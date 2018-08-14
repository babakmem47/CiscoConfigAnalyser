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
controller E1 1/0
 framing NO-CRC4 
 channel-group 5 timeslots 5-12
 channel-group 13 timeslots 13-20
!
crypto isakmp policy 1
 encr 3des

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

function CheckEveryLinesOfRawConfig(linesOfConfig) {
    var firstWordsList = [];
    for (var i = 0; i < linesOfConfig.length; i++) {
        var thisLineOfConfig = linesOfConfig[i];
        if (thisLineOfConfig.length == 0) { continue; }
        if (thisLineOfConfig.charAt(0) === "!" || thisLineOfConfig.charAt(0) === " ") { continue; }

        var wordsInThisLine = thisLineOfConfig.split(" ");
        AddThisLineToConfigTree(wordsInThisLine);       
    }
}

function SortNodeChildsBaseOnPreferedItems(node, prefItems) {
    var i = 0;
    var index = 0;
    while (i < prefItems.length) {
        var item = prefItems[i];
        var j = 0;
        while (j < node.children.length) {
            if (item == node.children[j].value) {
                var temp =  node.children[index];
                node.children[index] = node.children[j];
                node.children[j] = temp;
                index++;
                break;
            }
            j++;
        }
        i++;
    }

    return node;
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
    var parent = LocateLastNodeInList(rootConfig ,precededWords);
    InsertNodeUnderItsParent(node, parent);
}

function LocateLastNodeInList(startNode, precededNodesList){   // LocateLastNodeInList(startNode, ["service", "timestamp"])
    var lastNode = startNode
    var index = 0;    
    while(index < precededNodesList.length){
        var childs = lastNode.children;
        for(var i = 0; i < childs.length; i++) {
            if(childs[i].value == precededNodesList[index]){
                lastNode = childs[i];
                index++;
                break;
            }    
        }    
    }
    
    return lastNode;
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

function ChildrenValuesInString(node) {
    var childsValues = [];
    for(i = 0; i < node.children.length; i++){
        childsValues.push(node.children[i].value);
    }

    return childsValues;
}

var linesOfConfig = configfile.split("\n");
CheckEveryLinesOfRawConfig(linesOfConfig);
var listOfFirstWords = ChildrenValuesInString(rootConfig);
var preferedItems = ["interface", "ip", "controller", "line", "hostname", "username", "enable", "access-list", "router", "clock", "license", "version"];
//SortNodeChildsBaseOnPreferedItems(rootConfig ,preferedItems);
console.log("salam");



