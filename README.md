# Deno Tetris

A simple Tetris game that runs in the web browser, built with Deno.

## Features

- Classic Tetris gameplay with 7 standard tetrominoes
- Score tracking and level progression
- Next piece preview
- Responsive controls

## Requirements

- [Deno](https://deno.land/) installed on your system

## Installation

1. Clone or download this repository
2. Navigate to the project directory

## How to Run

Start the server by running:

```bash
deno run --allow-net --allow-read main.ts
```

Then open your browser and go to:

```
http://localhost:8000
```

## How to Play

- **← →**: Move piece left or right
- **↓**: Move piece down (soft drop)
- **↑**: Rotate piece clockwise
- **Space**: Hard drop (instantly drops the piece)

## Game Rules

- Clear lines by filling them completely with blocks
- The game speeds up as you level up
- Score points based on the number of lines cleared at once
- Game ends when blocks reach the top of the screen

## License

MIT