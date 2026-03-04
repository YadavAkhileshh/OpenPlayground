# 🎮 LagIsTheEnemy

**Lag is not a bug. Lag is the mechanic.**

A unique skill-based game where you master gameplay despite intentional, configurable input delay. Learn to predict, adapt, and conquer the delay.

---

## 🎯 Core Concept

In LagIsTheEnemy, every click you make is delayed by a configurable lag profile. Your task is to predict where targets will be when your delayed input finally executes. The better your prediction, the higher your score multiplier.

This isn't about reaction time—it's about **prediction mastery**.

---

## ✨ Features

### 🔧 Lag Profiles

Five distinct lag simulation types:

- **Constant Delay** - Fixed 200ms delay. Predictable but challenging.
- **Lag Spikes** - Random sudden delay increases (100ms → 500ms spikes)
- **Jitter** - Variable delay constantly fluctuating (50-300ms)
- **Packet Loss** - Random input drops (15% drop rate)
- **Progressive** - Lag increases over time (starts 50ms, +10ms increment)

### 🎮 Game Modes

- **Training Mode** - Learn to predict and compensate for lag
- **Adaptive Mode** - Lag dynamically adjusts to your skill level
- **Perfect Play** - Zero mistakes allowed, 20 targets
- **Endurance** - Survive as lag progressively increases
- **Custom Mode** - Configure your own lag nightmare

### 📊 Advanced Analytics

- **Real-time Performance Graphs** - Track score and accuracy over time
- **Lag Timeline Visualization** - See lag fluctuations as they happen
- **Prediction Scoring** - Measures how well you anticipate target movement
- **Session History** - Review your last 10 gaming sessions
- **Combo System** - Build streaks for score multipliers

### 🏆 Achievements

- **First Blood** - Hit your first target
- **Combo King** - Achieve a 10-hit combo
- **Predictor** - Maintain 90%+ prediction accuracy
- **Speed Demon** - Score 500+ under 500ms average lag
- **Lag Master** - Reach 1000+ total score

---

## 🚀 How to Play

1. **Select Game Mode** - Choose from Training, Adaptive, Perfect Play, Endurance, or Custom
2. **Choose Lag Profile** - Pick a lag type (or configure custom settings)
3. **Click START** - Game begins immediately
4. **Click Targets** - Click where you think targets will be when your delayed input executes
5. **Build Combos** - Hit consecutive targets to increase score multipliers
6. **Master Prediction** - The closer your prediction, the higher the bonus

### 🎓 Pro Tips

- **Lead Your Shots** - Click ahead of moving targets
- **Learn the Delay** - Each lag profile has patterns to master
- **Watch the Timeline** - The lag visualization helps you time your clicks
- **Predict Movement** - Targets move in predictable patterns
- **Build Combos** - Consistency is rewarded with massive multipliers

---

## 🎨 UI Overview

### Left Panel
- Game mode selection
- Lag profile selection
- Custom configuration sliders
- Real-time statistics
- Start/Reset controls

### Center Canvas
- Main game area (800x600)
- Moving targets with lifetime indicators
- Ghost click feedback (immediate visual)
- Delayed input queue visualization
- Performance metrics overlay

### Right Panel
- Performance graph (score + accuracy)
- Lag timeline graph
- Session history (last 10 games)
- Achievement tracker

---

## 📈 Scoring System

### Base Points
- Target Hit: **100 points**
- Combo Multiplier: **+10% per combo level**
- Prediction Bonus: **Up to +100% based on accuracy**

### Example Calculation
```
Base: 100 points
Combo Level 5: +50% (150 points)
Prediction 80%: +80% (270 points)
Final Score: 270 points
```

### Prediction Scoring
Your prediction accuracy is measured by how close the target is to where you predicted it would be when your delayed input executes. Perfect prediction = 100% bonus.

---

## 🔬 Technical Details

### Lag Simulation Engine
- **Input Queue System** - All clicks are queued with calculated delay
- **Profile-based Calculation** - Different algorithms per lag type
- **Visual Feedback** - Ghost clicks show immediate position vs delayed execution
- **Packet Loss Simulation** - Inputs can be randomly dropped

### Adaptive Difficulty
- Monitors rolling 10-action accuracy window
- Adjusts lag ±20ms based on performance
- Target accuracy: 70%
- Keeps gameplay challenging but fair

### Performance Tracking
- Real-time graphing using Canvas API
- Historical data stored in localStorage
- Session statistics preserved across page loads
- Up to 10 previous sessions retained

---

## 🛠️ L3 Expansion Roadmap

### Planned Features (1000+ lines expansion)

#### Additional Lag Profiles
- **Rubber-banding** - Delay oscillates between extremes
- **Network Congestion** - Realistic internet lag simulation
- **Geographic Latency** - Simulate different server distances
- **Wireless Interference** - Random burst patterns

#### Enhanced Game Modes
- **Boss Rush** - Special targets requiring multiple hits
- **Time Trial** - Race against the clock
- **Multiplayer Prediction** - Compete for best prediction scores
- **Daily Challenges** - New lag combinations every day

#### Advanced Analytics
- **Heatmap Visualization** - See where you click most
- **Accuracy Zones** - Performance by screen region
- **Learning Curve Graphs** - Track improvement over time
- **Export to CSV/JSON** - Download your data

#### Customization
- **Theme System** - Different visual styles
- **Sound Effects** - Audio feedback for hits/misses
- **Target Skins** - Unlockable visual variations
- **Background Music** - Dynamic soundtrack

#### Social Features
- **Leaderboards** - Global and friend rankings
- **Replay System** - Watch your best (or worst) runs
- **Share Scores** - Social media integration
- **Challenge Friends** - Send custom lag profiles

---

## 🎯 Why This Game is Unique

### Zero Competition
- **No reaction-time games** simulate lag as core mechanic
- **No prediction trainers** use dynamic lag profiles
- **No skill games** combine lag + prediction scoring
- **No puzzle games** feature adaptive lag difficulty

### Expandability
- Modular lag profile system
- Plugin architecture for new game modes
- Extensible analytics framework
- Easy to add new features without breaking existing code

### Educational Value
- Teaches predictive thinking
- Demonstrates network concepts
- Shows lag impact on gameplay
- Improves spatial reasoning

---

## 💾 Technologies

- **HTML5 Canvas** - Game rendering and graphics
- **CSS3** - Modern UI with animations
- **Vanilla JavaScript** - Zero dependencies
- **localStorage** - Session persistence
- **Canvas API** - Real-time graphing

---

## 🎮 Controls

- **Mouse Click** - Fire delayed input
- **Mode Buttons** - Switch game modes
- **Lag Buttons** - Change lag profiles
- **Sliders** - Adjust custom settings
- **START** - Begin game
- **RESET** - Return to menu
- **PLAY AGAIN** - Quick restart

---

## 📊 Statistics Tracked

- **Score** - Total points earned
- **Accuracy** - Hit percentage
- **Prediction Score** - Cumulative prediction bonus
- **Current Lag** - Real-time delay value
- **Average Lag** - Session average
- **Combo** - Current streak
- **Best Combo** - Highest streak achieved
- **Wave** - Current difficulty level
- **Time** - Session duration

---

## 🏗️ Project Structure

```
LagIsTheEnemy/
├── index.html          # Main game interface
├── script.js           # Game engine & logic
├── style.css           # UI styling & animations
├── project.json        # Metadata & configuration
└── README.md           # This file
```

---

## 🎨 Design Philosophy

### Visual Feedback
Every action has immediate visual feedback (ghost clicks) AND delayed execution visualization (input queue rings). This helps players understand the delay without getting frustrated.

### Progressive Learning
Training mode provides gentle introduction. Adaptive mode grows with your skill. Perfect Play and Endurance test mastery.

### Data-Driven
All performance metrics are tracked, graphed, and stored. Players can see their improvement over time and identify weak areas.

### Fair Challenge
Adaptive difficulty ensures the game is always challenging but never impossible. The target 70% accuracy keeps players in the "flow state."

---

## 🚀 Getting Started

1. Open `index.html` in a modern web browser
2. Select a game mode
3. Choose a lag profile
4. Click START
5. Master the delay!

No installation, no dependencies, no backend required.

---

## 🎯 Target Audience

- **Gamers** who want unique skill challenges
- **Esports players** training prediction skills
- **Developers** learning about lag simulation
- **Students** studying network latency concepts
- **Anyone** who enjoys mastering difficult mechanics

---

## 📝 License

© 2026 LagIsTheEnemy - Educational/Portfolio Project

---

## 🤝 Credits

**Developer:** Vijay  
**Version:** 1.0.0  
**Created:** January 31, 2026  

---

## 🎉 Final Thoughts

Lag is usually the enemy of gameplay. In this game, it **IS** the gameplay.

Master the delay. Become the prediction king. 🎮

**Remember:** Your input is delayed, but your mind doesn't have to be. Think ahead. Predict. Conquer.

---

### Ready to prove lag isn't your enemy?

**Open `index.html` and start playing!**
