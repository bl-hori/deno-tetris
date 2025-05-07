// Game constants
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const COLORS = [
  null,
  '#FF2D82', // I - Brighter pink
  '#2DCFFF', // J - Brighter blue
  '#2DFF82', // L - Brighter green
  '#F548FF', // O - Brighter purple
  '#FF9E2D', // S - Brighter orange
  '#FFE148', // T - Brighter yellow
  '#4887FF'  // Z - Brighter blue-purple
];

// Tetromino shapes
const PIECES = [
  null,
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
  [[2, 0, 0], [2, 2, 2], [0, 0, 0]],                         // J
  [[0, 0, 3], [3, 3, 3], [0, 0, 0]],                         // L
  [[0, 4, 4], [0, 4, 4], [0, 0, 0]],                         // O
  [[0, 5, 5], [5, 5, 0], [0, 0, 0]],                         // S
  [[0, 6, 0], [6, 6, 6], [0, 0, 0]],                         // T
  [[7, 7, 0], [0, 7, 7], [0, 0, 0]]                          // Z
];

// Game state
const gameState = {
  board: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
  score: 0,
  level: 1,
  piece: null,
  nextPiece: null,
  position: { x: 0, y: 0 },
  gameOver: false,
  dropCounter: 0,
  dropInterval: 1000, // milliseconds
  lastTime: 0
};

// Canvas setup
const canvas = document.getElementById('tetris-board');
const ctx = canvas.getContext('2d');
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

const nextPieceCanvas = document.getElementById('next-piece');
const nextPieceCtx = nextPieceCanvas.getContext('2d');
nextPieceCtx.scale(BLOCK_SIZE/2, BLOCK_SIZE/2);

// Create a new piece
function createPiece(type) {
  return {
    type,
    matrix: PIECES[type]
  };
}

// Create a random piece
function randomPiece() {
  const pieceTypes = [1, 2, 3, 4, 5, 6, 7];
  const type = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
  return createPiece(type);
}

// Draw a single square
function drawBlock(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
  ctx.strokeStyle = '#000';
  ctx.strokeRect(x, y, 1, 1);
  
  // Add inner highlight to make blocks more visible
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 0.9, y);
  ctx.lineTo(x + 0.9, y + 0.9);
  ctx.lineTo(x, y + 0.9);
  ctx.closePath();
  ctx.stroke();
}

// Draw the board
function drawBoard(ctx, board) {
  // Draw grid lines to make the board more visible
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 0.02;
  
  // Draw vertical grid lines
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ROWS);
    ctx.stroke();
  }
  
  // Draw horizontal grid lines
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(COLS, y);
    ctx.stroke();
  }
  
  // Draw blocks
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        drawBlock(ctx, x, y, COLORS[value]);
      }
    });
  });
}

// Draw the current piece
function drawPiece(ctx, piece, position) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        drawBlock(
          ctx, 
          x + position.x, 
          y + position.y, 
          COLORS[value]
        );
      }
    });
  });
}

// Draw the next piece preview
function drawNextPiece(ctx, piece) {
  ctx.clearRect(0, 0, 6, 6);
  
  // Draw background grid
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 0.02;
  for (let x = 0; x <= 4; x++) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0.5);
    ctx.lineTo(x + 0.5, 4.5);
    ctx.stroke();
  }
  for (let y = 0; y <= 4; y++) {
    ctx.beginPath();
    ctx.moveTo(0.5, y + 0.5);
    ctx.lineTo(4.5, y + 0.5);
    ctx.stroke();
  }
  
  // Center the piece in the preview
  const offsetX = piece.type === 1 ? 1 : 1.5;
  const offsetY = 1;
  
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        drawBlock(
          ctx, 
          x + offsetX, 
          y + offsetY, 
          COLORS[value]
        );
      }
    });
  });
}

// Clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width / BLOCK_SIZE, canvas.height / BLOCK_SIZE);
}

// Check collision
function collide(board, piece, position) {
  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix[y].length; x++) {
      if (piece.matrix[y][x] !== 0 &&
          (board[y + position.y] && 
           board[y + position.y][x + position.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

// Merge piece with the board
function merge(board, piece, position) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[y + position.y][x + position.x] = value;
      }
    });
  });
}

// Rotate the piece
function rotate(matrix, dir) {
  // Transpose the matrix
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  
  // Reverse each row to get a rotation
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

// Player movement
function playerMove(dir) {
  gameState.position.x += dir;
  if (collide(gameState.board, gameState.piece, gameState.position)) {
    gameState.position.x -= dir;
  }
}

function playerRotate(dir) {
  const pos = gameState.position.x;
  let offset = 1;
  
  rotate(gameState.piece.matrix, dir);
  
  // Handle wall kicks
  while (collide(gameState.board, gameState.piece, gameState.position)) {
    gameState.position.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    
    if (offset > gameState.piece.matrix[0].length) {
      rotate(gameState.piece.matrix, -dir);
      gameState.position.x = pos;
      return;
    }
  }
}

function playerDrop() {
  gameState.position.y++;
  
  if (collide(gameState.board, gameState.piece, gameState.position)) {
    gameState.position.y--;
    merge(gameState.board, gameState.piece, gameState.position);
    resetPiece();
    clearRows();
    updateScore();
  }
  
  gameState.dropCounter = 0;
}

function playerHardDrop() {
  while (!collide(gameState.board, gameState.piece, gameState.position)) {
    gameState.position.y++;
  }
  gameState.position.y--;
  merge(gameState.board, gameState.piece, gameState.position);
  resetPiece();
  clearRows();
  updateScore();
  gameState.dropCounter = 0;
}

// Reset piece
function resetPiece() {
  // Set current piece to next piece if it exists
  gameState.piece = gameState.nextPiece || randomPiece();
  // Generate new next piece
  gameState.nextPiece = randomPiece();
  // Draw the next piece preview
  drawNextPiece(nextPieceCtx, gameState.nextPiece);
  // Reset position
  gameState.position.y = 0;
  gameState.position.x = Math.floor(COLS / 2) - Math.floor(gameState.piece.matrix[0].length / 2);
  
  // Game over if collision happens immediately
  if (collide(gameState.board, gameState.piece, gameState.position)) {
    gameState.gameOver = true;
    alert(`Game Over! Your score: ${gameState.score}`);
    resetGame();
  }
}

// Clear completed rows
function clearRows() {
  let rowCount = 0;
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (gameState.board[y][x] === 0) {
        continue outer;
      }
    }
    
    // Remove the completed row
    const row = gameState.board.splice(y, 1)[0].fill(0);
    gameState.board.unshift(row);
    y++;
    rowCount++;
  }
  
  return rowCount;
}

// Update the score
function updateScore() {
  const rowsCleared = clearRows();
  if (rowsCleared > 0) {
    // Standard scoring system
    gameState.score += [40, 100, 300, 1200][rowsCleared - 1] * gameState.level;
    document.getElementById('score').textContent = gameState.score;
    
    // Level up after every 10 rows cleared
    if (Math.floor(gameState.score / 1000) > gameState.level - 1) {
      gameState.level = Math.floor(gameState.score / 1000) + 1;
      gameState.dropInterval = 1000 * Math.pow(0.8, gameState.level - 1);
      document.getElementById('level').textContent = gameState.level;
    }
  }
}

// Reset the game
function resetGame() {
  gameState.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
  gameState.score = 0;
  gameState.level = 1;
  gameState.gameOver = false;
  gameState.dropCounter = 0;
  gameState.dropInterval = 1000;
  
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('level').textContent = gameState.level;
  
  // Initialize pieces
  gameState.piece = randomPiece();
  gameState.nextPiece = randomPiece();
  gameState.position = {
    x: Math.floor(COLS / 2) - Math.floor(gameState.piece.matrix[0].length / 2),
    y: 0
  };
  
  // Draw next piece preview
  drawNextPiece(nextPieceCtx, gameState.nextPiece);
}

// Main game loop
function update(time = 0) {
  const deltaTime = time - gameState.lastTime;
  gameState.lastTime = time;
  
  gameState.dropCounter += deltaTime;
  if (gameState.dropCounter > gameState.dropInterval) {
    playerDrop();
  }
  
  if (!gameState.gameOver) {
    draw();
    requestAnimationFrame(update);
  }
}

// Draw the game
function draw() {
  clearCanvas();
  drawBoard(ctx, gameState.board);
  drawPiece(ctx, gameState.piece, gameState.position);
}

// Keyboard controls
document.addEventListener('keydown', event => {
  if (gameState.gameOver) return;
  
  switch (event.key) {
    case 'ArrowLeft':
      playerMove(-1);
      break;
    case 'ArrowRight':
      playerMove(1);
      break;
    case 'ArrowDown':
      playerDrop();
      break;
    case 'ArrowUp':
      playerRotate(1);
      break;
    case ' ':
      playerHardDrop();
      break;
  }
});

// Initialize game
resetGame();
update();