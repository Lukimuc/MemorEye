import Config from "./Config.js";
//import * as webgazer from "WebGazer";


//import webgazer from "https://github.com/brownhci/WebGazer/blob/master/www/webgazer.js";

var memoryArray,
    score,
    scoreText,
    cards,
    indexCardOpen1,
    indexCardOpen2,
    memoryCards,
    GazeCloudAPI,
    timerInterval,
    count,
    previousElement,
    currentElement,
    timerMatch,
    canOpenCards,
    timerRunning,
    wonText;

// these methods are called at start
init();


function init() {
    scoreText = document.getElementById("score_txt");
    score = 0;
    count = 0;
    canOpenCards = true;
    timerRunning = false;
    memoryArray = [];
    cards = document.querySelectorAll(".cardImg");
    memoryCards = document.querySelectorAll(".card");
    indexCardOpen1 = undefined;
    indexCardOpen2 = undefined;
    GazeCloudAPI = window.GazeCloudAPI;

    updateScoreText();
    initMemoryArray();
    setClickListeners();
    initGazeCloudAPI();
}


function initGazeCloudAPI() {
    GazeCloudAPI.StartEyeTracking();
    GazeCloudAPI.OnCalibrationComplete = function () {
        console.log('gaze Calibration Complete')
        GazeCloudAPI.OnResult = PlotGaze;
    }
    GazeCloudAPI.OnCamDenied = function () {
        console.log('camera access denied')
    }

    GazeCloudAPI.OnError = function (msg) { console.log('err: ' + msg) }
    GazeCloudAPI.UseClickRecalibration = true;

}

// initalizes the memoryArray
function initMemoryArray() {
    let cardsAmount = Config.MEMORY_CARDS_AMOUNT,
        imgArray = Config.IMAGES_ARRAY;

    for (let i = 0; i < cardsAmount; i += 2) {
        let rand = Math.floor(Math.random() * imgArray.length);
        memoryArray[i] = imgArray[rand];
        memoryArray[i + 1] = imgArray[rand];
        imgArray.splice(rand, 1);
    }
    shuffleCards();
}


function PlotGaze(GazeData) {
    var x = GazeData.docX;
    var y = GazeData.docY;

    var gaze = document.getElementById("gaze");
    x -= gaze.clientWidth / 2;
    y -= gaze.clientHeight / 2;

    var dwellTime = GazeData.GazeDwellTime;

    // Get the element at the gaze coordinates
    currentElement = document.elementFromPoint(x, y);
    if(currentElement != null) {
        previousElement = currentElement;
        setTimeout(() => {
            startTimer();
        }, Config.TICK_SPEED);
    }


    gaze.style.left = x + "px";
    gaze.style.top = y + "px";


    if (GazeData.state != 0) {
        if (gaze.style.display == 'block')
            gaze.style.display = 'none';
    }
    else {
        if (gaze.style.display == 'none')
            gaze.style.display = 'block';
    }
}

// shuffles all the cards in the memoryArray
function shuffleCards() {
    memoryArray.sort(() => Math.random() - 0.5);
    console.log("Shuffled cards!");
}

// shows the image (path to image saved in memoryArray) for a card
function revealMemoryCard(card) {
    if(timerMatch) { return; }

    let index = getIndexOfCard(card);
    if(index === -1) { return; }

    if((card.classList.contains("hidden"))) { return; }

    console.log("showing card " + index);
    cards[index].classList.remove("hidden");
    cards[index].src = memoryArray[index].toString();
    count = 0;
    
    if (indexCardOpen1 === undefined) {
        indexCardOpen1 = index;
    } else {
        indexCardOpen2 = index;
        checkForMatch();
    }   
}

// hides the images of the currently shown cards, when there is no match found
function hideMemoryCards() {
    //console.log("hiding image " + memoryArray[indexCardOpen1] + " and " + memoryArray[indexCardOpen2]);

    cards[indexCardOpen1].classList.add("hidden");
    cards[indexCardOpen1].src = "";
    cards[indexCardOpen2].classList.add("hidden");
    cards[indexCardOpen2].src = "";

    indexCardOpen1 = undefined;
    indexCardOpen2 = undefined;
    timerMatch = undefined;
}

function startTimer() {
    console.log(currentElement);
    if(!currentElement.classList.contains('card')) {
        count = 0;
        clearInterval(timerInterval);
        timerRunning = false;
    }
    if(timerRunning) { return; }
    if(currentElement !== null && currentElement !== undefined) {
        console.log("new timer...");
        timerRunning = true;
        timerInterval = setInterval(() => {
            updateTimer();
        }, Config.TIMER_INTERVAL_STEP);
    }
}

function updateTimer() {
if((currentElement !== null) && (currentElement.classList.contains('card'))) {
        console.log(count);
        console.log(timerInterval);
        count++;
        if(count === ((Config.TIMER_LOOK_TOTAL/Config.TIMER_INTERVAL_STEP)-1)) {
            console.log("Timer up! clicking....")
            count = 0;
            currentElement.click();
            clearInterval(timerInterval);
            timerRunning = false;
        }
    } else {
        count = 0;
        clearInterval(timerInterval);
    }
}

function setClickListeners() {
    memoryCards.forEach(element => {
        element.addEventListener("click", function() {
            revealMemoryCard(element);
        })
    });
}

// checks whether the path-names of two images match, is called only when two images are shown
function checkForMatch() {
    if (memoryArray[indexCardOpen1] === memoryArray[indexCardOpen2]) {
        console.log("Found a match!");

        indexCardOpen1 = undefined;
        indexCardOpen2 = undefined;
        score++;
        updateScoreText();
    } else if ((indexCardOpen1 || indexCardOpen2) !== undefined) {
        console.log("No match found for " + indexCardOpen1 + " and " + indexCardOpen2);
        timerMatch = setTimeout(hideMemoryCards, Config.TIMER_MATCH_TOTAL);
    }

    // game is won when max score is reached
    if(score == (memoryArray.length / 2)){
        gameWon();
    }

    // game is won when max score is reached
    if(score == (memoryArray.length / 2)){
        gameWon();
    }
}

// updates the score text from the html
function updateScoreText() {
    scoreText.innerHTML = Config.SCORE_TEXT + score;
}

// diplays game won text
function gameWon(){
    wonText = document.getElementById("won_txt");
    wonText.style.display = "block";
}

function getIndexOfCard(card) {
    let index = -1;
    for (let i=0; i< cards.length; i++) {
        if(cards[i].parentElement.id === card.id) {
            index = i;
        }
    }

    return index;
}

