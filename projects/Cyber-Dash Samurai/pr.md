## 📌 Description
This PR introduces **Cyber-Dash Samurai**, a high-octane action game that combines time manipulation with precision aiming .

The core mechanic involves **Time Dilation**: holding the mouse button slows the game speed to 10%, allowing the player to carefully aim their dash. Releasing the button triggers an instant dash attack. The engine uses **Line Segment Intersection** math to detect if the dash path crosses any enemy hitboxes, "slicing" them instantly.

**Key Features:**
* **Time Dilation Engine:** A global `timeScale` variable smoothly transitions between 1.0 (real-time) and 0.1 (bullet time), affecting enemy movement and particle physics.
* **Slice Detection:** Uses a math helper (`lineCircleCollide`) to check collisions along the entire vector of the dash, not just at the destination.
* **Visual Polish:**
    * **Vignette:** A dark overlay fades in during slow-mo to focus focus on aiming.
    * **Particles:** Destroyed enemies shatter into physics-driven shards that fade out.
    * **Shake:** The screen shakes on successful hits to add impact.

Fixes: #3477

---

## 📸 Screenshots

<img width="1918" height="975" alt="Image" src="https://github.com/user-attachments/assets/68e6b7d2-891b-40b8-8a52-3bff85d63a2d" />

<img width="1919" height="936" alt="Image" src="https://github.com/user-attachments/assets/29aae371-f4b8-4ea8-bce1-61fd118bcb9a" />

<img width="1919" height="950" alt="Image" src="https://github.com/user-attachments/assets/1e3978b9-cf75-4b97-9ee3-4f4d85d3db06" />

---

## 🧪 How Has This Been Tested?
- [x] **Manual testing**
    - **Time Dilation:** Verified that holding the mouse visibly slows down enemy approach speed.
    - **Collision:** Confirmed that dashing *through* an enemy destroys it, even if the dash ends past them.
    - **Combo:** Verified hitting multiple enemies in one dash increments the combo counter.
    - **Game Over:** Confirmed that touching an enemy (without dashing) triggers the game over state.

---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] My project is responsive