console.clear();

noise.seed(Math.random() * 1000);

const ASSET_PREFIX = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/111863/';

const PI = Math.PI,
      PI2 = PI * 2;

const // module aliases
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Composite = Matter.Composite,
      Constraint = Matter.Constraint,
      Engine = Matter.Engine,
      Events = Matter.Events,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint,
      Render = Matter.Render,
      Vector = Matter.Vector,
      World = Matter.World;

const COLORS = {
  white: 'white',
  red: '#F44336',
  black: '#212121',
  purple: '#9C27B0',
  blue: '#2196F3',
  green: '#8bc34a',
  yellow: '#FFC107',
  orange: '#FF9800',
  brown: '#795548',
  felt: '#757575',
  pocket: '#121212',
  frame: '#3E2723'
};

const WIREFRAMES = false,
      INCH = 12,
      FOOT = INCH * 12,
      BALL_DI = 2.4375 * INCH,
      BALL_RAD = BALL_DI / 2,
      // POCKET_DI = 3.5 * INCH,
      POCKET_DI = 4.5 * INCH,
      POCKET_RAD = POCKET_DI / 2,
      WALL_DI = 5 * INCH,
      WALL_RAD = WALL_DI / 2,
      // TABLE_W = 9 * FOOT,
      TABLE_W = 8 * FOOT,
      // TABLE_H = 4.5 * FOOT,
      TABLE_H = 3.5 * FOOT,
      RETURN_H = BALL_DI * 1.75,
      VIEW_W = WALL_DI * 2 + TABLE_W,
      VIEW_H = WALL_DI * 2 + TABLE_H + RETURN_H;

class Ball {
  constructor({ number, cueball }) {
    this.cue = number === 0;
    this.eight = number === 8;
    this.stripes = number > 8;
    this.solids = number > 0 && number < 8;
    this.number = number;
    this.diameter = BALL_DI; 
    this.pocketed = false;
    this.setInitialCoordinates();
    this.setRender();
    this.setColor();
    this.cueball = cueball;
    this.build();
  }

  get fromCueball() {
    return {
      angle: Vector.angle(this.body.position, this.cueball.body.position)
    };
  }
  
  setInitialCoordinates() {
    let pos = Ball.positions[this.number].map(p => rel(p));
    this.x = pos[0];
    this.y = pos[1];
  }

  setColor() {
    this.color = COLORS[[
      'white',
      'yellow', 'blue', 'red', 'purple', 'orange', 'green', 'brown',
      'black',
      'yellow', 'blue', 'red', 'purple', 'orange', 'green', 'brown'
    ][this.number]];
  }

  setRender() {
    this.render = { fillStyle: 'transparent', lineWidth: 0 };
  }

  enable() {
    Body.setStatic(this.body, false);
    this.pocketed = false;
    this.body.isSensor = false;
  }
  
  disable() {
    if (!this.cue) Body.setStatic(this.body, true);
    this.pocketed = true;
    this.body.isSensor = true;
  }

  rest() {
    this.setVelocity({ x: 0, y: 0 });
    Body.setPosition(this.body, this.body.position);
    Body.update(this.body, 0, 0, 0);
  }

  reset() {
    this.enable();
    this.setVelocity({ x: 0, y: 0 });
    Body.setPosition(this.body, { x: this.x, y: this.y });
  }

  pocket({ x, y }) {
    this.disable();
    Body.setVelocity(this.body, { x: 0, y: 0 });
    Body.setAngle(this.body, 0);
    Body.setPosition(this.body, { x, y });
    Body.update(this.body, 0, 0, 0);
  }
  
  setVelocity({ x, y }) {
    Body.setVelocity(this.body, { x, y });
  }

  build() {
    this.body = Bodies.circle(
      this.x, this.y, 
      this.diameter / 2, 
      {
        render: this.render,
        label: 'ball',
        restitution: 0.9,
        friction: 0.001,
        density: this.cue ? 0.00021 : 0.0002
      }
    );
  }

  static get positions() {
    let radians60 = 60 * (Math.PI / 180),
        radians60Sin = Math.sin(radians60),
        radians60Cos = Math.cos(radians60);

    let postStartX = TABLE_W - TABLE_W / 4,
        postStartY = TABLE_H / 2,
        pos1 = [postStartX, postStartY],
        pos2 = [postStartX + (radians60Sin * BALL_DI),
          postStartY - (radians60Cos * BALL_DI)],
        pos3 = [postStartX + (radians60Sin * (BALL_DI * 2)),
          postStartY - (radians60Cos * (BALL_DI * 2))],
        pos4 = [postStartX + (radians60Sin * (BALL_DI * 3)),
          postStartY - (radians60Cos * (BALL_DI * 3))],
        pos5 = [postStartX + (radians60Sin * (BALL_DI * 4)),
          postStartY - (radians60Cos * (BALL_DI * 4))];
    return [                      
      [ // cue
        TABLE_W / 4, TABLE_H / 2],
      pos1, // 1
      pos2, // 2
      pos3, // 3
      pos4, // 4
      [ // 5
        pos1[0] + (radians60Sin * (BALL_DI * 4)),
        pos1[1] + (radians60Cos * (BALL_DI * 4))],
      [ // 6
        pos4[0] + (radians60Sin * BALL_DI),
        pos4[1] + (radians60Cos * BALL_DI)],
      [ // 7
        pos2[0] + (radians60Sin * BALL_DI * 2),
        pos2[1] + (radians60Cos * BALL_DI * 2)],
      [ // 8
        pos2[0] + (radians60Sin * BALL_DI),
        pos2[1] + (radians60Cos * BALL_DI)],
      [ // 9
        pos1[0] + (radians60Sin * BALL_DI),
        pos1[1] + (radians60Cos * BALL_DI)],
      [ // 10
        pos1[0] + (radians60Sin * (BALL_DI * 2)),
        pos1[1] + (radians60Cos * (BALL_DI * 2))],
      [ // 11
        pos1[0] + (radians60Sin * (BALL_DI * 3)),
        pos1[1] + (radians60Cos * (BALL_DI * 3))],
      pos5, // 12
      [ // 13
        pos2[0] + (radians60Sin * (BALL_DI * 3)),
        pos2[1] + (radians60Cos * (BALL_DI * 3))],
      [ // 14
        pos3[0] + (radians60Sin * BALL_DI),
        pos3[1] + (radians60Cos * BALL_DI)],
      [ // 15
        pos3[0] + (radians60Sin * (BALL_DI * 2)),
        pos3[1] + (radians60Cos * (BALL_DI * 2))],
    ];
  }
}

class Table {
  constructor() {
    this.width = TABLE_W;
    this.height = TABLE_H;
    this.hypot = Math.hypot(TABLE_W, TABLE_H);
    this.build();
  }
  
  build() {
    this.buildBounds();
    this.buildWall();
    this.buildPockets();
  }

  buildBounds() {
    let boundsOptions = {
      isStatic: true,
      render: { fillStyle: 'red' },
      label: 'bounds',
      friction: 1,
      restitution: 0,
      density: 1
    };
    let hw = VIEW_W + VIEW_H * 2;
    let vw = VIEW_H;
    let h = VIEW_H;

    this.bounds = [
      // Top
      Bodies.rectangle(VIEW_W * 0.5, h * -0.5, hw, h, boundsOptions),
      // Bottom
      Bodies.rectangle(VIEW_W * 0.5, VIEW_H + h * 0.5, hw, h, boundsOptions),
      // Left
      Bodies.rectangle(vw * -0.5, VIEW_H * 0.5, vw, h, boundsOptions),
      // Left
      Bodies.rectangle(VIEW_W + vw * 0.5, VIEW_H * 0.5, vw, h, boundsOptions)
    ];
  }

  buildWall() {
    let wallOptions = {
      isStatic: true,
      render: { fillStyle: 'transparent' },
      label: 'wall',
      friction: 0.0025,
      restitution: 0.6,
      density: 0.125,
      slop: 0.5
    };

    let quarterW = (TABLE_W - POCKET_RAD * 2) / 4;
    let halfH = (TABLE_H - POCKET_RAD) / 2;
    let vertices = Table.wallVertices;
    let horizontalBlock = { width: WALL_DI * 1.5, height: WALL_DI - POCKET_RAD };
    let verticalBlock = { width: WALL_DI - POCKET_RAD, height: WALL_DI * 1.5 };
    let middleBlock = { width: WALL_DI - POCKET_RAD, height: WALL_DI - POCKET_RAD };
    let horTY = horizontalBlock.height / 2,
        horBY = rel(TABLE_H + WALL_DI - horizontalBlock.height / 2),
        horLX = horizontalBlock.width / 2,
        horRX = rel(TABLE_W + WALL_DI - horizontalBlock.width / 2),
        verTY = verticalBlock.height / 2,
        verBY = rel(TABLE_H + WALL_DI - verticalBlock.height / 2),
        verLX = verticalBlock.width / 2,
        verRX = rel(TABLE_W + WALL_DI - verticalBlock.width / 2)
    ;
    this.walls = [
      // Bottom Left
      Bodies.fromVertices(rel(TABLE_W / 4), rel(TABLE_H + WALL_RAD), vertices.bottom, wallOptions),
      // Bottom Right
      Bodies.fromVertices(rel(TABLE_W / 4 + TABLE_W / 2), rel(TABLE_H + WALL_RAD), vertices.bottom, wallOptions),
      // Top Left
      Bodies.fromVertices(rel(TABLE_W / 4), rel(0 - WALL_RAD), vertices.top, wallOptions),
      // Top Right
      Bodies.fromVertices(rel(TABLE_W / 4 + TABLE_W / 2), rel(0 - WALL_RAD), vertices.top, wallOptions),
      // Left
      Bodies.fromVertices(rel(0 - WALL_RAD), rel(TABLE_H / 2), vertices.left, wallOptions),
      // Right
      Bodies.fromVertices(rel(TABLE_W + WALL_RAD), rel(TABLE_H / 2), vertices.right, wallOptions),
      // TL horizontal
      Bodies.rectangle(horLX, horTY, horizontalBlock.width, horizontalBlock.height, wallOptions),
      // TR horizontal
      Bodies.rectangle(horRX, horTY, horizontalBlock.width, horizontalBlock.height, wallOptions),
      // BL horizontal
      Bodies.rectangle(horLX, horBY, horizontalBlock.width, horizontalBlock.height, wallOptions),
      // BR horizontal
      Bodies.rectangle(horRX, horBY, horizontalBlock.width, horizontalBlock.height, wallOptions),
      // TL vertical
      Bodies.rectangle(verLX, verTY, verticalBlock.width, verticalBlock.height, wallOptions),
      // TR vertical
      Bodies.rectangle(verRX, verTY, verticalBlock.width, verticalBlock.height, wallOptions),
      // BL vertical
      Bodies.rectangle(verLX, verBY, verticalBlock.width, verticalBlock.height, wallOptions),
      // BR vertical
      Bodies.rectangle(verRX, verBY, verticalBlock.width, verticalBlock.height, wallOptions),
      // B middle
      Bodies.rectangle(rel(TABLE_W / 2), horBY, middleBlock.width, middleBlock.height, wallOptions),
      // T middle
      Bodies.rectangle(rel(TABLE_W / 2), horTY, middleBlock.width, middleBlock.height, wallOptions)
    ];
  }
  
  buildPockets() {
    let pocketOptions = {
      render: { fillStyle: 'transparent', lineWidth: 0 },
      label: 'pocket',
      isSensor: true
    };
    let pocketTopY = WALL_DI * 0.75;
    let pocketBottomY = TABLE_H + WALL_DI * 1.25;
    let pocketLeftX = WALL_DI * 0.75;
    let pocketRightX = TABLE_W + WALL_DI * 1.25;
    this.pockets = [
      Bodies.circle(pocketLeftX, pocketTopY, POCKET_RAD, pocketOptions),
      Bodies.circle(TABLE_W / 2 + WALL_DI, pocketTopY, POCKET_RAD, pocketOptions),
      Bodies.circle(pocketRightX, pocketTopY, POCKET_RAD, pocketOptions),
      Bodies.circle(pocketLeftX, pocketBottomY, POCKET_RAD, pocketOptions),
      Bodies.circle(TABLE_W / 2 + WALL_DI, pocketBottomY, POCKET_RAD, pocketOptions),
      Bodies.circle(pocketRightX, pocketBottomY, POCKET_RAD, pocketOptions)
    ];
  }

  static get wallVertices() {
    let obj = {};
    let quarterW = (TABLE_W - POCKET_RAD * 2) / 4;
    let halfH = (TABLE_H - POCKET_RAD) / 2;
    obj.bottom = [
      { x: -quarterW, y: WALL_DI },
      { x:  quarterW, y: WALL_DI },
      { x:  quarterW, y: POCKET_RAD },
      { x:  quarterW - POCKET_RAD, y: 0 },
      { x: -quarterW + POCKET_RAD, y: 0 },
      { x: -quarterW, y: POCKET_RAD },
    ];
    obj.top = [
      { x: -quarterW, y: 0 },
      { x:  quarterW, y: 0 },
      { x:  quarterW, y: WALL_DI - POCKET_RAD },
      { x:  quarterW - POCKET_RAD, y: WALL_DI },
      { x: -quarterW + POCKET_RAD, y: WALL_DI },
      { x: -quarterW, y: WALL_DI - POCKET_RAD },
    ];
    obj.left = [
      { y: -halfH, x: 0 },
      { y:  halfH, x: 0 },
      { y:  halfH, x: WALL_DI - POCKET_RAD },
      { y:  halfH - POCKET_RAD, x: WALL_DI },
      { y: -halfH + POCKET_RAD, x: WALL_DI },
      { y: -halfH, x: WALL_DI - POCKET_RAD },
    ];
    obj.right = [
      { y: -halfH, x: WALL_DI },
      { y:  halfH, x: WALL_DI },
      { y:  halfH, x: POCKET_RAD },
      { y:  halfH - POCKET_RAD, x: 0 },
      { y: -halfH + POCKET_RAD, x: 0 },
      { y: -halfH, x: POCKET_RAD },
    ];
    return obj;
  }
}

class Machine {
  constructor() {
    this.clock = 0;
    this.fireCount = 0;
    this.x = rel(TABLE_W * 0.5);
    this.y = rel(TABLE_H * 0.5);
  }

  reset({ x, y }, placingCueball) {
    if (placingCueball) {
      this.x = rel(TABLE_W * 0.5);
      this.y = rel(TABLE_H * 0.5);
    } else {
      this.x = x;
      this.y = y;
    }
    this.power = 0;
  }

  fire() {
    if (this.fireCount > 100) {
      this.fireCount = 0;
      return true;
    }
    let shouldFire = Math.random() < 0.0125;
    if (shouldFire)
      this.fireCount = 0;
    else
      this.fireCount++;
    return shouldFire;
  }

  tick() {
    let n1 = noise.perlin2(this.clock, this.clock);
    let n2 = noise.perlin2(this.clock + 100, this.clock + 100);
    let n3 = noise.perlin2(this.clock + 1000, this.clock + 1000);
    let max = 16;
    this.x = Math.max(Math.min(this.x + n1 * max, rel(TABLE_W)), rel(0));
    this.y = Math.max(Math.min(this.y + n2 * max, rel(TABLE_H)), rel(0));
    this.clock += 0.02;
    this.power = (n3 + 1) * 0.5 * 0.8 + 0.2;
  }
}

class Player {
  constructor(number) {
    this.number = number;
    this.stripes = false;
    this.solids = false;
    this.points = 0;
  }

  get onEight() {
    return this.points === 7;
  }

  get winner() {
    return this.points === 8;
  }

  get denomText() {
    if (this.stripes) return 'Stripes';
    if (this.solids) return 'Solids';
    return '';
  }

  get invalidContactText() {
    if (this.stripes) return `${this.nameText} did not hit a Stripe first.`;
    if (this.solids) return `${this.nameText} did not hit a Solid first.`;
  }

  get nameText() {
    if (this.number === 1) return '<strong>You</strong>';
    return '<strong>AI</strong>';
  }

  get eightText() {
    return `${this.nameText} Pocketed the Eight.`;
  }

  get scratchText() {
    return `${this.nameText} Scratched!`;
  }

  get turnText() {
    let txt = (this.number === 1) ? 'Your' : 'AI\'s';
    txt = `<strong>${txt}</strong>`;
    txt += ' Turn ';
    if (this.stripes || this.solids) txt += `(${this.denomText})`;
    return txt;
  }

  get winText() {
    if (this.number === 1) return '<strong>You</strong> Win!';
    return '<strong>AI</strong> Wins!';
  }

  get teamText() {
    return `${this.nameText} is ${this.denomText}`;
  }

  assign(stripes) {
    stripes ? this.stripes = true : this.solids = true;
  }

  score(count) {
    this.points += count;
  }
}

class Canvas {
  constructor({ context }) {
    this.context = context;
  }

  drawCrosshair({ x, y }) {
    this.context.fillStyle = 'rgba(255, 255, 255, 0.25)';
    this.context.beginPath();
    this.context.arc(x, y, BALL_RAD, 0, PI2, false);
    this.context.fill();
  }

  drawMovingCrosshair({ x, y }) {
    let rad = BALL_RAD - 2;
    this.context.strokeStyle = COLORS.red;
    this.context.lineWidth = 4;
    this.context.translate(x, y);
    this.context.rotate(-PI * 0.25);
    // circle
    this.context.beginPath();
    this.context.arc(0, 0, rad, 0, PI2, false);
    this.context.stroke();
    // slash
    this.context.beginPath();
    this.context.moveTo(0, (BALL_RAD + 2) * -0.5);
    this.context.lineTo(0, (BALL_RAD + 2) * 0.5);
    this.context.stroke();
    // rotating back
    this.context.rotate(PI * 0.25);
    this.context.translate(-x, -y);
    
  }

  drawTable({ wallBodies, pocketBodies }) {
    this.drawSlate();
    this.drawWall(wallBodies);
    this.drawReturn();
    this.drawPockets(pocketBodies);
    this.drawPoints();
  }

  drawSlate() {
    let grad = this.context.createRadialGradient(
      VIEW_W * 0.5, (VIEW_H - RETURN_H) * 0.5, TABLE_H * 0.75 * 0.125, 
      VIEW_W * 0.5, (VIEW_H - RETURN_H) * 0.5, TABLE_H * 0.75 * 1.5
    );
    grad.addColorStop(0, 'rgba(255,255,255,0.05)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.05)');
    grad.addColorStop(1, 'rgba(255,255,255,0.15)');

    this.context.fillStyle = COLORS.felt;
    this.context.fillRect(WALL_RAD, WALL_RAD, TABLE_W + WALL_DI, TABLE_H + WALL_DI);
    this.context.fillStyle = grad;
    this.context.fillRect(WALL_RAD, WALL_RAD, TABLE_W + WALL_DI, TABLE_H + WALL_DI);
  }
  
  drawReturn() {
    let gutter = (RETURN_H - BALL_DI * 1.2) * 0.5;
    this.context.fillStyle = COLORS.pocket;
    this.context.fillRect(
      gutter, VIEW_H - RETURN_H + gutter,
      VIEW_W - gutter * 2, RETURN_H - gutter * 2
    );
  }

  drawWall(wallBodies) {
    this.context.fillStyle = COLORS.frame;
    wallBodies.forEach((body, i) => {
      this.context.beginPath();
      body.vertices.forEach(({ x, y }, j) => {
        if (j === 0) {
          this.context.moveTo(x, y);
        } else {
          this.context.lineTo(x, y);
        }
      });
      this.context.fill();

      // BUMPERS
      this.context.save();
      this.context.beginPath();
      body.vertices.forEach(({ x, y }, j) => {
        if (j === 0) {
          this.context.moveTo(x, y);
        } else {
          this.context.lineTo(x, y);
        }
      });
      this.context.clip();
      this.context.fillStyle = '#787878';
      let clipOff = WALL_DI * 0.75;
      let clipDiff = WALL_DI - clipOff;
      this.context.fillRect(clipOff, clipOff, TABLE_W + clipDiff * 2, TABLE_H + clipDiff * 2);
      this.context.restore();
    });
  }

  drawPockets(pocketBodies) {
    this.context.fillStyle = COLORS.pocket;
    pocketBodies.forEach(({ position, circleRadius }) => {
      this.context.beginPath();
      this.context.arc(position.x, position.y, circleRadius, 0, PI2, false);
      this.context.fill();
    });
  }

  drawPoints() {
    let di = 10,
        rad = di * 0.5,
        inc = TABLE_W / 7,
        xc1 = rel(TABLE_W * 0.25),
        xl1 = xc1 - inc,
        xr1 = xc1 + inc,
        xc2 = xc1 + TABLE_W * 0.5,
        xl2 = xc2 - inc,
        xr2 = xc2 + inc,
        x3 = WALL_RAD * 0.75,
        x4 = rel(TABLE_W + WALL_RAD * 1.25),
        y1 = WALL_RAD * 0.75,
        y2 = rel(TABLE_H + WALL_RAD * 1.25),
        yc3 = rel(TABLE_H * 0.5),
        yt3 = yc3 - inc,
        yb3 = yc3 + inc;
    let positions = [
      [xl1, y1], [xc1, y1], [xr1, y1],
      [xl1, y2], [xc1, y2], [xr1, y2],
      [xl2, y1], [xc2, y1], [xr2, y1],
      [xl2, y2], [xc2, y2], [xr2, y2],
      [x3, yt3], [x3, yc3], [x3, yb3],
      [x4, yt3], [x4, yc3], [x4, yb3]
    ];
    this.context.fillStyle = COLORS.brown;
    positions.forEach((coords) => {
      let x = coords[0],
          y = coords[1];
      this.context.beginPath();
      this.context.moveTo(x, y - rad);
      this.context.lineTo(x + rad, y);
      this.context.lineTo(x, y + rad);
      this.context.lineTo(x - rad, y);
      this.context.fill();
    });
  }

  drawIndicator({ x, y, cueball, power, maxDistance }) {
    this.cueX = cueball.position.x;
    this.cueY = cueball.position.y;
    this.angle = Math.atan2(y - this.cueY, x - this.cueX);
    this.angleCos = Math.cos(this.angle);
    this.angleSin = Math.sin(this.angle);

    // coordinates for starting power just off the cueball
    let lineMinX = this.cueX + (BALL_DI * 1.2) * this.angleCos;
    let lineMinY = this.cueY + (BALL_DI * 1.2) * this.angleSin;

    // coordinates for showing power
    let lineMaxX = lineMinX + maxDistance * this.angleCos;
    let lineMaxY = lineMinY + maxDistance * this.angleSin;

    // coordinates for calculating power
    let newX = lineMinX + (power * maxDistance) * this.angleCos;
    let newY = lineMinY + (power * maxDistance) * this.angleSin;

    // setting the force relative to power
    this.forceX = (newX - lineMinX) / maxDistance * 0.02;
    this.forceY = (newY - lineMinY) / maxDistance * 0.02;

    this.context.lineCap = 'round';
    
    // max power
    this.context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.context.lineWidth = 4;
    this.context.beginPath();
    this.context.moveTo(lineMinX, lineMinY);
    this.context.lineTo(lineMaxX, lineMaxY);
    this.context.stroke();
    this.context.closePath();

    // power level
    this.context.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    this.context.lineWidth = 4;
    this.context.beginPath();
    this.context.moveTo(lineMinX, lineMinY);
    this.context.lineTo(newX, newY);
    this.context.stroke();
    this.context.closePath();
  }
  
  drawBalls({ balls, ballIds }) {
    let inAngle = [];
    for (let i = 0, len = ballIds.length; i < len; i++) {
      let ballId = ballIds[i];
      let ball = balls[ballId];
      this.drawBall(ball);
    }
  }

  drawBall(ball) {
    let x = ball.body.position.x,
        y = ball.body.position.y,
        rad = ball.body.circleRadius,
        di = rad * 2,
        a = ball.body.angle;

    this.context.translate(x, y);
    this.context.rotate(a);

    // offset from center
    let offsetX = ((x - WALL_DI) / TABLE_W * 2 - 1),
        offsetY = ((y - WALL_DI) / TABLE_H * 2 - 1);

    let grad = this.context.createRadialGradient(
      rad * offsetX, rad * offsetY, rad * 0.125, 
      rad * offsetX, rad * offsetY, rad * 1.5
    );
    if (ball.eight) {
      grad.addColorStop(0, 'rgba(255,255,255,0.15)');
      grad.addColorStop(1, 'rgba(255,255,255,0.05)');
    } else {
      grad.addColorStop(0, 'rgba(0,0,0,0.05)');
      grad.addColorStop(1, 'rgba(0,0,0,0.3)');
    }

    this.context.shadowColor = 'rgba(0,0,0,0.05)';
    this.context.shadowBlur = 2;
    this.context.shadowOffsetX = -offsetX * BALL_RAD * 0.5;
    this.context.shadowOffsetY = -offsetY * BALL_RAD * 0.5;

    this.context.fillStyle = ball.color;
    this.context.beginPath();
    this.context.arc(0, 0, rad, 0, PI2, false);
    this.context.fill();
    this.context.shadowColor = 'transparent';

    if (ball.stripes) {
      let s1 = PI * 0.15,
          e1 = PI - s1,
          s2 = PI * -0.15,
          e2 = PI - s2;
      this.context.fillStyle = 'white';
      this.context.beginPath();
      this.context.arc(0, 0, rad, s1, e1, false);
      this.context.fill();
      this.context.beginPath();
      this.context.arc(0, 0, rad, s2, e2, true);
      this.context.fill();
    }

    this.context.rotate(-a);

    this.context.beginPath();
    this.context.arc(0, 0, rad, 0, PI2, false);
    this.context.fillStyle = grad;
    this.context.fill();

    this.context.translate(-x, -y);
  }
}

class Game {
  constructor({ world, canvas, sounds }) {
    this.machine = new Machine();
    this.sounds = sounds;
    this.world = world;
    this.canvas = canvas;
    this.$score = document.querySelector('div.score');
    this.$message = document.querySelector('div.message');
    this.table = new Table();
    this.balls = {};
    this.ballIds = [];
    this.ballNumbers.forEach(number => {
      let ball = new Ball({ number, cueball: this.cueball });
      if (ball.cue) this.cueId = ball.body.id;
      if (ball.eight) this.eightId = ball.body.id;
      this.balls[ball.body.id] = ball;
      this.ballIds.push(ball.body.id);
    });
    this.addBodiesToWorld();
    initEscapedBodiesRetrieval(this.ballIds.map(id => this.balls[id].body));
    this.reset();
  }

  handleEscapedBall(ballId) {
    console.log('ESCAPED', this.balls[ballId]);
    this.balls[ballId].reset();
  }

  reset() {
    this.gameOver = false;
    this.break = true;
    this.mousedown = false;
    this.power = 0;
    this.powerStep = 0.015;
    this.powerDirection = 1;
    this.players = [new Player(1), new Player(2)];
    this.playersAssigned = false;
    this.currentPlayerIdx = 0;

    this.messages = [this.currentPlayer.turnText];

    this.pocketedThisTurn = [];
    this.pocketedStripes = 0;
    this.pocketedSolids = 0;
    this.placingCueball = true;
    this.ballIds.forEach((ballId) => this.balls[ballId].reset());
    this.updateDOM();
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIdx % 2];
  }

  get otherPlayer() {
    return this.players[(this.currentPlayerIdx + 1) % 2];
  }

  get isMachine() {
    return this.currentPlayerIdx % 2 !== 0;
  }
  
  addBodiesToWorld() {
    World.add(this.world, this.table.bounds);
    World.add(this.world, this.table.walls);
    World.add(this.world, this.table.pockets);
    World.add(this.world, this.ballIds.map(b => this.balls[b].body));
  }

  handleMousedown() {
    if (this.gameOver) return;
    if (this.moving) return;
    if (!this.placingCueball) 
      this.mousedown = true;
  }

  handleMouseup() {
    if (this.gameOver) return;
    this.mousedown = false;
    if (this.moving) return;
    if (this.placingCueball)
      this.placeCueball();
    else
      this.strikeCueball();
  }

  handlePocketed(ballId) {
    let ball = this.balls[ballId];
    if (ball.cue) this.setupCueball();
    this.handlePocketedBall(ball);
  }

  handlePocketedBall(ball) {
    this.pocketedThisTurn.push(ball);
    let x,
        y = VIEW_H - RETURN_H / 2;
    if (ball.stripes) {
      x = VIEW_W - (this.pocketedStripes * (BALL_DI * 1.2)) - RETURN_H * 0.5;
      this.pocketedStripes++;
    } else if (ball.solids) {
      x = this.pocketedSolids * (BALL_DI * 1.2) + RETURN_H * 0.5;
      this.pocketedSolids++;
    } else if (ball.cue) {
      x = VIEW_W * 0.5 + BALL_RAD * 1.1;
    } else { // ball.eight
      x = VIEW_W * 0.5 - BALL_RAD * 1.1;
    }

    ball.pocket({ x, y });
  }
  
  handleTickAfter({ x, y }) {
    this.tickPower();
    let power = this.power;
    let wasMoving = this.moving;
    this.checkMovement();
    let isMoving = this.moving;
    if (wasMoving && !isMoving) this.handleTurnEnd();

    let movingCrosshair = { x, y };

    this.canvas.drawTable({ wallBodies: this.table.walls, pocketBodies: this.table.pockets });
    this.canvas.drawBalls({ balls: this.balls, ballIds: this.ballIds });

    let isMachineClick = this.isMachine && this.machine.fire();
    if (this.isMachine) {
      this.machine.tick();
      x = this.machine.x; y = this.machine.y;
      power = this.machine.power;
    }

    if (isMachineClick) this.handleMousedown();
    if (this.placingCueball) {
      this.moveCueball(x, y);
    } else if (!this.moving && !this.gameOver) {
      this.canvas.drawIndicator({
        x, y, power,
        cueball: this.cueball.body,
        maxDistance: this.table.height * 0.5
      });
    }
    if (isMachineClick) this.handleMouseup();
    if (isMoving || this.isMachine) this.canvas.drawMovingCrosshair(movingCrosshair);
    if (!isMoving) this.canvas.drawCrosshair({ x, y });
  }

  handleCollisionActive({ pairs }) {
    pairs.forEach(({ bodyA, bodyB }, i) => {
      let coll = bodyA.label + bodyB.label;
      if (coll === 'ballpocket' || coll == 'pocketball') {
        let ball = bodyA.label === 'ball' ? bodyA : bodyB;
        let distance = Math.hypot(
          bodyA.position.y - bodyB.position.y,
          bodyA.position.x - bodyB.position.x
        );
        if (distance / BALL_DI <= 1)
          this.handlePocketed(ball.id);
      }
    });
  }

  handleCollisionStart({ pairs }) {
    if (this.placingCueball) return;
    pairs.forEach((collision, i) => {
      let { bodyA, bodyB } = collision;
      let speed = collision.collision.axisBody.speed;
      let coll = bodyA.label + bodyB.label;
      if (!this.firstContact && coll === 'ballball')
        this.firstContact = [bodyA, bodyB];
      if (coll === 'ballball') {
        let vol = Math.min(0.5, speed) + 0.05;
        let rate = Math.random() - 0.5 + 1;
        this.sounds.ball.rate(rate);
        this.sounds.ball.volume(vol);
        this.sounds.ball.play();
      } else if (coll === 'ballwall' || coll === 'wallball') {
        let vol = Math.min(1, speed) * 0.8 + 0.2;
        let rate = Math.random() - 0.5 + 0.75;
        this.sounds.rail.rate(rate);
        this.sounds.rail.volume(vol);
        this.sounds.rail.play();
      }
    });
  }

  // logic for valid first contact, scoring, and game end.
  handleTurnEnd() {
    this.restBalls();
    this.messages = [];
    this.power = 0;
    let pocketed = this.pocketedThisTurn;
    let winner = null;

    let isCue = pocketed.filter(b => b.cue).length > 0,
        isEight = pocketed.filter(b => b.eight).length > 0;

    // determining valid first contact
    let validFirstContact = true;
    if (this.firstContact) {
      let balls = this.firstContact.map(b => this.balls[b.id]);
      let ball = balls.filter(b => !b.cue)[0];
      if (this.playersAssigned && !isCue && !isEight)
        if (
          (this.currentPlayer.stripes && !ball.stripes) ||
          (this.currentPlayer.solids && !ball.solids)
        ) validFirstContact = false;
      this.firstContact = null;
    }

    // handling pocketed balls
    if (pocketed.length > 0) {
      let stripes = pocketed.filter(b => b.stripes),
          solids = pocketed.filter(b => b.solids),
          hasStripes = stripes.length > 0,
          hasSolids = solids.length > 0;

      // assigning players
      if (!this.playersAssigned) {
        // only assign if one kind of ball went in and cueball and eightball were not pocketed
        if ((!hasStripes || !hasSolids) && !isCue && !isEight) {
          this.currentPlayer.assign(hasStripes);
          this.otherPlayer.assign(!hasStripes);
          this.playersAssigned = true;
        }
      }
      
      // calculate scores
      if (this.currentPlayer.stripes) {
        this.currentPlayer.score(stripes.length);
        this.otherPlayer.score(solids.length);
      } else if (this.currentPlayer.solids) {
        this.currentPlayer.score(solids.length);
        this.otherPlayer.score(stripes.length);
      }

      // handling game over
      if (isEight) {
        this.messageEight();
        winner = (this.currentPlayer.onEight) ? this.currentPlayer : this.otherPlayer;
      // handling cueball
      } else if (isCue) {
        this.messageScratch();
        this.switchTurns();
      // handling invalid contact
      } else if (!validFirstContact) {
        this.messageInvalidContact();
        this.switchTurns();
      // handling the wrong ball
      } else if (
        (!hasStripes && this.currentPlayer.stripes) ||
        (!hasSolids && this.currentPlayer.solids)
      ) {
        this.switchTurns();
      }
    // scratching with no other pocketed balls
    } else if (isCue) {
      this.messageScratch();
      this.switchTurns();
    // switching turns on nothing going in
    } else {
      this.switchTurns();
    }
    // ending the turn
    this.pocketedThisTurn = [];
    if (winner) {
      this.messageWin(winner);
      this.handleGameOver();
    } else {
      this.messageTurn();
    }
    if (this.isMachine) {
      let aMachineBall = this.aMachineBall;
      this.machine.reset(aMachineBall.body.position, this.placingCueball);
    }
    this.updateDOM();
  }

  handleGameOver() {
    this.gameOver = true;
    let $button = document.createElement('button');
    $button.innerHTML = 'New Game';
    $button.addEventListener('click', () => {
      $button.remove();
      this.reset();
    });
    document.body.appendChild($button);
  }

  messageTurn() {
    this.messages.push(this.currentPlayer.turnText);
  }

  messageScratch() {
    this.messages.push(this.currentPlayer.scratchText);
  }

  messageInvalidContact() {
    this.messages.push(this.currentPlayer.invalidContactText);
  }

  messageEight() {
    this.messages.push(this.currentPlayer.eightText);
  }

  messageWin(winner) {
    this.messages.push(winner.winText);
  }

  restBalls() {
    this.ballIds.forEach(id => this.balls[id].rest());
  }

  strikeCueball() {
    this.break = false;
    this.moving = true;
    let power = this.isMachine ? this.machine.power : this.power;
    let vol = Math.min(1, power) * 0.9 + 0.1;
    this.sounds.cue.volume(vol);
    this.sounds.cue.play();
    Body.applyForce(
      this.cueball.body, 
      this.cueball.body.position,
      { x: this.canvas.forceX, y: this.canvas.forceY }
    );
  }
  
  setupCueball() {
    this.cueball.disable();
    this.placingCueball = true;
  }

  placeCueball() {
    this.cueball.enable();
    this.cueball.pocketed = false;
    this.placingCueball = false;
  }

  moveCueball(x, y) {
    if (this.moving) {
      x = rel(TABLE_W / 2);
      y = rel(TABLE_H + WALL_DI + RETURN_H * 0.5);
    } else {
      let maxX = (this.break) ? rel(TABLE_W / 4 - BALL_RAD) : rel(TABLE_W - BALL_RAD),
          minX = rel(0 + BALL_RAD),
          maxY = rel(TABLE_H - BALL_RAD),
          minY = rel(0 + BALL_RAD);
      x = Math.min(maxX, Math.max(minX, x));
      y = Math.min(maxY, Math.max(minY, y));
    }
    this.cueball.setVelocity({ x: 0, y: 0 });
    Body.setPosition(this.cueball.body, { x, y });
  }

  tickPower() {
    if (this.mousedown) {
      this.power += this.powerStep * this.powerDirection;
      if (this.power < 0) {
        this.powerDirection = 1;
        this.power = 0;
      } else if (this.power > 1) {
        this.powerDirection = -1;
        this.power = 1;
      }
    }
  }

  updateDOM() {
    let current = this.currentPlayerIdx % 2;
    this.$score.innerHTML = 
      this.updatePlayerDOM(this.players[0], current === 0) + 
      this.updatePlayerDOM(this.players[1], current === 1);
    this.$message.innerHTML = '<p>' + this.messages.map(m => m).join(' ') + '</p>';
  }

  updatePlayerDOM(player, current) {
    return `<span>
  <span>${player.nameText}</span>
  <span>${player.points}</span>
</span>`;
  }

  switchTurns() {
    this.currentPlayerIdx++;
  }

  checkMovement() {
    if (this.moving) {
      let moving = false;
      for (let i = 0, len = this.ballIds.length; i < len && !moving; i++) {
        let ballId = this.ballIds[i];
        let ball = this.balls[ballId];
        if (ball.body && ball.body.speed > 0.125) moving = true;
      }
      this.moving = moving;
    }
  }

  get aMachineBall() {
    let balls = this.ballIds.map(id => this.balls[id]).filter(b => !b.pocketed);
    if (this.players[1].onEight) {
      balls = [this.eightball];
    } else if (this.players[1].stripes) {
      balls = balls.filter(b => b.stripes);
    } else if (this.players[1].solids) {
      balls = balls.filter(b => b.solids);
    } else {
      balls = balls.filter(b => !b.cue && !b.eight);
    }
    return balls[Math.floor(Math.random() * balls.length)];
  }
  
  get cueball() {
    return this.balls[this.cueId];
  }
  
  get eightball() {
    return this.balls[this.eightId];
  }

  get ballNumbers() {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  }
}

// create a world and engine
let world = World.create({ gravity: { x: 0, y: 0 } });
let engine = Engine.create({ world, timing: { timeScale: 1 } });

// create a renderer
let element = document.querySelector('div.canvas');
let render = Render.create({
  element, engine,
  options: {
    width: VIEW_W,
    height: VIEW_H,
    wireframes: WIREFRAMES,
    background: COLORS.frame
  }
});

if (window.location.href.match(/cpgrid/)) {
  document.body.classList.add('screenshot');
  let src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/111863/billiards.png';
  let img = new Image();
  img.src = src;
  document.body.appendChild(img);
} else {
  let canvas = new Canvas(render);
  let mouse = Mouse.create(render.canvas);
  let sounds = {
    cue: new Howl({ src: [ASSET_PREFIX + 'billiards-cue.mp3', ASSET_PREFIX + 'billiards-cue.ogg'] }),
    ball: new Howl({ src: [ASSET_PREFIX + 'billiards-ball.mp3', ASSET_PREFIX + 'billiards-ball.ogg'] }),
    rail: new Howl({ src: [ASSET_PREFIX + 'billiards-rail.mp3', ASSET_PREFIX + 'billiards-rail.ogg'] })
  };
  let game = new Game({ world, canvas, sounds });

  Events.on(render, 'afterRender', () => {
    game.handleTickAfter({ x: mouse.position.x, y: mouse.position.y });
  });

  let constraint = MouseConstraint.create(engine, { mouse });
  Events.on(constraint, 'mousedown', ({ mouse }) => {
    game.handleMousedown();
  });
  Events.on(constraint, 'mouseup', ({ mouse }) => {
    game.handleMouseup();
  });

  Events.on(engine, 'collisionActive', (e) => {
    game.handleCollisionActive({ pairs: e.pairs });
  });

  Events.on(engine, 'collisionStart', (e) => {
    game.handleCollisionStart({ pairs: e.pairs });
  });

  // run the engine
  Engine.run(engine);

  // run the renderer
  Render.run(render);
}


function rel(x) {
  return x + WALL_DI;
}

function initEscapedBodiesRetrieval(allBodies) {
  function hasBodyEscaped(body) {
    let { x, y } = body.position;
    return x < 0 || x > VIEW_W || y < 0 || y > VIEW_H;
  }

  setInterval(() => {
    let i, body;
    for (i = 0; i < allBodies.length; i++) {
      body = allBodies[i];
      if (hasBodyEscaped(body)) game.handleEscapedBall(body.id);
    }
  }, 300);
}