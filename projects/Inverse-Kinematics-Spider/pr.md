## 📌 Description
This PR introduces **Inverse-Kinematics-Spider**, a procedural animation tech demo .

The project simulates a multi-legged robot that navigates the screen naturally. Unlike traditional animation (sprites sheets), the leg movements are calculated in real-time using **Inverse Kinematics (IK)**. The engine determines where each foot should be planted to support the body, and then solves the joint angles (Coxa, Femur, Tibia) required to reach that point.

**Key Features:**
* **IK Solver:** Implements a 2-bone Inverse Kinematics algorithm (using geometry/Law of Cosines) to calculate joint positions.
* **Procedural Gait:** Legs autonomously detect when they are over-extended and trigger a "Step" animation to a new optimal position.
* **Dynamic Body:** The body rotates and moves towards the target (Mouse or Auto-Wander), pulling the legs along with it.
* **Configurable:** Users can adjust leg count (4-12 legs) and step height via the UI.

Fixes: #2781

---

## 📸 Screenshots

<img width="1919" height="916" alt="Image" src="https://github.com/user-attachments/assets/6269a42b-52d8-44c4-9660-a5cbcd3ff00e" />

<img width="1919" height="943" alt="Image" src="https://github.com/user-attachments/assets/2f05546f-f0c9-4e9e-9362-983a983727d0" />

<img width="1919" height="958" alt="Image" src="https://github.com/user-attachments/assets/163dcc21-f679-4d68-a043-26783764ae44" />

---

## 🧪 How Has This Been Tested?
- [x] **Manual testing**
    - **Movement:** Verified that the spider follows the mouse smoothly.
    - **IK Logic:** Confirmed that legs bend correctly at the "knee" and feet stay pinned to the ground while the body moves.
    - **Gait:** Verified that legs do not all lift at once; they step sequentially when the body moves too far.
    - **UI Controls:** Tested changing Leg Count (updates instantly) and toggling Auto-Wander.
---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] My project is responsiv