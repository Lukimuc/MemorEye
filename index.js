import Config from "./Config.js";
//import * as webgazer from "WebGazer";

//import webgazer from "https://github.com/brownhci/WebGazer/blob/master/www/webgazer.js";

let memoryArray,
    score,
    scoreText,
    cards,
    indexCardOpen1,
    indexCardOpen2;

//var webgazer = window.webgazer;




var webgazer = window.webgazer;
console.log(webgazer);
    webgazer.setTracker("js_objectdetect"); //set a tracker module
    webgazer.setRegression("weightedRidge"); //set a regression module
    webgazer.showVideoPreview(true) /* shows all video previews */
            .showPredictionPoints(true); /* shows a square every 100 milliseconds where current prediction is */
   

    

    webgazer.setGazeListener(function(data, elapsedTime) {
        console.log(data);
        console.log(elapsedTime);
        if (data == null) {
            return;
        }
        var xprediction = data.x; //these x coordinates are relative to the viewport
        var yprediction = data.y; //these y coordinates are relative to the viewport
        console.log(elapsedTime); //elapsed time is based on time since begin was called#
        console.log(xprediction);
        console.log(yprediction);

    }).begin();

    

                    

function init() {
    scoreText = document.getElementById("score_txt");
    score = 0;
    memoryArray = [];
    cards = document.querySelectorAll(".cardImg");
    indexCardOpen1 = undefined;
    indexCardOpen2 = undefined;

    updateScoreText();
    initMemoryArray();
}

// initalizes the memoryArray
function initMemoryArray() {
    let cardsAmount = Config.MEMORY_CARDS_AMOUNT,
     imgArray = Config.IMAGES_ARRAY;

    for(let i=0; i<cardsAmount; i+=2) {
        let rand = Math.floor(Math.random() * imgArray.length);
        memoryArray[i] = imgArray[rand];
        memoryArray[i+1] = imgArray[rand];
        imgArray.splice(rand,1);
    }

    shuffleCards();

    revealMemoryCard(10);
    revealMemoryCard(11);
}

// shuffles all the cards in the memoryArray
function shuffleCards() {
    memoryArray.sort(() => Math.random() -0.5);
    console.log("Shuffled cards!");
    console.log(memoryArray);
}

// shows the image (path to image saved in memoryArray) for a card
function revealMemoryCard(index) {
    console.log("showing card " + index);
    cards[index].classList.remove("hidden");
    cards[index].src = memoryArray[index].toString();

    if(indexCardOpen1 === undefined) {
        indexCardOpen1 = index;
    } else {
        indexCardOpen2 = index;
        checkForMatch();
    }
}

// hides the images of the currently shown cards, when there is no match found
function hideMemoryCards() {
    console.log("hiding image " + memoryArray[indexCardOpen1] + " and " + memoryArray[indexCardOpen2]);

    cards[indexCardOpen1].classList.add("hidden");
    cards[indexCardOpen1].src = "";
    cards[indexCardOpen2].classList.add("hidden");
    cards[indexCardOpen2].src = "";
    
    indexCardOpen1 = undefined;
    indexCardOpen2 = undefined;
}

// checks whether the path-names of two images match, is called only when two images are shown
function checkForMatch() {
    if(memoryArray[indexCardOpen1] === memoryArray[indexCardOpen2]) {
        console.log("Found a match!");
        
        indexCardOpen1 = undefined;
        indexCardOpen2 = undefined;
        score++;
        updateScoreText();
    } else if((indexCardOpen1 || indexCardOpen2) !== undefined) {
        console.log("No match found for " + indexCardOpen1 + " and " + indexCardOpen2);
        setTimeout(hideMemoryCards, 5000);
    }
}

// updates the score text from the html
function updateScoreText() {
    scoreText.innerHTML = Config.SCORE_TEXT + score;
}


// these methods are called at start
init();