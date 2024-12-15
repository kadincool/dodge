const canvas = document.getElementById("gameCanvas");
const can2d = canvas.getContext("2d");

let lastTime = Date.now();

let menu = {
  paused: true,
  // pausable: true,
  openAmnt: 0,
  opcacity: 1,
  screen: "menu",
  screens: {
    pause: {
      text: "Paused",
      opaque: false,
      pausable: true,
      elems: ["Continue", "Restart", "Main Menu"],
      actions: [
        (r) => {r.paused = false;},
        (r) => {initLevel(); r.setMenu("pause"); r.paused = false; r.openAmnt = 0;},
        (r) => {r.setMenu("menu");},
      ],
    },
    menu: {
      text: "Dodge",
      opaque: true,
      pausable: false,
      elems: ["Play"],
      actions: [
        (r) => {initLevel(); r.setMenu("pause"); r.paused = false; r.openAmnt = 0;},
      ],
    },
    dead: {
      text: "Game Over",
      opaque: true,
      pausable: false,
      elems: ["Restart", "Main Menu"],
      actions: [
        (r) => {initLevel(); r.setMenu("pause"); r.paused = false; r.openAmnt = 0;},
        (r) => {r.setMenu("menu");},
      ],
    }
  },
  elem: 0,
  updateMenu(delta) {
    if (this.screens[this.screen].opaque && this.paused) {
      this.opcacity = Math.min(this.opcacity + delta * 10, 1);
    } else {
      this.opcacity = Math.max(this.opcacity - delta * 10, 0);
    }
    if (this.paused) {
      this.openAmnt = Math.min(this.openAmnt + delta * 10, 1);
      if (this.screens[this.screen] && inputs.down && !lastInputs.down) {
        this.elem++;
        if (this.elem >= this.screens[this.screen].elems.length) {
          this.elem = 0;
        }
      }
      if (this.screens[this.screen] && inputs.up && !lastInputs.up) {
        this.elem--;
        if (this.elem < 0) {
          this.elem = this.screens[this.screen].elems.length - 1;
        }
      }
      if ((inputs.action && !lastInputs.action|| inputs.pause && !lastInputs.pause)) { // || inputs.pause && !lastInputs.pause
        this.screens[this.screen].actions[this.elem](this);
      }
    } else {
      this.openAmnt = Math.max(this.openAmnt - delta * 10, 0);
      if (this.screens[this.screen].pausable && inputs.pause && !lastInputs.pause) {
        this.paused = true;
      }
    }
  },

  setMenu(menu) {
    if (this.screens[menu]) {
      this.screen = menu;
      this.elem = 0;
    }
  },

  draw() {
    can2d.filter = "none";
    can2d.fillStyle = "#003f7f";
    can2d.globalAlpha = this.opcacity;
    can2d.fillRect(0, 0, 500, 500);
    // can2d.fillRect(0, 0, canvas.width, canvas.height);
    can2d.fillStyle = "black";
    can2d.globalAlpha = this.openAmnt * 0.2;
    can2d.fillRect(0, 0, 500, 500);
    // can2d.fillRect(0, 0, canvas.width, canvas.height);
    { // set text style
      can2d.fillStyle = "white";
      can2d.font = "bold 42px Courier New";
      can2d.textBaseline = "middle";
      can2d.textAlign = "center";
    }
    can2d.globalAlpha = this.openAmnt;
    can2d.fillText(this.screens[this.screen].text, 250, 100);
    // can2d.fillText(this.screens[this.screen].text, canvas.width / 2, 100);
    can2d.font = "bold 20px Courier New";
    for (let i = 0; i < this.screens[this.screen].elems.length; i++) {
      can2d.fillStyle = "#007fff";
      can2d.fillRect(150, 150 + 75 * i, 200, 50);
      // can2d.fillRect(canvas.width / 2 - 100, 150 + 75 * i, 200, 50);
      can2d.fillStyle = "white";
      can2d.fillText(this.screens[this.screen].elems[i], 250, 175 + 75 * i);
      // can2d.fillText(this.screens[this.screen].elems[i], canvas.width / 2, 175 + 75 * i);
      can2d.strokeStyle = "white";
      can2d.lineWidth = 3;
      if (i == this.elem) can2d.strokeRect(150, 150 + 75 * i, 200, 50)
      // if (i == this.elem) can2d.strokeRect(canvas.width / 2 - 100, 150 + 75 * i, 200, 50)
    }
    if (this.screen == "dead") {
      can2d.textBaseline = "bottom";
      can2d.fillText(`score: ${player.score}`, 250, 475);
      // can2d.fillText(`score: ${player.score}`, canvas.width / 2, canvas.height - 25);
    }
    can2d.globalAlpha = 1;
  },
};

let hazardMaker = {
  difficulty: 1,
  gapCountdown: 3,
  gapDelay: 3, //goes down with diff
  gapSpace: 100, //goes down with diff
  gapSpeed: 100, //goes up with diff
  nGapDir: 0,
  nGapPos: 250,

  // score: 0,
  nextLevel: 10,

  makeHazards(delta) {
    while (delta >= this.gapCountdown) {
      makeGap(this.nGapPos, this.gapSpace, this.gapSpeed, this.nGapDir, delta);
      this.nGapDir = Math.floor(Math.random() * 4);
      this.nGapPos = Math.floor(Math.random() * (level.height - this.gapSpace - 80)) + this.gapSpace / 2 + 40;
      delta -= this.gapCountdown;
      this.gapCountdown = this.gapDelay;
    }
    this.gapCountdown -= delta;
  },

  addScore() {
    // player.score += 1;
    player.score += 0.5;
    // this.score += 1;
    if (player.score >= this.nextLevel) {
      // this.score = 0;
      player.hp = Math.min(player.hp + 1, 4);
      this.nextLevel *= 3;
      this.levelUpDiff();
    }
  },

  drawFutureHazards() {
    if (this.nGapDir == 0 || this.nGapDir == 2) {
      let x = 0;
      if (this.nGapDir == 2) x = level.width - 20;
      can2d.fillRect(x, 0, 20, this.nGapPos - this.gapSpace / 2);
      can2d.fillRect(x, this.nGapPos + this.gapSpace / 2, 20, level.height - (this.nGapPos + this.gapSpace / 2));
    } else if (this.nGapDir == 1 || this.nGapDir == 3) {
      let y = 0;
      if (this.nGapDir == 3) y = level.height - 20;
      can2d.fillRect(0, y, this.nGapPos - this.gapSpace / 2, 20);
      can2d.fillRect(this.nGapPos + this.gapSpace / 2, y, level.width - (this.nGapPos + this.gapSpace / 2), 20);
    } else {
      return;
    }
  },

  levelUpDiff() {
    this.difficulty += 1;
    this.gapDelay *= 0.8;
    this.gapSpace = (this.gapSpace - 20) * 0.8 + 20;
    this.gapSpeed *= 1.2;
  }
}

class Wall {
  x;
  y;
  wid;
  hei;

  constructor(x = 0, y = 0, wid = 10, hei = 10) {
    this.x = x;
    this.y = y;
    this.wid = wid;
    this.hei = hei;
  }
}

class Hazard extends Wall {
  xMom;
  yMom;
  constructor(x = 0, y = 0, wid = 10, hei = 10, xMom = 0, yMom = 0) {
    super(x, y, wid, hei);
    this.xMom = xMom;
    this.yMom = yMom;
  }
}

function makeGap(pos, wid, speed, dir, delta = 0) {
  // let hazard = new Hazard(0, 0, 20, 20, 0, 0);
  // let hazard2 = new Hazard(0, 0, 20, 20, 0, 0);
  let id1 = -1;
  let id2 = -1;
  if (dir == 0 || dir == 2) {
    let xMom = speed;
    let x = 0;
    if (dir == 2) {
      xMom = -speed;
      x = level.width - 20;
    }
    id1 = level.hazards.push(new Hazard(x, 0, 20, pos - wid / 2, xMom, 0));
    id2 = level.hazards.push(new Hazard(x, pos + wid / 2, 20, level.height - (pos + wid / 2), xMom, 0));
  } else if (dir == 1 || dir == 3) {
    let yMom = speed;
    let y = 0;
    if (dir == 3) {
      yMom = -speed;
      y = level.height - 20;
    }
    id1 = level.hazards.push(new Hazard(0, y, pos - wid / 2, 20, 0, yMom));
    id2 = level.hazards.push(new Hazard(pos + wid / 2, y, level.width - (pos + wid / 2), 20, 0, yMom));
  } else {
    return;
  }
  moveHazard(level.hazards[id1 - 1], delta);
  moveHazard(level.hazards[id2 - 1], delta);
  // level.hazards.push(hazard);
}

let level = {
  width: 0,
  height: 0,

  walls: [],
  hazards: [],
}

function initLevel() {
  level.width = 500;
  level.height = 500;
  level.walls = [];
  level.hazards = [];

  player.x = 200;
  player.y = 200;
  player.xMom = 0;
  player.yMom = 0;
  player.wid = 10;
  player.hei = 10;
  player.iRemain = 0;
  player.hp = 3;
  player.score = 0;

  hazardMaker.difficulty = 1;
  hazardMaker.gapCountdown = 3;
  hazardMaker.gapDelay = 3; //goes down with diff
  hazardMaker.gapSpace = 100; //goes down with diff
  hazardMaker.gapSpeed = 100; //goes up with diff
  hazardMaker.nGapDir = 0;
  hazardMaker.nGapPos = 250;
  // hazardMaker.score = 0;
  hazardMaker.nextLevel = 10;

  level.walls.push(new Wall(0, 0, 500, 20));
  level.walls.push(new Wall(0, 480, 500, 20));
  level.walls.push(new Wall(0, 0, 20, 500));
  level.walls.push(new Wall(480, 0, 20, 500));
  level.walls.push(new Wall(130, 150, 20, 200));
  level.walls.push(new Wall(350, 150, 20, 200));
  level.walls.push(new Wall(200, 240, 100, 20));
  level.walls.push(new Wall(240, 50, 20, 150));
  level.walls.push(new Wall(240, 300, 20, 150));
  level.walls.push(new Wall(50, 240, 100, 20));
  level.walls.push(new Wall(350, 240, 100, 20));
  // level.walls.push(new Wall(130, 0, 20, 100));
  // level.walls.push(new Wall(130, 400, 20, 100));
  // level.walls.push(new Wall(350, 0, 20, 100));
  // level.walls.push(new Wall(350, 400, 20, 100));
  level.walls.push(new Wall(0, 0, 150, 100));
  level.walls.push(new Wall(0, 400, 150, 100));
  level.walls.push(new Wall(350, 0, 150, 100));
  level.walls.push(new Wall(350, 400, 150, 100));

  // level.hazards.push(new Hazard(200, 200, 100, 100, -250, 0));
  // makeGap(250, 100, 100, 1);
  // makeGap(250, 100, 100, 2);
  // makeGap(250, 100, 100, 3);
  // makeGap(250, 100, 100, 4);
}

initLevel();


function checkOverlap(obj1, obj2) {
  return obj1.x < obj2.x + obj2.wid && obj1.x + obj1.wid > obj2.x && obj1.y < obj2.y + obj2.hei && obj1.y + obj1.hei > obj2.y;
}

function moveHazard(hazard, delta) {
  hazard.x += hazard.xMom * delta;
  hazard.y += hazard.yMom * delta;
}

function moveHazards(delta) {
  for (let i = 0; i < level.hazards.length; i++) {
    let hazard = level.hazards[i];
    hazard.x += hazard.xMom * delta;
    hazard.y += hazard.yMom * delta;
    // check out of level bounds
    if (!checkOverlap({x: 0, y: 0, wid: level.width, hei: level.height}, hazard)) {
      level.hazards.splice(i, 1);
      hazardMaker.addScore();
      i--;
    }
  }
}

function frame() {
  let delta = Date.now() - lastTime;
  lastTime += delta;
  delta /= 1000;
  delta = Math.min(delta, 0.2);

  inputFrame();

  menu.updateMenu(delta);

  if (menu.paused) delta = 0;

  if (!menu.paused) playerMoveAndCollide(player, delta);

  moveHazards(delta);

  hazardMaker.makeHazards(delta);

  // draw
  let canvasSize = Math.min(Math.floor(window.innerWidth / 50) * 50, Math.floor(window.innerHeight / 50) * 50);
  if (canvas.width != canvasSize) canvas.width = canvasSize;
  if (canvas.height != canvasSize) canvas.height = canvasSize;
  can2d.resetTransform();
  can2d.scale(canvasSize / 500, canvasSize / 500)
  can2d.filter = "none";
  can2d.fillStyle = "#003f7f";
  can2d.fillRect(0, 0, 500, 500);
  // can2d.fillRect(0, 0, canvas.width, canvas.height);

  if (menu.openAmnt > 0) can2d.filter = `blur(${menu.openAmnt * 10 * (canvasSize / 500)}px)`;
  can2d.fillStyle = "#007fff";
  for (let wall of level.walls) {
    can2d.fillRect(wall.x, wall.y, wall.wid, wall.hei);
  }

  can2d.fillStyle = "black"
  can2d.globalAlpha = 0.3;
  hazardMaker.drawFutureHazards();
  can2d.globalAlpha = 1;

  can2d.fillStyle = "#ff003f";
  for (let hazard of level.hazards) {
    can2d.fillRect(hazard.x, hazard.y, hazard.wid, hazard.hei);
  }

  can2d.fillStyle = "white";
  
  can2d.fillRect(player.x, player.y, player.wid, player.hei);

  for (let i = 0; i < 4; i++) {
    if (player.hp > i) { // not >= because want 1 hp to only fill square index 0
      can2d.fillStyle = "white";
    } else {
      can2d.fillStyle = "black";
    }
    can2d.fillRect(i * 20 + 20, 20, 10, 10);
  }

  { // set text style
    can2d.fillStyle = "white";
    can2d.font = "bold 18px Courier New";
    can2d.textBaseline = "top";
    can2d.textAlign = "left";
  }
  can2d.fillText(`Level: ${hazardMaker.difficulty}`, 20, 40);
  can2d.fillText(`${player.score} / ${hazardMaker.nextLevel}`, 20, 60);

  menu.draw();

  requestAnimationFrame(frame);
}
frame();