// UI remains usable even if the 3D library or WebGL fails.
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = matchMedia("(max-width: 700px)");
    const chapters = [...document.querySelectorAll(".chapter")];
    const steps = [...document.querySelectorAll(".step")];
    const dialog = document.querySelector("#quote-dialog");
    const themeButton = document.querySelector("#theme-toggle");

let isNight = false;
    let targetProgress = 0;
    let currentChapter = -1;
    let chapterOffsets = [];

const labels = [
      ["01 / Free rooftop survey", "🏠", "Discover your solar potential.", "Our experts assess your roof on-site."],
      ["02 / 3D solar design", "📐", "See your solar future.", "A custom design built for your roof."],
      ["03 / Installation & subsidy", "🔧", "We install. We handle the paperwork.", "Installation and subsidy support, start to finish."],
      ["04 / Go solar, start saving", "☀", "Welcome to your solar future.", "Generate your own power. Save every month."]
    ];

const pageExtra = document.querySelector("#page-extra");
    const journeyBar = document.querySelector(".journey");
    if (pageExtra && journeyBar && "IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => journeyBar.classList.toggle("journey--hidden", entry.isIntersecting),
        { rootMargin: "-40% 0px -40% 0px" }
      ).observe(pageExtra);
    }

function measureChapters() {
      chapterOffsets = chapters.map(chapter =>
        chapter.getBoundingClientRect().top + window.scrollY
      );
      updateScroll();
    }

function updateScroll() {
      const y = window.scrollY;
      let position = 3;

for (let i = 0; i < 3; i++) {
        if (y < chapterOffsets[i + 1]) {
          const span = chapterOffsets[i + 1] - chapterOffsets[i];
          position = i + Math.max(0, (y - chapterOffsets[i]) / Math.max(1, span));
          break;
        }
      }

targetProgress = Math.min(1, Math.max(0, position / 3));
      document.querySelector("#progress").style.transform =
        `scaleX(${targetProgress})`;

const chapter = Math.min(3, Math.floor(position + .48));
      if (chapter === currentChapter) return;
      currentChapter = chapter;

steps.forEach((step, i) => {
        step.classList.toggle("active", i === chapter);
        if (i === chapter) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });

const [label, icon, title, subtitle] = labels[chapter];
      document.querySelector("#scene-label-text").textContent = label;
      document.querySelector("#note-icon").textContent = icon;
      document.querySelector("#note-title").textContent = title;
      document.querySelector("#note-subtitle").textContent = subtitle;
    }

steps.forEach(step => {
      step.addEventListener("click", () => {
        document.getElementById(step.dataset.section).scrollIntoView({
          behavior: reducedMotion.matches ? "instant" : "smooth"
        });
      });
    });

document.querySelectorAll("[data-open-quote]").forEach(button => {
      button.addEventListener("click", () => dialog.showModal());
    });

document.querySelector(".close-modal").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom
      ) dialog.close();
    });

document.querySelector("#project-form").addEventListener("submit", event => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      const text = [
        "DHANWATT SOLAR — MY FREE SURVEY REQUEST",
        "",
        `Name: ${values.get("name")}`,
        `Email: ${values.get("email")}`,
        `Property type: ${values.get("property")}`,
        "",
        "Next step: our team will contact you to schedule",
        "your free rooftop survey.",
        "",
        "Created locally using the Dhanwatt Solar website demo.",
        "This brief has not been submitted to a company."
      ].join("\n");

const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "my-dhanwatt-solar-survey.txt";
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      document.querySelector("#form-status").textContent =
        "Your download has started. No information was sent.";
    });

themeButton.addEventListener("click", () => {
      isNight = !isNight;
      document.body.classList.toggle("night", isNight);
      themeButton.textContent = isNight ? "☼" : "☾";
      themeButton.setAttribute("aria-pressed", String(isNight));
      themeButton.setAttribute(
        "aria-label",
        isNight ? "Switch to daylight view" : "Switch to night view"
      );
    });

window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", measureChapters);
    measureChapters();

async function createExperience() {
      const THREE = await import(
        "https://unpkg.com/three@0.160.0/build/three.module.js"
      );

const stage = document.querySelector("#stage");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);

const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      renderer.setClearColor(0x000000, 0);
      stage.appendChild(renderer.domElement);

renderer.domElement.addEventListener("webglcontextlost", event => {
        event.preventDefault();
        document.querySelector("#fallback").style.display = "block";
      });

renderer.domElement.addEventListener("webglcontextrestored", () => {
        document.querySelector("#fallback").style.display = "none";
      });

const world = new THREE.Group();
      scene.add(world);

const hemi = new THREE.HemisphereLight(0xfff9eb, 0x859e8b, 3);
      scene.add(hemi);

const sunlight = new THREE.DirectionalLight(0xffe7ce, 4);
      sunlight.position.set(-3, 9, 5);
      sunlight.castShadow = true;
      sunlight.shadow.mapSize.set(2048, 2048);
      sunlight.shadow.camera.left = -12;
      sunlight.shadow.camera.right = 12;
      sunlight.shadow.camera.top = 10;
      sunlight.shadow.camera.bottom = -10;
      sunlight.shadow.normalBias = .025;
      scene.add(sunlight);

const rim = new THREE.DirectionalLight(0xffffff, 2);
      rim.position.set(5, 4, -6);
      scene.add(rim);

function material(color, roughness = .65, metalness = 0) {
        return new THREE.MeshStandardMaterial({ color, roughness, metalness });
      }

const ivory = material(0xf6f1df);
      const plaster = material(0xe8dfcd);
      const darkGreen = material(0x24463c);
      const roofMaterial = material(0x547368, .85);
      const orange = material(0xf57545, .45);
      const tireMaterial = material(0x24322f);
      const silver = material(0xbfc9c4, .28, .75);
      const glass = material(0x739b9a, .2, .35);
      const wood = material(0xb99363, .9);

const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0xa1c4bc,
        roughness: .25,
        metalness: .2,
        emissive: 0xffc36b,
        emissiveIntensity: 0
      });

function box(parent, w, h, d, mat, x = 0, y = 0, z = 0) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
      }

function cylinder(parent, rt, rb, height, mat, x, y, z, segments = 32) {
        const mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(rt, rb, height, segments), mat
        );
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
      }

// All assets are generated in code — no model downloads.
      const cellMaterial = new THREE.MeshStandardMaterial({
        color: 0x123858,
        roughness: .24,
        metalness: .58,
        emissive: 0x173d69,
        emissiveIntensity: .12
      });

const lineMaterial = material(0x91b5cb, .3, .7);

function makePanel() {
        const group = new THREE.Group();
        box(group, 1.64, .10, 2.45, silver);
        box(group, 1.55, .035, 2.36, darkGreen, 0, .065, 0);

for (let x = 0; x < 4; x++) {
          for (let z = 0; z < 6; z++) {
            const cx = (x - 1.5) * .378;
            const cz = (z - 2.5) * .385;
            box(group, .35, .018, .355, cellMaterial, cx, .09, cz);

for (const offset of [-.085, .085]) {
              box(group, .004, .002, .348, lineMaterial, cx + offset, .101, cz);
            }
          }
        }

box(group, .08, .12, 2.46, silver, -.81, .02, 0);
        box(group, .08, .12, 2.46, silver, .81, .02, 0);
        return group;
      }

const heroPanel = makePanel();
      world.add(heroPanel);

// A softly shadowed, floating architectural island.
      const island = new THREE.Group();
      world.add(island);

cylinder(island, 4.55, 4.35, .18, material(0xd9dfc8), 0, -.20, 0, 96);
      cylinder(island, 4.32, 4.48, .12, material(0xc8d0b9), 0, -.34, 0, 96);

const road = box(island, 7.3, .025, 1.30, material(0xc0c9b9), -.3, -.085, 2.30);
      for (let i = 0; i < 10; i++) {
        box(island, .35, .009, .035, ivory, -3.4 + i * .7, -.066, 2.30);
      }

const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.ShadowMaterial({ opacity: .085 })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -.42;
      shadow.receiveShadow = true;
      world.add(shadow);

// Modern house with a matching sloped roof.
      const house = new THREE.Group();
      world.add(house);

box(house, 3.85, .16, 3.40, ivory, 0, 0, 0);
      box(house, 3.40, 1.62, 2.8, plaster, 0, .86, 0);
      box(house, 3.48, .16, 2.9, ivory, 0, .14, 0);

const roofAngle = .22;

// Fill the triangular wall beneath the single-pitch roof.
      const wedgeShape = new THREE.Shape();
      wedgeShape.moveTo(-1.4, 0);
      wedgeShape.lineTo(1.4, 0);
      wedgeShape.lineTo(1.4, .63);
      wedgeShape.closePath();

const wedgeGeometry = new THREE.ExtrudeGeometry(wedgeShape, {
        depth: 3.4,
        bevelEnabled: false
      });

const wedge = new THREE.Mesh(wedgeGeometry, plaster);
      wedge.rotation.y = Math.PI / 2;
      wedge.position.set(-1.7, 1.67, 0);
      wedge.castShadow = true;
      house.add(wedge);

const roof = new THREE.Group();
      roof.position.y = 1.97;
      roof.rotation.x = roofAngle;
      house.add(roof);
      box(roof, 3.95, .15, 3.38, roofMaterial);
      box(roof, 4.02, .065, .09, darkGreen, 0, -.025, 1.7);

const sidePanels = new THREE.Group();
      roof.add(sidePanels);

[-1.25, 1.25].forEach(x => {
        const panel = makePanel();
        panel.scale.set(.43, .75, .90);
        panel.position.set(x, .13, 0);
        sidePanels.add(panel);
      });

// Front windows and door.
      box(house, 1.13, 1.04, .08, darkGreen, -.83, .94, 1.43);
      box(house, 1.00, .91, .09, windowMaterial, -.83, .94, 1.48);
      box(house, .045, .96, .10, ivory, -.83, .94, 1.53);
      box(house, 1.01, .045, .10, ivory, -.83, .94, 1.53);

box(house, .71, 1.36, .09, darkGreen, .67, .80, 1.44);
      box(house, .57, 1.24, .07, wood, .67, .80, 1.50);
      box(house, .035, .18, .035, silver, .86, .87, 1.56);

for (let i = 0; i < 7; i++) {
        box(house, .014, 1.2, .015, plaster, .44 + i * .075, .81, 1.542);
      }

// Side glazing.
      box(house, .075, 1.02, 1.58, darkGreen, 1.73, .98, -.18);
      box(house, .08, .88, 1.44, windowMaterial, 1.78, .98, -.18);
      box(house, .09, .92, .05, ivory, 1.825, .98, -.18);

box(house, 1.1, .10, .48, ivory, .67, .08, 1.94);
      box(house, 1.3, .06, .48, plaster, .67, -.01, 2.25);

// Small exterior battery.
      box(house, .16, .62, .47, ivory, 1.83, .70, .91);
      box(house, .018, .045, .22, orange, 1.922, .82, .91);

function makeTree(parent, x, z, scale = 1) {
        const tree = new THREE.Group();
        tree.position.set(x, 0, z);
        tree.scale.setScalar(scale);
        parent.add(tree);

cylinder(tree, .07, .11, .9, wood, 0, .34, 0, 9);

const foliage = material(0x688f65, 1);
        [
          [0, 1.10, 0, .55],
          [-.23, .92, .08, .41],
          [.22, 1.27, -.02, .39]
        ].forEach(([px, py, pz, radius]) => {
          const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 1), foliage);
          leaf.position.set(px, py, pz);
          leaf.castShadow = true;
          tree.add(leaf);
        });

return tree;
      }

makeTree(house, -2.25, -.60, 1.15);
      makeTree(house, 2.18, -1.30, .85);

for (let i = 0; i < 4; i++) {
        const shrub = new THREE.Mesh(
          new THREE.IcosahedronGeometry(.19, 1),
          material(0x819870)
        );
        shrub.position.set(-1.45 + i * .31, .19, 1.75);
        shrub.castShadow = true;
        house.add(shrub);
      }

// Solar delivery truck.
      const truck = new THREE.Group();
      world.add(truck);

box(truck, 2.9, .20, 1.43, darkGreen, 0, .46, 0);
      box(truck, 1.08, .93, 1.38, orange, 1.00, .94, 0);
      box(truck, 1.12, .09, 1.44, ivory, 1.00, 1.44, 0);
      box(truck, .07, .45, 1.16, glass, 1.565, 1.15, 0);
      box(truck, .62, .42, .055, glass, 1.10, 1.16, .708);
      box(truck, .62, .42, .055, glass, 1.10, 1.16, -.708);
      box(truck, .16, .045, .03, darkGreen, .82, .83, .732);

box(truck, 1.95, .13, 1.50, wood, -.46, .69, 0);
      box(truck, 2.0, .20, .06, silver, -.46, .81, .74);
      box(truck, 2.0, .20, .06, silver, -.46, .81, -.74);
      box(truck, .12, .20, 1.40, silver, 1.59, .55, 0);

const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffedbc,
        emissive: 0xffd58a,
        emissiveIntensity: .7
      });

[-.46, .46].forEach(z => {
        box(truck, .03, .17, .25, headlightMaterial, 1.66, .81, z);
      });

const wheels = [];
      [-.98, 1.02].forEach(x => {
        [-.74, .74].forEach(z => {
          const wheel = cylinder(truck, .31, .31, .18, tireMaterial, x, .32, z, 24);
          wheel.rotation.x = Math.PI / 2;
          wheels.push(wheel);
          const hub = cylinder(
            truck, .15, .15, .19, silver, x, .32, z + Math.sign(z) * .015, 20
          );
          hub.rotation.x = Math.PI / 2;
        });
      });

// Final energy ring and light particles — decorative, not output data.
      const energyRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.60, .018, 8, 100),
        new THREE.MeshBasicMaterial({
          color: 0xf8a761,
          transparent: true,
          opacity: 0
        })
      );
      energyRing.rotation.x = -Math.PI / 2;
      energyRing.position.set(.9, -.065, -.65);
      world.add(energyRing);

const sparkGeometry = new THREE.SphereGeometry(.035, 6, 6);
      const sparks = [];

for (let i = 0; i < 18; i++) {
        const spark = new THREE.Mesh(
          sparkGeometry,
          new THREE.MeshBasicMaterial({
            color: 0xf7ac5b,
            transparent: true,
            opacity: 0
          })
        );
        world.add(spark);
        sparks.push(spark);
      }

// Scroll keyframes. The same panel travels through the entire story.
      // Truck is rotated so its long cargo bed matches the panel's long axis.
      truck.rotation.y = Math.PI / 2;

const frames = [
        {
          panel: [0, 2.35, 0],
          rotation: [.93, -.20, -.12],
          scale: 1.40,
          truck: [-7, 0, 1.25],
          house: [7, 0, -.90],
          islandScale: .001,
          sideScale: .001
        },
        {
          panel: [-1.60, .92, 1.36],
          rotation: [0, 0, 0],
          scale: .91,
          truck: [-1.60, 0, .94],
          house: [3.65, 0, -1.10],
          islandScale: 1,
          sideScale: .001
        },
        {
          panel: [.90, 4.15, -.75],
          rotation: [.22, 0, 0],
          scale: 1,
          truck: [-3.35, 0, 2.05],
          house: [.90, 0, -.75],
          islandScale: 1,
          sideScale: 1
        },
        {
          panel: [.90, 2.13, -.714],
          rotation: [.22, 0, 0],
          scale: 1,
          truck: [-7, 0, 2.05],
          house: [.90, 0, -.75],
          islandScale: 1,
          sideScale: 1
        }
      ];

const lerp = THREE.MathUtils.lerp;
      const clamp = THREE.MathUtils.clamp;
      const smooth = t => t * t * (3 - 2 * t);
      const pointer = new THREE.Vector2();
      const lookTarget = new THREE.Vector3(0, 1.35, 0);

window.addEventListener("pointermove", event => {
        if (event.pointerType === "touch" || reducedMotion.matches) return;
        pointer.set(
          (event.clientX / innerWidth - .5) * 2,
          (event.clientY / innerHeight - .5) * 2
        );
      }, { passive: true });

function resize() {
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }

new ResizeObserver(resize).observe(stage);
      resize();

let displayedProgress = targetProgress;
      let lastTime = performance.now();
      let previousTruckX = -7;

function interpolatePosition(object, from, to, t) {
        object.position.set(
          lerp(from[0], to[0], t),
          lerp(from[1], to[1], t),
          lerp(from[2], to[2], t)
        );
      }

function animate(now) {
        requestAnimationFrame(animate);

const dt = Math.min((now - lastTime) / 1000, .05);
        lastTime = now;
        if (document.hidden) return;

const reduced = reducedMotion.matches;
        const time = reduced ? 0 : now * .001;

displayedProgress = reduced
          ? Math.round(targetProgress * 3) / 3
          : lerp(displayedProgress, targetProgress, 1 - Math.exp(-9 * dt));

const position = clamp(displayedProgress * 3, 0, 3);
        const segment = Math.min(2, Math.floor(position));
        const t = smooth(position - segment);
        const from = frames[segment];
        const to = frames[segment + 1];

interpolatePosition(heroPanel, from.panel, to.panel, t);
        heroPanel.rotation.set(
          lerp(from.rotation[0], to.rotation[0], t),
          lerp(from.rotation[1], to.rotation[1], t),
          lerp(from.rotation[2], to.rotation[2], t)
        );

heroPanel.scale.setScalar(lerp(from.scale, to.scale, t));

// Idle float fades away before the panel reaches the truck.
        const floatAmount = 1 - smooth(clamp(position * 2, 0, 1));
        if (!reduced) {
          heroPanel.position.y += Math.sin(time * 1.25) * .09 * floatAmount;
          heroPanel.rotation.z += Math.sin(time * .6) * .035 * floatAmount;
        }

// Arc upward during the truck-to-rooftop transfer.
        if (segment === 1 && !reduced) {
          heroPanel.position.y += Math.sin(t * Math.PI) * .55;
        }

interpolatePosition(truck, from.truck, to.truck, t);
        interpolatePosition(house, from.house, to.house, t);

island.scale.setScalar(lerp(from.islandScale, to.islandScale, t));
        sidePanels.scale.setScalar(lerp(from.sideScale, to.sideScale, t));

const environmentVisible = position > .025;
        island.visible = environmentVisible;
        house.visible = environmentVisible;
        truck.visible = position > .015 && position < 2.96;

const truckDelta = truck.position.x - previousTruckX;
        wheels.forEach(wheel => wheel.rotation.y -= truckDelta * 2);
        previousTruckX = truck.position.x;

const powered = smooth(clamp((position - 2.65) / .35, 0, 1));
        windowMaterial.emissiveIntensity = powered * (isNight ? 2.1 : .48);
        cellMaterial.emissiveIntensity = .12 + powered * .16;

energyRing.material.opacity = powered * .48;
        energyRing.scale.setScalar(1 + Math.sin(time * 1.4) * .018 * powered);

sparks.forEach((spark, i) => {
          const angle = i * 2.39996 + time * .09;
          const cycle = (time * .18 + i / sparks.length) % 1;
          spark.position.set(
            .9 + Math.cos(angle) * (1.5 + (i % 3) * .30),
            .4 + cycle * 2.7,
            -.75 + Math.sin(angle) * 1.65
          );
          spark.material.opacity = reduced
            ? 0
            : powered * Math.sin(cycle * Math.PI) * .55;
        });

const lightingBlend = 1 - Math.exp(-4 * dt);
        hemi.intensity = lerp(hemi.intensity, isNight ? .8 : 3, lightingBlend);
        sunlight.intensity = lerp(sunlight.intensity, isNight ? .65 : 4, lightingBlend);
        rim.intensity = lerp(rim.intensity, isNight ? 2.8 : 2, lightingBlend);

// Small pointer parallax, not an intrusive full-scene rotation.
        const mobile = mobileQuery.matches;
        const distance = mobile ? 1.16 : 1;
        const px = reduced || mobile ? 0 : pointer.x * .33;
        const py = reduced || mobile ? 0 : pointer.y * .18;

camera.position.set(
          7.1 * distance + px,
          6.0 * distance + py,
          9.2 * distance
        );

lookTarget.set(.15, lerp(1.95, 1.20, smooth(clamp(position, 0, 1))), 0);
        camera.lookAt(lookTarget);

renderer.render(scene, camera);
      }

requestAnimationFrame(animate);
    }

createExperience().catch(error => {
      console.error("The 3D experience could not start:", error);
      const canvas = document.querySelector("#stage canvas");
      if (canvas) canvas.remove();
      document.querySelector("#fallback").style.display = "block";
    });

// ---- Solar savings calculator (simple estimate, not the 3D scene) ----
const calcRun = document.querySelector("#calc-run");
    if (calcRun) {
      calcRun.addEventListener("click", () => {
        const bill = parseFloat(document.querySelector("#calc-bill").value) || 0;
        const area = parseFloat(document.querySelector("#calc-area").value) || 0;

// Rough, illustrative assumptions for a first estimate only.
        const unitsPerMonth = bill / 8; // approx ₹/unit
        const sizeFromBill = unitsPerMonth / 120; // approx kWh per kW per month
        const sizeFromArea = area / 100; // approx 100 sq ft per kW
        const systemSize = area > 0
          ? Math.max(1, Math.min(sizeFromBill, sizeFromArea))
          : Math.max(1, sizeFromBill);

const monthlySavings = Math.min(bill * 0.85, systemSize * 120 * 8);
        const systemCost = systemSize * 55000; // approx installed ₹/kW before subsidy
        const paybackYears = monthlySavings > 0 ? systemCost / (monthlySavings * 12) : 0;

document.querySelector("#calc-size").textContent = `${systemSize.toFixed(1)} kW`;
        document.querySelector("#calc-savings").textContent =
          `₹${Math.round(monthlySavings).toLocaleString("en-IN")}`;
        document.querySelector("#calc-payback").textContent =
          paybackYears > 0 ? `${paybackYears.toFixed(1)} years` : "—";
      });
    }
