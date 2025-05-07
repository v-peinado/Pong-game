export class Paddle {
  constructor(pos, vel, width, height, isLeft) {
    this.pos = pos;
    this.vel = vel;
    this.width = width;
    this.height = height;
    this.score = 0;
    this.isLeft = isLeft;
    this.targetY = pos.y + height / 2;
  }

  update(keys, KEY_W, KEY_S, KEY_UP, KEY_DOWN) {
    if (this.isLeft) {
      if (keys[KEY_W]) {
        this.pos.y -= this.vel.y;
      }
      if (keys[KEY_S]) {
        this.pos.y += this.vel.y;
      }
    } else {
      if (keys[KEY_UP]) {
        this.pos.y -= this.vel.y;
      }
      if (keys[KEY_DOWN]) {
        this.pos.y += this.vel.y;
      }
    }
  }

  draw(ctx) {
    ctx.fillStyle = 'gray';
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  }

  collisionWithEdges(canvas) {
    if (this.pos.y <= 0) {
      this.pos.y = 0;
    }
    if (this.pos.y + this.height >= canvas.height) {
      this.pos.y = canvas.height - this.height;
    }
  }
}