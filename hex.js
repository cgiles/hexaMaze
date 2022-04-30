class Hex {
    constructor(size, coord = { s: 0, q: 0, r: 0 }, pointy = true) {
        if ((coord.s + coord.q + coord.r) != 0) {
            noLoop();
        }

        this.pointy = pointy;
        this.coord = coord;
        this.size = size;
        this.direction = [{ q: 1, r: 0, s: -1 }, { q: 0, r: 1, s: -1 }, { q: -1, r: 1, s: 0 },
        { q: -1, r: 0, s: 1 }, { q: 0, r: -1, s: 1 }, { q: 1, r: -1, s: 0 }];
        this.s = this.coord.s;
        this.q = this.coord.q;
        this.r = this.coord.r;
        this.orientation = [sqrt(3.0), sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0];
        this.x = (this.orientation[0] * this.q + this.orientation[1] * this.r) * this.size;
        this.y = (this.orientation[2] * this.q + this.orientation[3] * this.r) * this.size;

        this.angle = PI / 3;
        this.angleOffset = PI / 6;
        this.width = sqrt(3) * size;
        this.height = size * 2;
        this.sideOpen = [false, false, false, false, false, false];
        this.wasVisited = false;

        this.distance = 0;

        this.value = -1;

        this.hue = 0;
    }

    show(options={showBG:false,rainbowColor:true,drawIfUnvisited:true,showNumber:false,numberIsValue:true}) {
        if (this.wasVisited||options.drawIfUnvisited) {
            push();

            translate(this.x, this.y);
            //draw background
            
            if(options.showBG){
            noStroke();
            if (options.rainbowColor) fill(this.hue%360,190,190);
            else fill(255,0,0);
            beginShape();
            for (let i = 0; i < 6; i++) {
                let a = this.angle * i - this.angle / 2;

                let xP = cos(a) * this.size;
                let yP = sin(a) * this.size;
                vertex(xP, yP);



            }
            endShape(CLOSE);
        }
            //draw sides
            stroke(0);
            for (let i = 0; i < 6; i++) {
                if (!this.sideOpen[i]) {
                    let a = this.angle * (i) - this.angleOffset;
                    let aa = this.angle * (i + 1) - this.angleOffset;
                    let xP = cos(a) * this.size;
                    let yP = sin(a) * this.size;
                    let xPP = cos(aa) * this.size;
                    let yPP = sin(aa) * this.size;
                    fill(0);

                    line(xP, yP, xPP, yPP);
                    // text(str(i),(xP+xPP)/2,(yP+yPP)/2);
                    //text(this.coord.s+" "+this.q+" "+this.r,0,0);
                }
            }
            //draw points
            for (let i = 0; i < 6; i++) {
                let a = this.angle * i - this.angleOffset;
                let xP = cos(a) * this.size;
                let yP = sin(a) * this.size;
                push();
                fill(0);
                noStroke();
                circle(xP, yP, this.size / 4);
                pop();
            }
            if(options.showNumber){
            fill(0);
            textAlign(CENTER,CENTER);
            text(options.numberIsValue?this.value:this.distance,0,0);
            }
            pop();
        }
    }
    getNeighbors(hexs = []) {
        let neighbors = [];
        for (let i = 0; i < this.direction.length; i++) {
            let aHex = addHex(new Hex(0, this.coord), new Hex(0, this.direction[i]));
           
            let foundHex = hexs.find(element => compareHex(element, aHex));
            neighbors.push(foundHex);
        }
      
        return neighbors;
    }
    getUnvisitedNeighbors(hexs = []) {
        let neighbors = this.getNeighbors(hexs);
       
        let unvisitedNeighbors = [];
        for (let i = 0; i < neighbors.length; i++) {
            if (neighbors[i] != undefined) {

                if (!neighbors[i].wasVisited) {
                    unvisitedNeighbors.push(neighbors[i]);
                }
            }
        }
        return unvisitedNeighbors;
    }
    getVisitedNeighbors(hexs = []) {
        let neighbors = this.getNeighbors(hexs);
        
        let visitedNeighbors = [];
        for (let i = 0; i < neighbors.length; i++) {
            if (neighbors[i] != undefined) {
                if (neighbors[i].wasVisited) {
                    visitedNeighbors.push(neighbors[i]);
                }
            }
        }
        
        return visitedNeighbors;
    }
    getDifferentNeighbor(hexs = []) {
        let neighbors = [];
        for (let i = 0; i < hexs.length; i++) {
            if (hexs[i] != undefined) {
                if (hexs[i].value != this.value) {
                    neighbors.push(hexs[i]);
                }
            }
        }
        if (neighbors.length > 0) {
            return randomValue(neighbors);
        } else {
            return neighbors;
        }

    }
    getOpenUnvisitedNeighbors(hexs=[]){
        let openNeighbors=[];
        let neighbors=this.getNeighbors(hexs);
        for(let i=0;i<neighbors.length;i++){
            if(this.sideOpen[i]){
                if(!neighbors[i].wasVisited){
                    openNeighbors.push(neighbors[i]);
                }
            }
        }
        return openNeighbors;
    }
    getWidth(s = this.size) {
        return sqrt(3) * s;
    }
    getHeight(s = this.size) {
        return s * 2;
    }
    getCoord() {
        return this.coord
    }
    beenVisited() {
        return this.wasVisited;
    }
    isDeadEnd(){
        let nbOpenSide=0;
        for(let i=0;i<this.sideOpen.length;i++){
            if(this.sideOpen[i])nbOpenSide++;
            
        }
        if(nbOpenSide>1)return false;
        else return true;
    }
}
function addHex(a, b) {
    if (a != undefined && b != undefined)
        return new Hex(a.size, { s: a.s + b.s, q: a.q + b.q, r: a.r + b.r });
}
function compareHex(a, b) {
    if (a != undefined && b != undefined)
        return a.s == b.s && a.q == b.q && a.r == b.r;
}

function generateHexs(size, map_radius = 0) {
    let hexs = [];
    for (let q = -map_radius; q <= map_radius; q++) {
        let r1 = max(-map_radius, -q - map_radius);
        let r2 = min(map_radius, -q + map_radius);
        for (let r = r1; r <= r2; r++) {
            

            hexs.push(new Hex(size, { s: q, q: r, r: -q - r }));
        }
    }
    return hexs;
}
function getHexIndex(hex, hexs = []) {

    let anIndex = hexs.findIndex((element) => compareHex(hex, element))
    if (anIndex >= 0) return anIndex;
    else return undefined;
}
function findHexsWithSameValue(value, hexs = []) {
    let hexsSameValue = []
    hexsSameValue = hexs.filter(element => element.value == value);
    return hexsSameValue;
}