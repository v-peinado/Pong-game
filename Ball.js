export class Ball {
  constructor(pos, vel, rad) {
    this.pos = pos;
    this.vel = vel;
    this.rad = rad;
  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }

  draw(ctx) {
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  collisionWithEdges(canvas) {
    if (this.pos.y + this.rad >= canvas.height) {
      this.pos.y = canvas.height - this.rad;
      this.vel.y *= -1;
    } else if (this.pos.y - this.rad <= 0) {
      this.pos.y = this.rad;
      this.vel.y *= -1;
    }
  }

  collisionWithPaddle(paddle) {
    let dx = Math.abs(this.pos.x - paddle.pos.x - paddle.width / 2);
    let dy = Math.abs(this.pos.y - paddle.pos.y - paddle.height / 2);
  
    if (dx <= (this.rad + paddle.width / 2) && dy <= (this.rad + paddle.height / 2)) {
      if (dx > paddle.width / 2) {
        // Colisión en los laterales: usar la lógica de ángulo de rebote
        let relativeIntersectY = this.pos.y - (paddle.pos.y + paddle.height / 2);
        let normalizedIntersect = relativeIntersectY / (paddle.height / 2);
        let bounceAngle = normalizedIntersect * (Math.PI / 4);  // máximo 45 grados
  
        let speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
  
        if (this.vel.x < 0) {
          this.vel.x = speed * Math.cos(bounceAngle);
          this.vel.y = speed * Math.sin(bounceAngle);
          this.pos.x = paddle.pos.x + paddle.width + this.rad;
        } else {
          this.vel.x = -speed * Math.cos(bounceAngle);
          this.vel.y = speed * Math.sin(bounceAngle);
          this.pos.x = paddle.pos.x - this.rad;
        }
      } else if (dy > paddle.height / 2) {
        // Colisión en la parte superior o inferior: invertir velocidad vertical
        this.vel.y *= -1;
        if (this.pos.y < paddle.pos.y) {
          this.pos.y = paddle.pos.y - this.rad;
        } else {
          this.pos.y = paddle.pos.y + paddle.height + this.rad;
        }
      } else {
        // Colisión en la esquina: invertir ambas velocidades
        this.vel.x *= -1;
        this.vel.y *= -1;
        if (this.pos.x < paddle.pos.x) {
          this.pos.x = paddle.pos.x - this.rad;
        } else if (this.pos.x > paddle.pos.x + paddle.width) {
          this.pos.x = paddle.pos.x + paddle.width + this.rad;
        }
        if (this.pos.y < paddle.pos.y) {
          this.pos.y = paddle.pos.y - this.rad;
        } else if (this.pos.y > paddle.pos.y + paddle.height) {
          this.pos.y = paddle.pos.y + paddle.height + this.rad;
        }
      }
    }
  }
}

