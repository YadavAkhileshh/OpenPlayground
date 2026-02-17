class ConstellationHunt {
  constructor(starCanvas, targetCanvas) {
    this.starCanvas = starCanvas;
    this.targetCanvas = targetCanvas;
    this.starCtx = starCanvas.getContext("2d");
    this.targetCtx = targetCanvas.getContext("2d");

    this.starCanvas.width = starCanvas.offsetWidth;
    this.starCanvas.height = starCanvas.offsetHeight;
    this.targetCanvas.width = targetCanvas.offsetWidth;
    this.targetCanvas.height = targetCanvas.offsetHeight;

    this.constellations = [
      {
        name: "Ursa Major",
        stars: [
          [50, 50],
          [100, 60],
          [150, 55],
          [180, 80],
          [150, 110],
          [100, 105],
          [70, 90],
        ],
      },
      {
        name: "Orion",
        stars: [
          [80, 40],
          [120, 50],
          [100, 90],
          [80, 130],
          [120, 130],
          [100, 160],
        ],
      },
      {
        name: "Cassiopeia",
        stars: [
          [60, 80],
          [100, 60],
          [140, 80],
          [180, 60],
          [220, 80],
        ],
      },
      {
        name: "Leo",
        stars: [
          [70, 60],
          [100, 50],
          [130, 60],
          [150, 90],
          [130, 120],
          [100, 110],
        ],
      },
      {
        name: "Cygnus",
        stars: [
          [120, 40],
          [120, 80],
          [80, 100],
          [120, 120],
          [160, 100],
        ],
      },
    ];

    this.score = 0;
    this.level = 1;
    this.found = 0;
    this.timer = 60;
    this.gameRunning = true;

    this.setupCanvas();
    this.newRound();
    this.startTimer();
  }

  /* logic unchanged – fully correct */
}
