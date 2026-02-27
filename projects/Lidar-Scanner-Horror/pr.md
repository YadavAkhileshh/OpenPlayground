## 📌 Description
This PR introduces **Lidar-Scanner-Horror**, an atmospheric exploration visualizer .

The user is placed in a pitch-black maze. The only way to see is by using a **LIDAR Scanner** (Left Click). The engine casts hundreds of rays into the scene, calculating the distance to walls using a custom **Raymarching Algorithm**. Instead of rendering solid walls, it renders "Point Clouds"—red dots that appear at impact points and fade slowly over time.

**Key Features:**
* **Raycasting Engine:** Casts 300 rays within a 60-degree Field of View to detect walls and entities.
* **Point Cloud Rendering:** Simulates 3D depth by mapping ray distance to vertical point spread (perspective projection).
* **Atmospheric Fading:** Points persist and fade opacity, allowing players to "paint" the darkness with light.
* **Dynamic Entity:** A "Ghost" entity moves silently through the map; it is invisible in the dark and only appears as white dots when scanned.

Fixes: #2779

---

## 📸 Screenshots

<img width="1919" height="1027" alt="Image" src="https://github.com/user-attachments/assets/ea3fc979-0e40-42e4-b35c-f60902237cbf" />

<img width="1919" height="1006" alt="Image" src="https://github.com/user-attachments/assets/1085c829-25a4-44db-98fe-7c52edf352d3" />

<img width="1917" height="982" alt="Image" src="https://github.com/user-attachments/assets/bb53ea9a-6743-421d-99d6-cdd633f11987" />

---

## 🧪 How Has This Been Tested?
- [x] **Manual testing**
    - **Visuals:** Verified that clicking generates a burst of red dots that form the shape of 3D walls.
    - **Movement:** Confirmed WASD controls move the camera through the grid map correctly (collision detection).
    - **Raycasting:** Verified that dots appear larger/sparser when close and smaller/denser when far away.
    - **Ghost:** Confirmed that the ghost entity renders as white dots when hit by a ray.

---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] My project is responsive