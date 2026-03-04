# ⌨️ Echo-Type – Delayed Keyboard Survival Game

## 🎮 Game Concept

**Think 3 seconds ahead or die.**

Echo-Type is a unique survival game where every keystroke you make executes **3 seconds later**. You must plan your moves in advance, predicting where enemies will be and where you need to go before danger arrives.

## 🕹️ How to Play

### Controls
- **W** - Queue move UP (executes 3s later)
- **A** - Queue move LEFT (executes 3s later)
- **S** - Queue move DOWN (executes 3s later)
- **D** - Queue move RIGHT (executes 3s later)
- **SHIFT + WASD** - Sprint (move 2 spaces instead of 1)
- **Z** - Undo last queued command (requires undo tokens)
- **SPACE** - Pause/Resume game
- **C** - Clear entire command queue

### Objective
- Survive waves of enemies
- Collect power-ups to gain advantages
- Build combos by staying alive
- Red enemies hunt you at normal speed
- Orange enemies are FAST and worth more points
- Purple enemies are TANKS - slower but tougher
- Every 5 waves triggers a BOSS WAVE with fluctuating delays
- Score increases over time and with combo multiplier
Normal enemies (10 pts)
- **Orange Squares** - Fast enemies (20 pts)
- **Purple Squares** - Tank enemies (30 pts, slower but bigger)
- **Gray Blocks** - Obstacles for strategic cover
- **Pulsing Circles** - Power-ups:
  - 🚀 **Speed Boost** - Reduces echo delay by 50% for 8s
  - 🛡️ **Shield** - Absorb one enemy hit for 10s
  - ⏮️ **Undo Token** - Get 3 undo charges
- **Dashed Square** - Your next queued position
- **Command Queue** - Shows your upcoming moves with countdown timers
- **YUse Sprint Wisely** - Hold SHIFT to move 2 spaces but plan carefully
3. **Save Undo Tokens** - Use them when you make a critical mistake
4. **Watch the Queue** - Monitor your command queue carefully
5. **Predict Enemy Movement** - Enemies move toward you predictably
6. **Use Obstacles** - Plan routes around obstacles to block enemies
7. **Power-Up Priority** - Shield > Speed > Undo depending on situation
8. **Combo Multiplier** - Stay alive 3+ seconds to build combo (up to 5x)
9. **Boss Wave Prep** - Save power-ups for boss waves when delay fluctuates
10. **Clear When Needed** - Press C to clear bad command sequences
11. **Enemy Types Matter** - Fast enemies (orange) move more often, tanks (purple) are slower
12
## 🎯 Strategy Tips

1. **Think Ahead** - Always plan at least 2-3 moves in advance
2. *Wave-based difficulty progression
- ✅ **NEW: Sprint system** (hold SHIFT for 2-space moves)
- ✅ **NEW: Undo buffer** with token system

### Enemy Variety
- ✅ **Normal Enemies** - Standard speed hunters
- ✅ **Fast Enemies** - Move more frequently
- ✅ **Tank Enemies** - Slower but larger

### Power-Up System
- ✅ **Speed Boost** - Reduces echo delay by 50%
- ✅ **Shield** - Absorbs one enemy hit
- ✅ **Undo Tokens** - Cancel queued commands
- ✅ Power-ups spawn every 10 seconds
- ✅ Active power display with timers

### Advanced Features
- ✅ **Boss Waves** - Every 5 waves with fluctuating delays (1-5s)
- ✅ **Combo System** - Build up to 5x score multiplier
- ✅ **Particle Effects** - Visual feedback for all actions
- ✅ **Obstacles** - Strategic coveditional advanced features:

- **Difficulty Modes** - Easy/Normal/Hard/Insane presets
- **More Power-ups** - Teleport, time slow, enemy freeze
- **Reverse Echo Mode** - Commands execute in reverse order
- **Echo Compression** - Combine multiple moves into one
- **Multiple Levels** - Different grid sizes and themes
- **Sound Effects** - Audio feedback for movements and collisions
- **Leaderboard** - Local or online high scores
- **Custom Delay Settings** - Player-adjustable echo delay
- **Boss Enemies** - Special enemies with unique behaviors
- **Achievements** - Unlock rewards and challenge
- Executing command highlighting
- Active power-ups display
- Combo multiplier indicator
### Core Mechanics
- ✅ 3-second echo delay on all inputs
- ✅ Grid-based movement system
- ✅ Smart enemy AI that hunts the player
- ✅ Visual command queue with countdown timers
- ✅ Future position preview
- ✅ Progressive difficulty (enemies spawn over time)

### UI Features
- Real-time score tracking
- Level progression system
- Enemy counter
- Visual command timeline
- Executing command highlighting
- Pause functionality

## 🎨 Future Enhancements

The game is designed to support advanced features:

- **Speed Modifiers** - Power-ups that reduce echo delay
- **Undo Buffer** - Ability to cancel recent commands
- **R5 points per tick** (×combo multiplier)
- **+100 bonus** per wave completion (×wave number)
- **+50 points** per power-up collected
- **+10/20/30 points** per enemy defeated (varies by type, ×combo)
- **Combo System:**
  - Builds when you survive (up to 5x multiplier)
  - Decays if you don't move for 3 seconds
  - Resets on deathid sizes and themes
- **Sound Effects** - Audio feedback for movements and collisions

## 🛠️ Technical Details

### Technologies
- Pure HTML5 Canvas for rendering
- Vanilla JavaScript (no frameworks)
- CSS3 animations and gradients
- Responsive design

### Game Loop
- 60 FPS animation loop
- Command queue processing system
- Timestamp-based delay execution
- Efficient collision detection

## 📁 File Structure

```
Echo-Type/
├── index.html      # Game structure
├── style.css       # Styling and animations
├── script.js       # Game logic
├── README.md       # Documentation
└── project.json    # Project metadata
```

## 🎯 Scoring System

- **+10 points** every time enemies move
- Survive longer = higher scores
- Level increases every 100 points
- More enemies spawn as you progress

## 🏆 Challenge Modes (Ideas)

- **Speed Run** - Survive 1 minute with 1s delay
- **Marathon** - Survive as long as possible
- **Chaos** - Random delay between 1-5 seconds
- **Precision** - One mistake = game over

## 📝 License

Feel free to modify, share, and build upon this game!

---

**Created with 💀 by the delayed keyboard gods**

*Remember: In Echo-Type, your past self controls your future. Choose wisely.*
