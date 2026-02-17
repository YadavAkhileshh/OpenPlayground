## 📌 Description
This PR introduces **Ragdoll-Ninja-Parkour**, a physics-based challenge game inspired by QWOP .

The game utilizes a **Verlet Integration** engine to simulate a ragdoll character made of points and rigid constraints. Unlike typical platformers, the player does not have direct control over movement. Instead, they control the contraction of specific muscle groups (Thighs and Calves) using `Q`, `W`, `O`, and `P`. The goal is to coordinate these contractions to maintain balance and propel the character forward without hitting their head on the ground.

**Key Features:**
* **Active Ragdoll Physics:** Simulates muscles by dynamically changing the resting length of constraints when keys are pressed.
* **Verlet Integration:** Uses position-based dynamics for stable and fast soft-body simulation.
* **Procedural Animation:** There are no pre-made animations; all movement is the result of physics interactions.
* **Camera Tracking:** The view automatically follows the player's torso as they stumble forward.

Fixes: #2780

---

## 📸 Screenshots

<img width="1919" height="956" alt="Image" src="https://github.com/user-attachments/assets/be45a615-2edb-4eed-8e44-7ca52319f739" />

<img width="1919" height="949" alt="Image" src="https://github.com/user-attachments/assets/a97d0c0f-9771-44f3-9efc-ce0cd3a97180" />

<img width="1919" height="947" alt="Image" src="https://github.com/user-attachments/assets/cfb8612b-0b4c-48f4-8aae-daddc2eae8d0" />

---

## 🧪 How Has This Been Tested?
- [x] **Manual testing**
    - **Controls:** Verified that pressing Q/W/O/P visually shortens the corresponding leg segments (Thighs/Calves).
    - **Physics:** Confirmed that the ragdoll falls under gravity and collides with the floor.
    - **Win/Loss:** Verified that touching the head to the ground triggers the "Knockout" screen.
    - **Movement:** Managed to move forward 10m by alternating leg contractions (difficult but possible).

---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] My project is responsive