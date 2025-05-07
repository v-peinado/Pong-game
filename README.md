# Transcendence Pong

Pong game featuring a human-like AI opponent that simulates natural player behavior, including realistic errors and adaptive difficulty, developed for the 42 School Transcendence project.

## Why Use a Local Server?

This project requires a local web server to run properly because browsers block direct JavaScript module imports when using the `file://` protocol due to CORS (Cross-Origin Resource Sharing) security restrictions. Without a server, you'll see errors like:

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at file:///path/to/your/Game.js. (Reason: CORS request not http).
```

## Setting Up a Local Server

The easiest way to run this project is to use Python's built-in HTTP server:

### Python 3:

1. Open a terminal and navigate to the project directory:
   ```
   cd path/to/your/project
   ```

2. Start the server:
   ```
   python -m http.server 8000
   ```

3. Open your browser and go to:
   ```
   http://localhost:8000
   ```

## Game Controls

### 1-Player vs AI:
- W key: Move paddle up
- S key: Move paddle down

### 2-Player Mode:
- Player 1: W (up) and S (down) keys
- Player 2: Up and Down arrow keys

Enjoy the game!