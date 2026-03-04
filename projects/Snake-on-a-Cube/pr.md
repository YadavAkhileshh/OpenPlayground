## 📌 Description
This PR introduces **Snake-on-a-Cube**, a 3D logic puzzle game .

It takes the classic Snake mechanics and maps them onto the surface of a 3D cube. When the snake moves off the edge of one face, it seamlessly wraps to the adjacent face (e.g., moving "Right" from the Front face takes you to the Right face). The 3D engine handles the coordinate mapping and automatically rotates the cube so the active face is always viewable.

**Key Features:**
* **3D Projection Engine:** A custom Canvas-based 3D renderer that projects cube vertices and sorts faces by Z-depth (Painter's Algorithm).
* **Face Wrapping Logic:** Complex transition logic handles moving between orthogonal planes (Front $\to$ Right, Top $\to$ Back, etc.), adjusting the snake's local grid coordinates and direction vector.
* **Auto-Camera:** The cube rotates smoothly to track the snake's head, preventing the player from losing sight of their position.
* **Grid Mapping:** Interpolates 2D grid coordinates onto 3D face planes to draw snake segments and food with perspective.

Fixes: #2782

---

## 📸 Screenshots

<img width="1890" height="930" alt="Image" src="https://github.com/user-attachments/assets/0855e49f-dad6-44ce-904f-b704375dafe9" />

<img width="1919" height="948" alt="Image" src="https://github.com/user-attachments/assets/f0981575-392c-4e2c-8348-9c9d17f08f4c" />

<img width="1918" height="986" alt="Image" src="https://github.com/user-attachments/assets/3535f82a-3d57-4602-b444-90a383f249af" />

---

## 🧪 How Has This Been Tested?
- [x] **Manual testing**
    - **Movement:** Verified WASD controls move the snake on the current face.
    - **Transitions:** Tested crossing all 4 edges of the Front face to ensure correct wrapping to Top, Bottom, Left, and Right faces.
    - **Rotation:** Verified the camera rotates 90 degrees smoothly upon face transition.
    - **Collision:** Confirmed that running into own tail ends the game.
    - **Food:** Confirmed food spawns on random faces and increases score.

---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] My project is responsive