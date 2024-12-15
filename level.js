// object with timer to make the hazards
let hazardMaker = {
  difficulty: 1,
  gapCountdown: 3,
  gapDelay: 3, //goes down with diff
  gapSpace: 100, //goes down with diff
  gapSpeed: 100, //goes up with diff
  nGapDir: 0,
  nGapPos: 250,

  nextLevel: 10,

  // makes hazards and then moves them continuously
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
    player.score += 0.5;
    if (player.score >= this.nextLevel) {
      player.hp = Math.min(player.hp + 1, 4);
      this.nextLevel *= 3;
      this.levelUpDiff();
    }
  },

  // To draw the faint outlines
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

// function to make the gap hazards
function makeGap(pos, wid, speed, dir, delta = 0) {
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
  hazardMaker.nextLevel = 10;

  // outer frame
  level.walls.push(new Wall(0, 0, 500, 20));
  level.walls.push(new Wall(0, 480, 500, 20));
  level.walls.push(new Wall(0, 0, 20, 500));
  level.walls.push(new Wall(480, 0, 20, 500));
  // T shape on either side
  level.walls.push(new Wall(130, 150, 20, 200));
  level.walls.push(new Wall(50, 240, 100, 20));
  level.walls.push(new Wall(350, 150, 20, 200));
  level.walls.push(new Wall(350, 240, 100, 20));
  // line in the middle interruped by a dash
  level.walls.push(new Wall(240, 50, 20, 150));
  level.walls.push(new Wall(240, 300, 20, 150));
  level.walls.push(new Wall(200, 240, 100, 20)); // dash through the middle
  // corner indents
  level.walls.push(new Wall(0, 0, 150, 100));
  level.walls.push(new Wall(0, 400, 150, 100));
  level.walls.push(new Wall(350, 0, 150, 100));
  level.walls.push(new Wall(350, 400, 150, 100));
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