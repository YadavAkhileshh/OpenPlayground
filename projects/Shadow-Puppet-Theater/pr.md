## 📌 Description
This PR introduces **Shadow-Puppet-Theater**, a dynamic lighting and storytelling engine .

The simulation utilizes 2D vector mathematics to project geometric shadows away from a light source in real-time. By moving the light closer to a puppet, the projection geometry naturally scales up, creating a cinematic and intimidating "monster shadow" effect on the backdrop. 

**Key Features:**
* **Dynamic Polygon Projection:** Calculates extrusion vectors for every vertex of a puppet away from the light source $L$, drawing hard-edged quadrilaterals that stretch to the edge of the screen .
* **Canvas Compositing Masks:** Employs an off-screen canvas with `globalCompositeOperation` toggles (`destination-out` and `source-over`). This safely layers ambient darkness, the radial light gradient, and the black shadow polygons together perfectly before drawing them onto the main scene to avoid overlapping alpha artifacts.
* **Interactive Sandbox:** Users can click and drag both the light source and the puppet silhouettes to freely direct their own cinematic scenes.

Fixes: #3197

---

## 📸 Screenshots

<img width="1916" height="972" alt="Image" src="https://github.com/user-attachments/assets/f0cb5d3c-b32a-468b-b325-5fcee3577b5a" />

<img width="1906" height="1027" alt="Image" src="https://github.com/user-attachments/assets/c87c441d-c512-4742-b7f7-e865036ab950" />

<img width="1919" height="957" alt="Image" src="https://github.com/user-attachments/assets/eac7e5ff-f689-497d-a4b6-c5fd435a29f2" />

---

## 🔧 Type of Change
- [x] ✨ New feature
- [ ] 🎨 UI / Styling change

---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] I will add my project to projects.json