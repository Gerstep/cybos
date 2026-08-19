/* ══════════════════════════════════════════════════════════════════════════
   THE COMMONS — a sunlit ring garden, grown at runtime
   ══════════════════════════════════════════════════════════════════════════

   Ten thousand stems stand in a circle of warm daylight. Every one of them
   is planted and none of them has flowered, because the real count is zero
   and this fund does not pretend otherwise. Light runs around the inside of
   the ring rather than down through it — mutual aid, not charity — and the
   wind crosses the whole meadow in slow gusts. Put a pointer into it and the
   grass parts and lifts, and seed catches the sun where your hand passed.

   When somebody joins, one stem blooms. That is the only way gold enters
   this garden.

   Nothing here is a photograph or a model file. The stems, the flowers, the
   sky, the ground and the light are all built from a fixed seed on load, so
   the same garden grows every time.

   Exposed as window.FRDMScene: .ignite() opens a flower.
   ══════════════════════════════════════════════════════════════════════════ */
import * as THREE from './three.module.min.js';

(function () {
  'use strict';

  var canvas = document.getElementById('scene');
  if (!canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.documentElement.classList.add('reduced');
    return;
  }

  var T = THREE;
  T.ColorManagement.enabled = false;

  /* ── the world's dimensions ──────────────────────────────────────────── */
  var RING_R = 7.2;          // radius of the planted circle
  var BAND = 2.05;           // how wide the planting band is
  var GROUND_R = 78;         // the visible plain
  var TAU = Math.PI * 2;

  var narrow = window.matchMedia('(max-width: 760px)');

  /* Fill rate and vertex count are the two costs here, so the tiers trade
     pixel ratio, blade detail and the ambient extras. The stem count never
     moves: ten thousand is the argument. */
  var TIERS = [
    { dpr: 2.0, segs: 4, threads: 96, pollen: 900, shade: true },
    { dpr: 1.4, segs: 3, threads: 60, pollen: 480, shade: true },
    { dpr: 1.0, segs: 2, threads: 28, pollen: 200, shade: false }
  ];

  var qs = new URLSearchParams(window.location.search);
  var forced = qs.get('quality');
  if (forced === 'off') {
    document.documentElement.classList.add('no-webgl');
    return;
  }
  var tier = forced === 'low' ? 2 : forced === 'medium' ? 1 : narrow.matches ? 1 : 0;
  var tierLocked = !!forced;

  var STEMS = Math.max(1, Math.min(24000, parseInt(qs.get('stems'), 10) || 10000));
  var MAX_THREADS = 96;
  var THREAD_SEGS = 22;
  var MAX_POLLEN = 900;
  var MAX_BLOOMS = 64;

  /* ── palette, in the same sRGB values the stylesheet uses ────────────── */
  var SUN_COL = [1.0, 0.92, 0.74];
  var SKY_TOP = [0.216, 0.478, 0.663];
  var SKY_LOW = [1.0, 0.898, 0.686];
  var HAZE = [0.929, 0.902, 0.784];
  var GRASS_BASE = [0.067, 0.184, 0.118];
  var GRASS_TIP = [0.584, 0.776, 0.318];
  var EARTH = [0.427, 0.353, 0.251];
  var PLAIN = [0.706, 0.714, 0.51];
  var GOLD = [0.945, 0.686, 0.204];

  function v3(a) { return new T.Vector3(a[0], a[1], a[2]); }

  /* Low and across the pool, inside the hero's frustum: the water gets a
     glint path, the far rim is rimmed, and the near stems are backlit. Late
     afternoon, not noon. */
  var SUN_DIR = new T.Vector3(0.58, 0.155, -0.8).normalize();

  /* ── deterministic noise ─────────────────────────────────────────────── */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rnd = mulberry32(0x0c1c1e5f);

  /* An integer hash, not a sine: the lattice is only ever read at whole
     coordinates, and Math.sin at this call count costs more than the rest of
     the builder put together. */
  function hash2(x, y) {
    var h = (x * 374761393 + y * 668265263) | 0;
    h = (h ^ (h >>> 13)) * 1274126177 | 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function vnoise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y);
    var xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = hash2(xi, yi), b = hash2(xi + 1, yi);
    var c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  }
  function fbm(x, y) {
    return vnoise(x, y) * 0.55 + vnoise(x * 2.03, y * 2.03) * 0.28 + vnoise(x * 4.11, y * 4.11) * 0.17;
  }

  /* ══════════════════════════════════════════════════════════════════════
     RENDERER
     ══════════════════════════════════════════════════════════════════════ */
  var gl = null;
  try {
    gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: true,
      powerPreference: 'high-performance'
    });
  } catch (err) { gl = null; }
  if (!gl) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  var renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: canvas, context: gl, antialias: false });
  } catch (err) {
    document.documentElement.classList.add('no-webgl');
    return;
  }
  renderer.outputColorSpace = T.LinearSRGBColorSpace;
  renderer.setClearColor(0xf5eed9, 1);

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(38, 1, 0.35, 400);

  /* ── shared uniforms ─────────────────────────────────────────────────── */
  var uTime = { value: 0 };
  var uFade = { value: 0 };
  var uWind = { value: 0.3 };
  var uPointer = { value: new T.Vector3(9999, 0, 9999) };
  var uReach = { value: 3.2 };
  var uSunDir = { value: SUN_DIR.clone() };
  var uSunCol = { value: v3(SUN_COL) };
  var uHaze = { value: v3(HAZE) };
  var uPixel = { value: 1 };

  var LIGHT_GLSL = [
    'uniform vec3 uSunDir;',
    'uniform vec3 uSunCol;',
    'uniform vec3 uHaze;',
    /* Sky fill from above and a warm bounce off the plain below: two cheap
       hemisphere terms do more for a meadow than any number of lamps. */
    'vec3 ambientAt(vec3 n){',
    '  float up = n.y * 0.5 + 0.5;',
    '  vec3 skyFill = vec3(0.44, 0.54, 0.6) * 0.5;',
    '  vec3 bounce  = vec3(0.68, 0.58, 0.38) * 0.42;',
    '  return mix(bounce, skyFill, up);',
    '}'
  ].join('\n');

  /* ══════════════════════════════════════════════════════════════════════
     SKY — one inverted sphere, graded from a warm horizon to a cool zenith
     ══════════════════════════════════════════════════════════════════════ */
  var skyMat = new T.ShaderMaterial({
    side: T.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTop: { value: v3(SKY_TOP) },
      uLow: { value: v3(SKY_LOW) },
      uSunDir: uSunDir,
      uSunCol: uSunCol
    },
    vertexShader: [
      'varying vec3 vDir;',
      'void main(){',
      '  vDir = normalize(position);',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uTop; uniform vec3 uLow; uniform vec3 uSunDir; uniform vec3 uSunCol;',
      'varying vec3 vDir;',
      'void main(){',
      '  vec3 d = normalize(vDir);',
      '  float h = clamp(d.y * 1.5 + 0.1, 0.0, 1.0);',
      '  vec3 col = mix(uLow, uTop, pow(h, 0.62));',
      /* The sun is not drawn as a disc — only as the glow it throws into the
         air around it, which is all you ever see looking across a field. */
      '  float toSun = max(dot(d, uSunDir), 0.0);',
      '  col += uSunCol * pow(toSun, 22.0) * 0.3;',
      '  col += uSunCol * pow(toSun, 320.0) * 0.8;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n')
  });
  var sky = new T.Mesh(new T.SphereGeometry(220, 24, 16), skyMat);
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  scene.add(sky);

  /* ══════════════════════════════════════════════════════════════════════
     THE PLAIN — warm ground fading into the haze, with the ring's shadow
     ══════════════════════════════════════════════════════════════════════ */
  var groundMat = new T.ShaderMaterial({
    uniforms: {
      uSunDir: uSunDir, uSunCol: uSunCol, uHaze: uHaze,
      uPlain: { value: v3(PLAIN) },
      uEarth: { value: v3(EARTH) },
      uRing: { value: RING_R },
      uBand: { value: BAND },
      uTime: uTime
    },
    vertexShader: [
      'varying vec3 vW;',
      'void main(){',
      '  vec4 w = modelMatrix * vec4(position, 1.0);',
      '  vW = w.xyz;',
      '  gl_Position = projectionMatrix * viewMatrix * w;',
      '}'
    ].join('\n'),
    fragmentShader: [
      LIGHT_GLSL,
      'uniform vec3 uPlain; uniform vec3 uEarth; uniform float uRing; uniform float uBand;',
      'varying vec3 vW;',
      'float h21(vec2 p){ return fract(sin(dot(p, vec2(41.7, 289.3))) * 43758.5453); }',
      'float n2(vec2 p){',
      '  vec2 i = floor(p), f = fract(p);',
      '  f = f * f * (3.0 - 2.0 * f);',
      '  float a = h21(i), b = h21(i + vec2(1,0)), c = h21(i + vec2(0,1)), d = h21(i + vec2(1,1));',
      '  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);',
      '}',
      'void main(){',
      '  float r = length(vW.xz);',
      '  float grain = n2(vW.xz * 0.22) * 0.6 + n2(vW.xz * 1.7) * 0.26 + n2(vW.xz * 6.1) * 0.14;',
      '  vec3 col = uPlain * (0.78 + grain * 0.44);',
      /* Turned earth under the planting band, so the stems look sown rather
         than laid on top of a floor. */
      '  float band = 1.0 - smoothstep(0.0, uBand * 0.62, abs(r - uRing));',
      '  col = mix(col, uEarth * (0.82 + grain * 0.3), band * 0.9);',
      /* Contact shadow: the ring occludes its own footing. */
      '  col *= 1.0 - band * 0.22;',
      '  vec3 n = vec3(0.0, 1.0, 0.0);',
      '  float ndl = max(dot(n, uSunDir), 0.0);',
      '  col = col * (ambientAt(n) * 1.9 + uSunCol * ndl * 1.5);',
      /* Aerial perspective: the plain dissolves into the same air the sky is
         made of, which is what stops the horizon reading as a cut edge. */
      '  float fog = smoothstep(0.32, 1.0, r / 78.0);',
      '  col = mix(col, uHaze, fog);',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n')
  });
  var ground = new T.Mesh(new T.CircleGeometry(GROUND_R, 96), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  scene.add(ground);


  /* ══════════════════════════════════════════════════════════════════════
     THE POOL — the shared fund, held in the middle of the circle

     Every thread of light crosses it and every stem stands around it. It is
     the one thing in the garden that belongs to nobody in particular, which
     is the whole point of the section that comes later.
     ══════════════════════════════════════════════════════════════════════ */
  var poolMat = new T.ShaderMaterial({
    uniforms: {
      uTime: uTime, uSunDir: uSunDir, uSunCol: uSunCol, uHaze: uHaze,
      uSkyTop: { value: v3(SKY_TOP) },
      uSkyLow: { value: v3(SKY_LOW) },
      uDeep: { value: new T.Vector3(0.157, 0.318, 0.286) },
      uPointer: uPointer
    },
    vertexShader: [
      'varying vec3 vW;',
      'varying vec2 vUv;',
      'void main(){',
      '  vUv = uv;',
      '  vec4 w = modelMatrix * vec4(position, 1.0);',
      '  vW = w.xyz;',
      '  gl_Position = projectionMatrix * viewMatrix * w;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime; uniform vec3 uSunDir; uniform vec3 uSunCol; uniform vec3 uHaze;',
      'uniform vec3 uSkyTop; uniform vec3 uSkyLow; uniform vec3 uDeep; uniform vec3 uPointer;',
      'varying vec3 vW; varying vec2 vUv;',
      'float h21(vec2 p){ return fract(sin(dot(p, vec2(41.7, 289.3))) * 43758.5453); }',
      'float n2(vec2 p){',
      '  vec2 i = floor(p), f = fract(p);',
      '  f = f * f * (3.0 - 2.0 * f);',
      '  float a = h21(i), b = h21(i + vec2(1,0)), c = h21(i + vec2(0,1)), d = h21(i + vec2(1,1));',
      '  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);',
      '}',
      'void main(){',
      '  vec3 V = normalize(cameraPosition - vW);',
      /* Two slow noise fields at different speeds give a surface that moves
         without ever repeating into a pattern. */
      '  float w1 = n2(vW.xz * 2.8 + vec2(uTime * 0.09, uTime * 0.055));',
      '  float w2 = n2(vW.xz * 6.4 - vec2(uTime * 0.06, uTime * 0.11));',
      '  vec2 slope = vec2(w1 - w2, w2 - w1) * 0.1;',
      '  vec3 N = normalize(vec3(slope.x, 1.0, slope.y));',
      /* A ring of ripples spreading from wherever the pointer rests. */
      '  float pd = length(vW.xz - uPointer.xz);',
      '  float ring = sin(pd * 4.5 - uTime * 3.0) * exp(-pd * 0.55) * smoothstep(6.0, 0.0, pd);',
      '  N = normalize(N + vec3(ring * 0.09, 0.0, ring * 0.09));',
      /* Fresnel: the sky at a glancing angle, the depth of the water when
         looked into straight down. */
      '  float f = pow(1.0 - max(dot(N, V), 0.0), 3.0);',
      '  vec3 R = reflect(-V, N);',
      '  float h = clamp(R.y * 1.4 + 0.2, 0.0, 1.0);',
      '  vec3 skyRefl = mix(uSkyLow, uSkyTop, pow(h, 0.8));',
      '  skyRefl += uSunCol * pow(max(dot(R, uSunDir), 0.0), 14.0) * 0.24;',
      '  vec3 col = mix(uDeep, skyRefl, clamp(f * 0.95 + 0.26, 0.0, 1.0));',
      /* Sun glint, tight enough to read as water rather than metal. */
      '  vec3 H = normalize(uSunDir + V);',
      '  col += uSunCol * pow(max(dot(N, H), 0.0), 220.0) * 1.5;',
      '  col += uSunCol * pow(max(dot(N, H), 0.0), 90.0) * 0.16;',
      /* The rim shallows out into the planted earth. */
      '  float r = length(vW.xz) / 5.93;',
      '  float shore = smoothstep(1.0, 0.86, r);',
      '  col = mix(mix(col, uHaze * 0.9, 0.35), col, shore);',
      '  float fog = smoothstep(0.2, 0.95, length(vW.xz) / 78.0);',
      '  col = mix(col, uHaze, fog * 0.5);',
      '  gl_FragColor = vec4(col, shore * 0.94 + 0.06);',
      '}'
    ].join('\n'),
    transparent: true,
    depthWrite: false
  });
  var POOL_R = RING_R - BAND * 0.62;
  var pool = new T.Mesh(new T.CircleGeometry(POOL_R, 84), poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.03;
  pool.renderOrder = 1;
  scene.add(pool);

  /* ══════════════════════════════════════════════════════════════════════
     TEN THOUSAND STEMS
     ══════════════════════════════════════════════════════════════════════ */

  /* One tapered ribbon, built at a given number of height segments so the
     governor can trade blade detail for frames without touching the count. */
  function bladeGeometry(segs) {
    var pos = [], uvs = [], idx = [];
    for (var i = 0; i <= segs; i++) {
      var t = i / segs;
      var w = 0.038 * Math.pow(1 - t, 0.58);
      pos.push(-w, t, 0); uvs.push(0, t);
      pos.push(w, t, 0); uvs.push(1, t);
    }
    for (var s = 0; s < segs; s++) {
      var a = s * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, c, b, b, c, d);
    }
    var g = new T.InstancedBufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.setAttribute('iPos', iPosAttr);
    g.setAttribute('iDir', iDirAttr);
    g.setAttribute('iParams', iParamsAttr);
    g.instanceCount = STEMS;
    g.boundingSphere = new T.Sphere(new T.Vector3(0, 0, 0), RING_R + BAND + 3);
    return g;
  }

  var iPos = new Float32Array(STEMS * 3);
  var iDir = new Float32Array(STEMS * 2);
  var iParams = new Float32Array(STEMS * 4);

  /* Planted by area with a clumping field, so the band reads as a meadow of
     individuals and not as a swept stroke. */
  for (var i = 0; i < STEMS; i++) {
    var a = rnd() * TAU;
    var tri = rnd() + rnd() - 1;                      // dense mid-band
    var r = RING_R + tri * (BAND * 0.5);
    var clump = fbm(Math.cos(a) * 3.1 + 11.0, Math.sin(a) * 3.1 + 7.0);
    r += (clump - 0.5) * 0.45;

    var x = Math.cos(a) * r, z = Math.sin(a) * r;
    var yaw = rnd() * TAU;
    iPos[i * 3] = x; iPos[i * 3 + 1] = 0; iPos[i * 3 + 2] = z;
    iDir[i * 2] = Math.cos(yaw); iDir[i * 2 + 1] = Math.sin(yaw);
    iParams[i * 4] = 0.34 + clump * 0.34 + rnd() * 0.34;  // height
    iParams[i * 4 + 1] = rnd() * TAU;                    // phase
    iParams[i * 4 + 2] = rnd();                          // tint
    iParams[i * 4 + 3] = 0.05 + rnd() * 0.28;             // resting lean
  }

  var iPosAttr = new T.InstancedBufferAttribute(iPos, 3);
  var iDirAttr = new T.InstancedBufferAttribute(iDir, 2);
  var iParamsAttr = new T.InstancedBufferAttribute(iParams, 4);

  var grassMat = new T.ShaderMaterial({
    side: T.DoubleSide,
    uniforms: {
      uTime: uTime, uWind: uWind, uPointer: uPointer, uReach: uReach,
      uSunDir: uSunDir, uSunCol: uSunCol, uHaze: uHaze,
      uBase: { value: v3(GRASS_BASE) },
      uTip: { value: v3(GRASS_TIP) }
    },
    vertexShader: [
      'attribute vec3 iPos;',
      'attribute vec2 iDir;',
      'attribute vec4 iParams;',
      'uniform float uTime; uniform float uWind; uniform float uReach;',
      'uniform vec3 uPointer;',
      'varying float vT;',
      'varying float vAcross;',
      'varying float vTint;',
      'varying float vNear;',
      'varying vec3 vN;',
      'varying float vFog;',
      'void main(){',
      '  float t = uv.y;',
      '  float height = iParams.x;',
      '  float phase  = iParams.y;',
      '  vec3 side = vec3(iDir.x, 0.0, iDir.y);',
      '  vec3 fwd  = vec3(-iDir.y, 0.0, iDir.x);',
      /* Two frequencies and a slow travelling gust, so the wind crosses the
         whole ring instead of every stem twitching on its own clock. */
      '  float gust = sin(uTime * 0.34 - iPos.x * 0.055 + iPos.z * 0.04) * 0.5 + 0.5;',
      '  float sway = sin(uTime * 1.45 + phase + iPos.x * 0.3)',
      '             + sin(uTime * 2.6 + phase * 1.7) * 0.35;',
      '  float bend = (iParams.w + sway * uWind * (0.35 + 0.65 * gust)) * pow(t, 1.55);',
      /* She rises: the stems near the pointer lean away and lift. Scaled by
         each stem's own length, because a constant push combs the meadow into
         streaks instead of parting it. */
      '  vec2 away = iPos.xz - uPointer.xz;',
      '  float d = length(away);',
      '  float near = 1.0 - smoothstep(0.0, uReach, d);',
      '  near *= near;',
      '  vec2 awayN = d > 0.0001 ? away / d : vec2(1.0, 0.0);',
      '  vec3 p = iPos;',
      '  p += side * position.x;',
      '  p.y += position.y * height;',
      '  p += fwd * bend * height;',
      '  p.xz += awayN * near * 0.62 * pow(t, 1.4) * height;',
      '  p.y += near * 0.2 * height * pow(t, 1.8);',
      '  vec4 world = vec4(p, 1.0);',
      /* The blade faces along fwd; bending tips that normal back, which is
         what gives the band its light-into-dark roll. */
      '  vN = normalize(fwd + vec3(0.0, 1.0, 0.0) * (1.0 - bend * 1.2));',
      '  vT = t;',
      '  vAcross = uv.x * 2.0 - 1.0;',
      '  vTint = iParams.z;',
      '  vNear = near;',
      '  vFog = smoothstep(0.3, 0.92, length(p.xz) / 78.0);',
      '  gl_Position = projectionMatrix * viewMatrix * world;',
      '}'
    ].join('\n'),
    fragmentShader: [
      LIGHT_GLSL,
      'uniform vec3 uBase; uniform vec3 uTip;',
      'varying float vT; varying float vAcross; varying float vTint;',
      'varying float vNear; varying vec3 vN; varying float vFog;',
      'void main(){',
      '  vec3 albedo = mix(uBase, uTip, pow(vT, 0.8));',
  /* A wide tint range: a meadow is olive and gold as well as green. */
      '  albedo = mix(albedo, albedo * vec3(1.22, 1.1, 0.7), vTint * 0.42);',
      '  albedo *= 0.84 + vTint * 0.3;',
      /* A soft midrib: the blade is a curved surface, not a flat card. */
      '  albedo *= 0.84 + 0.16 * (1.0 - abs(vAcross));',
      '  vec3 n = normalize(vN);',
      '  float ndl = max(dot(n, uSunDir), 0.0);',
      /* Backlight through the leaf. This is most of why grass looks alive. */
      '  float through = max(dot(-n, uSunDir), 0.0);',
      '  vec3 col = albedo * (ambientAt(n) + uSunCol * ndl * 1.15);',
      '  col += uSunCol * albedo * pow(through, 1.6) * 0.85 * pow(vT, 0.7);',
      /* Self-shadowing down in the pile, weighted by the surface\'s own
         luminance so the shade has range instead of a flat floor. */
      '  col *= mix(0.42, 1.0, pow(vT, 0.62));',
      /* The sunlit crown is added after the pile shading, not folded into
         the albedo, or it comes back out at the same value as everything. */
      '  col += uSunCol * pow(vT, 5.0) * 0.16;',
      '  col += uSunCol * vNear * 0.22;',
      '  col = mix(col, uHaze, vFog);',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n')
  });

  var grass = new T.Mesh(bladeGeometry(TIERS[tier].segs), grassMat);
  grass.frustumCulled = false;
  scene.add(grass);

  /* ══════════════════════════════════════════════════════════════════════
     THREADS — light travelling one way around the inside of the ring
     ══════════════════════════════════════════════════════════════════════ */
  var tVerts = MAX_THREADS * THREAD_SEGS * 2;
  var tPos = new Float32Array(tVerts * 3);
  var tT = new Float32Array(tVerts);
  var tSeed = new Float32Array(tVerts);
  var vIdx = 0;
  var A = new T.Vector3(), B = new T.Vector3(), M = new T.Vector3(), P = new T.Vector3(), Q = new T.Vector3();

  function bez(out, a, m, b, t) {
    var it = 1 - t;
    out.x = it * it * a.x + 2 * it * t * m.x + t * t * b.x;
    out.y = it * it * a.y + 2 * it * t * m.y + t * t * b.y;
    out.z = it * it * a.z + 2 * it * t * m.z + t * t * b.z;
    return out;
  }

  for (var c = 0; c < MAX_THREADS; c++) {
    var a0 = rnd() * TAU;
    /* Always forward around the circle — the direction of travel is the
       argument the section is making. */
    var a1 = a0 + 0.5 + rnd() * 1.5;
    var seed = rnd();
    var lift = 0.5 + rnd() * 1.5;
    A.set(Math.cos(a0) * (RING_R - 0.3), 0.35 + rnd() * 0.5, Math.sin(a0) * (RING_R - 0.3));
    B.set(Math.cos(a1) * (RING_R - 0.3), 0.35 + rnd() * 0.5, Math.sin(a1) * (RING_R - 0.3));
    M.copy(A).add(B).multiplyScalar(0.5 * (0.3 + rnd() * 0.45));
    M.y = lift;

    for (var s2 = 0; s2 < THREAD_SEGS; s2++) {
      var t0 = s2 / THREAD_SEGS, t1 = (s2 + 1) / THREAD_SEGS;
      bez(P, A, M, B, t0); bez(Q, A, M, B, t1);
      tPos[vIdx * 3] = P.x; tPos[vIdx * 3 + 1] = P.y; tPos[vIdx * 3 + 2] = P.z;
      tT[vIdx] = t0; tSeed[vIdx] = seed; vIdx++;
      tPos[vIdx * 3] = Q.x; tPos[vIdx * 3 + 1] = Q.y; tPos[vIdx * 3 + 2] = Q.z;
      tT[vIdx] = t1; tSeed[vIdx] = seed; vIdx++;
    }
  }

  var threadGeo = new T.BufferGeometry();
  threadGeo.setAttribute('position', new T.BufferAttribute(tPos, 3));
  threadGeo.setAttribute('aT', new T.BufferAttribute(tT, 1));
  threadGeo.setAttribute('aSeed', new T.BufferAttribute(tSeed, 1));
  threadGeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, 0), RING_R + 2);

  var threadMat = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: uTime, uFade: uFade, uGold: { value: v3(GOLD) }, uHaze: uHaze },
    vertexShader: [
      'attribute float aT; attribute float aSeed;',
      'varying float vT; varying float vSeed;',
      'void main(){',
      '  vT = aT; vSeed = aSeed;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime; uniform float uFade; uniform vec3 uGold; uniform vec3 uHaze;',
      'varying float vT; varying float vSeed;',
      'void main(){',
      '  float speed = 0.09 + fract(vSeed * 7.31) * 0.1;',
      '  float head = fract(uTime * speed + vSeed);',
      '  float d = abs(vT - head); d = min(d, 1.0 - d);',
      '  float pulse = smoothstep(0.07, 0.0, d);',
      /* Both tails fade so a thread never collides with the rim it leaves. */
      '  float ends = smoothstep(0.0, 0.14, vT) * smoothstep(1.0, 0.86, vT);',
      '  vec3 col = mix(uGold * 0.72, vec3(1.0, 0.97, 0.88), pulse);',
      '  float a = (0.1 + pulse * 0.8) * ends * uFade;',
      '  gl_FragColor = vec4(col, a);',
      '}'
    ].join('\n')
  });
  var threads = new T.LineSegments(threadGeo, threadMat);
  threads.frustumCulled = false;
  scene.add(threads);

  /* ══════════════════════════════════════════════════════════════════════
     POLLEN — seed in the air, and a trail where the pointer passed
     ══════════════════════════════════════════════════════════════════════ */
  var pPos = new Float32Array(MAX_POLLEN * 3);
  var pRnd = new Float32Array(MAX_POLLEN * 3);
  for (var q = 0; q < MAX_POLLEN; q++) {
    var pa = rnd() * TAU;
    var pr = RING_R + (rnd() + rnd() - 1) * (BAND * 1.4);
    pPos[q * 3] = Math.cos(pa) * pr;
    pPos[q * 3 + 1] = 0.2 + rnd() * 2.6;
    pPos[q * 3 + 2] = Math.sin(pa) * pr;
    pRnd[q * 3] = rnd();
    pRnd[q * 3 + 1] = rnd();
    pRnd[q * 3 + 2] = 0.5 + rnd() * 0.8;
  }
  var pollenGeo = new T.BufferGeometry();
  pollenGeo.setAttribute('position', new T.BufferAttribute(pPos, 3));
  pollenGeo.setAttribute('aRnd', new T.BufferAttribute(pRnd, 3));
  pollenGeo.boundingSphere = new T.Sphere(new T.Vector3(0, 1, 0), RING_R + 6);
  pollenGeo.setDrawRange(0, TIERS[tier].pollen);

  var pollenMat = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: uTime, uFade: uFade, uPixel: uPixel, uSunCol: uSunCol, uPointer: uPointer },
    vertexShader: [
      'attribute vec3 aRnd;',
      'uniform float uTime; uniform float uPixel; uniform vec3 uPointer;',
      'varying float vLit;',
      'void main(){',
      '  vec3 p = position;',
      /* Drift: a slow rise with a lateral wander, wrapped so the air is
         never empty and nothing has to be respawned on the CPU. */
      '  float rise = fract(aRnd.x + uTime * 0.022) * 3.4;',
      '  p.y = 0.18 + rise;',
      '  p.x += sin(uTime * 0.34 + aRnd.y * 6.28) * 0.5;',
      '  p.z += cos(uTime * 0.29 + aRnd.x * 6.28) * 0.5;',
      '  float nearP = 1.0 - smoothstep(0.0, 4.2, length(p.xz - uPointer.xz));',
      '  vLit = 0.5 + nearP * 0.9 + (1.0 - rise / 3.4) * 0.2;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_PointSize = aRnd.z * uPixel * 3.4 * (9.0 / max(-mv.z, 0.2)) * (1.0 + nearP);',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uFade; uniform vec3 uSunCol;',
      'varying float vLit;',
      'void main(){',
      '  vec2 uv = gl_PointCoord - 0.5;',
      '  float d2 = dot(uv, uv);',
      '  if (d2 > 0.25) discard;',
      '  float a = smoothstep(0.25, 0.0, d2);',
      '  gl_FragColor = vec4(uSunCol * 1.06, a * a * 0.5 * vLit * uFade);',
      '}'
    ].join('\n')
  });
  var pollen = new T.Points(pollenGeo, pollenMat);
  pollen.frustumCulled = false;
  scene.add(pollen);

  /* ══════════════════════════════════════════════════════════════════════
     BLOOMS — the only gold in the garden, one per member
     ══════════════════════════════════════════════════════════════════════ */
  var bPos = new Float32Array(MAX_BLOOMS * 3);
  var bRnd = new Float32Array(MAX_BLOOMS * 2);
  var bOpen = new Float32Array(MAX_BLOOMS);
  var bloomCount = 0;

  var bloomGeo = new T.InstancedBufferGeometry();
  bloomGeo.setAttribute('position', new T.Float32BufferAttribute(
    [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0], 3));
  bloomGeo.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2));
  bloomGeo.setIndex([0, 1, 2, 2, 1, 3]);
  var bPosAttr = new T.InstancedBufferAttribute(bPos, 3); bPosAttr.setUsage(T.DynamicDrawUsage);
  var bRndAttr = new T.InstancedBufferAttribute(bRnd, 2); bRndAttr.setUsage(T.DynamicDrawUsage);
  var bOpenAttr = new T.InstancedBufferAttribute(bOpen, 1); bOpenAttr.setUsage(T.DynamicDrawUsage);
  bloomGeo.setAttribute('iPos', bPosAttr);
  bloomGeo.setAttribute('iRnd', bRndAttr);
  bloomGeo.setAttribute('iOpen', bOpenAttr);
  bloomGeo.instanceCount = 0;
  bloomGeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, 0), RING_R + BAND + 3);

  var bloomMat = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: uTime, uFade: uFade, uGold: { value: v3(GOLD) }, uSunCol: uSunCol },
    vertexShader: [
      'attribute vec3 iPos; attribute vec2 iRnd; attribute float iOpen;',
      'uniform float uTime;',
      'varying vec2 vUv; varying float vOpen; varying float vSeed;',
      'void main(){',
      '  vUv = uv; vOpen = iOpen; vSeed = iRnd.x;',
      '  float scale = (0.52 + iRnd.y * 0.3) * smoothstep(0.0, 1.0, iOpen);',
      '  vec3 c = iPos;',
      '  c.y += 0.9 + iRnd.y * 0.5 + sin(uTime * 1.3 + iRnd.x * 6.28) * 0.05;',
      /* Billboarded in view space so a flower always faces the reader. */
      '  vec4 mv = modelViewMatrix * vec4(c, 1.0);',
      '  mv.xy += (uv - 0.5) * scale;',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uFade; uniform vec3 uGold; uniform vec3 uSunCol;',
      'varying vec2 vUv; varying float vOpen; varying float vSeed;',
      'void main(){',
      '  vec2 p = vUv - 0.5;',
      '  float r = length(p) * 2.0;',
      '  float ang = atan(p.y, p.x);',
      /* Six petals from a polar rosette, with an anti-aliased edge. */
      '  float petal = 0.62 + 0.34 * cos(ang * 6.0 + vSeed * 6.28);',
      '  float edge = fwidth(r) * 1.6 + 0.02;',
      '  float mask = smoothstep(petal + edge, petal - edge, r);',
      '  if (mask < 0.01) discard;',
      '  vec3 col = mix(uGold, uSunCol * 1.04, smoothstep(0.55, 0.0, r));',
      '  col = mix(col * 0.86, col, smoothstep(1.0, 0.2, r));',
      '  gl_FragColor = vec4(col, mask * uFade * smoothstep(0.0, 0.6, vOpen));',
      '}'
    ].join('\n')
  });
  var blooms = new T.Mesh(bloomGeo, bloomMat);
  blooms.frustumCulled = false;
  scene.add(blooms);

  var opening = [];

  function ignite(count) {
    var n = count || 1;
    for (var g = 0; g < n && bloomCount < MAX_BLOOMS; g++) {
      /* Take a real stem's position, so a flower always stands where
         something was already growing. */
      var pick = Math.floor(rnd() * STEMS);
      var k = bloomCount++;
      bPos[k * 3] = iPos[pick * 3];
      bPos[k * 3 + 1] = iPos[pick * 3 + 1];
      bPos[k * 3 + 2] = iPos[pick * 3 + 2];
      bRnd[k * 2] = rnd();
      bRnd[k * 2 + 1] = rnd();
      bOpen[k] = 0;
      opening.push({ i: k, t: 0 });
    }
    bloomGeo.instanceCount = bloomCount;
    bPosAttr.needsUpdate = true;
    bRndAttr.needsUpdate = true;
    bOpenAttr.needsUpdate = true;
  }

  function stepBlooms(dt) {
    if (!opening.length) return;
    for (var g = opening.length - 1; g >= 0; g--) {
      var it = opening[g];
      it.t += dt / 1.1;
      bOpen[it.i] = it.t >= 1 ? 1 : 1 - Math.pow(1 - it.t, 3);
      if (it.t >= 1) opening.splice(g, 1);
    }
    bOpenAttr.needsUpdate = true;
  }

  /* ══════════════════════════════════════════════════════════════════════
     FRAMING — one world, two vantage points
     ══════════════════════════════════════════════════════════════════════ */

  /* Standing in the meadow at the near edge of the ring, looking across it.
     Raised and pulled back for the loop, where the circle has to read as a
     circle. Both are expressed as an orbit so the interpolation is three
     scalars and never an Euler triple. */
  var VIEW_HERO = { dist: 17.2, elev: 0.235, azim: -0.4, fov: 44, look: 1.15 };
  var VIEW_LOOP = { dist: 25.5, elev: 0.66, azim: 0.24, fov: 34, look: 0.35 };

  var view = { dist: VIEW_HERO.dist, elev: VIEW_HERO.elev, azim: VIEW_HERO.azim, fov: VIEW_HERO.fov, look: VIEW_HERO.look };
  var want = { dist: 0, elev: 0, azim: 0, fov: 0, look: 0 };
  var lookAt = new T.Vector3();

  var wantX = 0, wantY = 0, haveX = 0, haveY = 0, primed = false;
  var appliedOffX = NaN, appliedOffY = NaN;
  var stageRect = null;
  var drift = { x: 0, y: 0, tx: 0, ty: 0 };

  function loopDistance(fov) {
    if (!stageRect) return VIEW_LOOP.dist;
    var H = window.innerHeight;
    var fit = window.innerWidth < 760 ? 0.7 : 0.72;
    var target = Math.min(stageRect.height, stageRect.width) * fit;
    if (target < 40) return VIEW_LOOP.dist;
    /* The ring's apparent height when tilted away by the elevation. */
    var ringH = 2 * (RING_R + BAND * 0.5) * Math.max(0.34, Math.sin(VIEW_LOOP.elev * Math.PI * 0.5 + 0.42));
    var d = (ringH * H) / (2 * Math.tan((fov * Math.PI / 180) / 2) * target);
    return Math.max(12, Math.min(70, d));
  }

  function measureWant() {
    var W = window.innerWidth, H = window.innerHeight;
    if (loopOn && stageEl) {
      stageRect = stageEl.getBoundingClientRect();
      if (stageRect.width > 0) {
        wantX = stageRect.left + stageRect.width / 2;
        wantY = stageRect.top + stageRect.height / 2;
        want.dist = loopDistance(VIEW_LOOP.fov);
        want.elev = VIEW_LOOP.elev; want.azim = VIEW_LOOP.azim;
        want.fov = VIEW_LOOP.fov; want.look = VIEW_LOOP.look;
        return want;
      }
    }
    stageRect = null;
    var wide = W >= 900;
    wantX = wide ? W * 0.66 : W * 0.5;
    wantY = wide ? H * 0.66 : H * 0.3;
    want.dist = VIEW_HERO.dist * (wide ? 1 : 1.24);
    want.elev = VIEW_HERO.elev * (wide ? 1 : 1.7);
    want.azim = VIEW_HERO.azim;
    want.fov = VIEW_HERO.fov;
    want.look = VIEW_HERO.look;
    return want;
  }

  function placeCamera() {
    var ce = Math.cos(view.elev), se = Math.sin(view.elev);
    camera.position.set(
      Math.sin(view.azim + drift.x * 0.06) * ce * view.dist,
      se * view.dist + 0.9,
      Math.cos(view.azim + drift.x * 0.06) * ce * view.dist
    );
    lookAt.set(0, view.look + drift.y * 0.25, 0);
    camera.lookAt(lookAt);
    camera.fov = view.fov;
  }

  function snapFraming() {
    var w = measureWant();
    view.dist = w.dist; view.elev = w.elev; view.azim = w.azim;
    view.fov = w.fov; view.look = w.look;
    haveX = wantX; haveY = wantY;
    primed = true;
    placeCamera();
    camera.updateProjectionMatrix();
  }

  function damp(cur, tgt, lambda, dt) {
    return cur + (tgt - cur) * (1 - Math.exp(-lambda * dt));
  }

  function applyCamera(dt) {
    var w = measureWant();
    if (!primed) { haveX = wantX; haveY = wantY; primed = true; }
    var l = 4.2;
    view.dist = damp(view.dist, w.dist, l, dt);
    view.elev = damp(view.elev, w.elev, l, dt);
    view.azim = damp(view.azim, w.azim, l, dt);
    view.fov = damp(view.fov, w.fov, l, dt);
    view.look = damp(view.look, w.look, l, dt);
    drift.x = damp(drift.x, drift.tx, 2.4, dt);
    drift.y = damp(drift.y, drift.ty, 2.4, dt);

    var ol = loopOn ? 20 : 6;
    haveX = damp(haveX, wantX, ol, dt);
    haveY = damp(haveY, wantY, ol, dt);

    placeCamera();

    var W = window.innerWidth, H = window.innerHeight;
    var offX = -(haveX - W / 2);
    var offY = -(haveY - H / 2);
    if (!(Math.abs(offX - appliedOffX) < 0.25 && Math.abs(offY - appliedOffY) < 0.25)) {
      camera.setViewOffset(W, H, offX, offY, W, H);
      appliedOffX = offX; appliedOffY = offY;
    } else {
      camera.updateProjectionMatrix();
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     POINTER
     ══════════════════════════════════════════════════════════════════════ */
  var ray = new T.Raycaster();
  var ndc = new T.Vector2(-10, -10);
  var groundPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
  var hit = new T.Vector3();
  var pointerLive = false;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  function onPointerMove(ev) {
    if (ev.pointerType === 'touch' || !fine.matches) return;
    ndc.x = (ev.clientX / window.innerWidth) * 2 - 1;
    ndc.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    /* A little of the pointer goes into the camera as well, so the whole
       world has weight rather than only the grass reacting. */
    drift.tx = ndc.x;
    drift.ty = -ndc.y;
    pointerLive = true;
  }
  function onPointerOut() {
    pointerLive = false;
    drift.tx = 0; drift.ty = 0;
    uPointer.value.set(9999, 0, 9999);
  }

  function updatePointer() {
    if (!pointerLive) { uPointer.value.set(9999, 0, 9999); return; }
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(groundPlane, hit)) uPointer.value.copy(hit);
    else uPointer.value.set(9999, 0, 9999);
  }

  /* ══════════════════════════════════════════════════════════════════════
     QUALITY GOVERNOR
     ══════════════════════════════════════════════════════════════════════ */
  function applyTier(next) {
    tier = Math.max(0, Math.min(TIERS.length - 1, next));
    var q = TIERS[tier];
    if (grass.geometry._segs !== q.segs) {
      var old = grass.geometry;
      grass.geometry = bladeGeometry(q.segs);
      grass.geometry._segs = q.segs;
      old.dispose();
    }
    pollenGeo.setDrawRange(0, q.pollen);
    threadGeo.setDrawRange(0, q.threads * THREAD_SEGS * 2);
    var dpr = Math.min(window.devicePixelRatio || 1, q.dpr);
    if (Math.abs(renderer.getPixelRatio() - dpr) > 0.01) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    }
    uPixel.value = renderer.getPixelRatio();
    canvas.dataset.tier = String(tier);
  }

  var ema = 0, slowRun = 0, govFrames = 0;
  function resetGovernor() { ema = 0; slowRun = 0; govFrames = 0; }

  function governor(dt) {
    if (tierLocked) return;
    govFrames++;
    /* The first frames carry shader compilation and the first upload, and
       whatever scrolling woke the observer. They are never evidence. */
    if (govFrames < 5) return;

    /* Half a second is a main-thread stall — a layout, a decode, a
       collection — not a rasteriser falling behind, so it counts for very
       little on its own. Otherwise any hiccup would permanently downgrade
       a perfectly capable machine. */
    if (dt > 0.55) {
      slowRun += 1;
    } else if (dt > 0.09) {
      slowRun += 4;
      ema = ema ? ema * 0.85 + dt * 0.15 : dt;
    } else {
      ema = ema ? ema * 0.85 + dt * 0.15 : dt;
      if (ema > 0.031) slowRun += 1;
      else slowRun = Math.max(0, slowRun - 2);
    }

    if (slowRun >= 26) {
      if (tier < TIERS.length - 1) {
        resetGovernor();
        applyTier(tier + 1);
      } else if (slowRun >= 100) {
        stop();
        document.documentElement.classList.add('no-webgl');
        canvas.style.display = 'none';
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     VISIBILITY
     ══════════════════════════════════════════════════════════════════════ */
  var heroEl = document.querySelector('.hero');
  var loopEl = document.getElementById('loop');
  var stageEl = document.getElementById('loopStage');
  var nodeEls = stageEl ? Array.prototype.slice.call(stageEl.querySelectorAll('[data-node]')) : [];
  var NODE_ANGLE = { give: -Math.PI / 2, vote: 0, empower: Math.PI / 2, ask: Math.PI };

  var heroOn = false, loopOn = false, docVisible = !document.hidden;
  var running = false, rafId = 0, lastT = 0, destroyed = false;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.target === heroEl) heroOn = en.isIntersecting;
      else if (en.target === loopEl) loopOn = en.isIntersecting;
    });
    sync();
  }, { rootMargin: '12% 0px', threshold: 0 });
  if (heroEl) io.observe(heroEl);
  if (loopEl) io.observe(loopEl);

  function sync() {
    var wantRun = (heroOn || loopOn) && docVisible && !destroyed;
    if (wantRun && !running) start();
    else if (!wantRun && running) stop();
  }

  function start() {
    if (running || destroyed) return;
    running = true;
    canvas.dataset.animationActive = 'true';
    lastT = 0;
    resetGovernor();
    /* Coming back into view, take up the new vantage point outright rather
       than swinging to it from wherever the last section left the camera. */
    primed = false;
    snapFraming();
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    canvas.dataset.animationActive = 'false';
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  document.addEventListener('visibilitychange', function () {
    docVisible = !document.hidden;
    sync();
  });

  /* ── the four loop labels, placed from the live ring ─────────────────── */
  var projV = new T.Vector3();
  var centreV = new T.Vector3();
  var labelsOn = false;

  function placeLabels() {
    if (!stageEl || !nodeEls.length) return;
    if (!loopOn || !stageRect) {
      if (labelsOn) {
        stageEl.classList.remove('is-projected');
        for (var r = 0; r < nodeEls.length; r++) {
          nodeEls[r].style.transform = '';
          nodeEls[r].style.opacity = '';
        }
        labelsOn = false;
      }
      return;
    }
    if (!labelsOn) { stageEl.classList.add('is-projected'); labelsOn = true; }

    var W = window.innerWidth, H = window.innerHeight;
    centreV.set(0, 0.6, 0).project(camera);
    var cx = (centreV.x * 0.5 + 0.5) * W - stageRect.left;
    var cy = (-centreV.y * 0.5 + 0.5) * H - stageRect.top;

    for (var n = 0; n < nodeEls.length; n++) {
      var el = nodeEls[n];
      var ang = NODE_ANGLE[el.getAttribute('data-node')];
      projV.set(Math.cos(ang) * (RING_R + BAND * 0.5), 0.7, Math.sin(ang) * (RING_R + BAND * 0.5));
      projV.project(camera);
      if (projV.z > 1) { el.style.opacity = '0'; continue; }
      el.style.opacity = '1';
      var sx = (projV.x * 0.5 + 0.5) * W - stageRect.left;
      var sy = (-projV.y * 0.5 + 0.5) * H - stageRect.top;
      var dx = sx - cx, dy = sy - cy;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var push = Math.min(window.innerWidth < 760 ? 6 : 12, len * 0.06);
      sx += (dx / len) * push;
      sy += (dy / len) * push;
      el.style.transform = 'translate3d(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px,0) translate(-50%,-50%)';
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     RESIZE + LOOP
     ══════════════════════════════════════════════════════════════════════ */
  function resize() {
    var W = window.innerWidth, H = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, TIERS[tier].dpr));
    renderer.setSize(W, H, false);
    uPixel.value = renderer.getPixelRatio();
    camera.aspect = W / H;
    appliedOffX = NaN;
    uReach.value = W < 760 ? 2.4 : 3.2;
    snapFraming();
    if (!running) renderer.render(scene, camera);
  }

  var resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 90);
  }

  function tick(now) {
    if (!running) return;
    rafId = requestAnimationFrame(tick);

    var t = now * 0.001;
    var raw = lastT ? t - lastT : 1 / 60;
    var dt = Math.min(raw, 1 / 30);
    lastT = t;
    uTime.value = t;

    governor(raw);
    if (!running) return;

    if (uFade.value < 1) uFade.value = Math.min(1, uFade.value + dt * 1.1);
    /* The wind builds after the first frame so the meadow settles into
       motion rather than starting mid-gust. */
    uWind.value = 0.3 + Math.sin(t * 0.11) * 0.12;

    applyCamera(dt);
    updatePointer();
    stepBlooms(dt);

    renderer.render(scene, camera);
    placeLabels();
  }

  /* ══════════════════════════════════════════════════════════════════════
     RESILIENCE
     ══════════════════════════════════════════════════════════════════════ */
  canvas.addEventListener('webglcontextlost', function (ev) {
    ev.preventDefault();
    stop();
    document.documentElement.classList.add('no-webgl');
  }, false);
  canvas.addEventListener('webglcontextrestored', function () {
    document.documentElement.classList.remove('no-webgl');
    resize();
    sync();
  }, false);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    stop();
    io.disconnect();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerOut);
    window.removeEventListener('blur', onPointerOut);
    clearTimeout(resizeTimer);
    [grass.geometry, threadGeo, pollenGeo, bloomGeo, ground.geometry, sky.geometry, pool.geometry]
      .forEach(function (g) { if (g) g.dispose(); });
    [grassMat, threadMat, pollenMat, bloomMat, groundMat, skyMat, poolMat]
      .forEach(function (m) { m.dispose(); });
    renderer.dispose();
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerOut);
  window.addEventListener('blur', onPointerOut);
  window.addEventListener('pagehide', destroy, { once: true });

  grass.geometry._segs = TIERS[tier].segs;
  applyTier(tier);
  resize();
  document.body.classList.add('scene-ready');
  sync();

  window.FRDMScene = {
    ignite: ignite,
    destroy: destroy,
    stats: function () {
      return { stems: STEMS, tier: tier, blooms: bloomCount, running: running, locked: tierLocked };
    }
  };
})();
