


let aMaze
let popo;
let started = false;

function setup() {

  createCanvas(windowWidth, windowHeight);
  frameRate(10);
  

  
  // setHexsValues(cells);

  /*let options={
    randomStart:true,
    instant:true,
    shouldSolve:true,
    instantSolving:true,
    rainbow:true
  }*/
  generateHexaGraphics();
  started = true;
  createMaze()
  colorMode(HSB, aMaze.nbCells, 255, 255);
  popo = baseOption;
  popo.numberIsValue = true;
  popo.instant = false;
  popo.showNumber = true;
  popo.showSolution = true;
  popo.showBG=true;
  console.log(popo.showNumber);
  createPane();
}

function draw() {

  background(255);
 popo.numberIsValue=guiValues.kindOfMaze==1?true:false;

  aMaze.generateMaze();
  //popo.showSolution = guiValues.showSolution;
  popo.showNumber=guiValues.showNumber;
  aMaze.renderMaze({numberIsValue:!aMaze.isExploring,showNumber:guiValues.displayNumber,drawIfUnvisited:true,showBG:true,});
  text(aMaze.unvisitedHexs.length+" "+floor(frameRate()), 10, 10);
  //if(aMaze.generated)console.log("Generated");
  
}
function keyPressed() {
  if (key == " ") {
    if (isLooping()) noLoop();
    else loop();
  }
}

function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
}

const randomValue = (list) => {
  return list[Math.floor(Math.random() * list.length)];
}
function removeHexFromArray(hex, hexs = []) {
  let hexIndexToRemove = hexs.findIndex((element) => compareHex(element, hex));
  if (hexIndexToRemove >= 0) {
    hexs.splice(hexIndexToRemove, 1);
  }
  return hexs;
}



let baseOption = { numberIsValue: false, showBG: false, drawIfUnvisited: true, showNumber: false };



function createMaze() {
  if (started) {
    let options = {
      randomStart: guiValues.randomStart,
      instant: guiValues.instantCreation,
      shouldSolve: true,
      instantSolving: false,
      rainbow: true
    }
    let hexRadius = 20;
    hexRadius=( windowHeight - 20) / (guiValues.radiusMaze * 2 * sqrt(3));
  
    aMaze = new MazeGenerator(guiValues.kindOfMaze, guiValues.radiusMaze, hexRadius, options);
    
  }
}

const guiValues = {
  //maze values
  radiusMaze: 20,
  showSolution: false,
  randomStart: true,
  showSolution: false,
  kindOfMaze:0,
  instantCreation:false,
  displayNumber:false
}
function createPane(){
  const pane=new Tweakpane.Pane({title:"Parameters",expanded:true});
  const mazeFolder=pane.addFolder({title:"Maze",expanded:true});
  mazeFolder.addInput(guiValues,"radiusMaze",{min:3,max:20,step:1});
  mazeFolder.addInput(guiValues,"kindOfMaze",{options:{deepFirstSearch:0,kruksal:1}});
  mazeFolder.addInput(popo,"showSolution",{label:"Show solution"});
  mazeFolder.addInput(guiValues,"instantCreation");
  const hexFolder=pane.addFolder({title:"Hexagone",expanded:false});
  hexFolder.addInput(guiValues,"displayNumber");
  pane.addMonitor(aMaze.mazeStatus,"value");
  const btn=pane.addButton({title:'Generate Maze'});
  btn.on('click',()=>{
    createMaze();

  })
}
/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
  };
}