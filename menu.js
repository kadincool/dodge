let menu = {
  paused: true,
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
    can2d.fillStyle = "black";
    can2d.globalAlpha = this.openAmnt * 0.2;
    can2d.fillRect(0, 0, 500, 500);
    { // set text style
      can2d.fillStyle = "white";
      can2d.font = "bold 42px Courier New";
      can2d.textBaseline = "middle";
      can2d.textAlign = "center";
    }
    can2d.globalAlpha = this.openAmnt;
    can2d.fillText(this.screens[this.screen].text, 250, 100);
    can2d.font = "bold 20px Courier New";
    for (let i = 0; i < this.screens[this.screen].elems.length; i++) {
      can2d.fillStyle = "#007fff";
      can2d.fillRect(150, 150 + 75 * i, 200, 50);
      can2d.fillStyle = "white";
      can2d.fillText(this.screens[this.screen].elems[i], 250, 175 + 75 * i);
      can2d.strokeStyle = "white";
      can2d.lineWidth = 3;
      if (i == this.elem) can2d.strokeRect(150, 150 + 75 * i, 200, 50);
    }
    if (this.screen == "dead") {
      can2d.textBaseline = "bottom";
      can2d.fillText(`score: ${player.score}`, 250, 475);
    }
    can2d.globalAlpha = 1;
  },
};