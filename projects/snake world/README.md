# 🐍 Snake World - Multiplayer Game

A thrilling multiplayer snake game where you control your snake, eat food and coins, and compete with other players or AI snakes!

## Features

### 🎮 Gameplay Mechanics
- **Slower Game Speed** - The game runs at a comfortable pace (6 ticks) so you have time to react and control your snake
- **Arrow Key Control** - Use `↑ ↓ ← →` arrow keys to move your snake
- **Gradual Obstacle Spawning** - Rocks and holes appear slowly during gameplay, giving you time to adapt
- **Multiplayer Support** - Each snake can be controlled by a different player
- **Food & Coins** - Eat green food to grow your snake, collect yellow coins for points
- **Obstacles** - Avoid brown rocks and black holes or your snake dies!
- **Boundaries** - Don't hit the edges of the game board
- **Snake Collision** - Avoid other snakes or collide with them to die
- **Coin Rewards** - When a snake dies, it drops coins you can collect

### 📊 Game Stats
- Track total coins collected
- Monitor alive snakes count
- View survival time

## Installation & Setup

### Single Player Mode (Recommended for Testing)
Simply open `index.html` in your web browser to play the single-player version with AI snakes.

### Multiplayer Mode (Using Node.js Server)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Connect Players**
   - Open http://localhost:3000 in multiple browser windows/tabs
   - Each player can enter their name
   - Press "Start Game" to begin
   - Each player controls one snake with arrow keys

## How to Play

### Controls
- **↑ UP ARROW** - Move snake up
- **↓ DOWN ARROW** - Move snake down
- **← LEFT ARROW** - Move snake left
- **→ RIGHT ARROW** - Move snake right

### Objectives
1. **Survive** - Don't hit boundaries, obstacles, or other snakes
2. **Grow** - Eat green food to increase your snake's length
3. **Collect** - Gather yellow coins for points
4. **Compete** - Compete with other players to have the highest score

### What to Avoid
- 🟫 **Brown Rocks** - Instant death on collision
- ⚫ **Black Holes** - Instant death on collision
- 🐍 **Other Snakes** - Don't collide with other snakes' bodies
- 🔲 **Boundaries** - Stay inside the game board

## Game Features

### Slow, Controllable Gameplay
The game speed is set to a comfortable pace (6 ticks) so you have plenty of time to react and control your snake's movement. This makes the game more strategic and less frantic.

### Gradual Obstacle Progression
Instead of placing all obstacles at once, they spawn gradually during gameplay. This gives new players time to get familiar with the controls before the board becomes crowded with hazards.

### Multiple Game Modes
- **Single Player**: Play against 3 AI snakes
- **Multiplayer**: Play with other people on the same server

### Your Personal Snake
- You always control a specific snake (blue in single-player mode)
- Each multiplayer player gets their own unique colored snake
- Game ends when YOUR snake dies (not when all snakes die)

## File Structure

```
snake-world/
├── index.html          # Main game interface
├── style.css           # Styling and responsive design
├── script.js           # Client-side game logic (single-player)
├── server.js           # Node.js server (multiplayer)
├── package.json        # NPM dependencies and scripts
└── README.md           # This file
```

## Technical Details

### Single Player
- Pure HTML5 Canvas and JavaScript
- AI-controlled snakes with intelligent pathfinding
- Runs entirely in the browser

### Multiplayer
- Express.js server
- Socket.io for real-time player communication
- Game state synchronized across all clients
- Independent movement for each player

## Tips for Success

1. **Plan Ahead** - Obstacles spawn slowly, use this time to plan safe routes
2. **Eat Strategically** - Growing longer helps you collect more coins but limits mobility
3. **Watch Others** - Learn from how other snakes navigate the board
4. **Stay Safe** - Avoid edges and obstacles early on
5. **Collect Coins** - When another snake dies, rush to collect their dropped coins!

## Game Rules

1. Your snake continuously moves in the direction you've set
2. Eating food makes your snake grow by 1 segment
3. Eating coins increases your score
4. Your snake dies if it hits:
   - Game board boundary
   - A rock
   - A hole
   - Another snake's body
5. When your snake dies, the game ends
6. Coins dropped by dead snakes can be collected by living snakes

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Any modern browser supporting HTML5 Canvas and WebSockets

## Performance

- Optimal frame rate: 60 FPS
- Game updates every 6 frames (creates slower, more controllable gameplay)
- Smooth animations and responsive controls

## Future Enhancements

- Power-ups (speed boost, shield, etc.)
- Leaderboard system
- Custom game modes
- Obstacles with different properties
- Sound effects and music
- Mobile touch controls

## License

MIT License - Feel free to modify and distribute!

## Support

For issues or suggestions, please refer to the OpenPlayground repository.

---

**Ready to become the Snake Master? 🐍 Start playing now!**
