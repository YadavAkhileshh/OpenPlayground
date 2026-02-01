# 🎮 Snake World - Visual Guide & Controls

## 🎯 Game Screen Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    🐍 SNAKE WORLD 🐍                        │
│         Total Coins: 0  |  Snakes Alive: 4  |  Time: 0s    │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐  ┌─────────────────────┐
│                                  │  │  GAME INFO          │
│          GAME CANVAS             │  │  ─────────────────  │
│       (900x600 pixels)           │  │  📍 Speed: Slow     │
│                                  │  │  ⏰ Obstacles: Slow │
│  🔵 (Your Snake - Blue)          │  │  🎮 Controls: Keys  │
│  🔴 (Enemy Snakes - Red)         │  │  🍎 Food: Grow      │
│  🟢 (Food - Green)               │  │  💰 Coins: Points   │
│  🟡 (Coins - Yellow)             │  │  🟫 Rocks: Avoid    │
│  🟫 (Rocks - Brown)              │  │  ⚫ Holes: Avoid     │
│  ⚫ (Holes - Black)              │  │                      │
│                                  │  │  [START] [PAUSE]    │
│                                  │  │  [RESET]            │
└──────────────────────────────────┘  └─────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Legend: 🔵 Your Snake  🔴 Enemy  🟢 Food  🟡 Coin  🟫 Rock  ⚫ Hole │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ⬅️  Arrow Keys Control Your Snake  🎮  Survive & Collect!  │
└──────────────────────────────────────────────────────────────┘
```

## ⌨️ Controls - Arrow Keys

```
        ⬆️  UP
        │
◀️ LEFT ┼ RIGHT ▶️
        │
        ⬇️ DOWN
```

| Key | Action | Symbol |
|-----|--------|--------|
| **⬆️ UP ARROW** | Move snake UP | `↑` |
| **⬇️ DOWN ARROW** | Move snake DOWN | `↓` |
| **◀️ LEFT ARROW** | Move snake LEFT | `←` |
| **▶️ RIGHT ARROW** | Move snake RIGHT | `→` |

## 🎮 Button Controls

| Button | Function |
|--------|----------|
| **START GAME** | Begin a new game |
| **PAUSE** | Pause/Resume gameplay |
| **RESET** | Clear board and start fresh |

## 🎯 Game Elements & Their Meanings

### Your Snake 🔵
```
┌─┬─┐
│ │ │  Head with eyes
├─┼─┤
│ │ │  Body segment
├─┼─┤
│ │ │  Body segment
└─┴─┘
```
- **Blue** snake you control
- **Eyes** show direction
- Grows when eating food
- Dies on obstacles, boundaries, or other snakes

### Food 🟢
```
   ●
```
- Small green circle
- Eat to grow your snake by 1 segment
- No points, just growth
- Keep respawning

### Coins 💰
```
  ◎
```
- Yellow circle with outline
- Each coin = +1 point
- Dropped by dead snakes
- Collect for high score!

### Rocks 🟫
```
┌───┐
│███│
└───┘
```
- Brown square with border
- **INSTANT DEATH** on touch
- Spawn gradually during game
- Strategic hazards

### Holes ⚫
```
   ○
```
- Black circle
- **INSTANT DEATH** on touch
- Appear slowly during gameplay
- Be very careful!

### Enemy Snakes 🔴
```
🔴 Red snakes = AI or other players
- Move on their own
- Eat food like you do
- Can block your path
- When they die, they drop coins!
```

## 🔄 Game Flow

### Start Screen
```
[Click "START GAME"]
         ↓
```

### Initial Board (First 3 Seconds)
```
┌─────────────────────────────────────┐
│                                     │
│    🔵 (You)      🔴 (Enemies)      │
│                                     │
│   🟢 🟢 🟢      2 Rocks 🟫 🟫      │
│   💰 💰 💰      1 Hole ⚫           │
│                                     │
│   Plenty of open space!             │
│                                     │
└─────────────────────────────────────┘
```

### Middle of Game (~30 Seconds)
```
┌─────────────────────────────────────┐
│                                     │
│   🔴 ← Getting longer!              │
│   🟫 More rocks appearing           │
│ 🔵  ⚫ Holes spawning               │
│ ✓ Eat, avoid, collect coins!       │
│                                     │
│   Growing challenge!                │
│                                     │
└─────────────────────────────────────┘
```

### Late Game (60+ Seconds)
```
┌─────────────────────────────────────┐
│                                     │
│   🔴🔴🔴 Longer snakes              │
│   🟫🟫🟫 More obstacles              │
│   ⚫⚫⚫ Many hazards                 │
│ 🔵   Challenging!                   │
│   💰 Coins everywhere (dead snakes) │
│                                     │
│   Stay focused, avoid everything!   │
│                                     │
└─────────────────────────────────────┘
```

### Game Over
```
╔═════════════════════════════════════╗
║          💀 GAME OVER 💀            ║
║                                     ║
║   Your snake has been eliminated!   ║
║                                     ║
║   📊 FINAL STATS:                   ║
║   Total Coins: [X]                  ║
║   Food Eaten: [X]                   ║
║   Survival Time: [X]s               ║
║   Snakes Still Alive: [X]           ║
║                                     ║
║          [PLAY AGAIN]               ║
╚═════════════════════════════════════╝
```

## 📈 Game Difficulty Progression

```
TIME    DIFFICULTY    OBSTACLES    THREAT LEVEL
────────────────────────────────────────────────
 0s        🟢 Easy         3         ⭐ Low
10s        🟢 Easy         5         ⭐ Low
20s        🟡 Normal       8         ⭐⭐ Medium
30s        🟡 Normal      12         ⭐⭐ Medium
60s        🔴 Hard        20         ⭐⭐⭐ High
120s       🔴 Hard        25         ⭐⭐⭐ High
```

## 🎯 What to Do Each Second

```
[Game Start]
↓
[First 5s]  - Learn controls, get comfortable
↓
[5-20s]     - Start collecting food and coins
↓
[20-40s]    - Adapt to more obstacles
↓
[40+s]      - Navigation expert mode!
↓
[Until Dead]- Survive as long as possible
```

## 💡 Quick Reference Card

```
┌────────────────────────────────────┐
│   SNAKE WORLD QUICK REFERENCE      │
├────────────────────────────────────┤
│ CONTROLS:                          │
│   ⬆️ UP    | ⬇️ DOWN                │
│   ◀️ LEFT  | ▶️ RIGHT               │
│                                    │
│ OBJECTS:                           │
│   🟢 Eat = Grow                    │
│   💰 Collect = Points              │
│   🟫 Avoid = Death                 │
│   ⚫ Avoid = Death                  │
│   🔴 Avoid = Death                 │
│   🔲 Avoid = Death (boundary)      │
│                                    │
│ GOAL:                              │
│   Last as long as possible!        │
│   Collect coins!                   │
│   Become the champion!             │
│                                    │
│ SPEED: 🐢 Slow (Easy to control)  │
│ MODE: Single Player (vs AI)        │
└────────────────────────────────────┘
```

## 🏆 Difficulty Levels at a Glance

```
Easy   🟢 ░░░░░░░░░░ 10% Obstacles
            └─ Perfect for learning!

Normal 🟡 ░░░░░░░░░░ 50% Obstacles
            └─ Good challenge

Hard   🔴 ██████░░░░ 80% Obstacles
            └─ Master level!
```

## 📍 Minimap Explanation

The game board is divided into 45x30 grid squares:
- Each square is 20 pixels
- Total canvas: 900x600 pixels
- Snakes move 1 square per tick

```
┌────────────────────────────────────┐
│  Perimeter (DEATH if you touch)    │  ← Boundaries
│  ┌──────────────────────────────┐  │
│  │   Safe area (45 x 30 grid)   │  │
│  │   Move and maneuver here!    │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│  Perimeter (DEATH if you touch)    │  ← Boundaries
└────────────────────────────────────┘
```

## ⚡ Game Speed Explained

```
GAME_SPEED = 6 means:

Display Frame:  1  2  3  4  5  6 │ 1  2  3  4  5  6
                                  ↓
Snake Movement: ✓  ✓  ✓  ✓  ✓  ✓ │ ✓  ✓  ✓  ✓  ✓  ✓
                └─────────────────┘  └─────────────────┘
                 1 snake movement    1 snake movement
                 every 6 frames      every 6 frames

Result: Slower, more controllable gameplay! 🐢
```

---

**Now you understand the entire game! Time to play! 🐍✨**
