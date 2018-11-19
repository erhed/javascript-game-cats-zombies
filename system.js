"use strict";

// Open 'system.html' in a browser for a visual representation of the game mecanics

// When player moves, enemies move. If an enemy is 1 position away from the player the game is over.
// Radar detects enemies 3 positions away in any one direction.
// Radar detects cats 1 position away.
// Find all cats.
// There are mushrooms in the forest for some added magic.

// Audio -----------------------------------------------------------------------------------------------------------

// Set volumes and make play-functions for sounds

// Wind ambience
const audioWind = document.getElementById("audio-wind");
audioWind.volume = 0.5;

setTimeout(() => { audioWind.play(); }, 1000); // "Autoplay" wind

// Song
const audioTheme = document.getElementById("audio-theme");
audioTheme.volume = 1;

function audioplayTheme() {
  audioTheme.play();
}

// Enemy (radar inner)
const audioZombieInner = document.getElementById("audio-zombie-inner");
audioZombieInner.volume = 0;

function audioplayZombieInner() {
  audioZombieInner.pause();
  audioZombieInner.currentTime = 0;
  audioZombieInner.play();
}

// Enemy (radar outer)
const audioZombieOuter = document.getElementById("audio-zombie-outer");
audioZombieOuter.volume = 0;

function audioplayZombieOuter() {
  audioZombieOuter.pause();
  audioZombieOuter.currentTime = 0;
  audioZombieOuter.play();
}

// Cat
const audioCat = document.getElementById("audio-cat");
audioCat.volume = 0.26;

let audioCatPlaying = false;

function audioplayCat() {
  if (audioCatPlaying === false) {
    audioCatPlaying = true;
    audioCat.play();
    setTimeout(() => {
      audioCatPlaying = false;
    }, 5000);
  }
}

// Bells (found cat)
const audioBells = document.getElementById("audio-bells");
audioBells.volume = 0.26;

function audioplayBells() {
  audioBells.pause();
  audioBells.currentTime = 0;
  audioBells.play();
}

// Bongo (mushroom)
const audioBongo = document.getElementById("audio-bongo");
audioBongo.volume = 0.0;

function audioplayBongo() {
  audioBongo.play();
}

// Walking, right foot / left foot
const audioFootLeft = document.getElementById("audio-left-foot");
const audioFootRight = document.getElementById("audio-right-foot");

audioFootLeft.volume = 0.22;
audioFootRight.volume = 0.26;

let audioFootToggler = true;

function audioplayFoot() {
  if (audioFootToggler === true) {
    audioFootRight.pause();
    audioFootRight.currentTime = 0;
    audioFootRight.play();
    audioFootToggler = false;
  } else if (audioFootToggler === false) {
    audioFootLeft.pause();
    audioFootLeft.currentTime = 0;
    audioFootLeft.play();
    audioFootToggler = true;
  }
}

// Game over
const audioGameOver = document.getElementById("audio-gameover");
audioGameOver.volume = 0.26;

function audioplayGameover() {
  audioGameOver.pause();
  audioGameOver.currentTime = 0;
  audioGameOver.play();
}

// Win
const audioWin = document.getElementById("audio-win");
audioWin.volume = 0.5;

function audioplayWin() {
  audioWin.pause();
  audioWin.currentTime = 0;
  audioWin.play();
}

// Zombie sound control variables, enemySoundControl()

let enemySoundInner;
let enemySoundOuter;
let zombieInnerVolume = 0.32;
let zombieOuterVolume = 0.26;

// Define global variables -----------------------------------------------------------------------------------------------------------

const gridSize = 11; // Size of map

let playerPosition = {
  x: 5,
  y: 5
};

const enemies = 2; // Number of enemies
let enemyPositions = []; // Enemy positions, default positions in startPlaying()-function
let enemyRadar = [
  {
    pos: "null",
    distance: "null"
  },
  {
    pos: "null",
    distance: "null"
  },
  {
    pos: "null",
    distance: "null"
  }
];

// Cats
const cats = 5; // Number of cats
let catPositions = []; // Cat positions
let catRadarPositions = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
];

// Score
let catsSaved = 0; // Main score
let stepsTaken = 0; // Steps taken

// Mushrooms
const mushrooms = 2; // Number of mushrooms
let mushroomPositions = []; // Mushroom positions
let mushroomsFound = 0; // Number of mushrooms found

// Other
let numberOfTrees = 0; // tells magicON() how many trees to change colors on
let walkEnabled = false; // toggles arrow keys walk around-function
let rotation = 0; // For radar

// Listen for keystroke -> walkWithArrowKeys()
window.addEventListener("keydown", walkWithArrowKeys);
let enterKeyEnabled = true;

const generatedItemsWrapper = document.getElementById("generatedItems"); // Environment items are put in #generatedItems <div>
const guiItemsWrapper = document.getElementById("guiItems");

// Show score (catsSaved)

let drawGUI = {
  score: function() {
    if (catsSaved === 0) {
      guiItemsWrapper.innerHTML = "<div id='score'>--</div>";
    } else {
      guiItemsWrapper.innerHTML = "<div id='score'>" + catsSaved + "</div>";
    }
  }
};

// Run functions on startup -----------------------------------------------------------------------------------------------------------

radarRender("off");
walkFunction("off");
generateItems();

// Functions -----------------------------------------------------------------------------------------------------------

// Enables walk with keyboard arrow keys and 'Enter' to play again

function walkWithArrowKeys(e) {
  if (e.key === "Enter" && enterKeyEnabled === true) {
    startPlaying();
  } else if (walkEnabled === true) {
    if (e.key === "ArrowUp" && playerPosition.y !== 0) {
      walkAround("up");
    }
    if (e.key === "ArrowDown" && playerPosition.y !== (gridSize-1)) {
      walkAround("down");
    }
    if (e.key === "ArrowLeft" && playerPosition.x !== 0) {
      walkAround("left");
    }
    if (e.key === "ArrowRight" && playerPosition.x !== (gridSize-1)) {
      walkAround("right");
    }
  }
}

// Game initialization, executed when "play"-button is pressed

// Resets some variables and handles visuals & sounds for new game

function startPlaying() {
  // Player starts in the middle of the map
  playerPosition = {
    x: 5,
    y: 5
  };

  // Enemies get random X-positions but set Y-positions, 1 enemy above player and 1 below.
  const rnd1 = randomNumber(gridSize - 1);
  const rnd2 = randomNumber(gridSize - 1);
  enemyPositions = [
    {
      x: rnd1,
      y: 0
    },
    {
      x: rnd2,
      y: 10
    }
  ];

  enterKeyEnabled = false;

  catsSaved = 0; // Reset score
  mushroomsFound = 0; // Reset
  stepsTaken = 0; // Reset

  // No cats on screen, yet
  const catDiv = document.getElementById("cat");
  catDiv.style.opacity = "0";

  // Audio
  audioWin.pause();
  audioWind.volume = 0.23;
  audioplayZombieInner();
  audioplayZombieOuter();
  audioplayTheme();
  audioplayBongo();

  // Generate items
  generateCats();
  generateMushrooms();
  
  // Visuals and walk-function
  showGameOver("off");
  radarRender("on");
  walkFunction("on");
  showLogo("off");
  showPlayButton("off");
  showWinText("off");
  boundariesForArrows(); // Resets

  // Radar
  catRadarHandler();
  renderCatRadar();
  enemyRadarHandler();
  renderEnemyRadar();

  drawGUI.score();
}

// Show/hide logo, using CSS 'opacity' property

function showLogo(onoff) {
  const logodiv = document.getElementById("logo");
  if (onoff === "on") {
    logodiv.style.opacity = "1";
  } else if (onoff === "off") {
    logodiv.style.opacity = "0";
  }
}

// Show/hide play-button, using CSS 'left' property

function showPlayButton(onoff) {
  const playTxtDiv = document.getElementById("menu-item-play");
  const playBtnDiv = document.getElementById("menu-item-1-bg-1");
  if (onoff === "on") {
    playTxtDiv.style.left = "15vw";
    playBtnDiv.style.left = "15vw";
  } else if (onoff === "off") {
    playTxtDiv.style.left = "-150vw";
    playBtnDiv.style.left = "-150vw";
  }
}

// Show/hide win text (you saved them all!), using CSS 'opacity' property

function showWinText(onoff) {
  const windiv = document.getElementById("wintext");
  if (onoff === "on") {
    windiv.style.opacity = "1";
  } else if (onoff === "off") {
    windiv.style.opacity = "0";
  }
}

// Random enemy placement
//
// generateEnemies(enemies);
// function generateEnemies() {
//   for (let i = 1; i <= enemies; i++) {
//     enemyPositions.push({
//       "x": randomNumber(0, gridSize),
//       "y": randomNumber(0, gridSize)
//     });
//   }
// }

// Place cats

// Generates 'cats'-variable amount of cats by populating catPositions[] with random values.

function generateCats() {
  catPositions = [];
  for (let i = 0; i < cats; i++) {
    let rnd1 = randomNumber(gridSize - 1);
    let rnd2 = randomNumber(gridSize - 1);
    catPositions.push({
      x: rnd1,
      y: rnd2
    });
  }
}

// Place mushrooms

// Generates 'mushrooms'-variable amount of mushrooms by populating mushroomPositions[] with random values.

function generateMushrooms() {
  mushroomPositions = [];
  for (let i = 0; i < mushrooms; i++) {
    let rnd1 = randomNumber(gridSize - 1);
    let rnd2 = randomNumber(gridSize - 1);
    mushroomPositions.push({
      x: rnd1,
      y: rnd2
    });
  }
}

// Show/hide radar, using CSS left & margin-top properties

function radarRender(onoff) {
  const radarEnemyContainer = document.getElementById("radar-enemy-container");
  const scoreContainer = document.getElementById("score");

  if (onoff === "on") {
    radarEnemyContainer.style.left = "33.3vw";
    scoreContainer.style.marginTop = "-96px";
  } else if (onoff === "off") {
    radarEnemyContainer.style.left = "-5000px";
    scoreContainer.style.marginTop = "-5000px";
  }
}

// Player move function

// Makes changes in playerPosition and triggers and updates everything.

function walkAround(direction) {

  // Calculate new player position (with edge boundaries)
  if (direction === "up") {
    playerPosition.y += playerPosition.y === 0 ? 0 : -1;
  } else if (direction === "down") {
    playerPosition.y += playerPosition.y === gridSize - 1 ? 0 : 1;
  } else if (direction === "left") {
    playerPosition.x += playerPosition.x === 0 ? 0 : -1;
  } else if (direction === "right") {
    playerPosition.x += playerPosition.x === gridSize - 1 ? 0 : 1;
  }

  stepsTaken++;

  console.log(playerPosition.x, playerPosition.y);

  audioplayFoot();

  // Make enemies walk
  for (let i = 0; i < enemies; i++) {
    enemyWalk(i);
  }

  // Trigger radar update
  enemyRadarHandler();
  renderEnemyRadar();
  catRadarHandler();
  renderCatRadar();

  boundariesForArrows(); // Removes arrow when at map edge
  catchCat(); // Check if cat
  generateItems(); // Render new view (trees & mountains)
  eatMushroom(); // Check if mushroom
}

// Enemy move function

// Triggered by walkAround() (player move function)
// Calculates new positions and makes changes in enemyPositions[]

function enemyWalk(enemyID) {
  // Randomize enemy move/wrong direction/stand still
  let percentMove = 48; // Moves x minus percentWrongDirection % of times
  let percentWrongDirection = 17; // Moves in opposite direction x % of times
  // 100 - (percentMove + percentWrongDirection) = stand still

  let randomMove = randomNumber(100);
  let move = true;
  let wrongDirection = false;

  if (randomMove <= percentMove && randomMove > percentWrongDirection) {
    move = true;
    wrongDirection = false;
  } else if (randomMove <= percentWrongDirection) {
    move = false;
    wrongDirection = true;
  } else {
    move = false;
    wrongDirection = false;
  }

  // Difference in distance between player and enemy, no negative values allowed here

  const diffX = Math.abs(enemyPositions[enemyID].x - playerPosition.x);
  const diffY = Math.abs(enemyPositions[enemyID].y - playerPosition.y);

  // Move enemy towards player

  // Moves 1 closer in either X or Y direction based on which distance is bigger

  if (move) {
    if (diffX >= diffY) {
      enemyPositions[enemyID].x += playerPosition.x >= enemyPositions[enemyID].x ? 1 : -1;
    } else {
      enemyPositions[enemyID].y += playerPosition.y >= enemyPositions[enemyID].y ? 1 : -1;
    }
  }

  // Move enemy away from player

  // Moves away 1 in either X or Y direction based on which distance is bigger

  else if (wrongDirection) {
    if (diffX >= diffY) {
      enemyPositions[enemyID].x += playerPosition.x >= enemyPositions[enemyID].x ? -1 : 1;
    } else if (diffX < diffY) {
      enemyPositions[enemyID].y += playerPosition.y >= enemyPositions[enemyID].y ? -1 : 1;
    }
  }
}

// Found cat-function

// Checks if you stepped on a catPosition[]

function catchCat() {
  const catDiv = document.getElementById("cat");
  for (let i = 0; i < catPositions.length; i++) {
    if (
      playerPosition.x === catPositions[i].x &&
      playerPosition.y === catPositions[i].y
    ) {
      audioplayBells(); // Play sound

      walkFunction("off"); // Turn off walk function, turns back on after 1000 ms
      catsSaved++; // Increase score
      drawGUI.score(); // Update score on screen
      catDiv.style.opacity = "1"; // Show cat

      // Checks if all cats are found
      if (catsSaved === cats) {
        winGameHandler();
        break;
      }

      setTimeout(() => {
        walkFunction("on"); // Turn walk function back on after 1000 ms
      }, 1000);
      catPositions[i].x = 100; // Remove cat from position
      catPositions[i].y = 100;

      break;
    } else {
      catDiv.style.opacity = "0";
    }
  }
}

// Magic mushroom-mode trigger

function eatMushroom() {
  for (let i = 0; i < mushroomPositions.length; i++) {
    if (playerPosition.x === mushroomPositions[i].x && playerPosition.y === mushroomPositions[i].y) {
      mushroomPositions[i].x = 100; // Remove mushroom
      mushroomPositions[i].y = 100;
      audioBongo.volume = 0.26; // Turn on magic sounds
      mushroomsFound++;
      setTimeout(() => {
        magicOFF();
        audioBongo.volume = 0;
      }, 9000); // Turn magic off after 9 seconds
      magicON(); // Turn on gradient animations
    }
  }
}

// All cats were saved!

function winGameHandler() {
  enterKeyEnabled = true;
  audioplayWin();
  audioTheme.pause();
  audioBongo.pause();
  showWinText("on");
  turnOffEnemySound();
  showPlayButton("on");
}

// Game over

function gameOverHandler() {
  enterKeyEnabled = true;
  audioWind.volume = 0;
  audioCat.pause();
  audioTheme.pause();
  audioBongo.pause();
  audioplayGameover();

  showGameOver("on");
  radarRender("off");
  walkFunction("off");
  turnOffEnemySound();

  // showPlayButton("on");
  setTimeout(() => {
    showPlayButton("on");
  }, 800);

  // Display score and steps taken
  const scorediv = document.getElementById('gameoverscore');
  scorediv.innerHTML = `cats saved:<br><span id="gameoverscore-score">${catsSaved} / ${cats}</span><br>steps:<br><span id="gameoverscore-score">${stepsTaken}</span>`;
}

// Show/hide game over-screen (using CSS property "top")

function showGameOver(onoff) {
  const gameOverDiv = document.getElementById("gameoverscreen");
  if (onoff === "on") {
    gameOverDiv.style.top = "0";
  } else if (onoff === "off") {
    gameOverDiv.style.top = "-100vh";
  }
}

// Generate environment -----------------------------------------------------------------------------------------------------------

// Set what to render in generateItems()

// Number ID's for trees and mountains start at 1. 1, 2 & 3 have different settings in respective function

function generateItems() {
  generatedItemsWrapper.innerHTML = "";

  generateMountain(1);
  generateMountain(2);
  generateMountain(3);

  numberOfTrees = 0;

  generateTree(1);
  generateTree(2);
  if (randomNumber(100) < 40) {
    generateTree(3);
  }
}

// Randomly place trees, using CSS top & left-properties for placement and transform: scale() for size

function generateTree(z) {
  generatedItemsWrapper.innerHTML += `<div id='wrap${z}'><div id='triangle1${z}'></div><div id='triangle2${z}'></div><div id='triangle3${z}'></div><div id='rectangle${z}'></div></div>`;

  const styleID = document.getElementById(`wrap${z}`);

  let top = 0;
  let left = 0;
  let scale = 0;

  // Tree 1
  if (z === 1) {
    top = 36;
    left = -20;
    scale = 0.4;
  } 
  
  // Tree 2
  else if (z === 2) {
    top = 41;
    left = -20;
    scale = 0.76;
  } 
  
  // Tree 3
  else if (z === 3) {
    top = 48;
    left = -30;
    scale = 1.5;
  } 
  
  // Tree 4
  else if (z === 4) {
    top = 38;
    left = -30;
    scale = 0.2;
  }

  styleID.style.top = top + randomNumber(3) + "vh";
  styleID.style.transform = "scale(" + scale + ")";

  if (z === 3) {
    // Tree 3 only renders sometimes and with own placement boundaries
    let treeFrontRandom = randomNumber(30);
    if (treeFrontRandom > 10) {
      styleID.style.left = left + treeFrontRandom + "vw";
    } else {
      styleID.style.left = left + treeFrontRandom + 100 + "vw";
    }
  } else {
    styleID.style.left = left + randomNumber(100) + "vw";
  }

  styleID.style.zIndex = z * 10;
  numberOfTrees++;
}

// Randomly place mountains, using CSS top & left-properties for placement and width & height for size

function generateMountain(mountain) {
  generatedItemsWrapper.innerHTML += `<div id='mountain${mountain}'></div>`;

  const styleID = document.getElementById(`mountain${mountain}`);

  let width = 0;
  let height = 0;
  let top = 0;
  let left = 0;

  // Mountain 1
  if (mountain === 1) {
    width = 600;
    height = 600;
    top = 47;
    left = -110;
  }

  // Mountain 2
  else if (mountain === 2) {
    width = 600;
    height = 600;
    top = 47;
    left = 10;
  }

  // Mountain 3
  else if (mountain === 3) {
    width = 400;
    height = 400;
    top = 49;
    left = -20;
  }

  styleID.style.width = width + randomNumber(20) + "px";
  styleID.style.height = height + randomNumber(20) + "px";
  styleID.style.top = top + randomNumber(1) + "vh";
  styleID.style.left = left + randomNumber(40) + "vw";
  styleID.style.zIndex = -90 - mountain;
}

// Random number generator

function randomNumber(max) {
  const number = Math.floor(Math.random() * max + 1);
  return number;
}

// Radar -----------------------------------------------------------------------------------------------------------

// Enemy Radar
// Populates enemyRadar[] with coordinates and checks for 'game over'

function enemyRadarHandler() {
  for (let enemyID = 0; enemyID < enemyPositions.length; enemyID++) {
    let diffX = enemyPositions[enemyID].x - playerPosition.x;
    let diffY = enemyPositions[enemyID].y - playerPosition.y;

    // GAME OVER

    if (
      (enemyPositions[enemyID].x === playerPosition.x ||
        enemyPositions[enemyID].x === playerPosition.x + 1 ||
        enemyPositions[enemyID].x === playerPosition.x - 1) &&
      (enemyPositions[enemyID].y === playerPosition.y ||
        enemyPositions[enemyID].y === playerPosition.y + 1 ||
        enemyPositions[enemyID].y === playerPosition.y - 1)
    ) {
      gameOverHandler();
    }

    // OUTER PERIMITER

    //TOP LEFT
    if (
      (diffX === -3 && diffY === -2) ||
      (diffX === -3 && diffY === -3) ||
      (diffX === -2 && diffY === -3)
    ) {
      enemyRadar[enemyID].pos = "tl";
      enemyRadar[enemyID].distance = "outer";
    }
    //TOP CENTER
    else if (
      (diffX === -1 && diffY === -3) ||
      (diffX === 0 && diffY === -3) ||
      (diffX === 1 && diffY === -3)
    ) {
      enemyRadar[enemyID].pos = "tc";
      enemyRadar[enemyID].distance = "outer";
    }
    //TOP RIGHT
    else if (
      (diffX === 2 && diffY === -3) ||
      (diffX === 3 && diffY === -3) ||
      (diffX === 3 && diffY === -2)
    ) {
      enemyRadar[enemyID].pos = "tr";
      enemyRadar[enemyID].distance = "outer";
    }
    //CENTER RIGHT
    else if (
      (diffX === 3 && diffY === -1) ||
      (diffX === 3 && diffY === 0) ||
      (diffX === 3 && diffY === 1)
    ) {
      enemyRadar[enemyID].pos = "cr";
      enemyRadar[enemyID].distance = "outer";
    }
    //BOTTOM RIGHT
    else if (
      (diffX === 3 && diffY === 2) ||
      (diffX === 3 && diffY === 3) ||
      (diffX === 2 && diffY === 3)
    ) {
      enemyRadar[enemyID].pos = "br";
      enemyRadar[enemyID].distance = "outer";
    }
    //BOTTOM CENTER
    else if (
      (diffX === 1 && diffY === 3) ||
      (diffX === 0 && diffY === 3) ||
      (diffX === -1 && diffY === 3)
    ) {
      enemyRadar[enemyID].pos = "bc";
      enemyRadar[enemyID].distance = "outer";
    }
    //BOTTOM LEFT
    else if (
      (diffX === -2 && diffY === 3) ||
      (diffX === -3 && diffY === 3) ||
      (diffX === -3 && diffY === 2)
    ) {
      enemyRadar[enemyID].pos = "bl";
      enemyRadar[enemyID].distance = "outer";
    }
    //CENTER LEFT
    else if (
      (diffX === -3 && diffY === 1) ||
      (diffX === -3 && diffY === 0) ||
      (diffX === -3 && diffY === -1)
    ) {
      enemyRadar[enemyID].pos = "cl";
      enemyRadar[enemyID].distance = "outer";
    }

    // INNER PERIMITER

    //TOP LEFT
    else if (
      (diffX === -2 && diffY === -1) ||
      (diffX === -2 && diffY === -2) ||
      (diffX === -1 && diffY === -2)
    ) {
      enemyRadar[enemyID].pos = "tl";
      enemyRadar[enemyID].distance = "inner";
    }
    //TOP CENTER
    else if (diffX === 0 && diffY === -2) {
      enemyRadar[enemyID].pos = "tc";
      enemyRadar[enemyID].distance = "inner";
    }
    //TOP RIGHT
    else if (
      (diffX === 1 && diffY === -2) ||
      (diffX === 2 && diffY === -2) ||
      (diffX === 2 && diffY === -1)
    ) {
      enemyRadar[enemyID].pos = "tr";
      enemyRadar[enemyID].distance = "inner";
    }
    //CENTER RIGHT
    else if (diffX === 2 && diffY === 0) {
      enemyRadar[enemyID].pos = "cr";
      enemyRadar[enemyID].distance = "inner";
    }
    //BOTTOM RIGHT
    else if (
      (diffX === 2 && diffY === 1) ||
      (diffX === 2 && diffY === 2) ||
      (diffX === 1 && diffY === 2)
    ) {
      enemyRadar[enemyID].pos = "br";
      enemyRadar[enemyID].distance = "inner";
    }
    //BOTTOM CENTER
    else if (diffX === 0 && diffY === 2) {
      enemyRadar[enemyID].pos = "bc";
      enemyRadar[enemyID].distance = "inner";
    }
    //BOTTOM LEFT
    else if (
      (diffX === -1 && diffY === 2) ||
      (diffX === -2 && diffY === 2) ||
      (diffX === -2 && diffY === 1)
    ) {
      enemyRadar[enemyID].pos = "bl";
      enemyRadar[enemyID].distance = "inner";
    }
    //CENTER LEFT
    else if (diffX === -2 && diffY === 0) {
      enemyRadar[enemyID].pos = "cl";
      enemyRadar[enemyID].distance = "inner";
    } else {
      enemyRadar[enemyID].pos = "null";
      enemyRadar[enemyID].distance = "null";
    }
  }
}

// Render enemies on radar when in perimiter, looping through enemyRadar[]
// Rotates red enemy dot-SVG depending on direction (css transform: rotate())

function renderEnemyRadar() {

  enemySoundInner = 0;
  enemySoundOuter = 0;

  const inner1 = document.getElementById("radar-inner-1");
  const inner2 = document.getElementById("radar-inner-2");
  const inner3 = document.getElementById("radar-inner-3");

  const outer1 = document.getElementById("radar-outer-1");
  const outer2 = document.getElementById("radar-outer-2");
  const outer3 = document.getElementById("radar-outer-3");

  // hide enemy dots when not in perimiter

  if (enemyRadar[0].pos === "null") {
    // reset
    inner1.style.display = "none";
    outer1.style.display = "none";
  }

  if (enemyRadar[1].pos === "null") {
    // reset
    inner2.style.display = "none";
    outer2.style.display = "none";
  }

  if (enemyRadar[2].pos === "null") {
    // reset
    inner3.style.display = "none";
    outer3.style.display = "none";
  }

  for (let i = 0; i < enemyRadar.length; i++) {
    // set rotation based on direction identifier set by enemyRadarHandler()
    // LOCATION, tl = top left, tc = top center...
    if (enemyRadar[i].pos === "tl") {
      rotation = -45;
    } else if (enemyRadar[i].pos === "tc") {
      rotation = 0;
    } else if (enemyRadar[i].pos === "tr") {
      rotation = 45;
    } else if (enemyRadar[i].pos === "cr") {
      rotation = 90;
    } else if (enemyRadar[i].pos === "br") {
      rotation = 135;
    } else if (enemyRadar[i].pos === "bc") {
      rotation = 180;
    } else if (enemyRadar[i].pos === "bl") {
      rotation = 225;
    } else if (enemyRadar[i].pos === "cl") {
      rotation = 270;
    }

    if (enemyRadar[i].distance === "outer") {
      // show outer enemy dot & hide inner enemy dot (per enemy)
      //outer
      const styleID = document.getElementById(`radar-outer-${i + 1}`);
      const styleID2 = document.getElementById(`radar-inner-${i + 1}`);
      styleID.style.transform = "rotate(" + rotation + "deg)";
      styleID.style.display = "inherit";
      styleID2.style.display = "none";
      enemySoundOuter++;
    } else if (enemyRadar[i].distance === "inner") {
      // show inner enemy dot & hide outer enemy dot (per enemy)
      //inner
      const styleID = document.getElementById(`radar-inner-${i + 1}`);
      const styleID2 = document.getElementById(`radar-outer-${i + 1}`);
      styleID.style.transform = "rotate(" + rotation + "deg)";
      styleID.style.display = "inherit";
      styleID2.style.display = "none";
      enemySoundInner++;
    }
    
  }
  enemySoundControl();
}

// Enemy sound control

// Plays zombie_outer.mp3 if an enemy is in outer perimiter,
// zombie_inner.mp3 if an enemy is in the inner perimiter,
// plays both sounds if one is in inner and one is in outer.
// No sound if no enemy is in perimiter.

function enemySoundControl() {
  if (enemySoundInner > 0 && enemySoundOuter === 0) {
    audioZombieInner.volume = zombieInnerVolume;
    audioZombieOuter.volume = 0;
  } else if (enemySoundInner > 0 && enemySoundOuter > 0) {
    audioZombieInner.volume = zombieInnerVolume;
    audioZombieOuter.volume = zombieOuterVolume;
  } else if (enemySoundInner === 0 && enemySoundOuter > 0) {
    audioZombieInner.volume = 0;
    audioZombieOuter.volume = zombieOuterVolume;
  } else if (enemySoundInner === 0 && enemySoundOuter === 0) {
    audioZombieInner.volume = 0;
    audioZombieOuter.volume = 0;
  }
}

// Turns off enemy sounds

function turnOffEnemySound() {
  enemySoundInner = 0;
  enemySoundOuter = 0;
  enemySoundControl();
}

// Cat radar

// Sets 8 catRadarPositions[] (1 per direction) to true or false, true if cat, false if not.
// Plays sound if cat is in perimiter

function catRadarHandler() {
  // Reset radar
  for (let k = 0; k < catRadarPositions.length; k++) {
    catRadarPositions[k] = false;
  }

  // Check coordinates
  for (let i = 0; i < catPositions.length; i++) {
    let diffX = catPositions[i].x - playerPosition.x;
    let diffY = catPositions[i].y - playerPosition.y;

    //TOP LEFT
    if (diffX === -1 && diffY === -1) {
      catRadarPositions[0] = true;
      audioplayCat();
    }
    //TOP CENTER
    if (diffX === 0 && diffY === -1) {
      catRadarPositions[1] = true;
      audioplayCat();
    }
    //TOP RIGHT
    if (diffX === 1 && diffY === -1) {
      catRadarPositions[2] = true;
      audioplayCat();
    }
    //CENTER RIGHT
    if (diffX === 1 && diffY === 0) {
      catRadarPositions[3] = true;
      audioplayCat();
    }
    //BOTTOM RIGHT
    if (diffX === 1 && diffY === 1) {
      catRadarPositions[4] = true;
      audioplayCat();
    }
    //BOTTOM CENTER
    if (diffX === 0 && diffY === 1) {
      catRadarPositions[5] = true;
      audioplayCat();
    }
    //BOTTOM LEFT
    if (diffX === -1 && diffY === 1) {
      catRadarPositions[6] = true;
      audioplayCat();
    }
    //CENTER LEFT
    if (diffX === -1 && diffY === 0) {
      catRadarPositions[7] = true;
      audioplayCat();
    }
  }
}

// Render cat radar from catRadarPositions[]

function renderCatRadar() {
  for (let l = 0; l < catRadarPositions.length; l++) {
    const div = document.getElementById(`radar-cat-${l + 1}`);
    if (catRadarPositions[l] === true) {
      div.style.borderTop = "20px solid rgb(216, 219, 46)"; // show cat radar item
    } else {
      div.style.borderTop = "20px solid rgba(0, 0, 0, 0)"; // hide cat radar item
    }
  }
}

// Magic mode -----------------------------------------------------------------------------------------------------------

// Adds CSS classes with gradient animations to sky, mountains and ground, static colors for trees

function magicON() {

  // Sky
  const skyDiv = document.getElementById("sky");
  skyDiv.style.animation = "psySky 15s ease infinite";
  skyDiv.style.background =
    "linear-gradient(180deg, #ff00a7, #00d0ff, #00ff7a, #0032ff)";
  skyDiv.style.backgroundSize = "800% 800%";

  // Ground
  const groundDiv = document.getElementById("ground");
  groundDiv.style.animation = "psyGround 10s ease infinite";
  groundDiv.style.background =
    "linear-gradient(308deg, #a8794c, #ff0c8d, #dc00ff, #0067cc)";
  groundDiv.style.backgroundSize = "800% 800%";

  // Top triangles for trees
  const treeTriangle11Div = document.getElementById("triangle11");
  treeTriangle11Div.classList.add("mushroomMode");

  const treeTriangle12Div = document.getElementById("triangle12");
  treeTriangle12Div.classList.add("mushroomMode");

  if (numberOfTrees === 3) {
    const treeTriangle13Div = document.getElementById("triangle13");
    treeTriangle13Div.classList.add("mushroomMode");
  }

  // Middle triangles
  const treeTriangle21Div = document.getElementById("triangle21");
  treeTriangle21Div.classList.add("mushroomMode");

  const treeTriangle22Div = document.getElementById("triangle22");
  treeTriangle22Div.classList.add("mushroomMode");

  if (numberOfTrees === 3) {
    const treeTriangle23Div = document.getElementById("triangle23");
    treeTriangle23Div.classList.add("mushroomMode");
  }

  // Bottom triangles
  const treeTriangle31Div = document.getElementById("triangle31");
  treeTriangle31Div.classList.add("mushroomMode");

  const treeTriangle32Div = document.getElementById("triangle32");
  treeTriangle32Div.classList.add("mushroomMode");

  if (numberOfTrees === 3) {
    const treeTriangle33Div = document.getElementById("triangle33");
    treeTriangle33Div.classList.add("mushroomMode");
  }

  // Rectangles
  const treeRectangle1Div = document.getElementById("rectangle1");
  treeRectangle1Div.classList.add("mushroomMode");

  const treeRectangle2Div = document.getElementById("rectangle2");
  treeRectangle2Div.classList.add("mushroomMode");

  if (numberOfTrees === 3) {
    const treeRectangle3Div = document.getElementById("rectangle3");
    treeRectangle3Div.classList.add("mushroomMode");
  }

  // Mountains
  const mountain1Div = document.getElementById("mountain1");
  mountain1Div.style.animation = "psyGround 10s ease infinite";
  mountain1Div.style.background =
    "linear-gradient(33deg, #00a3ff, #ff009b, #eaf72d, #8392e4)";
  mountain1Div.style.backgroundSize = "800% 800%";

  const mountain2Div = document.getElementById("mountain2");
  mountain2Div.style.animation = "psyGround 10s ease infinite";
  mountain2Div.style.background =
    "linear-gradient(127deg, #54e445, #454fe4, #e700ff, #ff0000)";
  mountain2Div.style.backgroundSize = "800% 800%";

  const mountain3Div = document.getElementById("mountain3");
  mountain3Div.style.animation = "psyGround 10s ease infinite";
  mountain3Div.style.background =
    "linear-gradient(67deg, #f9ff00, #ff0000, #1100ff, #f32cc9)";
  mountain3Div.style.backgroundSize = "800% 800%";

  // Turn off ability to walk
  walkFunction("off");
}

// Magic mode OFF

function magicOFF() {
  // Sky
  const skyDiv = document.getElementById("sky");
  skyDiv.style.animation = "none";
  skyDiv.style.background = "";
  skyDiv.style.backgroundSize = "";

  // Ground
  const groundDiv = document.getElementById("ground");
  groundDiv.style.animation = "none";
  groundDiv.style.background = "";
  groundDiv.style.backgroundSize = "";

  // Top triangles
  const treeTriangle11Div = document.getElementById("triangle11");
  treeTriangle11Div.classList.remove("mushroomMode");

  const treeTriangle12Div = document.getElementById("triangle12");
  treeTriangle12Div.classList.remove("mushroomMode");

  if (numberOfTrees === 3) {
    const treeTriangle13Div = document.getElementById("triangle13");
    treeTriangle13Div.classList.remove("mushroomMode");
  }

  // Middle triangles
  const treeTriangle21Div = document.getElementById("triangle21");
  treeTriangle21Div.classList.remove("mushroomMode");

  const treeTriangle22Div = document.getElementById("triangle22");
  treeTriangle22Div.classList.remove("mushroomMode");

  if (numberOfTrees === 3) {
    const treeTriangle23Div = document.getElementById("triangle23");
    treeTriangle23Div.classList.remove("mushroomMode");
  }

  // Bottom triangles
  const treeTriangle31Div = document.getElementById("triangle31");
  treeTriangle31Div.classList.remove("mushroomMode");

  const treeTriangle32Div = document.getElementById("triangle32");
  treeTriangle32Div.classList.remove("mushroomMode");

  if (numberOfTrees === 3) {
    const treeTriangle33Div = document.getElementById("triangle33");
    treeTriangle33Div.classList.remove("mushroomMode");
  }

  // Rectangles
  const treeRectangle1Div = document.getElementById("rectangle1");
  treeRectangle1Div.classList.remove("mushroomMode");

  const treeRectangle2Div = document.getElementById("rectangle2");
  treeRectangle2Div.classList.remove("mushroomMode");

  if (numberOfTrees === 3) {
    const treeRectangle3Div = document.getElementById("rectangle3");
    treeRectangle3Div.classList.remove("mushroomMode");
  }

  // Mountains
  const mountain1Div = document.getElementById("mountain1");
  mountain1Div.style.animation = "none";
  mountain1Div.style.background = "";
  mountain1Div.style.backgroundSize = "";

  const mountain2Div = document.getElementById("mountain2");
  mountain2Div.style.animation = "none";
  mountain2Div.style.background = "";
  mountain2Div.style.backgroundSize = "";

  const mountain3Div = document.getElementById("mountain3");
  mountain3Div.style.animation = "none";
  mountain3Div.style.background = "";
  mountain3Div.style.backgroundSize = "";

  // Turn on ability to walk
  walkFunction("on");
}

// Enable/disable walk

function walkFunction(onoff) {
  if (onoff === "on") {

    // Enable walk

    walkEnabled = true;

    const arrowUp = document.getElementById("control-up");
    const arrowDown = document.getElementById("control-down");
    const arrowLeft = document.getElementById("control-left");
    const arrowRight = document.getElementById("control-right");

    const clickFunctionUp = document.getElementById("control-click-up");
    const clickFunctionDown = document.getElementById("control-click-down");
    const clickFunctionLeft = document.getElementById("control-click-left");
    const clickFunctionRight = document.getElementById("control-click-right");

    arrowUp.style.transform = "scale(1)";
    clickFunctionUp.style.left = "40vw";

    arrowDown.style.transform = "scale(1)";
    clickFunctionDown.style.left = "40vw";

    arrowLeft.style.transform = "scale(1)";
    clickFunctionLeft.style.left = "22vw";

    arrowRight.style.transform = "scale(1)";
    clickFunctionRight.style.left = "58vw";

  } else if (onoff === "off") {

    // Disable walk

    walkEnabled = false;

    const arrowUp = document.getElementById("control-up");
    const arrowDown = document.getElementById("control-down");
    const arrowLeft = document.getElementById("control-left");
    const arrowRight = document.getElementById("control-right");

    const clickFunctionUp = document.getElementById("control-click-up");
    const clickFunctionDown = document.getElementById("control-click-down");
    const clickFunctionLeft = document.getElementById("control-click-left");
    const clickFunctionRight = document.getElementById("control-click-right");

    arrowUp.style.transform = "scale(0.01)";
    clickFunctionUp.style.left = "-5000px";

    arrowDown.style.transform = "scale(0.01)";
    clickFunctionDown.style.left = "-5000px";

    arrowLeft.style.transform = "scale(0.01)";
    clickFunctionLeft.style.left = "-5000px";

    arrowRight.style.transform = "scale(0.01)";
    clickFunctionRight.style.left = "-5000px";
  }
}

// Remove nav-arrows at map edge and add boundary edge boxes

// (uses CSS properties transform for arrows, left for tap area and opacity for map boundary blocks)

function boundariesForArrows() {
  const arrowUp = document.getElementById("control-up");
  const arrowDown = document.getElementById("control-down");
  const arrowLeft = document.getElementById("control-left");
  const arrowRight = document.getElementById("control-right");

  const clickFunctionUp = document.getElementById("control-click-up");
  const clickFunctionDown = document.getElementById("control-click-down");
  const clickFunctionLeft = document.getElementById("control-click-left");
  const clickFunctionRight = document.getElementById("control-click-right");

  const edgeBoundaryUp = document.getElementById("bound-up");
  const edgeBoundaryDown = document.getElementById("bound-down");
  const edgeBoundaryLeft = document.getElementById("bound-left");
  const edgeBoundaryRight = document.getElementById("bound-right");

  if (playerPosition.y === 0) {
    arrowUp.style.transform = "scale(0.01)";
    clickFunctionUp.style.left = "-5000px";
    edgeBoundaryUp.style.opacity = 1;
  } else {
    arrowUp.style.transform = "scale(1)";
    clickFunctionUp.style.left = "40vw";
    edgeBoundaryUp.style.opacity = 0;
  }

  if (playerPosition.y === gridSize - 1) {
    arrowDown.style.transform = "scale(0.01)";
    clickFunctionDown.style.left = "-5000px";
    edgeBoundaryDown.style.opacity = 1;
  } else {
    arrowDown.style.transform = "scale(1)";
    clickFunctionDown.style.left = "40vw";
    edgeBoundaryDown.style.opacity = 0;
  }

  if (playerPosition.x === 0) {
    arrowLeft.style.transform = "scale(0.01)";
    clickFunctionLeft.style.left = "-5000px";
    edgeBoundaryLeft.style.opacity = 1;
  } else {
    arrowLeft.style.transform = "scale(1)";
    clickFunctionLeft.style.left = "22vw";
    edgeBoundaryLeft.style.opacity = 0;
  }

  if (playerPosition.x === gridSize - 1) {
    arrowRight.style.transform = "scale(0.01)";
    clickFunctionRight.style.left = "-5000px";
    edgeBoundaryRight.style.opacity = 1;
  } else {
    arrowRight.style.transform = "scale(1)";
    clickFunctionRight.style.left = "58vw";
    edgeBoundaryRight.style.opacity = 0;
  }
}