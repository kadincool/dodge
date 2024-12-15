let keys = {};
let inputs = {};
let lastInputs = {};
let playerGamepad = null;
const deadzone = 0.5;

let player = {
  x: 200,
  y: 200,
  xMom: 0,
  yMom: 0,
  wid: 10,
  hei: 10,
  iRemain: 0,

  hp: 3,
  score: 0,

  speed: 3000,
  bounceStrength: 500,
  iTime: 1,
};

function inputFrame() {
  lastInputs = inputs;
  inputs = {
    up: false,
    down: false,
    left: false,
    right: false,
    pause: false,
    action: false,
  }; // make new one because of pass by reference later
  if (keys.KeyW) inputs.up = true;
  if (keys.KeyS) inputs.down = true;
  if (keys.KeyD) inputs.left = true;
  if (keys.KeyA) inputs.right = true;
  if (keys.Enter) inputs.pause = true;
  if (keys.Space) inputs.action = true;

  if (playerGamepad) {
    if (playerGamepad.axes[0] < -deadzone) inputs.right = true;
    if (playerGamepad.axes[0] > deadzone) inputs.left = true;
    if (playerGamepad.axes[1] < -deadzone) inputs.up = true;
    if (playerGamepad.axes[1] > deadzone) inputs.down = true;

    if (playerGamepad.buttons[12].pressed) inputs.up = true;
    if (playerGamepad.buttons[13].pressed) inputs.down = true;
    if (playerGamepad.buttons[14].pressed) inputs.right = true;
    if (playerGamepad.buttons[15].pressed) inputs.left = true;
    if (playerGamepad.buttons[9].pressed) inputs.pause = true;
    if (playerGamepad.buttons[0].pressed) inputs.action = true;
  }
}

function playerTakeDamage() {
  player.hp -= 1;
  if (player.hp <= 0) {
    menu.setMenu("dead");
    menu.paused = true;
  }
}

function playerMoveAndCollide(player, delta) {
  if (inputs.left) {
    player.xMom += player.speed * delta;
  }
  if (inputs.right) {
    player.xMom -= player.speed * delta;
  }
  if (inputs.down) {
    player.yMom += player.speed * delta;
  }
  if (inputs.up) {
    player.yMom -= player.speed * delta;
  }

  player.xMom *= 0.001 ** delta;
  player.yMom *= 0.001 ** delta;

  // sees if a smear between the new position and the old position hits anything
  let smearPlayer = {x: player.x + Math.min(player.xMom * delta, 0), y: player.y, wid: player.wid + Math.abs(player.xMom * delta), hei: player.hei};
  if (player.iRemain <= 0) // only check hazards if no invincibility
  for (let hazard of level.hazards) {
    let smearHazard = {x: hazard.x + Math.min(hazard.xMom * delta, 0), y: hazard.y, wid: hazard.wid + Math.abs(hazard.xMom * delta), hei: hazard.hei};
    if (checkOverlap(smearPlayer, smearHazard)) {
      if (player.xMom - hazard.xMom > 0) {
        player.xMom = -player.bounceStrength;
      } else {
        player.xMom = player.bounceStrength;
      }
      player.iRemain = player.iTime;
      playerTakeDamage();
      break;
    }
  }
  smearPlayer = {x: player.x + Math.min(player.xMom * delta, 0), y: player.y, wid: player.wid + Math.abs(player.xMom * delta), hei: player.hei}; // remake smear to accomidate change in momentum
  for (let wall of level.walls) {
    if (checkOverlap(smearPlayer, wall)) {
      if (player.xMom > 0) {
        player.x = wall.x - player.wid;
      } else {
        player.x = wall.x + wall.wid;
      }
      player.xMom = 0;
      break;
    }
  }
  player.x += player.xMom * delta;
  // Y direction
  smearPlayer = {x: player.x, y: player.y + Math.min(player.yMom * delta, 0), wid: player.wid, hei: player.hei + Math.abs(player.yMom * delta)};
  if (player.iRemain <= 0) // only check hazards if no invincibility
  for (let hazard of level.hazards) {
    let smearHazard = {x: hazard.x, y: hazard.y + Math.min(hazard.yMom * delta, 0), wid: hazard.wid, hei: hazard.hei + Math.abs(hazard.yMom * delta)};
    if (checkOverlap(smearPlayer, smearHazard)) {
      if (player.yMom - hazard.yMom > 0) {
        player.yMom = -player.bounceStrength;
      } else {
        player.yMom = player.bounceStrength;
      }
      player.iRemain = player.iTime;
      playerTakeDamage();
      break;
    }
  }
  smearPlayer = {x: player.x, y: player.y + Math.min(player.yMom * delta, 0), wid: player.wid, hei: player.hei + Math.abs(player.yMom * delta)};
  for (let wall of level.walls) {
    if (checkOverlap(smearPlayer, wall)) {
      if (player.yMom > 0) {
        player.y = wall.y - player.hei;
      } else {
        player.y = wall.y + wall.hei;
      }
      player.yMom = 0;
      break;
    }
  }
  player.y += player.yMom * delta;

  player.iRemain = Math.max(player.iRemain - delta, 0);
}

document.addEventListener("keydown", (e) => {keys[e.code] = true});
document.addEventListener("keyup", (e) => {keys[e.code] = false});
window.addEventListener("gamepadconnected", (e) => {if (playerGamepad == null) playerGamepad = e.gamepad});
window.addEventListener("gamepaddisconnected", (e) => {if (playerGamepad == e.gamepad) {playerGamepad = null; menu.paused = true;}});