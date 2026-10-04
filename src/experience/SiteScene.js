import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// A procedural "architectural maquette" of a Gurugram builder floor (stilt + 4 floors) that
// assembles itself from an empty plot as `progress` goes 0 → 1:
//   Foundation → Structure (columns + slabs) → Finishing (walls, glazing) → Interior (lights)
//   → Final inspection (scaffold + crane leave) → Handover (landscape, warm glow)

const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const easeOutBack = (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const lerp = (a, b, t) => a + (b - a) * t;

const W = 10;      // plot width (x)
const D = 13;      // plot depth (z)
const H = 3.1;     // floor-to-floor height
const LEVELS = 5;  // stilt + 4 floors
const TOP = H * LEVELS;

const COLORS = {
  footing: 0x8f887d,
  concrete: 0xc8c1b5,
  slab: 0xe9e3d7,
  wall: 0xf3eee5,
  glass: 0x223246,
  edge: 0xdcbd6c,
  crane: 0xe2b84a,
  tree: 0x5d8a64,
  trunk: 0x6b5442,
  warm: 0xffc879,
};

export const FRAMINGS = {
  intro:    { desk: { sx: 0.19, sy: 0.07, dist: 66, h: 8.5 },  mob: { sx: 0, sy: 0.13, dist: 104, h: 9 } },
  overview: { desk: { sx: 0.24, sy: 0.04, dist: 70, h: 8.5 }, mob: { sx: 0, sy: 0.17, dist: 110, h: 9 } },
  progress: { desk: { sx: -0.25, sy: 0.05, dist: 68, h: 8.5 }, mob: { sx: 0, sy: 0.17, dist: 106, h: 9 } },
};

export default class SiteScene {
  constructor(container, { reduced = false } = {}) {
    this.container = container;
    this.reduced = reduced;
    this.progress = 0;
    this.targetProgress = 0;
    this.night = 0.2;
    this.targetNight = 0.2;
    this.framingName = "intro";
    this.frame = { sx: 0.19, sy: 0.07, dist: 66, h: 8.5 };
    this.userAz = 0;
    this.azVel = 0;
    this.pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    this.time = 0;
    this.active = false;
    this.anims = [];
    this.disposables = [];

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    container.appendChild(canvas);
    this.canvas = canvas;

    const mobile = Math.min(window.innerWidth, window.innerHeight) < 700;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.localClippingEnabled = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.5, 400);

    this.buildLights();
    this.buildGround();
    this.buildBuilding();
    this.buildScaffold();
    this.buildCrane();
    this.buildLandscape();
    this.buildDust();

    this.clock = new THREE.Clock();
    this.loop = this.loop.bind(this);
    this.resize();
    this.applyProgress(0);
    this.renderer.render(this.scene, this.camera);
  }

  /* ───────────── materials helpers ───────────── */
  mat(color, opts = {}) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.02, transparent: true, ...opts });
    this.disposables.push(m);
    return m;
  }
  lineMat(color, opacity) {
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
    this.disposables.push(m);
    return m;
  }
  edges(geometry, opacity = 0.55) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 20), this.lineMat(COLORS.edge, opacity));
    e.userData.baseOpacity = opacity;
    return e;
  }
  box(w, h, d, x = 0, y = 0, z = 0) {
    // geometry with its base at y (so scaling Y grows it upward)
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(x, y + h / 2, z);
    return g;
  }
  addAnim(obj, a, b, kind, extra = {}) {
    this.anims.push({ obj, a, b, kind, ...extra });
  }

  /* ───────────── scene parts ───────────── */
  buildLights() {
    this.hemi = new THREE.HemisphereLight(0xa9c1e6, 0x3b2f24, 1.15);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffdcb0, 2.1);
    this.sun.position.set(16, 26, 18);
    this.scene.add(this.sun);
    this.rim = new THREE.DirectionalLight(0x86a8ff, 0.7);
    this.rim.position.set(-18, 12, -14);
    this.scene.add(this.rim);
    this.glow = new THREE.PointLight(COLORS.warm, 0, 40, 1.6);
    this.glow.position.set(0, 6, 9);
    this.scene.add(this.glow);
  }

  canvasTexture(size, draw) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    draw(c.getContext("2d"), size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    this.disposables.push(t);
    return t;
  }

  buildGround() {
    const span = 90;
    const tex = this.canvasTexture(1024, (g, s) => {
      const px = s / span; // pixels per unit
      g.clearRect(0, 0, s, s);
      for (let i = 0; i <= span; i++) {
        const major = i % 5 === 0;
        g.strokeStyle = major ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)";
        g.lineWidth = major ? 1.4 : 1;
        g.beginPath(); g.moveTo(i * px, 0); g.lineTo(i * px, s); g.stroke();
        g.beginPath(); g.moveTo(0, i * px); g.lineTo(s, i * px); g.stroke();
      }
      // radial fade to transparent
      g.globalCompositeOperation = "destination-in";
      const r = g.createRadialGradient(s / 2, s / 2, s * 0.05, s / 2, s / 2, s * 0.5);
      r.addColorStop(0, "rgba(0,0,0,1)"); r.addColorStop(0.55, "rgba(0,0,0,0.6)"); r.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = r; g.fillRect(0, 0, s, s);
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(span, span), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    this.scene.add(ground);
    this.disposables.push(ground.geometry, ground.material);

    // Soft contact shadow
    const shadowTex = this.canvasTexture(256, (g, s) => {
      const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      r.addColorStop(0, "rgba(0,0,0,0.55)"); r.addColorStop(0.6, "rgba(0,0,0,0.25)"); r.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = r; g.fillRect(0, 0, s, s);
    });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 2.6, D * 2.4), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    this.scene.add(shadow);
    this.addAnim(shadow, 0.05, 0.45, "fade", { base: 1 });

    // Plot boundary (marked out on day one)
    const pts = [[-W / 2 - 1, -D / 2 - 1], [W / 2 + 1, -D / 2 - 1], [W / 2 + 1, D / 2 + 2.4], [-W / 2 - 1, D / 2 + 2.4], [-W / 2 - 1, -D / 2 - 1]]
      .map(([x, z]) => new THREE.Vector3(x, 0.03, z));
    const plot = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), this.lineMat(COLORS.edge, 0.9));
    this.scene.add(plot);
    this.plot = plot;

    // Corner pegs
    const pegGeo = mergeGeometries(pts.slice(0, 4).map((p) => this.box(0.18, 0.9, 0.18, p.x, 0, p.z)));
    const pegs = new THREE.Mesh(pegGeo, this.mat(COLORS.crane, { roughness: 0.5 }));
    this.scene.add(pegs);
    this.addAnim(pegs, 0.0, 0.02, "fade", { base: 1, out: [0.5, 0.6] });
  }

  buildBuilding() {
    const b = new THREE.Group();
    this.building = b;
    this.scene.add(b);

    // Footing / plinth
    const footGeo = this.box(W + 1.2, 0.6, D + 1.2, 0, -0.3, 0);
    const foot = new THREE.Mesh(footGeo, this.mat(COLORS.footing));
    foot.add(this.edges(footGeo, 0.4));
    b.add(foot);
    this.addAnim(foot, 0.0, 0.08, "scaleY");

    const colX = [-W / 2 + 0.3, 0, W / 2 - 0.3];
    const colZ = [-D / 2 + 0.3, -D / 6, D / 6, D / 2 - 0.3];
    this.levelTops = [];

    for (let k = 0; k < LEVELS; k++) {
      const y0 = k * H;
      const start = 0.08 + k * 0.09;

      // Columns for this level
      const cols = [];
      colX.forEach((x) => colZ.forEach((z) => cols.push(this.box(0.5, H, 0.5, x, 0, z))));
      if (k > 0) {
        // stair / lift core rises with the frame
        cols.push(this.box(2.4, H, 3.2, -W / 2 + 1.5, 0, -D / 2 + 1.9));
      }
      const colGeo = mergeGeometries(cols);
      const colMesh = new THREE.Mesh(colGeo, this.mat(COLORS.concrete));
      colMesh.position.y = y0;
      colMesh.add(this.edges(colGeo, 0.35));
      b.add(colMesh);
      this.addAnim(colMesh, start, start + 0.05, "scaleY");

      // Slab on top of this level
      const slabGeo = this.box(W + 0.5, 0.32, D + 0.5, 0, -0.16, 0);
      const slab = new THREE.Mesh(slabGeo, this.mat(COLORS.slab));
      slab.position.y = y0 + H;
      slab.add(this.edges(slabGeo, 0.6));
      b.add(slab);
      this.addAnim(slab, start + 0.04, start + 0.09, "drop", { baseY: y0 + H });

      // Balcony on the front of each upper floor
      if (k > 0) {
        const balGeo = this.box(W - 1.4, 0.24, 1.6, 0, -0.12, D / 2 + 0.25 + 0.8);
        const bal = new THREE.Mesh(balGeo, this.mat(COLORS.slab));
        bal.position.y = y0;
        bal.add(this.edges(balGeo, 0.5));
        b.add(bal);
        this.addAnim(bal, start + 0.02, start + 0.07, "drop", { baseY: y0 });

        const railGeo = this.box(W - 1.4, 1.0, 0.06, 0, 0, D / 2 + 0.25 + 1.6);
        const rail = new THREE.Mesh(railGeo, this.mat(0xbfd6ea, { opacity: 0.25, roughness: 0.1, metalness: 0.3 }));
        rail.position.y = y0 + 0.12;
        rail.add(this.edges(railGeo, 0.5));
        b.add(rail);
        this.addAnim(rail, 0.62 + (k - 1) * 0.03, 0.68 + (k - 1) * 0.03, "fade", { base: 0.25 });
      }
      this.levelTops.push({ start, top: y0 + H });

      // Walls + glazing on the four floors above the stilt
      if (k > 0) {
        const wt = 0.22;
        const walls = [
          this.box(wt, H - 0.32, D - 0.2, -W / 2 + wt / 2 + 0.05, 0, 0), // left
          this.box(wt, H - 0.32, D - 0.2, W / 2 - wt / 2 - 0.05, 0, 0),  // right
          this.box(W - 0.2, H - 0.32, wt, 0, 0, -D / 2 + wt / 2 + 0.05), // back
          this.box(1.4, H - 0.32, wt, -W / 2 + 0.75, 0, D / 2 - 0.15),   // front piers
          this.box(1.4, H - 0.32, wt, W / 2 - 0.75, 0, D / 2 - 0.15),
        ];
        const wallGeo = mergeGeometries(walls);
        const wall = new THREE.Mesh(wallGeo, this.mat(COLORS.wall, { roughness: 0.95 }));
        wall.position.y = y0;
        wall.add(this.edges(wallGeo, 0.3));
        b.add(wall);
        const ws = 0.56 + (k - 1) * 0.03;
        this.addAnim(wall, ws, ws + 0.06, "scaleY");

        // Windows: big front glazing + punched windows on sides/back
        const win = [];
        const wy = 0.6, wh = H - 1.3;
        win.push(this.box(W - 3.0, H - 0.7, 0.05, 0, 0.18, D / 2 - 0.1));
        [-D / 3, 0, D / 3].forEach((z) => {
          win.push(this.box(0.05, wh, 1.8, -W / 2 - 0.02, wy, z));
          win.push(this.box(0.05, wh, 1.8, W / 2 + 0.02, wy, z));
        });
        [-W / 4, W / 4].forEach((x) => win.push(this.box(2.0, wh, 0.05, x, wy, -D / 2 - 0.02)));
        const winGeo = mergeGeometries(win);
        const glassMat = this.mat(COLORS.glass, { roughness: 0.12, metalness: 0.4, emissive: new THREE.Color(COLORS.warm), emissiveIntensity: 0 });
        const glass = new THREE.Mesh(winGeo, glassMat);
        glass.position.y = y0;
        b.add(glass);
        const gs = 0.6 + (k - 1) * 0.03;
        this.addAnim(glass, gs, gs + 0.06, "fade", { base: 0.92 });
        this.addAnim(glass, 0.72 + (k - 1) * 0.025, 0.8 + (k - 1) * 0.025, "lights", { level: k });
      }
    }

    // Roof: parapet, stair headroom, water tank
    const roofY = TOP;
    const parapet = mergeGeometries([
      this.box(W + 0.5, 0.9, 0.15, 0, 0, -D / 2 - 0.17),
      this.box(W + 0.5, 0.9, 0.15, 0, 0, D / 2 + 0.17),
      this.box(0.15, 0.9, D + 0.5, -W / 2 - 0.17, 0, 0),
      this.box(0.15, 0.9, D + 0.5, W / 2 + 0.17, 0, 0),
      this.box(2.4, 2.6, 3.2, -W / 2 + 1.5, 0, -D / 2 + 1.9),
      this.box(1.6, 1.1, 1.6, W / 2 - 1.6, 0, -D / 2 + 1.8),
    ]);
    const roof = new THREE.Mesh(parapet, this.mat(COLORS.wall));
    roof.position.y = roofY;
    roof.add(this.edges(parapet, 0.55));
    b.add(roof);
    this.addAnim(roof, 0.53, 0.58, "scaleY");

    // Handover trim — a warm gold band along the roof line
    const trimGeo = this.box(W + 0.8, 0.12, D + 0.8, 0, 0.9, 0);
    const trim = new THREE.Mesh(trimGeo, this.mat(COLORS.edge, { emissive: new THREE.Color(COLORS.edge), emissiveIntensity: 0.6, roughness: 0.4, metalness: 0.6 }));
    trim.position.y = roofY;
    b.add(trim);
    this.addAnim(trim, 0.92, 1.0, "fade", { base: 1 });
  }

  buildScaffold() {
    const pos = [];
    const off = 0.9;
    const x0 = -W / 2 - off, x1 = W / 2 + off, z0 = -D / 2 - off, z1 = D / 2 + off + 1.6;
    const h = TOP + 1.2;
    const seg = (a, b) => pos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    const edgesXZ = [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]];
    edgesXZ.forEach(([[ax, az], [bx, bz]]) => {
      const len = Math.hypot(bx - ax, bz - az);
      const n = Math.max(2, Math.round(len / 2.2));
      for (let i = 0; i <= n; i++) {
        const t = i / n; const x = lerp(ax, bx, t), z = lerp(az, bz, t);
        seg([x, 0, z], [x, h, z]);
        if (i < n) {
          const nx = lerp(ax, bx, (i + 1) / n), nz = lerp(az, bz, (i + 1) / n);
          for (let y = 1.55; y <= h; y += 1.55) seg([x, y, z], [nx, y, nz]);
          if (i % 2 === 0) for (let y = 0; y < h - 3; y += 3.1) seg([x, y, z], [nx, y + 3.1, nz]);
        }
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    this.clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const m = new THREE.LineBasicMaterial({ color: 0x9fb4cc, transparent: true, opacity: 0, depthWrite: false, clippingPlanes: [this.clip] });
    this.disposables.push(geo, m);
    this.scaffold = new THREE.LineSegments(geo, m);
    this.building.add(this.scaffold);
  }

  lattice(len, w, axis = "y") {
    // simple lattice truss as line segments, along +axis from origin
    const pos = [];
    const seg = (a, b) => pos.push(...a, ...b);
    const P = (u, a, c) => (axis === "y" ? [a, u, c] : [u, a, c]);
    const corners = [[-w / 2, -w / 2], [w / 2, -w / 2], [w / 2, w / 2], [-w / 2, w / 2]];
    corners.forEach(([a, c]) => seg(P(0, a, c), P(len, a, c)));
    const step = w * 1.4;
    for (let u = 0; u <= len + 1e-3; u += step) {
      for (let i = 0; i < 4; i++) {
        const [a1, c1] = corners[i], [a2, c2] = corners[(i + 1) % 4];
        seg(P(u, a1, c1), P(u, a2, c2));
        if (u + step <= len + 1e-3) seg(P(u, a1, c1), P(u + step, a2, c2));
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    this.disposables.push(geo);
    return geo;
  }

  buildCrane() {
    const crane = new THREE.Group();
    crane.position.set(-W / 2 - 5.5, 0, -D / 2 + 1);
    const lm = this.lineMat(COLORS.crane, 0.95);
    const mastH = TOP + 4.5;
    crane.add(new THREE.LineSegments(this.lattice(mastH, 1.0, "y"), lm));
    const base = new THREE.Mesh(this.box(3, 0.6, 3), this.mat(COLORS.footing));
    crane.add(base);

    const top = new THREE.Group();
    top.position.y = mastH;
    const jib = new THREE.LineSegments(this.lattice(19, 0.8, "x"), lm);
    jib.position.x = 0;
    top.add(jib);
    const counter = new THREE.LineSegments(this.lattice(6, 0.8, "x"), lm);
    counter.rotation.y = Math.PI;
    top.add(counter);
    const weight = new THREE.Mesh(this.box(1.6, 1.2, 1.1, -5.2, -0.6, 0), this.mat(0x6f6a62));
    top.add(weight);
    const cab = new THREE.Mesh(this.box(1.3, 1.2, 1.3, 0.2, -1.4, 0.9), this.mat(COLORS.crane, { roughness: 0.4 }));
    top.add(cab);
    const apex = new THREE.LineSegments(this.lattice(2.8, 0.7, "y"), lm);
    top.add(apex);
    // tie lines from apex to jib tips
    const ties = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 2.8, 0), new THREE.Vector3(14, 0.4, 0), new THREE.Vector3(0, 2.8, 0), new THREE.Vector3(-5.5, 0.4, 0)]);
    this.disposables.push(ties);
    top.add(new THREE.LineSegments(ties, lm));

    // trolley + cable + hook block
    this.trolley = new THREE.Group();
    top.add(this.trolley);
    const cableGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0)]);
    this.disposables.push(cableGeo);
    this.cable = new THREE.Line(cableGeo, this.lineMat(0xffffff, 0.6));
    this.trolley.add(this.cable);
    this.hook = new THREE.Mesh(this.box(0.6, 0.6, 0.6, 0, -0.3, 0), this.mat(COLORS.crane));
    this.trolley.add(this.hook);
    // a slab of material hanging from the hook
    this.load = new THREE.Mesh(this.box(2.6, 0.3, 1.2, 0, -1.1, 0), this.mat(COLORS.slab));
    this.load.add(this.edges(this.load.geometry, 0.5));
    this.hook.add(this.load);

    crane.add(top);
    this.craneTop = top;
    this.crane = crane;
    this.craneMast = mastH;
    this.scene.add(crane);
  }

  buildLandscape() {
    const trees = new THREE.Group();
    const spots = [[-8, 9.5], [-6, 12], [7.5, 10.5], [9, 6.5], [-9.5, 4], [5, 13], [-3.5, 12.8], [10, -3]];
    spots.forEach(([x, z], i) => {
      const t = new THREE.Group();
      const trunk = new THREE.Mesh(this.box(0.25, 1.2, 0.25), this.mat(COLORS.trunk));
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1 + (i % 3) * 0.25, 0), this.mat(COLORS.tree, { flatShading: true, roughness: 0.9 }));
      this.disposables.push(crown.geometry);
      crown.position.y = 1.9 + (i % 3) * 0.2;
      t.add(trunk, crown);
      t.position.set(x, 0, z);
      trees.add(t);
      this.addAnim(t, 0.9 + (i % 4) * 0.02, 0.97 + (i % 4) * 0.01, "pop");
    });
    // driveway
    const drive = new THREE.Mesh(this.box(4, 0.05, 6, 0, 0, D / 2 + 5), this.mat(0x9a9387, { roughness: 1 }));
    this.scene.add(drive);
    this.addAnim(drive, 0.88, 0.95, "fade", { base: 1 });
    this.scene.add(trees);
  }

  buildDust() {
    const n = 220;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 34;
      p[i * 3 + 1] = Math.random() * 22;
      p[i * 3 + 2] = (Math.random() - 0.5) * 34;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({ color: 0xffe2b0, size: 0.09, transparent: true, opacity: 0.5, depthWrite: false, sizeAttenuation: true });
    this.disposables.push(geo, m);
    this.dust = new THREE.Points(geo, m);
    this.scene.add(this.dust);
  }

  /* ───────────── state ───────────── */
  applyProgress(p) {
    for (const a of this.anims) {
      let t = ss(a.a, a.b, p);
      const { obj } = a;
      if (a.out) t *= 1 - ss(a.out[0], a.out[1], p);
      if (!a.mats) { a.mats = []; obj.traverse((o) => { if (o.material) a.mats.push(o); }); }
      const mats = a.mats;
      switch (a.kind) {
        case "scaleY":
          obj.scale.y = Math.max(0.001, t);
          obj.visible = t > 0.002;
          mats.forEach((o) => { o.material.opacity = (o.userData.baseOpacity ?? 1) * Math.min(1, t * 1.6); });
          break;
        case "drop":
          obj.position.y = a.baseY + (1 - t) * 2.5;
          obj.visible = t > 0.002;
          mats.forEach((o) => { o.material.opacity = (o.userData.baseOpacity ?? 1) * t; });
          break;
        case "fade":
          obj.visible = t > 0.002;
          mats.forEach((o) => { o.material.opacity = (o.userData.baseOpacity ?? a.base ?? 1) * t; });
          break;
        case "pop":
          obj.visible = t > 0.002;
          obj.scale.setScalar(Math.max(0.001, easeOutBack(t)));
          break;
        case "lights":
          obj.material.emissiveIntensity = t * (1.1 + this.night * 1.4);
          break;
        default:
      }
    }

    // Built height = top of the highest slab that has landed
    let built = 0.6;
    for (const l of this.levelTops) built = Math.max(built, lerp(l.top - H, l.top, ss(l.start, l.start + 0.09, p)));
    if (p > 0.53) built = lerp(built, TOP + 1, ss(0.53, 0.58, p));
    this.builtHeight = built;

    // Scaffold follows the frame upward, then leaves at inspection
    this.clip.constant = built + 1.2;
    this.scaffold.material.opacity = 0.55 * ss(0.08, 0.14, p) * (1 - ss(0.8, 0.88, p));
    this.scaffold.visible = this.scaffold.material.opacity > 0.01;

    // Crane arrives early, leaves after inspection
    const craneIn = ss(0.02, 0.08, p) * (1 - ss(0.84, 0.92, p));
    this.crane.visible = craneIn > 0.01;
    this.crane.position.y = -(1 - craneIn) * 2.5;
    if (!this.craneMats) { this.craneMats = []; this.crane.traverse((o) => { if (o.material) this.craneMats.push(o.material); }); this.craneMats.forEach((m) => { m.userData.base = m.opacity; }); }
    this.craneMats.forEach((m) => { m.opacity = m.userData.base * craneIn; });
    this.load.visible = p < 0.6;

    // Plot outline fades once the plinth is down
    this.plot.material.opacity = 0.9 * (1 - ss(0.1, 0.2, p) * 0.75);

    // Handover glow
    const handover = ss(0.9, 1.0, p);
    this.glow.intensity = handover * (8 + this.night * 22);
  }

  setProgress(p) { this.targetProgress = Math.min(1, Math.max(0, p)); this.kick(); }
  setNight(n) { this.targetNight = n; this.kick(); }
  setFraming(name) { this.framingName = name; this.kick(); }
  dragBy(dx) { this.azVel += dx * 0.0009; this.userAz += dx * 0.004; this.kick(); }
  setPointer(x, y) { this.pointer.x = x; this.pointer.y = y; }

  setActive(on) {
    if (on === this.active) return;
    this.active = on;
    if (on) { this.clock.getDelta(); this.raf = requestAnimationFrame(this.loop); }
    else cancelAnimationFrame(this.raf);
  }
  kick() { if (!this.active) { this.update(0.016); this.renderer.render(this.scene, this.camera); } }

  resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.w = w; this.h = h;
    this.mobile = w < 768 || w / h < 0.8;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.kick();
  }

  update(dt) {
    const k = 1 - Math.pow(0.0015, dt); // frame-rate independent smoothing
    this.time += dt;

    // progress / night easing
    const pk = this.reduced ? 1 : 1 - Math.pow(0.02, dt);
    this.progress += (this.targetProgress - this.progress) * pk;
    if (Math.abs(this.targetProgress - this.progress) < 1e-4) this.progress = this.targetProgress;
    this.night += (this.targetNight - this.night) * k * 0.5;
    this.applyProgress(this.progress);

    this.hemi.intensity = lerp(1.15, 0.55, this.night);
    this.sun.intensity = lerp(2.1, 0.7, this.night);

    // framing
    const f = (FRAMINGS[this.framingName] || FRAMINGS.intro)[this.mobile ? "mob" : "desk"];
    for (const key of ["sx", "sy", "dist", "h"]) this.frame[key] += (f[key] - this.frame[key]) * k * 0.6;

    // orbit: slow auto-rotate + drag inertia + pointer parallax
    this.azVel *= Math.pow(0.04, dt);
    this.userAz += this.azVel;
    this.pointer.sx += (this.pointer.x - this.pointer.sx) * k * 0.4;
    this.pointer.sy += (this.pointer.y - this.pointer.sy) * k * 0.4;
    const auto = this.reduced ? 0 : this.time * 0.045;
    const az = 0.75 + auto + this.userAz + this.pointer.sx * 0.18;
    const polar = 1.12 - this.pointer.sy * 0.06;
    const d = this.frame.dist;
    this.camera.position.set(Math.sin(az) * Math.sin(polar) * d, Math.cos(polar) * d + this.frame.h, Math.cos(az) * Math.sin(polar) * d);
    this.camera.lookAt(0, this.frame.h, 0);
    this.camera.setViewOffset(this.w, this.h, -this.frame.sx * this.w, this.frame.sy * this.h, this.w, this.h);

    // crane: slewing jib, trolley and hook tracking the working level
    if (this.crane.visible) {
      this.craneTop.rotation.y = -0.5 + Math.sin(this.time * 0.18) * 0.55;
      const reach = 9 + Math.sin(this.time * 0.23) * 3.5;
      this.trolley.position.x = reach;
      const hookY = Math.max(this.builtHeight + 2.4 - this.craneMast, -this.craneMast + 1.5) + Math.sin(this.time * 0.6) * 0.4;
      this.hook.position.y = hookY;
      this.cable.geometry.attributes.position.setY(1, hookY);
      this.cable.geometry.attributes.position.needsUpdate = true;
    }

    // dust drift
    if (!this.reduced) {
      const arr = this.dust.geometry.attributes.position.array;
      for (let i = 1; i < arr.length; i += 3) { arr[i] += dt * 0.35; if (arr[i] > 22) arr[i] = 0; }
      this.dust.geometry.attributes.position.needsUpdate = true;
      this.dust.rotation.y += dt * 0.02;
    }
    this.dust.material.opacity = 0.45 * (1 - ss(0.9, 1, this.progress) * 0.6);
  }

  loop() {
    if (!this.active) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.loop);
  }

  dispose() {
    this.setActive(false);
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
    this.disposables.forEach((d) => d.dispose && d.dispose());
    this.renderer.dispose();
    this.canvas.remove();
  }
}
