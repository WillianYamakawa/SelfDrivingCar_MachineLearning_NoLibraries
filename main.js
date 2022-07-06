const carCanvas = document.getElementById("carCanvas")
const gen = document.getElementById("gen")
let generation = localStorage.getItem("generation")
gen.innerHTML = generation?"Generation: "+generation:"Generation: 0"


const carCtx = carCanvas.getContext("2d");

const lanesCount = 4
const spaceBetweenWaves = 300;
const waveCount = 30

carCanvas.width = lanesCount*60;
const road = new Road(carCanvas.width/2, carCanvas.width*0.9, lanesCount);


const cars = generateCars(300);
let bestCar = cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(localStorage.getItem("bestBrain"))

        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain, 0.2)
        }
    }
    
}

const traffic=[]

let lastLaneExclude = 0;
for(let wave=0; wave<waveCount;wave++){
    let laneExclude = lastLaneExclude;
    while(laneExclude == lastLaneExclude){
        laneExclude = Math.round(Math.random()*(lanesCount-1))
    }
    lastLaneExclude=laneExclude
    for(let lane =0; lane<lanesCount;lane++){
        if(lane != laneExclude){
            traffic.push(new Car(road.getLaneCenter(lane), -wave*200-200, 30, 50,"DUMMY", 2))
        }
    }
}

animate()

function save(){
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain))
    localStorage.setItem("generation", Number(localStorage.getItem("generation"))+1);
    window.location.reload()
}

function discard(){
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("generation");
    window.location.reload()
}

function generateCars(N){
    const cars = [];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"))
    }
    return cars
}

function animate(){
    for(let i = 0; i < traffic.length;i++){
        traffic[i].update([],[])
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders, traffic);
    }

    bestCar = cars.find(
        c=>c.y==Math.min(...cars.map(c=>c.y))
    )
    
    let isAllDead = true;
    cars.forEach(c=>{
        if(!c.damaged){
            isAllDead=false;
            return;
        }
    })

    if(isAllDead){
        setTimeout(()=> {save()}, 1000)
    }

    carCanvas.height = window.innerHeight

    carCtx.save()
    carCtx.translate(0, -bestCar.y+carCanvas.height*.7);

    road.draw(carCtx);
    for(let i = 0; i < traffic.length;i++){
        traffic[i].draw(carCtx, "red")
    }
    carCtx.globalAlpha=0.2
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx,"blue");
    }
    carCtx.globalAlpha=1
    bestCar.draw(carCtx, "blue", true)
    carCtx.restore()

    requestAnimationFrame(animate)
}