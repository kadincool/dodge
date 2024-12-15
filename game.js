const canvas = document.getElementById("gameCanvas");
const can2d = canvas.getContext("2d");

let lastTime = Date.now();

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

  if (menu.openAmnt > 0) can2d.filter = `blur(${menu.openAmnt * 10}px)`; // wont scale properly but too much blur causes lag
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
    if (player.hp > i) { // not >= because 1 hp should only fill square index 0
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