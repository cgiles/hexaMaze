class MazeGenerator {
    constructor(kindOfMaze = KindOfMaze.DepthFirstSearch, mazeRadius = 20, hexRadius = 20, options = { randomStart: false, rainbow: false, instant: false, instantSolving: false, shouldSolve: true }) {

        this.kindOfMaze = kindOfMaze;
        this.generated = false;
        this.mazeRadius = mazeRadius;
        this.hexRadius = hexRadius;
        this.rainbow = options.rainbow;
        this.instant = options.instant;
        this.instantSolving = options.instant != options.instantSolving ? options.instantSolving : options.instant;
        this.randomStart = options.randomStart;
        this.hexs = generateHexs(this.hexRadius, this.mazeRadius);
        this.nbCells = this.hexs.length;
        this.halfNbCells = floor(this.nbCells / 2);
        this.visitedHexs = [];
        this.unvisitedHexs = [...this.hexs];
        this.aHex = this.randomStart ? randomValue(this.hexs) : new Hex(hexRadius, { s: 0, q: 0, r: 0 });
        this.aHex.wasVisited = true;

        this.hue = 0;
        this.distance = 0;

        this.maxDistance = -Infinity;
        this.moreDistantHex = this.aHex;

        this.startHex = this.aHex;
        this.startHexIndex = getHexIndex(this.startHex, this.hexs);

        this.endHex;
        this.endHexIndex;
        this.setHexsValues()


        this.explored = false;
        this.isExploring = false;

        this.shouldSolve = options.shouldSolve;
        this.solved = false;
        this.isSolving = false;
        this.solution = [];

        this.mazeStatus={value:"none"};
    }

    renderMaze(options = { numberIsValue: false, showBG: false, drawIfUnvisited: true, showNumber: false, showSolution: true }) {
        push();
        translate(width / 2, height / 2);
        let showOptions = {
            showBG: options.showBG,
            drawIfUnvisited: options.drawIfUnvisited,
            showNumber: options.showNumber,
            rainbowColor: this.rainbow,
            numberIsValue: options.numberIsValue

        }

        for (let i = 0; i < this.hexs.length; i++) {
            this.hexs[i].show(showOptions);
        }
        push();
        if (this.solution.length > 0 && options.showSolution) {
            for (let i = 1; i < this.solution.length; i++) {
                stroke(0, 255, 127);
                strokeWeight(3);
                line(this.solution[i - 1].x, this.solution[i - 1].y, this.solution[i].x, this.solution[i].y);
            }
        }
        pop();

        fill(this.rainbow ? (this.hue + this.halfNbCells) % this.nbCells : 0, 255, 255);
        if (this.generated && this.explored) circle(this.hexs[this.startHexIndex].x, this.hexs[this.startHexIndex].y, this.hexRadius * 0.6);
        else circle(this.aHex.x, this.aHex.y, this.hexRadius * 0.6)
        fill(this.rainbow ? (this.hue + this.halfNbCells / 2) % this.nbCells : 180, 255, 255);
        if (this.generated && this.explored) circle(this.hexs[this.endHexIndex].x, this.hexs[this.endHexIndex].y, this.hexRadius * 0.6);

        pop();
    }

    generateMaze() {
        this.updateMazeStatus();
        if (!this.generated) {
            if (this.instant) {
                push();
                translate(width / 2, height / 2);
                textAlign(CENTER, CENTER);
                textSize(24);
                text("Generating Maze", 0, 0);
                pop();
                switch (this.kindOfMaze) {
                    case KindOfMaze.DepthFirstSearch:
                        do {
                            this.aHex = this.depthFirstSearch();
                        } while (this.generated == false);
                        break;
                    case KindOfMaze.Kruksal:
                        while (!this.isAllSameValues()) {
                            this.kruksalGenerator();
                        }
                        this.generated = true;
                        break;
                    case KindOfMaze.DFPK:
                        while (!this.isAllSameValues()) {
                            this.aHex = this.DFPK();
                        }
                        this.generated = true;

                }
                while (!this.explored) this.exploreMaze();


            } 
            else if (this.generated&&this.explored&&this.shouldSolve && this.instantSolving&&!this.solved) 
            {
            while (!this.solved) this.solveMaze();
            
            }
            else {
                switch (this.kindOfMaze) {
                    case KindOfMaze.DepthFirstSearch:
                        this.aHex = this.depthFirstSearch()

                        break;
                    case KindOfMaze.Kruksal:
                        this.kruksalGenerator()
                        if (this.isAllSameValues()) {
                            this.generated = true;
                        }
                        break;
                    case KindOfMaze.DFPK:
                        this.aHex = this.DFPK();
                }
            }
        }
        if (!this.explored && this.generated) this.exploreMaze();
        if (!this.instantSolving && this.shouldSolve && !this.solved && this.explored && this.generated) this.solveMaze();
    }
    depthFirstSearch() {

        let possibleNeighbors = this.aHex.getUnvisitedNeighbors(this.hexs);

        if (possibleNeighbors.length > 0) {

            this.aHex.hue = this.rainbow ? this.hue : 180;

            this.hue++;
            this.distance++;

            this.visitedHexs.push(this.aHex);

            let nextNeighbor = randomValue(possibleNeighbors);

            let directionNeighbor = getHexIndex(nextNeighbor, this.aHex.getNeighbors(this.hexs));

            let neighborIndex = getHexIndex(nextNeighbor, this.hexs);

            let thisIndex = getHexIndex(this.aHex, this.hexs);

            this.hexs[thisIndex].wasVisited = true;
            this.hexs[neighborIndex].wasVisited = true;

            this.hexs[thisIndex].sideOpen[directionNeighbor] = true;
            this.hexs[neighborIndex].sideOpen[floor(directionNeighbor + 3) % 6] = true;

            nextNeighbor.hue = this.rainbow ? this.hue : 180;
            nextNeighbor.distance = this.distance;

            if (this.distance > this.maxDistance) {
                this.maxDistance = this.distance;
                this.moreDistantHex = nextNeighbor;
            }

            return nextNeighbor;

        } else if (this.visitedHexs.length > 0) {
            let nextNeighbor = this.hexs[getHexIndex(this.visitedHexs[this.visitedHexs.length - 1], this.hexs)];
            this.hue = nextNeighbor.hue;
            this.distance = nextNeighbor.distance;
            this.visitedHexs.pop();
            return nextNeighbor;
        } else {
            this.endHex = this.moreDistantHex;
            this.endHexIndex = getHexIndex(this.endHex, this.hexs);
            this.generated = true;
            //this.explored = true;
            //this.solved=true;
        }
    }

    //////Kruksal's Method
    setHexsValues() {
        for (let i = 0; i < this.hexs.length; i++) {
            this.hexs[i].value = i;
            this.hexs[i].hue = i;
        }
    }
    isAllSameValues() {
        let firstValue = this.hexs[0].value;
        for (let i = 0; i < this.hexs.length; i++) {
            if (this.hexs[i].value != firstValue) {
                return false;
            }
        }
        return true;
    }
    kruksalGenerator() {
        this.aHex = randomValue(this.hexs);

        let neigbors = this.aHex.getNeighbors(this.hexs);
        if (neigbors != undefined && neigbors.length > 0) {
            let pickedNeighbor = this.aHex.getDifferentNeighbor(neigbors);

            let pickedNeighborValue = pickedNeighbor.value;

            let thisIndex = getHexIndex(this.aHex, this.hexs);

            let pickedNeighborIndex = getHexIndex(pickedNeighbor, this.hexs);

            let directionNeighbor = getHexIndex(pickedNeighbor, this.aHex.getNeighbors(this.hexs));

            if (thisIndex != undefined && pickedNeighborIndex != undefined) {
                this.hexs[thisIndex].sideOpen[directionNeighbor] = true;
                this.hexs[pickedNeighborIndex].sideOpen[(directionNeighbor + 3) % 6] = true;
                let hexsWithSameValue = findHexsWithSameValue(pickedNeighborValue, this.hexs);

                for (let i = 0; i < hexsWithSameValue.length; i++) {
                    hexsWithSameValue[i].value = this.aHex.value;
                    hexsWithSameValue[i].hue = this.aHex.hue;
                }
            }
        }

    }

    DFPK() {
        let possibleNeighbors = this.aHex.getUnvisitedNeighbors(this.hexs);

        this.unvisitedHexs = [...removeHexFromArray(this.aHex, this.unvisitedHexs)];
        if (possibleNeighbors.length > 0) {
            // this.aHex.hue = this.rainbow ? this.hue : 180;



            let nextNeighbor = randomValue(possibleNeighbors);

            let directionNeighbor = getHexIndex(nextNeighbor, this.aHex.getNeighbors(this.hexs));

            let neighborIndex = getHexIndex(nextNeighbor, this.hexs);

            let thisIndex = getHexIndex(this.aHex, this.hexs);

            this.hexs[thisIndex].wasVisited = true;
            this.hexs[neighborIndex].wasVisited = true;

            this.hexs[thisIndex].sideOpen[directionNeighbor] = true;
            this.hexs[neighborIndex].sideOpen[floor(directionNeighbor + 3) % 6] = true;

            this.hexs[neighborIndex].value = this.aHex.value;
            this.hexs[neighborIndex].hue = this.aHex.hue;

            return nextNeighbor;

        }
        else if (possibleNeighbors.length == 0 && this.aHex.getDifferentNeighbor(this.aHex.getNeighbors(this.hexs)).length > 0) {
            let neigbors = this.aHex.getNeighbors(this.hexs);
            if (neigbors != undefined && neigbors.length > 0) {
                let pickedNeighbor = this.aHex.getDifferentNeighbor(neigbors);
                if (typeof (pickedNeighbor) != "number") console.log("Something wrong here");
                let pickedNeighborValue = pickedNeighbor.value;

                let thisIndex = getHexIndex(this.aHex, this.hexs);

                let pickedNeighborIndex = getHexIndex(pickedNeighbor, this.hexs);

                let directionNeighbor = getHexIndex(pickedNeighbor, this.aHex.getNeighbors(this.hexs));

                if (thisIndex != undefined && pickedNeighborIndex != undefined) {
                    this.hexs[thisIndex].sideOpen[directionNeighbor] = true;
                    this.hexs[pickedNeighborIndex].sideOpen[(directionNeighbor + 3) % 6] = true;
                    let hexsWithSameValue = findHexsWithSameValue(pickedNeighborValue, this.hexs);

                    for (let i = 0; i < hexsWithSameValue.length; i++) {
                        hexsWithSameValue[i].value = this.aHex.value;
                        hexsWithSameValue[i].hue = this.aHex.hue;
                    }
                }
                return this.aHex;
            }
        } else if (this.unvisitedHexs.length > 0) {
            return randomValue(this.unvisitedHexs);
        }
        else if (!this.isAllSameValues()) {
            this.aHex = randomValue(this.hexs);
            let neigbors = this.aHex.getNeighbors(this.hexs);
            if (neigbors != undefined && neigbors.length > 0) {
                let pickedNeighbor = this.aHex.getDifferentNeighbor(neigbors);

                let pickedNeighborValue = pickedNeighbor.value;

                let thisIndex = getHexIndex(this.aHex, this.hexs);

                let pickedNeighborIndex = getHexIndex(pickedNeighbor, this.hexs);

                let directionNeighbor = getHexIndex(pickedNeighbor, this.aHex.getNeighbors(this.hexs));

                if (thisIndex != undefined && pickedNeighborIndex != undefined) {
                    this.hexs[thisIndex].sideOpen[directionNeighbor] = true;
                    this.hexs[pickedNeighborIndex].sideOpen[(directionNeighbor + 3) % 6] = true;
                    let hexsWithSameValue = findHexsWithSameValue(pickedNeighborValue, this.hexs);

                    for (let i = 0; i < hexsWithSameValue.length; i++) {
                        hexsWithSameValue[i].value = this.aHex.value;
                        hexsWithSameValue[i].hue = this.aHex.hue;
                    }
                }
                return this.aHex;
            }
            if (this.isAllSameValues()) this.generated = true;
        } else {
            this.generated = true;
        }
    }



    exploreMaze() {
        if (!this.isExploring) {
            this.isExploring = true;
            let possibleStart = []
            this.visitedHexs = [];
            this.distance = 0;
            this.hue = 0;
            for (let i = 0; i < this.hexs.length; i++) {
                if (this.hexs[i].isDeadEnd()) {
                    possibleStart.push(this.hexs[i]);
                }
                this.hexs[i].wasVisited = false;
            }

            this.aHex = randomValue(possibleStart);
            this.startHex = this.aHex;
            this.startHexIndex = getHexIndex(this.aHex, this.hexs);
            this.aHex.distance = this.distance;

            this.visitedHexs.push(this.aHex);
            console.log("possible starts :" + possibleStart.length);
            console.log("nb hexs: " + this.hexs.length);

        } else if (this.isExploring) {


            let unvisitedNeighbors = this.aHex.getOpenUnvisitedNeighbors(this.hexs);
            if (unvisitedNeighbors.length > 0) {
                this.aHex.hue = this.hue;
                this.hue++;
                this.distance++;
                this.visitedHexs.push(this.aHex);

                let nextNeighbor = randomValue(unvisitedNeighbors);
                let directionNeighbor = getHexIndex(nextNeighbor, this.aHex.getNeighbors(this.hexs));

                let neighborIndex = getHexIndex(nextNeighbor, this.hexs);

                let thisIndex = getHexIndex(this.aHex, this.hexs);

                this.hexs[thisIndex].wasVisited = true;
                this.hexs[neighborIndex].wasVisited = true;

                this.hexs[thisIndex].sideOpen[directionNeighbor] = true;
                this.hexs[neighborIndex].sideOpen[floor(directionNeighbor + 3) % 6] = true;

                nextNeighbor.hue = this.rainbow ? this.hue : 180;
                nextNeighbor.distance = this.distance;

                if (this.distance > this.maxDistance) {
                    this.maxDistance = this.distance;
                    this.moreDistantHex = nextNeighbor;
                }

                this.aHex = nextNeighbor;

            } else if (this.visitedHexs.length > 0) {
                let nextNeighbor = this.hexs[getHexIndex(this.visitedHexs[this.visitedHexs.length - 1], this.hexs)];
                this.hue = nextNeighbor.hue;
                this.distance = nextNeighbor.distance;
                this.visitedHexs.pop();
                this.aHex = nextNeighbor;
            } else {

                this.explored = true;
                this.endHex = this.moreDistantHex;
                this.endHexIndex = getHexIndex(this.endHex, this.hexs);
            }
        }
    }
    solveMaze() {
        if (!this.isSolving) {
            this.isSolving = true;

            this.visitedHexs = [];
            this.aHex = this.startHex;
            for (let i = 0; i < this.hexs.length; i++) {
                this.hexs[i].wasVisited = false;
            }
        } else {
            console.log("solving");
            this.solution = [...this.visitedHexs];
            if (compareHex(this.aHex, this.endHex)) {
                this.visitedHexs.push(this.aHex);
                console.log("Solved !")
                this.solved = true;
                this.solution = [...this.visitedHexs];
                return;
            }
            let unvisitedNeighbors = this.aHex.getOpenUnvisitedNeighbors(this.hexs);
            if (unvisitedNeighbors.length > 0) {
                // this.aHex.hue = this.hue;
                // this.hue++;

                this.visitedHexs.push(this.aHex);

                let nextNeighbor = randomValue(unvisitedNeighbors);
                let directionNeighbor = getHexIndex(nextNeighbor, this.aHex.getNeighbors(this.hexs));

                let neighborIndex = getHexIndex(nextNeighbor, this.hexs);

                let thisIndex = getHexIndex(this.aHex, this.hexs);

                this.hexs[thisIndex].wasVisited = true;
                this.hexs[neighborIndex].wasVisited = true;

                this.hexs[thisIndex].sideOpen[directionNeighbor] = true;
                this.hexs[neighborIndex].sideOpen[floor(directionNeighbor + 3) % 6] = true;

                //nextNeighbor.hue = this.rainbow ? this.hue : 180;


                this.aHex = nextNeighbor;

            } else if (this.visitedHexs.length > 0) {
                let nextNeighbor = this.hexs[getHexIndex(this.visitedHexs[this.visitedHexs.length - 1], this.hexs)];
                //this.hue = nextNeighbor.hue;
                this.distance = nextNeighbor.distance;
                this.visitedHexs.pop();
                this.aHex = nextNeighbor;
            }
        }
         
    }
    updateMazeStatus(){
        if(!this.generated)this.mazeStatus.value="Generating";
        else if(this.isExplored)this.mazeStatus.value="exploring"
        else if(this.explored&&this.isSolving)this.mazeStatus.value="solving"
        else if(this.solved)this.mazeStatus.value="solved"
    }
    /**
    * Return if the maze is generated or not
    * @returns if the maze been generated
    */
    isGenerated() {
        return this.generated;
    }

}
const KindOfMaze = {
    DepthFirstSearch: 0,
    Kruksal: 1,
    DFPK: 2
}


