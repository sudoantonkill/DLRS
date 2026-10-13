import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '../utils/soundFx';
import { PlusCircle, Compass, MapPin, Globe2, Eye, ShieldCheck, ChevronRight } from 'lucide-react';

// Convert Lat/Lng to 3D Cartesian coordinates on a sphere of radius R
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Convert 3D Cartesian point on unit sphere to Lat/Lng
function vector3ToLatLng(v) {
  const normalized = v.clone().normalize();
  const phi = Math.acos(Math.min(Math.max(normalized.y, -1), 1));
  const lat = 90 - (phi * 180 / Math.PI);
  const theta = Math.atan2(normalized.z, -normalized.x);
  let lng = (theta * 180 / Math.PI) - 180;
  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;
  return { lat, lng };
}

// Generate realistic procedural Earth satellite texture as immediate zero-latency fallback
function createRealisticEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // 1. Photorealistic Oceanic Depths
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0, '#0d223f');
  oceanGrad.addColorStop(0.3, '#103964');
  oceanGrad.addColorStop(0.5, '#124375');
  oceanGrad.addColorStop(0.7, '#103964');
  oceanGrad.addColorStop(1, '#0d223f');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Helper to draw continent with natural land colors and coastal shallow waters
  const drawContinent = (points, fillColor, shelfColor = '#1f6a8e') => {
    // Coastal shelf
    ctx.strokeStyle = shelfColor;
    ctx.lineWidth = 14;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      const px = ((x + 180) / 360) * 2048;
      const py = ((90 - y) / 180) * 1024;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();

    // Solid continent body
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      const px = ((x + 180) / 360) * 2048;
      const py = ((90 - y) / 180) * 1024;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
  };

  // Eurasia (Europe + Asia green & steppe)
  drawContinent([
    [-10, 36], [0, 44], [10, 55], [30, 70], [60, 72], [100, 75],
    [140, 70], [170, 65], [140, 40], [120, 25], [105, 10], [98, 20],
    [70, 25], [50, 28], [40, 35], [25, 36], [15, 38], [-5, 36]
  ], '#2f5e32');

  // Indian Subcontinent (Rich green / alluvial)
  drawContinent([
    [68, 24], [72, 32], [78, 35], [88, 27], [92, 22], [82, 16],
    [80, 8], [77, 8], [73, 15], [68, 24]
  ], '#3b7437');

  // Africa (Sahara desert gold + Congo rainforest green)
  drawContinent([
    [-17, 15], [-5, 35], [12, 37], [32, 32], [44, 12], [51, 10],
    [40, -10], [35, -25], [28, -34], [18, -34], [12, -5], [0, 5], [-17, 15]
  ], '#a18a52'); // Sahara warm desert
  // Central/South Africa green overlay
  drawContinent([
    [-5, 5], [12, 5], [38, 5], [40, -10], [32, -26], [24, -28], [12, -5], [-5, 5]
  ], '#29542a');

  // North America (Plains & Boreal forest)
  drawContinent([
    [-165, 65], [-140, 70], [-100, 72], [-60, 60], [-65, 45], [-75, 35],
    [-80, 25], [-97, 18], [-105, 20], [-120, 34], [-125, 48], [-165, 65]
  ], '#395e34');

  // South America (Amazon Basin deep green + Patagonia)
  drawContinent([
    [-78, 10], [-60, 8], [-35, -5], [-38, -15], [-45, -25], [-55, -38],
    [-68, -55], [-75, -45], [-70, -20], [-80, -2], [-78, 10]
  ], '#255227');

  // Australia (Red outback desert & eastern green belt)
  drawContinent([
    [114, -22], [125, -15], [135, -12], [148, -18], [152, -28],
    [148, -38], [135, -35], [115, -34], [114, -22]
  ], '#9c5a35');

  // Antarctica & Greenland (Pristine Polar Ice)
  ctx.fillStyle = '#edf4fa';
  // Antarctica bottom shelf
  ctx.beginPath();
  ctx.rect(0, 930, 2048, 94);
  ctx.fill();

  // Greenland ice sheet
  ctx.beginPath();
  ctx.ellipse((( -42 + 180) / 360) * 2048, ((90 - 72) / 180) * 1024, 70, 95, 0, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// Create a high-tech floating 3D billboard text badge for pins
function createPinTextSprite(text, color = '#00f0ff', isSelected = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = isSelected ? 'rgba(0, 240, 255, 0.92)' : 'rgba(3, 10, 24, 0.88)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(8, 10, 424, 80, 14);
  ctx.fill();
  ctx.stroke();

  // Decorative corner accents
  ctx.fillStyle = color;
  ctx.fillRect(14, 16, 6, 6);
  ctx.fillRect(420, 16, 6, 6);

  ctx.fillStyle = isSelected ? '#020611' : '#ffffff';
  ctx.font = 'bold 26px "Space Grotesk", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 220, 50);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(3.4, 0.78, 1);
  return sprite;
}

export default function Globe3D({
  targetPlot,
  isDescent = false,
  onZoomComplete,
  onSelectPlot,
  registeredPlots = [],
  isRegisterMode = false,
  newPlotCoords = null,
  onLocationPicked,
  onTriggerDescent,
  onOpenRegister
}) {
  const mountRef = useRef(null);
  const animFrameRef = useRef(null);
  const sceneStateRef = useRef({});

  const [altitudeKm, setAltitudeKm] = useState(35786);
  const [telemetryStatus, setTelemetryStatus] = useState("REAL EARTH ORBIT // SATELLITE OPTICS ONLINE");
  const [zoomProgress, setZoomProgress] = useState(0);
  const [hoveredPlot, setHoveredPlot] = useState(null);
  const [clickCoords, setClickCoords] = useState(null);
  const [textureStatus, setTextureStatus] = useState("LOADING NASA SATELLITE TILES...");

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    let width = currentMount.clientWidth || window.innerWidth;
    let height = currentMount.clientHeight || window.innerHeight;
    if (width === 0) width = window.innerWidth;
    if (height === 0) height = window.innerHeight;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010309);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 8, 44);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    currentMount.innerHTML = '';
    currentMount.appendChild(renderer.domElement);

    // --- LIGHTING (Natural Sun & Ambient Space Illumination) ---
    const ambientLight = new THREE.AmbientLight(0x445566, 1.3);
    scene.add(ambientLight);

    // Main Sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.7);
    sunLight.position.set(60, 20, 45);
    scene.add(sunLight);

    // Soft celestial rim fill light
    const fillLight = new THREE.DirectionalLight(0x336699, 0.85);
    fillLight.position.set(-50, -15, -30);
    scene.add(fillLight);

    // --- DEEP SPACE STARFIELD ---
    const starCount = 2400;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 800;
      starPositions[i + 1] = (Math.random() - 0.5) * 800;
      starPositions[i + 2] = (Math.random() - 0.5) * 800;

      const shade = 0.8 + Math.random() * 0.2;
      starColors[i] = shade;
      starColors[i + 1] = shade;
      starColors[i + 2] = shade * (Math.random() > 0.5 ? 1.0 : 0.85);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // --- REAL EARTH SPHERE ---
    const earthRadius = 14;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);

    // Initial realistic satellite procedural texture
    const fallbackTexture = createRealisticEarthTexture();
    const earthMat = new THREE.MeshPhongMaterial({
      map: fallbackTexture,
      shininess: 28,
      specular: new THREE.Color(0x225588),
      bumpScale: 0.08
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);

    // Master rotating Earth group
    const earthGroup = new THREE.Group();
    earthGroup.add(earthMesh);
    scene.add(earthGroup);

    // --- ASYNC LOAD HIGH-RES NASA BLUE MARBLE TEXTURES ---
    const texLoader = new THREE.TextureLoader();
    texLoader.load(
      '/textures/earth_blue_marble.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        earthMat.map = texture;
        earthMat.needsUpdate = true;
        setTextureStatus("NASA BLUE MARBLE // 2K SATELLITE OPTICS ACTIVE");
      },
      undefined,
      () => {
        // Fallback to earth_atmos_2048 if blue_marble is not available
        texLoader.load('/textures/earth_atmos_2048.jpg', (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          earthMat.map = tex;
          earthMat.needsUpdate = true;
          setTextureStatus("NASA ATMOS OPTICS ACTIVE");
        });
      }
    );

    // Load specular water map & elevation normal bump map
    texLoader.load('/textures/earth_specular_2048.jpg', (spec) => {
      earthMat.specularMap = spec;
      earthMat.needsUpdate = true;
    });
    texLoader.load('/textures/earth_normal_2048.jpg', (norm) => {
      earthMat.bumpMap = norm;
      earthMat.bumpScale = 0.06;
      earthMat.needsUpdate = true;
    });

    // --- REAL ATMOSPHERIC CLOUD LAYER ---
    const cloudsGeo = new THREE.SphereGeometry(earthRadius * 1.012, 64, 64);
    const cloudsMat = new THREE.MeshLambertMaterial({
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthGroup.add(cloudsMesh);

    texLoader.load('/textures/earth_clouds_1024.png', (cloudTex) => {
      cloudsMat.map = cloudTex;
      cloudsMat.needsUpdate = true;
    });

    // --- REALISTIC ATMOSPHERE RAYLEIGH BLUE GLOW RIM ---
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.06, 48, 48);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
          // Soft true atmospheric blue (not neon cyan)
          gl_FragColor = vec4(0.32, 0.62, 1.0, 1.0) * intensity * 1.5;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

    // --- PINS / BEACONS FOR REGISTERED LAND PARCELS ---
    const pinsGroup = new THREE.Group();
    earthGroup.add(pinsGroup);

    const pinClickTargets = []; // Store hitboxes for raycasting

    registeredPlots.forEach((plot) => {
      const isSelected = targetPlot?.id === plot.id;
      const pos = latLngToVector3(plot.lat, plot.lng, earthRadius);
      const color = plot.boundaryColor || '#00f0ff';

      const parcelGroup = new THREE.Group();
      parcelGroup.userData = { plot };

      // 1. Pin needle standing perpendicular to Earth surface
      const needleGeo = new THREE.CylinderGeometry(0.08, 0.16, 2.0, 16);
      needleGeo.translate(0, 1.0, 0);
      needleGeo.rotateX(Math.PI / 2);
      const needleMat = new THREE.MeshBasicMaterial({ color: isSelected ? '#ffffff' : color });
      const needle = new THREE.Mesh(needleGeo, needleMat);
      needle.position.copy(pos);
      needle.lookAt(pos.clone().multiplyScalar(2));
      parcelGroup.add(needle);

      // 2. Glowing beacon head
      const headRadius = isSelected ? 0.44 : 0.32;
      const headGeo = new THREE.SphereGeometry(headRadius, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffffff : color
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.copy(pos.clone().normalize().multiplyScalar(earthRadius + 2.0));
      parcelGroup.add(head);

      // 3. Ground pulse ring
      const ringGeo = new THREE.RingGeometry(0.25, isSelected ? 0.95 : 0.7, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.9 : 0.6
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos.clone().multiplyScalar(1.008));
      ring.lookAt(pos.clone().multiplyScalar(2));
      parcelGroup.add(ring);

      // 4. Floating 3D billboard text badge
      const shortName = plot.name.split('//')[1]?.trim() || plot.location.split(',')[0] || `Plot ${plot.id}`;
      const labelSprite = createPinTextSprite(`#${plot.id} ${shortName}`, color, isSelected);
      labelSprite.position.copy(pos.clone().normalize().multiplyScalar(earthRadius + 2.85));
      parcelGroup.add(labelSprite);

      // 5. Invisible larger hit target sphere for easy clicking
      const hitGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitSphere = new THREE.Mesh(hitGeo, hitMat);
      hitSphere.position.copy(pos.clone().normalize().multiplyScalar(earthRadius + 1.8));
      hitSphere.userData = { plot };
      parcelGroup.add(hitSphere);
      pinClickTargets.push(hitSphere);

      pinsGroup.add(parcelGroup);
    });

    // --- TEMPORARY ANCHOR FOR NEW REGISTRATION ---
    let tempAnchorGroup = null;
    if (newPlotCoords) {
      tempAnchorGroup = new THREE.Group();
      const pos = latLngToVector3(newPlotCoords.lat, newPlotCoords.lng, earthRadius);

      const pinGeo = new THREE.CylinderGeometry(0.1, 0.22, 2.4, 16);
      pinGeo.translate(0, 1.2, 0);
      pinGeo.rotateX(Math.PI / 2);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(pos);
      pin.lookAt(pos.clone().multiplyScalar(2));
      tempAnchorGroup.add(pin);

      const headGeo = new THREE.SphereGeometry(0.48, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.copy(pos.clone().normalize().multiplyScalar(earthRadius + 2.4));
      tempAnchorGroup.add(head);

      const label = createPinTextSprite(`[NEW PLACEMENT ANCHOR]`, '#39ff14', true);
      label.position.copy(pos.clone().normalize().multiplyScalar(earthRadius + 3.4));
      tempAnchorGroup.add(label);

      pinsGroup.add(tempAnchorGroup);
    }

    // Save refs for interaction & animation
    sceneStateRef.current = {
      scene,
      camera,
      renderer,
      earthGroup,
      earthMesh,
      cloudsMesh,
      pinClickTargets
    };

    // Calculate rotation to center on target plot OR active registration coordinates
    const activeLat = (isRegisterMode && newPlotCoords) ? newPlotCoords.lat : (targetPlot?.lat ?? 19.0596);
    const activeLng = (isRegisterMode && newPlotCoords) ? newPlotCoords.lng : (targetPlot?.lng ?? 72.8295);

    const targetPhi = (90 - activeLat) * (Math.PI / 180);
    const targetTheta = (activeLng + 180) * (Math.PI / 180);
    const desiredRotY = -targetTheta + Math.PI / 2;
    const desiredRotX = -(targetPhi - Math.PI / 2);

    // Orientation: immediately focus on active coordinates
    earthGroup.rotation.y = desiredRotY;
    earthGroup.rotation.x = desiredRotX * 0.4;

    // --- USER INTERACTION (ORBIT ROTATION & RAYCAST CLICKING) ---
    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let dragDistance = 0;
    let userRotVelocityY = 0;
    let userRotVelocityX = 0;
    let cameraDistance = 44;
    let isAutoRotating = true;

    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onMouseDown = (e) => {
      isDragging = true;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      dragDistance = 0;
      userRotVelocityY = 0;
      userRotVelocityX = 0;
      isAutoRotating = false;
    };

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging && !isDescent) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        dragDistance += Math.abs(dx) + Math.abs(dy);

        earthGroup.rotation.y += dx * 0.0055;
        earthGroup.rotation.x += dy * 0.0055;

        // Clamp vertical tilt
        earthGroup.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, earthGroup.rotation.x));

        userRotVelocityY = dx * 0.003;
        userRotVelocityX = dy * 0.003;

        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Hover Raycast check on Pins
        raycaster.setFromCamera(mouseCoord, camera);
        const pinHits = raycaster.intersectObjects(pinClickTargets, false);
        if (pinHits.length > 0) {
          renderer.domElement.style.cursor = 'pointer';
          setHoveredPlot(pinHits[0].object.userData.plot);
        } else {
          renderer.domElement.style.cursor = isRegisterMode ? 'crosshair' : 'grab';
          setHoveredPlot(null);
        }
      }
    };

    const onMouseUp = (e) => {
      if (!isDragging) return;
      isDragging = false;

      // Click detected (small movement threshold)
      if (dragDistance < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseCoord, camera);

        // 1. First check if a Pin was clicked
        const pinHits = raycaster.intersectObjects(pinClickTargets, false);
        if (pinHits.length > 0) {
          const clickedPlot = pinHits[0].object.userData.plot;
          sound.playTargetLock();
          if (onSelectPlot) {
            onSelectPlot(clickedPlot);
          }
          return;
        }

        // 2. If Earth surface was clicked
        const earthHits = raycaster.intersectObject(earthMesh, false);
        if (earthHits.length > 0) {
          const hitPoint = earthHits[0].point;
          // Convert hit in world space to local space on earthMesh
          const localHit = earthGroup.worldToLocal(hitPoint.clone());
          const geo = vector3ToLatLng(localHit);
          setClickCoords(geo);
          sound.playClick();

          if (isRegisterMode && onLocationPicked) {
            onLocationPicked(geo.lat, geo.lng);
          }
        }
      }
    };

    const onWheel = (e) => {
      if (isDescent) return;
      e.preventDefault();
      cameraDistance += e.deltaY * 0.025;
      cameraDistance = Math.max(18, Math.min(65, cameraDistance));
      camera.position.z = cameraDistance;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // --- ANIMATION LOOP ---
    let descentStartTime = null;
    const descentDurationMs = 3800;

    const animate = (timestamp) => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Independent cloud rotation for realistic planetary atmosphere
      cloudsMesh.rotation.y += 0.0006;

      if (!isDescent) {
        // Smooth rotation damping inertia
        if (!isDragging) {
          earthGroup.rotation.y += userRotVelocityY;
          earthGroup.rotation.x += userRotVelocityX;
          userRotVelocityY *= 0.94;
          userRotVelocityX *= 0.94;

          // Gentle ambient planetary drift
          if (isAutoRotating) {
            earthGroup.rotation.y += 0.0012;
          }
        }

        camera.position.z = cameraDistance;
        camera.lookAt(0, 0, 0);
      } else {
        // --- CINEMATIC SUPERSPEED DESCENT TO SURFACE ---
        if (!descentStartTime) {
          descentStartTime = timestamp;
          sound.playWarpDescent();
          sound.playBassThud();
        }

        const elapsed = timestamp - descentStartTime;
        const progress = Math.min(elapsed / descentDurationMs, 1.0);
        setZoomProgress(progress);

        // Smooth cubic ease curve
        const easeT = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const currentAlt = Math.max(0.1, Math.round((1 - easeT) * 35786));
        setAltitudeKm(currentAlt);

        if (progress < 0.3) {
          setTelemetryStatus("CALCULATING ORBITAL RECON VECTOR // STABLE ENTRY");
        } else if (progress < 0.65) {
          setTelemetryStatus("ATMOSPHERIC INGRESS // DECELERATING SATELLITE SENSORS");
        } else if (progress < 0.9) {
          setTelemetryStatus("SURFACE OPTICAL LOCK // CONNECTING HIGH-RES ESRI MAP");
        } else {
          setTelemetryStatus("TARGET ACQUIRED // ENGAGING SATELLITE HUD");
        }

        // Align Earth smoothly to center on target coordinates
        earthGroup.rotation.y = THREE.MathUtils.lerp(earthGroup.rotation.y, desiredRotY, 0.08);
        earthGroup.rotation.x = THREE.MathUtils.lerp(earthGroup.rotation.x, desiredRotX, 0.08);

        // Plunge camera directly toward the surface
        const startZ = 44;
        const endZ = earthRadius + 1.2;
        const currentDist = THREE.MathUtils.lerp(startZ, endZ, easeT);
        camera.position.set(0, 0, currentDist);
        camera.lookAt(0, 0, 0);

        if (progress >= 1.0 && onZoomComplete) {
          onZoomComplete();
        }
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Resize Observer to handle dynamic container resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(currentMount);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);

      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudsGeo.dispose();
      cloudsMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, [targetPlot, isDescent, registeredPlots, newPlotCoords, isRegisterMode]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Three.js Real Earth Canvas */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: isDescent ? 'wait' : (isRegisterMode ? 'crosshair' : 'grab')
        }}
      />

      {/* Cinematic Telemetry HUD */}
      <div className="hud-overlay" style={{ pointerEvents: 'none' }}>
        
        {/* Top-Left Telemetry */}
        <div className="hud-corner top-left">
          <div className="hud-tag">
            <Globe2 size={12} className="inline mr-1 text-cyan" />
            <span>REAL EARTH SATELLITE VIEW</span>
          </div>
          <div className="hud-value font-mono">
            ALTITUDE: <span style={{ color: '#00f0ff' }}>{altitudeKm.toLocaleString()} KM</span>
          </div>
          <div className="hud-sub">
            {targetPlot ? `LOCKED: ${targetPlot.name}` : "MUMBAI GEOSPATIAL CLUSTER"}
          </div>
          <div className="hud-coord font-mono">
            LAT: {targetPlot?.lat?.toFixed(4) ?? "19.0596"}° N | LNG: {targetPlot?.lng?.toFixed(4) ?? "72.8295"}° E
          </div>
          <div className="hud-sub text-green font-mono text-xs mt-1">
            ● {textureStatus}
          </div>
        </div>

        {/* Top-Right Orbital Sensors & Registration Indicator */}
        <div className="hud-corner top-right">
          <div className="hud-tag">ORBITAL LEDGER STATUS</div>
          <div className="hud-value font-mono" style={{ color: '#00ff88' }}>
            ● {registeredPlots.length} REGISTERED PARCELS ON GLOBE
          </div>
          <div className="hud-sub">CHAIN: ETHEREUM SEPOLIA (11155111)</div>

          {isRegisterMode && (
            <div className="register-hud-hint font-mono" style={{ marginTop: '8px', color: '#39ff14', fontSize: '11px' }}>
              ▶ REGISTRATION ACTIVE: CLICK ANYWHERE ON GLOBE TO PIN LOCATION
            </div>
          )}

          {clickCoords && (
            <div className="hud-coord font-mono" style={{ color: '#ffd700', marginTop: '4px' }}>
              PICKED: {clickCoords.lat.toFixed(4)}° N, {clickCoords.lng.toFixed(4)}° E
            </div>
          )}
        </div>

        {/* Hovered Plot Quick Tooltip on Globe */}
        {hoveredPlot && (
          <div
            className="globe-hover-tooltip font-mono"
            style={{
              position: 'absolute',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(2, 8, 22, 0.92)',
              border: '1px solid #00f0ff',
              padding: '8px 18px',
              borderRadius: '6px',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)',
              color: '#ffffff',
              fontSize: '12px'
            }}
          >
            <div style={{ color: '#00f0ff', fontWeight: 'bold' }}>PARCEL #{hoveredPlot.id} // {hoveredPlot.name}</div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>{hoveredPlot.location} &bull; {hoveredPlot.area?.toLocaleString()} SQ FT</div>
            <div style={{ color: '#00ff88', fontSize: '10px', marginTop: '2px' }}>[ CLICK TO INSPECT DOSSIER ]</div>
          </div>
        )}

        {/* Interactive Bottom Control Toolbar */}
        <div
          className="hud-bottom-bar font-mono"
          style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="hud-blink-dot" />
            <span>{telemetryStatus}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Quick Register Land Button */}
            <button
              className="hud-action-btn register font-mono"
              onClick={() => {
                sound.playClick();
                if (onOpenRegister) onOpenRegister();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(57, 255, 20, 0.15)',
                border: '1px solid #39ff14',
                color: '#39ff14',
                padding: '6px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                letterSpacing: '1px'
              }}
            >
              <PlusCircle size={13} />
              <span>+ REGISTER NEW LAND</span>
            </button>

            {/* Commence Descent Button */}
            {onTriggerDescent && (
              <button
                className="hud-action-btn descent font-mono"
                onClick={() => {
                  sound.playClick();
                  onTriggerDescent();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid #00f0ff',
                  color: '#00f0ff',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  letterSpacing: '1px'
                }}
              >
                <ChevronRight size={13} />
                <span>DESCENT TO HIGH-RES SATELLITE MAP</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar during descent */}
        {isDescent && (
          <div className="hud-progress-bar-wrap" style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', height: '4px' }}>
            <div
              className="hud-progress-bar"
              style={{ width: `${Math.round(zoomProgress * 100)}%`, height: '100%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }}
            />
          </div>
        )}

      </div>
    </div>
  );
}
