### 📈 Overview
This PR introduces **Market-Mogul**, a fast-paced stock market simulation game. The player starts with $1,000 in virtual cash and must buy and sell shares of a highly volatile synthetic asset to maximize their net worth. 

Closes #0000

### ✨ Key Technical Features
* **Algorithmic Price Generation:** Uses a randomized walk algorithm with a dynamic "trend" bias. The price fluctuates every second, simulating real market volatility.
* **Live Canvas Charting:** The HTML5 Canvas API maps the historical price array to X/Y coordinates in real-time, scaling dynamically as the price reaches new highs or lows.
* **Event-Driven Economy:** A procedural news ticker at the bottom of the screen generates "Breaking News" events that actively manipulate the underlying mathematical trend (triggering Bull or Bear runs).

<img width="1639" height="907" alt="Image" src="https://github.com/user-attachments/assets/3e8230c6-4663-4451-a832-b6be7aa61ccb" />

<img width="1686" height="864" alt="Image" src="https://github.com/user-attachments/assets/09501bd0-5278-4311-a18a-0f9cfffb4e0d" />

<img width="1511" height="836" alt="Image" src="https://github.com/user-attachments/assets/3e29f7b2-2ac9-44e7-acea-651c111847f3" />

<img width="1421" height="800" alt="Image" src="https://github.com/user-attachments/assets/7a605628-2c34-412c-a103-eef878cddefa" />

### 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 
* **Logic & Rendering:** Vanilla JavaScript, Canvas API

### 🕹️ How to Test
1. Navigate to `/projects/Market-Mogul/index.html`.
2. Watch the live chart and the "Current Price" indicator.
3. Pay attention to the News Ticker at the bottom—if it announces a scandal, the price will likely crash!
4. Use the Buy and Sell buttons to trade your shares. Try to double your starting Net Worth!