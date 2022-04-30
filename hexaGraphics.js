let hexsGraphic=[];

function generateHexaGraphics(){
    //generate strings of binaries up to 63;
    
    let binaries=[];
    for(let i=0;i<64;i++){
        let bString=i.toString(2);
        if(bString.length<6){
            let amount0=6-bString.length;
            for(let ii=0;ii<amount0;ii++){
                bString="0"+bString;
            }
        }
        console.log(bString)
        binaries.push(bString);
    }
    //generate graphics of hexagones based on the binaries strings
    for(let i=0;i<binaries.length;i++){
        let pg=createGraphics(400,400);
        
    }
    
}