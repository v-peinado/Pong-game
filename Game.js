import { Ball } from './Ball.js';
import { Paddle } from './Paddle.js';



export class Game {
  constructor(canvas, param2, param3, param4) {
    // Detectar qué versión de la llamada estamos utilizando
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Configuración predeterminada
    this.keys = {};
    this.lastAIUpdate = 0;
    this.AI_INTERVAL = 1000;
    this.animationFrameId = null;
    this.gameEnded = false;
    this.KEY_UP = 38;
    this.KEY_DOWN = 40;
    this.KEY_W = 87;
    this.KEY_S = 83;
    
    // Caso 1: new Game(canvas, match, maxPoints, onGameEnd)
    if (param2 && typeof param2 === 'object' && param2.id !== undefined) {
      // Es el caso de torneo con match - aquí se establece la detección del objeto match
      this.match = param2;
      this.maxPoints = param3 || 10;
      this.onGameEnd = param4;
      this.isSinglePlayer = false;
      this.difficulty = {
        BALL_SPEED: 7,
        PLAYER_SPEED: 7,
        RANDOMNESS: 50,
        MISS_CHANCE: 0.1,
        AI_REACTION_DELAY: 200
      };
    } 
    // Caso 2: new Game(canvas, isSinglePlayer, difficulty, maxPoints, onGameEnd)
    else if (typeof param2 === 'boolean' || param2 === undefined) {
      this.isSinglePlayer = param2 || false;
      this.difficulty = param3 || {
        BALL_SPEED: 7,
        PLAYER_SPEED: 7,
        RANDOMNESS: 50,
        MISS_CHANCE: 0.1,
        AI_REACTION_DELAY: 200
      };
      this.maxPoints = typeof param4 === 'number' ? param4 : 10;
      this.onGameEnd = typeof param4 === 'function' ? param4 : null;
    }
    // Caso 3: new Game(canvas, options)
    else if (typeof param2 === 'object') {
      const options = param2;
      this.isSinglePlayer = options.isSinglePlayer || false;
      this.difficulty = options.difficulty || {
        BALL_SPEED: 7,
        PLAYER_SPEED: 7,
        RANDOMNESS: 50,
        MISS_CHANCE: 0.1,
        AI_REACTION_DELAY: 200
      };
      this.maxPoints = options.maxPoints || 10;
      this.onGameEnd = options.onGameEnd || null;
      this.match = options.match || null;
    }

    // Inicializar objetos del juego
    const ballSpeed = this.difficulty.BALL_SPEED || 7;
    
    this.ball = new Ball(
      { x: canvas.width / 2, y: canvas.height / 2 },
      { x: ballSpeed, y: ballSpeed },
      10
    );
    
    const playerSpeed = this.difficulty.PLAYER_SPEED || 7;
    
    this.paddle1 = new Paddle(
      { x: 10, y: canvas.height / 2 - 80 },
      { x: 0, y: playerSpeed },
      10,
      160,
      true
    );
    
    this.paddle2 = new Paddle(
      { x: canvas.width - 20, y: canvas.height / 2 - 80 },
      { x: 0, y: playerSpeed },
      10,
      160,
      false
    );

    // Eventos de teclado
    window.addEventListener('keydown', (e) => {
      this.keys[e.keyCode] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.keyCode] = false;
    });
    
    // Vincular el método loop
    this.loop = this.loop.bind(this);
  }

  simulateKeyDown(keyCode) {
    const event = new KeyboardEvent('keydown', { keyCode });
    window.dispatchEvent(event);
  }

  simulateKeyUp(keyCode) {
    const event = new KeyboardEvent('keyup', { keyCode });
    window.dispatchEvent(event);
  }

  player2AI(timestamp) {
    if (timestamp - this.lastAIUpdate >= this.AI_INTERVAL) {
      this.lastAIUpdate = timestamp;

      let predictedY = this.predictBallY();

      const randomness = Math.random() * this.difficulty.RANDOMNESS - (this.difficulty.RANDOMNESS / 2);
      let targetY = predictedY + randomness;

      if (Math.random() < this.difficulty.MISS_CHANCE) {
        targetY = Math.random() * this.canvas.height;
      }
      this.paddle2.targetY = targetY;

      const paddleCenter = this.paddle2.pos.y + this.paddle2.height / 2;
      if (paddleCenter < this.paddle2.targetY - 5) {
        this.simulateKeyDown(this.KEY_DOWN);
        this.simulateKeyUp(this.KEY_UP);
      } else if (paddleCenter > this.paddle2.targetY + 5) {
        this.simulateKeyDown(this.KEY_UP);
        this.simulateKeyUp(this.KEY_DOWN);
      } else {
        this.simulateKeyUp(this.KEY_UP);
        this.simulateKeyUp(this.KEY_DOWN);
      }

      setTimeout(() => {
        this.simulateKeyUp(this.KEY_UP);
        this.simulateKeyUp(this.KEY_DOWN);
      }, this.difficulty.AI_REACTION_DELAY + Math.random() * 200);
    }
  }

  paddleUpdate(paddle) {
    const paddleCenter = paddle.pos.y + paddle.height / 2;
    const speed = paddle.vel.y;

    if (paddleCenter < paddle.targetY - 5) {
      paddle.pos.y += speed;
    } else if (paddleCenter > paddle.targetY + 5) {
      paddle.pos.y -= speed;
    }
    paddle.pos.y = Math.max(0, Math.min(this.canvas.height - paddle.height, paddle.pos.y));
  }

  predictBallY() {
    if (this.ball.vel.x <= 0) {
      return this.ball.pos.y;
    }
    
    let tempBall = {
      pos: { x: this.ball.pos.x, y: this.ball.pos.y },
      vel: { x: this.ball.vel.x, y: this.ball.vel.y },
      rad: this.ball.rad
    };
    
    let maxIterations = 500;
    let iterations = 0;
    
    while (tempBall.pos.x < this.paddle2.pos.x && iterations < maxIterations) {
      tempBall.pos.x += tempBall.vel.x;
      tempBall.pos.y += tempBall.vel.y;
      iterations++;
      
      if (tempBall.pos.y + tempBall.rad >= this.canvas.height) {
        tempBall.pos.y = this.canvas.height - tempBall.rad;
        tempBall.vel.y *= -1;
      } else if (tempBall.pos.y - tempBall.rad <= 0) {
        tempBall.pos.y = tempBall.rad;
        tempBall.vel.y *= -1;
      }
    }
    
    if (iterations === maxIterations) {
      console.warn("predictBallY reached maximum iterations.");
    }

    const errorMargin = 15;
    const randomError = (Math.random() * 2 * errorMargin) - errorMargin;
    let predictedY = tempBall.pos.y + randomError;

    predictedY = Math.max(this.ball.rad, Math.min(this.canvas.height - this.ball.rad, predictedY));

    return predictedY;
  }

  respawnBall() {
    this.ball.pos.x = this.canvas.width / 2;
    this.ball.pos.y = Math.random() * this.canvas.height;
    this.ball.vel.x *= -1;
    // Randomizar la dirección vertical al respawn
    if (Math.random() > 0.5) {
      this.ball.vel.y *= -1;
    }
  }

  increaseScore() {
    if (this.ball.pos.x <= -this.ball.rad) {
      this.paddle2.score++;
      this.respawnBall();
    }
    if (this.ball.pos.x >= this.canvas.width + this.ball.rad) {
      this.paddle1.score++;
      this.respawnBall();
    }
  }

  updateScores() {
    // Comprobar si existen los elementos antes de actualizar
    const player1ScoreEl = document.getElementById('player1Score');
    const player2ScoreEl = document.getElementById('player2Score');
    
    if (player1ScoreEl) player1ScoreEl.textContent = this.paddle1.score;
    if (player2ScoreEl) player2ScoreEl.textContent = this.paddle2.score;
  }

  checkGameEnd() {
    if (this.paddle1.score >= this.maxPoints) {
      this.stopGameAndFinish(this.paddle1.score, this.paddle2.score, 'Player1');
    } else if (this.paddle2.score >= this.maxPoints) {
      this.stopGameAndFinish(this.paddle1.score, this.paddle2.score, 'Player2');
    }
  }

  stopGameAndFinish(player1Points, player2Points, winner) {
    if (this.gameEnded) return;
    
    this.gameEnded = true;
    cancelAnimationFrame(this.animationFrameId);
    
    if (this.onGameEnd) {
      this.onGameEnd(player1Points, player2Points, winner);
    } else {
      // Si no hay onGameEnd pero estamos en un torneo
      if (this.match) {
        console.log(`Match ${this.match.id} terminado: ${player1Points}-${player2Points}`);
      } else {
          // Anunciar el ganador y redirigir al menú de elección de tipo de juego
        const message = document.createElement('div');
        message.textContent = `${winner} wins! Redirecting to the game selection menu...`;
        message.style.position = 'absolute';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.backgroundColor = 'white';
        message.style.padding = '20px';
        message.style.border = '1px solid black';
        document.body.appendChild(message);

        setTimeout(() => {
          window.location.href = '/index.html'; // Cambia esta URL a la del menú de elección de tipo de juego
        }, 3000); // Redirigir después de 3 segundos
        }
    }
  }

  update(timestamp) {
    this.ball.update();
    this.paddle1.update(this.keys, this.KEY_W, this.KEY_S, this.KEY_UP, this.KEY_DOWN);

    if (this.isSinglePlayer) {
      this.player2AI(timestamp);
      this.paddleUpdate(this.paddle2);
    } else {
      this.paddle2.update(this.keys, this.KEY_W, this.KEY_S, this.KEY_UP, this.KEY_DOWN);
    }

    // Colisiones
    this.ball.collisionWithEdges(this.canvas);
    this.ball.collisionWithPaddle(this.paddle1);
    this.ball.collisionWithPaddle(this.paddle2);
    this.paddle1.collisionWithEdges(this.canvas);
    this.paddle2.collisionWithEdges(this.canvas);
    
    // Lógica del juego
    this.increaseScore();
    this.updateScores();
    this.checkGameEnd();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ball.draw(this.ctx);
    this.paddle1.draw(this.ctx);
    this.paddle2.draw(this.ctx);
  }

  loop(timestamp) {
    this.update(timestamp);
    this.draw();
    if (!this.gameEnded) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  start() {
    // Si no se llamó explícitamente con start(), iniciar automáticamente
    this.animationFrameId = requestAnimationFrame(this.loop);
    return this; // Para encadenar métodos
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId);
    this.gameEnded = true;
    return this; // Para encadenar métodos
  }

  reset() {
    this.gameEnded = false;
    this.paddle1.score = 0;
    this.paddle2.score = 0;
    this.respawnBall();
    this.updateScores();
    return this; // Para encadenar métodos
  }
}