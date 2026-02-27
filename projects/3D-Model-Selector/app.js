const backgrounds = [
  {
    id: "none",
    name: "None",
    details: "Transparent background",
    type: "background"
  },
  {
    id: "void",
    name: "Dark Void",
    details: "Deep space with stars",
    type: "background"
  },
  {
    id: "grid",
    name: "Grid Floor",
    details: "Reflective grid plane",
    type: "background"
  },
  {
    id: "gradient",
    name: "Gradient Sky",
    details: "Atmospheric color blend",
    type: "background"
  },
  {
    id: "radial",
    name: "Radial Glow",
    details: "Soft radial gradient",
    type: "background"
  }
];
const environments = [
  {
    id: "studio",
    name: "Studio",
    details: "Neutral balanced lighting",
    type: "environment",
    ambient: { light: 0.4, dark: 0.5 },
    key: { light: 1.0, dark: 1.2, position: [2, 2, 2] },
    fill: { light: 0.3, dark: 0.6, position: [-2, -1, -2] },
    rim: { light: 0.3, dark: 0.5, position: [0, 3, -3] },
    bgColor: { light: 0xf4eeeb, dark: 0x653449 }
  },
  {
    id: "sunset",
    name: "Sunset",
    details: "Warm orange glow",
    type: "environment",
    ambient: { light: 0.3, dark: 0.4 },
    key: { light: 1.2, dark: 1.5, position: [3, 1, 2], color: 0xff9a56 },
    fill: { light: 0.4, dark: 0.7, position: [-2, 0, -1], color: 0xff6b35 },
    rim: { light: 0.5, dark: 0.8, position: [-1, 2, -3], color: 0xffd700 },
    bgColor: { light: 0xffeaa7, dark: 0x4a2c2a }
  },
  {
    id: "night",
    name: "Night Sky",
    details: "Cool blue moonlight",
    type: "environment",
    ambient: { light: 0.2, dark: 0.3 },
    key: { light: 0.8, dark: 1.0, position: [2, 3, 1], color: 0x6eb5ff },
    fill: { light: 0.2, dark: 0.4, position: [-1, -1, -2], color: 0x4a90e2 },
    rim: { light: 0.3, dark: 0.5, position: [0, 4, -2], color: 0x9ec8ff },
    bgColor: { light: 0xdfe6e9, dark: 0x2d3436 }
  },
  {
    id: "forest",
    name: "Forest",
    details: "Natural green ambiance",
    type: "environment",
    ambient: { light: 0.5, dark: 0.6 },
    key: { light: 0.9, dark: 1.1, position: [1, 3, 2], color: 0xa8e6a1 },
    fill: { light: 0.4, dark: 0.6, position: [-2, 0, -1], color: 0x6ab04c },
    rim: { light: 0.3, dark: 0.4, position: [2, 2, -2], color: 0xbadc58 },
    bgColor: { light: 0xe8f5e9, dark: 0x2d4a2b }
  },
  {
    id: "urban",
    name: "Urban",
    details: "Cool concrete tones",
    type: "environment",
    ambient: { light: 0.3, dark: 0.4 },
    key: { light: 1.0, dark: 1.3, position: [3, 2, 1], color: 0xb8bfc6 },
    fill: { light: 0.3, dark: 0.5, position: [-2, -1, -1], color: 0x7f8c8d },
    rim: { light: 0.4, dark: 0.6, position: [0, 3, -3], color: 0xdfe6e9 },
    bgColor: { light: 0xecf0f1, dark: 0x34495e }
  },
  {
    id: "dramatic",
    name: "Dramatic",
    details: "High contrast spotlight",
    type: "environment",
    ambient: { light: 0.1, dark: 0.2 },
    key: { light: 1.5, dark: 2.0, position: [4, 4, 2] },
    fill: { light: 0.1, dark: 0.2, position: [-3, -2, -2] },
    rim: { light: 0.6, dark: 1.0, position: [-2, 3, -4] },
    bgColor: { light: 0xe0e0e0, dark: 0x1a1a1a }
  }
];
const materials = [
  {
    id: "phong",
    name: "Phong",
    details: "Smooth shading with specular highlights",
    type: "material"
  },
  {
    id: "standard",
    name: "Standard PBR",
    details: "Physically-based rendering",
    type: "material"
  },
  {
    id: "flat",
    name: "Flat",
    details: "No shading, solid color",
    type: "material"
  },
  {
    id: "wireframe",
    name: "Wireframe",
    details: "Show mesh edges only",
    type: "material"
  },
  {
    id: "metallic",
    name: "Metallic",
    details: "Reflective metal surface",
    type: "material"
  },
  {
    id: "glass",
    name: "Glass",
    details: "Transparent with refraction",
    type: "material"
  }
];
const models = [
  {
    id: "cube",
    name: "Cube",
    details: "Basic cube geometry",
    size: "2.1 KB",
    type: "mesh",
    color: 0x9d6b85,
    geometry: "box"
  },
  {
    id: "sphere",
    name: "Sphere",
    details: "Smooth subdivided sphere",
    size: "3.7 KB",
    type: "mesh",
    color: 0xb8859d,
    geometry: "sphere"
  },
  {
    id: "torus",
    name: "Torus",
    details: "Donut-shaped torus",
    size: "4.2 KB",
    type: "mesh",
    color: 0x8d5e75,
    geometry: "torus"
  },
  {
    id: "dodecahedron",
    name: "Dodecahedron",
    details: "Twelve-faced polyhedron",
    size: "5.1 KB",
    type: "mesh",
    color: 0xc795ab,
    geometry: "dodecahedron"
  },
  {
    id: "icosahedron",
    name: "Icosahedron",
    details: "Twenty-faced polyhedron",
    size: "4.8 KB",
    type: "mesh",
    color: 0xb88da0,
    geometry: "icosahedron"
  },
  {
    id: "octahedron",
    name: "Octahedron",
    details: "Eight-faced polyhedron",
    size: "3.2 KB",
    type: "mesh",
    color: 0xa57188,
    geometry: "octahedron"
  },
  {
    id: "tetrahedron",
    name: "Tetrahedron",
    details: "Four-faced polyhedron",
    size: "1.5 KB",
    type: "mesh",
    color: 0x8a5c72,
    geometry: "tetrahedron"
  },
  {
    id: "torusknot",
    name: "Torus Knot",
    details: "Twisted torus knot",
    size: "8.4 KB",
    type: "mesh",
    color: 0xd0a0b5,
    geometry: "torusknot"
  },
  {
    id: "lathe",
    name: "Lathe",
    details: "Rotated profile shape",
    size: "5.2 KB",
    type: "mesh",
    color: 0x966985,
    geometry: "lathe"
  },
  {
    id: "trefoil",
    name: "Trefoil Knot",
    details: "Mathematical knot with curves",
    size: "12.4 KB",
    type: "mesh",
    color: 0xa87590,
    geometry: "trefoil"
  },
  {
    id: "stellated",
    name: "Stellated Dodecahedron",
    details: "Spiky star polyhedron",
    size: "8.9 KB",
    type: "mesh",
    color: 0xb88da0,
    geometry: "stellated"
  }
];
const miniScenes = new Map();
const materialScenes = new Map();
const environmentScenes = new Map();
const backgroundScenes = new Map();
const geometryCache = new Map();
let selectedScene = null;
let sharedRenderer = null;
let isSelectOpen = false;
let selectedModelId = null;
let selectedMaterialId = "phong";
let selectedEnvironmentId = "studio";
let selectedBackgroundId = "none";

function getSharedRenderer() {
  if (!sharedRenderer) {
    const canvas = document.createElement("canvas");
    sharedRenderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
  }
  return sharedRenderer;
}

function addBackground(scene, backgroundId, isDarkMode) {
  switch (backgroundId) {
    case "void":
      const starGeometry = new THREE.BufferGeometry();
      const starVertices = [];
      for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 50;
        const y = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        starVertices.push(x, y, z);
      }
      starGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starVertices, 3)
      );
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.8
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
      scene.background = new THREE.Color(0x000000);
      break;
    case "grid":
      const gridSize = 10;
      const gridDivisions = 20;
      const gridHelper = new THREE.GridHelper(
        gridSize,
        gridDivisions,
        isDarkMode ? 0x9d6b85 : 0x2a2a2a,
        isDarkMode ? 0x653449 : 0x666666
      );
      gridHelper.position.y = -1;
      scene.add(gridHelper);
      const planeGeo = new THREE.PlaneGeometry(gridSize, gridSize);
      const planeMat = new THREE.MeshStandardMaterial({
        color: isDarkMode ? 0x1a1a1a : 0xcccccc,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: isDarkMode ? 0.3 : 0.6
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -1;
      plane.receiveShadow = true;
      scene.add(plane);
      break;
    case "gradient":
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      if (isDarkMode) {
        gradient.addColorStop(0, "#9d6b85");
        gradient.addColorStop(1, "#653449");
      } else {
        gradient.addColorStop(0, "#b8a5b0");
        gradient.addColorStop(1, "#7d6575");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      const texture = new THREE.CanvasTexture(canvas);
      scene.background = texture;
      break;
    case "radial":
      const radialCanvas = document.createElement("canvas");
      radialCanvas.width = 512;
      radialCanvas.height = 512;
      const radialCtx = radialCanvas.getContext("2d");
      const radialGradient = radialCtx.createRadialGradient(
        256,
        256,
        0,
        256,
        256,
        300
      );
      if (isDarkMode) {
        radialGradient.addColorStop(0, "#9d6b85");
        radialGradient.addColorStop(0.5, "#7d5069");
        radialGradient.addColorStop(1, "#653449");
      } else {
        radialGradient.addColorStop(0, "#e8d8e0");
        radialGradient.addColorStop(0.5, "#c8b0b8");
        radialGradient.addColorStop(1, "#9d8a95");
      }
      radialCtx.fillStyle = radialGradient;
      radialCtx.fillRect(0, 0, 512, 512);
      const radialTexture = new THREE.CanvasTexture(radialCanvas);
      scene.background = radialTexture;
      break;
    case "none":
    default:
      break;
  }
}

function createMaterial(materialId, color, isDarkMode) {
  switch (materialId) {
    case "phong":
      return new THREE.MeshPhongMaterial({
        color: color,
        shininess: isDarkMode ? 60 : 30,
        specular: isDarkMode ? 0x888888 : 0x444444
      });
    case "standard":
      return new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.4
      });
    case "flat":
      return new THREE.MeshBasicMaterial({
        color: color
      });
    case "wireframe":
      return new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        wireframeLinewidth: 2
      });
    case "metallic":
      return new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.7,
        roughness: 0.3,
        emissive: new THREE.Color(color).multiplyScalar(0.3),
        emissiveIntensity: isDarkMode ? 0.6 : 0.7,
        envMapIntensity: 2
      });
    case "glass":
      return new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0,
        roughness: 0.05,
        transmission: 0.6,
        transparent: true,
        opacity: 1,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1
      });
    default:
      return new THREE.MeshPhongMaterial({ color: color });
  }
}

function createGeometry(type) {
  if (geometryCache.has(type)) {
    return geometryCache.get(type);
  }
  const geometries = {
    box: () => new THREE.BoxGeometry(1, 1, 1),
    sphere: () => new THREE.SphereGeometry(0.7, 16, 12),
    torus: () => new THREE.TorusGeometry(0.5, 0.2, 8, 16),
    dodecahedron: () => new THREE.DodecahedronGeometry(0.7),
    icosahedron: () => new THREE.IcosahedronGeometry(0.7),
    octahedron: () => new THREE.OctahedronGeometry(0.7),
    tetrahedron: () => new THREE.TetrahedronGeometry(0.7),
    torusknot: () => new THREE.TorusKnotGeometry(0.5, 0.2, 64, 8),
    lathe: () => {
      const points = [];
      for (let i = 0; i < 10; i++) {
        points.push(
          new THREE.Vector2(Math.sin(i * 0.2) * 0.3 + 0.3, (i - 5) * 0.1)
        );
      }
      return new THREE.LatheGeometry(points, 12);
    },
    trefoil: () => {
      const points = [];
      const segments = 200;
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const x = Math.sin(t) + 2 * Math.sin(2 * t);
        const y = Math.cos(t) - 2 * Math.cos(2 * t);
        const z = -Math.sin(3 * t);
        points.push(new THREE.Vector3(x * 0.15, y * 0.15, z * 0.15));
      }
      const curve = new THREE.CatmullRomCurve3(points, true);
      return new THREE.TubeGeometry(curve, 100, 0.08, 12, true);
    },
    stellated: () => {
      const baseGeo = new THREE.DodecahedronGeometry(0.5);
      const vertices = baseGeo.attributes.position.array;
      const newVertices = [];
      for (let i = 0; i < vertices.length; i += 9) {
        const v1 = new THREE.Vector3(
          vertices[i],
          vertices[i + 1],
          vertices[i + 2]
        );
        const v2 = new THREE.Vector3(
          vertices[i + 3],
          vertices[i + 4],
          vertices[i + 5]
        );
        const v3 = new THREE.Vector3(
          vertices[i + 6],
          vertices[i + 7],
          vertices[i + 8]
        );
        const center = new THREE.Vector3()
          .add(v1)
          .add(v2)
          .add(v3)
          .divideScalar(3);
        const tip = center.clone().normalize().multiplyScalar(1.2);
        newVertices.push(
          v1.x,
          v1.y,
          v1.z,
          v2.x,
          v2.y,
          v2.z,
          tip.x,
          tip.y,
          tip.z,
          v2.x,
          v2.y,
          v2.z,
          v3.x,
          v3.y,
          v3.z,
          tip.x,
          tip.y,
          tip.z,
          v3.x,
          v3.y,
          v3.z,
          v1.x,
          v1.y,
          v1.z,
          tip.x,
          tip.y,
          tip.z
        );
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(newVertices, 3)
      );
      geometry.computeVertexNormals();
      return geometry;
    }
  };
  const geometry = geometries[type] ? geometries[type]() : geometries.box();
  geometryCache.set(type, geometry);
  return geometry;
}

function createScene(
  canvas,
  model,
  size = 64,
  useSharedRenderer = false,
  materialId = null,
  environmentId = null,
  backgroundId = null
) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  let renderer;
  if (useSharedRenderer) {
    renderer = getSharedRenderer();
  } else {
    const needsAlpha =
      !backgroundId || backgroundId === "none" || backgroundId === "grid";
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: needsAlpha
    });
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
  }
  //const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkMode =
    document.documentElement.getAttribute("data-theme") === "dark";

  const env =
    environments.find((e) => e.id === environmentId) || environments[0];
  if (backgroundId && backgroundId !== "none") {
    addBackground(scene, backgroundId, isDarkMode);
  }
  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    isDarkMode ? env.ambient.dark : env.ambient.light
  );
  scene.add(ambientLight);
  const hemiLight = new THREE.HemisphereLight(
    0xffffff,
    isDarkMode ? 0x653449 : 0xcccccc,
    isDarkMode ? 0.4 : 0.6
  );
  scene.add(hemiLight);
  const keyLight = new THREE.DirectionalLight(
    env.key.color || 0xffffff,
    isDarkMode ? env.key.dark : env.key.light
  );
  keyLight.position.set(...env.key.position);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(
    env.fill.color || (isDarkMode ? 0xf4eeeb : 0xffffff),
    isDarkMode ? env.fill.dark : env.fill.light
  );
  fillLight.position.set(...env.fill.position);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(
    env.rim.color || (isDarkMode ? 0xf4eeeb : 0xffffff),
    isDarkMode ? env.rim.dark : env.rim.light
  );
  rimLight.position.set(...env.rim.position);
  scene.add(rimLight);
  const geometry = createGeometry(model.geometry);
  let mesh;
  if (materialId) {
    const material = createMaterial(materialId, model.color, isDarkMode);
    if (model.type === "points" && materialId !== "wireframe") {
      mesh = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          color: model.color,
          size: 0.05,
          sizeAttenuation: true
        })
      );
    } else if (model.type === "line" && materialId !== "wireframe") {
      mesh = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: model.color,
          linewidth: 2
        })
      );
    } else {
      mesh = new THREE.Mesh(geometry, material);
    }
  } else {
    if (model.type === "wireframe") {
      const material = new THREE.MeshBasicMaterial({
        color: model.color,
        wireframe: true,
        wireframeLinewidth: 2
      });
      mesh = new THREE.Mesh(geometry, material);
    } else if (model.type === "points") {
      const material = new THREE.PointsMaterial({
        color: model.color,
        size: 0.05,
        sizeAttenuation: true
      });
      mesh = new THREE.Points(geometry, material);
    } else if (model.type === "line") {
      const material = new THREE.LineBasicMaterial({
        color: model.color,
        linewidth: 2
      });
      mesh = new THREE.Line(geometry, material);
    } else {
      const material = new THREE.MeshPhongMaterial({
        color: model.color,
        shininess: isDarkMode ? 60 : 30,
        specular: isDarkMode ? 0x888888 : 0x444444
      });
      mesh = new THREE.Mesh(geometry, material);
    }
  }
  scene.add(mesh);
  camera.position.set(2.5, 1.5, 2.5);
  camera.lookAt(0, 0, 0);
  return { scene, camera, renderer, mesh, canvas, size };
}

function populateBackgroundSelect() {
  const select = document.getElementById("backgroundSelect");
  if (
    !select ||
    !selectedModelId ||
    !selectedMaterialId ||
    !selectedEnvironmentId
  )
    return;
  const existingOptions = select.querySelectorAll("option");
  existingOptions.forEach((opt) => opt.remove());
  backgroundScenes.clear();
  const fragment = document.createDocumentFragment();
  const model = models.find((m) => m.id === selectedModelId);
  if (!model) return;
  backgrounds.forEach((background) => {
    const option = document.createElement("option");
    option.value = background.id;
    if (background.id === selectedBackgroundId) {
      option.selected = true;
    }
    const canvas = document.createElement("canvas");
    canvas.className = "model-canvas";
    canvas.width = 64;
    canvas.height = 64;
    option.innerHTML = `
      <div class="model-option">
        <div class="model-preview">${canvas.outerHTML}</div>
        <div class="model-info">
          <div class="model-name">${background.name}</div>
          <div class="model-details">${background.details}</div>
        </div>
        <div class="model-size"></div>
        <div class="model-type">${background.type}</div>
      </div>
    `;
    fragment.appendChild(option);
    const actualCanvas = option.querySelector(".model-canvas");
    if (actualCanvas) {
      const sceneData = createScene(
        actualCanvas,
        model,
        64,
        true,
        selectedMaterialId,
        selectedEnvironmentId,
        background.id
      );
      backgroundScenes.set(background.id, sceneData);
    }
  });
  select.appendChild(fragment);
}

function populateEnvironmentSelect() {
  const select = document.getElementById("environmentSelect");
  if (!select || !selectedModelId || !selectedMaterialId) return;
  const existingOptions = select.querySelectorAll("option");
  existingOptions.forEach((opt) => opt.remove());
  environmentScenes.clear();
  const fragment = document.createDocumentFragment();
  const model = models.find((m) => m.id === selectedModelId);
  if (!model) return;
  environments.forEach((environment) => {
    const option = document.createElement("option");
    option.value = environment.id;
    if (environment.id === selectedEnvironmentId) {
      option.selected = true;
    }
    const canvas = document.createElement("canvas");
    canvas.className = "model-canvas";
    canvas.width = 64;
    canvas.height = 64;
    option.innerHTML = `
      <div class="model-option">
        <div class="model-preview">${canvas.outerHTML}</div>
        <div class="model-info">
          <div class="model-name">${environment.name}</div>
          <div class="model-details">${environment.details}</div>
        </div>
        <div class="model-size"></div>
        <div class="model-type">${environment.type}</div>
      </div>
    `;
    fragment.appendChild(option);
    const actualCanvas = option.querySelector(".model-canvas");
    if (actualCanvas) {
      const sceneData = createScene(
        actualCanvas,
        model,
        64,
        true,
        selectedMaterialId,
        environment.id
      );
      environmentScenes.set(environment.id, sceneData);
    }
  });
  select.appendChild(fragment);
}

function populateMaterialSelect() {
  const select = document.getElementById("materialSelect");
  if (!select || !selectedModelId) return;
  const existingOptions = select.querySelectorAll("option");
  existingOptions.forEach((opt) => opt.remove());
  materialScenes.clear();
  const fragment = document.createDocumentFragment();
  const model = models.find((m) => m.id === selectedModelId);
  if (!model) return;
  materials.forEach((material) => {
    const option = document.createElement("option");
    option.value = material.id;
    if (material.id === selectedMaterialId) {
      option.selected = true;
    }
    const canvas = document.createElement("canvas");
    canvas.className = "model-canvas";
    canvas.width = 64;
    canvas.height = 64;
    option.innerHTML = `
      <div class="model-option">
        <div class="model-preview">${canvas.outerHTML}</div>
        <div class="model-info">
          <div class="model-name">${material.name}</div>
          <div class="model-details">${material.details}</div>
        </div>
        <div class="model-size"></div>
        <div class="model-type">${material.type}</div>
      </div>
    `;
    fragment.appendChild(option);
    const actualCanvas = option.querySelector(".model-canvas");
    if (actualCanvas) {
      const sceneData = createScene(actualCanvas, model, 64, true, material.id);
      materialScenes.set(material.id, sceneData);
    }
  });
  select.appendChild(fragment);
}

function populateSelect() {
  const select = document.getElementById("modelSelect");
  const existingOptions = select.querySelectorAll("option");
  existingOptions.forEach((opt) => opt.remove());
  const fragment = document.createDocumentFragment();
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.id;
    const canvas = document.createElement("canvas");
    canvas.className = "model-canvas";
    canvas.width = 64;
    canvas.height = 64;
    option.innerHTML = `
      <div class="model-option">
        <div class="model-preview">${canvas.outerHTML}</div>
        <div class="model-info">
          <div class="model-name">${model.name}</div>
          <div class="model-details">${model.details}</div>
        </div>
        <div class="model-size">${model.size}</div>
        <div class="model-type">${model.type}</div>
      </div>
    `;
    fragment.appendChild(option);
    const actualCanvas = option.querySelector(".model-canvas");
    if (actualCanvas) {
      const sceneData = createScene(actualCanvas, model, 64, true, null);
      miniScenes.set(model.id, sceneData);
    }
  });
  select.appendChild(fragment);
}

function updateMainPreview(modelId, materialId, environmentId, backgroundId) {
  const model = models.find((m) => m.id === modelId);
  if (!model) return;
  const canvas = document.getElementById("selectedCanvas");
  const info = document.getElementById("selectedInfo");
  const container = canvas.parentElement;
  let savedRotation = null;
  if (selectedScene?.mesh) {
    savedRotation = {
      x: selectedScene.mesh.rotation.x,
      y: selectedScene.mesh.rotation.y,
      z: selectedScene.mesh.rotation.z
    };
  }
  if (selectedScene) {
    if (selectedScene.scene) {
      selectedScene.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      selectedScene.scene.clear();
    }
    if (selectedScene.renderer) {
      selectedScene.renderer.dispose();
    }
  }
  const size = Math.min(container.clientWidth, container.clientHeight);
  selectedScene = createScene(
    canvas,
    model,
    size,
    false,
    materialId,
    environmentId,
    backgroundId
  );
  if (savedRotation && selectedScene.mesh) {
    selectedScene.mesh.rotation.x = savedRotation.x;
    selectedScene.mesh.rotation.y = savedRotation.y;
    selectedScene.mesh.rotation.z = savedRotation.z;
  }
  const materialName =
    materials.find((m) => m.id === materialId)?.name || "Phong";
  const envName =
    environments.find((e) => e.id === environmentId)?.name || "Studio";
  const bgName = backgrounds.find((b) => b.id === backgroundId)?.name || "None";
  info.innerHTML = `<strong>${model.name}</strong> • ${materialName} • ${envName} • ${bgName}`;
  updateTechDetails(
    selectedScene.mesh.geometry,
    materialId,
    model.type,
    environmentId,
    backgroundId
  );
}

function updateTechDetails(
  geometry,
  materialId,
  geometryType,
  environmentId,
  backgroundId
) {
  const vertices = geometry.attributes.position.count;
  const faces = geometry.index ? geometry.index.count / 3 : vertices / 3;
  const materialName =
    materials.find((m) => m.id === materialId)?.name || "Phong";
  const envName =
    environments.find((e) => e.id === environmentId)?.name || "Studio";
  const bgName = backgrounds.find((b) => b.id === backgroundId)?.name || "None";
  document.getElementById("vertices").textContent = vertices.toLocaleString();
  document.getElementById("faces").textContent = Math.floor(
    faces
  ).toLocaleString();
  document.getElementById("geometry-type").textContent = geometryType || "Mesh";
  document.getElementById("material").textContent = materialName;
  document.getElementById("environment").textContent = envName;
  document.getElementById("background").textContent = bgName;
}

function animate() {
  requestAnimationFrame(animate);
  const modelSelect = document.getElementById("modelSelect");
  const materialSelect = document.getElementById("materialSelect");
  const environmentSelect = document.getElementById("environmentSelect");
  const backgroundSelect = document.getElementById("backgroundSelect");
  const isModelOpen = modelSelect?.matches(":open");
  const isMaterialOpen = materialSelect?.matches(":open");
  const isEnvironmentOpen = environmentSelect?.matches(":open");
  const isBackgroundOpen = backgroundSelect?.matches(":open");
  const isAnySelectOpen =
    isModelOpen || isMaterialOpen || isEnvironmentOpen || isBackgroundOpen;
  const renderer = getSharedRenderer();
  renderer.setClearColor(0x000000, 0);
  if (isModelOpen) {
    miniScenes.forEach((sceneData) => {
      if (sceneData.mesh && sceneData.canvas) {
        sceneData.mesh.rotation.y += 0.01;
        sceneData.mesh.rotation.x += 0.005;
        renderer.setSize(sceneData.size, sceneData.size);
        renderer.render(sceneData.scene, sceneData.camera);
        const ctx = sceneData.canvas.getContext("2d");
        ctx.clearRect(0, 0, sceneData.size, sceneData.size);
        ctx.drawImage(renderer.domElement, 0, 0);
      }
    });
  }
  if (isMaterialOpen) {
    materialScenes.forEach((sceneData) => {
      if (sceneData.mesh && sceneData.canvas) {
        sceneData.mesh.rotation.y += 0.01;
        sceneData.mesh.rotation.x += 0.005;
        renderer.setSize(sceneData.size, sceneData.size);
        renderer.render(sceneData.scene, sceneData.camera);
        const ctx = sceneData.canvas.getContext("2d");
        ctx.clearRect(0, 0, sceneData.size, sceneData.size);
        ctx.drawImage(renderer.domElement, 0, 0);
      }
    });
  }
  if (isEnvironmentOpen) {
    environmentScenes.forEach((sceneData) => {
      if (sceneData.mesh && sceneData.canvas) {
        sceneData.mesh.rotation.y += 0.01;
        sceneData.mesh.rotation.x += 0.005;
        renderer.setSize(sceneData.size, sceneData.size);
        renderer.render(sceneData.scene, sceneData.camera);
        const ctx = sceneData.canvas.getContext("2d");
        ctx.clearRect(0, 0, sceneData.size, sceneData.size);
        ctx.drawImage(renderer.domElement, 0, 0);
      }
    });
  }
  if (isBackgroundOpen) {
    backgroundScenes.forEach((sceneData) => {
      if (sceneData.mesh && sceneData.canvas) {
        sceneData.mesh.rotation.y += 0.01;
        sceneData.mesh.rotation.x += 0.005;
        renderer.setSize(sceneData.size, sceneData.size);
        renderer.render(sceneData.scene, sceneData.camera);
        const ctx = sceneData.canvas.getContext("2d");
        ctx.clearRect(0, 0, sceneData.size, sceneData.size);
        ctx.drawImage(renderer.domElement, 0, 0);
      }
    });
  }
  if (selectedScene?.mesh && !isAnySelectOpen) {
    selectedScene.mesh.rotation.y += 0.015;
    selectedScene.mesh.rotation.x += 0.008;
    selectedScene.renderer.render(selectedScene.scene, selectedScene.camera);
  }
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (typeof selectedModelId === "string" && selectedModelId) {
    updateMainPreview(
      selectedModelId,
      selectedMaterialId,
      selectedEnvironmentId,
      selectedBackgroundId
    );
  }
}

function initTheme() {
  const systemTheme = getSystemTheme();
  applyTheme(systemTheme);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", (e) => {
    const newTheme = e.matches ? "dark" : "light";
    applyTheme(newTheme);
  });
}

function setupThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || getSystemTheme();
    const newTheme = current === "dark" ? "light" : "dark";
    applyTheme(newTheme);
  });
}

initTheme();
setupThemeToggle();

document.addEventListener("DOMContentLoaded", () => {
  const modelSelect = document.getElementById("modelSelect");
  const materialSelect = document.getElementById("materialSelect");
  const environmentSelect = document.getElementById("environmentSelect");
  const backgroundSelect = document.getElementById("backgroundSelect");
  const infoToggle = document.getElementById("infoToggle");
  const techDetails = document.getElementById("techDetails");

  function updateSelectedContent(select, dataset, id) {
    const selectedContent = select.querySelector("selectedcontent");
    const item = dataset.find((m) => m.id === id);
    if (item && selectedContent) {
      selectedContent.innerHTML = `
        <div class="selected-button-content">
          <span class="model-type">${item.type}</span>
          <span class="model-name">${item.name}</span>
        </div>`;
    }
  }

  function refreshSelects() {
    populateMaterialSelect();
    populateEnvironmentSelect();
    populateBackgroundSelect();
  }

  [modelSelect, materialSelect, environmentSelect, backgroundSelect].forEach(
    (select) => {
      select.addEventListener("toggle", (e) => {
        isSelectOpen = e.newState === "open";
        console.log(`${select.id} toggle:`, e.newState);
      });
    }
  );

  infoToggle.addEventListener("click", () => {
    const hidden = techDetails.hidden;
    techDetails.hidden = !hidden;
    const label = hidden ? "Hide technical details" : "Show technical details";
    infoToggle.setAttribute("aria-label", label);
    infoToggle.setAttribute("title", label);
  });

  modelSelect.addEventListener("change", function () {
    if (!this.value) return;
    selectedModelId = this.value;
    updateSelectedContent(this, models, this.value);
    refreshSelects();

    updateSelectedContent(materialSelect, materials, selectedMaterialId);
    updateSelectedContent(
      environmentSelect,
      environments,
      selectedEnvironmentId
    );
    updateSelectedContent(backgroundSelect, backgrounds, selectedBackgroundId);

    updateMainPreview(
      this.value,
      selectedMaterialId,
      selectedEnvironmentId,
      selectedBackgroundId
    );
  });

  materialSelect.addEventListener("change", function () {
    if (!this.value) return;
    selectedMaterialId = this.value;
    updateSelectedContent(this, materials, this.value);

    populateEnvironmentSelect();
    populateBackgroundSelect();

    updateSelectedContent(
      environmentSelect,
      environments,
      selectedEnvironmentId
    );
    updateSelectedContent(backgroundSelect, backgrounds, selectedBackgroundId);

    if (selectedModelId) {
      updateMainPreview(
        selectedModelId,
        this.value,
        selectedEnvironmentId,
        selectedBackgroundId
      );
    }
  });

  environmentSelect.addEventListener("change", function () {
    if (!this.value) return;
    selectedEnvironmentId = this.value;
    updateSelectedContent(this, environments, this.value);

    populateBackgroundSelect();
    updateSelectedContent(backgroundSelect, backgrounds, selectedBackgroundId);

    if (selectedModelId && selectedMaterialId) {
      updateMainPreview(
        selectedModelId,
        selectedMaterialId,
        this.value,
        selectedBackgroundId
      );
    }
  });

  backgroundSelect.addEventListener("change", function () {
    if (!this.value) return;
    selectedBackgroundId = this.value;
    updateSelectedContent(this, backgrounds, this.value);

    if (selectedModelId && selectedMaterialId && selectedEnvironmentId) {
      updateMainPreview(
        selectedModelId,
        selectedMaterialId,
        selectedEnvironmentId,
        this.value
      );
    }
  });

  requestAnimationFrame(() => {
    setTimeout(() => {
      populateSelect();
      animate();

      if (models.length > 0) {
        selectedModelId = models[0].id;
        modelSelect.value = selectedModelId;
        updateSelectedContent(modelSelect, models, selectedModelId);

        setTimeout(() => {
          populateMaterialSelect();
          populateEnvironmentSelect();
          populateBackgroundSelect();

          if (materials.length > 0) {
            materialSelect.value = selectedMaterialId;
            updateSelectedContent(
              materialSelect,
              materials,
              selectedMaterialId
            );
          }

          if (environments.length > 0) {
            environmentSelect.value = selectedEnvironmentId;
            updateSelectedContent(
              environmentSelect,
              environments,
              selectedEnvironmentId
            );
          }

          if (backgrounds.length > 0) {
            backgroundSelect.value = selectedBackgroundId;
            updateSelectedContent(
              backgroundSelect,
              backgrounds,
              selectedBackgroundId
            );
          }
        }, 100);

        updateMainPreview(
          selectedModelId,
          selectedMaterialId,
          selectedEnvironmentId,
          selectedBackgroundId
        );
      }
    }, 50);
  });
});
