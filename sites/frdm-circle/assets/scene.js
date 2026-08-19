/* ══════════════════════════════════════════════════════════════════════════
   THE CIRCLE — the hero geometry is the product.
   ══════════════════════════════════════════════════════════════════════════

   Ten thousand seats sit on a tilted ring. Every one of them is unlit,
   because the real count is zero and the whole premise of this fund is that
   it does not pretend. Light travels around the inside of the ring rather
   than down through it: money moving between members, never dispensed from
   above. Occasionally a mote lifts off the rim, crosses the middle, and
   settles on the far side.

   One canvas serves two sections. The camera holds a hero framing and a
   loop framing, and a screen-space view offset keeps the ring locked to
   whichever element it belongs to. Nothing renders unless one of those two
   sections is on screen.

   Exposed as window.FRDMScene for site.js: .ignite() lights one seat when
   somebody joins.
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

  /* ── tuning ──────────────────────────────────────────────────────────── */
  var RING_R = 3.1;
  /* The ring's own tilt is what opens or closes the ellipse, not the camera
     elevation: at rest it lies almost edge-on to make a wide horizon for the
     hero, and for the loop it turns to face the reader. Rotating one axis is
     a scalar interpolation, which is exactly why the camera is left alone. */
  var TILT_HERO = -0.62;
  var TILT_LOOP = -1.12;
  var ELEV = 0.132;
  var narrow = window.matchMedia('(max-width: 760px)');

  /* Quality tiers. The seat count never changes — ten thousand is the
     argument, not a decoration — so every tier economises on fill rate
     instead: pixel ratio, sprite size, chord count, the halo, the embers.
     A weak GPU still counts every woman; it just draws her smaller. */
  var TIERS = [
    { dpr: 2.0, size: 6.6, chords: 124, risers: 20, glow: true, embers: true },
    { dpr: 1.35, size: 4.4, chords: 76, risers: 14, glow: true, embers: true },
    { dpr: 1.0, size: 2.9, chords: 38, risers: 8, glow: false, embers: false }
  ];

  var qs = new URLSearchParams(window.location.search);
  var forced = qs.get('quality');
  if (forced === 'off') {
    document.documentElement.classList.add('no-webgl');
    return;
  }
  var tier = forced === 'low' ? 2 : forced === 'medium' ? 1 : narrow.matches ? 1 : 0;
  var tierLocked = !!forced;

  var SEATS = Math.max(1, Math.min(20000, parseInt(qs.get('seats'), 10) || 10000));
  var MAX_CHORDS = 124;
  var CHORD_SEGS = 26;
  var MAX_RISERS = 20;
  var EMBERS = 360;
  var EMBER_LIFE = 1.5;

  var CREAM = [0.965, 0.925, 0.902];
  var ROSE = [0.898, 0.647, 0.514];

  /* Deterministic everywhere: the same circle grows on every load. */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rnd = mulberry32(0x0c1c1e5f);

  var TAU = Math.PI * 2;

  /* ── renderer ────────────────────────────────────────────────────────── */
  /* The context is created here rather than left to three, so that a browser
     without WebGL 2 takes the static ring instead of three's deprecated
     WebGL 1 path — which would otherwise warn on every load. */
  var gl = null;
  try {
    gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    gl = null;
  }
  if (!gl) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  var renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: canvas, context: gl, alpha: true, antialias: false });
  } catch (err) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  renderer.outputColorSpace = T.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(42, 1, 0.1, 100);

  var ring = new T.Group();
  ring.rotation.x = TILT_HERO;
  scene.add(ring);

  /* ══════════════════════════════════════════════════════════════════════
     SEATS — 10,000 of them, one draw call
     ══════════════════════════════════════════════════════════════════════ */
  var seatPos = new Float32Array(SEATS * 3);
  var seatSeed = new Float32Array(SEATS);
  var seatSize = new Float32Array(SEATS);
  var seatLit = new Float32Array(SEATS);
  var seatAngle = new Float32Array(SEATS);

  var slot = TAU / SEATS;
  for (var i = 0; i < SEATS; i++) {
    /* Jittered across several slots so the rim reads as a crowd of
       individuals rather than a machined stroke. */
    var a = i * slot + (rnd() - 0.5) * slot * 9;
    /* A slow wobble in the band radius, so the ring breathes in plan. */
    var wob = Math.sin(a * 3.1 + 1.7) * 0.055 + Math.sin(a * 7.3 + 4.2) * 0.03 + Math.sin(a * 13.1) * 0.014;
    /* Triangular spread: dense down the centre of the band, thin at its edges. */
    var tri = (rnd() + rnd() - 1);
    var rr = RING_R + wob + tri * 0.30;
    var y = (rnd() + rnd() - 1) * 0.075;

    seatPos[i * 3] = Math.cos(a) * rr;
    seatPos[i * 3 + 1] = y;
    seatPos[i * 3 + 2] = Math.sin(a) * rr;
    seatSeed[i] = rnd();
    seatSize[i] = 0.5 + rnd() * 0.8;
    seatLit[i] = 0;
    seatAngle[i] = a;
  }

  var seatGeo = new T.BufferGeometry();
  seatGeo.setAttribute('position', new T.BufferAttribute(seatPos, 3));
  seatGeo.setAttribute('aSeed', new T.BufferAttribute(seatSeed, 1));
  seatGeo.setAttribute('aSize', new T.BufferAttribute(seatSize, 1));
  var litAttr = new T.BufferAttribute(seatLit, 1);
  litAttr.setUsage(T.DynamicDrawUsage);
  seatGeo.setAttribute('aLit', litAttr);
  seatGeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, 0), RING_R + 2);

  var uTime = { value: 0 };
  var uOpacity = { value: 0 };
  var REF_DIST = 8.0;
  var uScale = { value: 8.0 };
  var uPointer = { value: new T.Vector3(999, 999, 999) };

  var seatMat = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: T.AdditiveBlending,
    uniforms: {
      uTime: uTime,
      uOpacity: uOpacity,
      uScale: uScale,
      uPointer: uPointer,
      uSize: { value: TIERS[tier].size },
      uReach: { value: 1.15 },
      uCream: { value: new T.Vector3(CREAM[0], CREAM[1], CREAM[2]) },
      uRose: { value: new T.Vector3(ROSE[0], ROSE[1], ROSE[2]) }
    },
    vertexShader: [
      'attribute float aSeed;',
      'attribute float aSize;',
      'attribute float aLit;',
      'uniform float uTime;',
      'uniform float uScale;',
      'uniform float uSize;',
      'uniform float uReach;',
      'uniform vec3 uPointer;',
      'varying float vLit;',
      'varying float vNear;',
      'varying float vSeed;',
      'void main(){',
      '  vec3 p = position;',
      '  float ph = aSeed * 6.28318;',
      '  p.y += sin(uTime * 0.85 + ph) * 0.022;',
      /* She rises: seats near the pointer lift off the rim and warm up. */
      '  float d = distance(p, uPointer);',
      '  float near = 1.0 - smoothstep(0.0, uReach, d);',
      '  near *= near;',
      '  p.y += near * 0.34;',
      '  p.xz += normalize(p.xz + 1e-5) * near * 0.06;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_PointSize = uSize * aSize * (uScale / max(-mv.z, 0.1)) * (1.0 + near * 1.6 + aLit * 1.1);',
      '  gl_Position = projectionMatrix * mv;',
      '  vLit = aLit;',
      '  vNear = near;',
      '  vSeed = aSeed;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime;',
      'uniform float uOpacity;',
      'uniform vec3 uCream;',
      'uniform vec3 uRose;',
      'varying float vLit;',
      'varying float vNear;',
      'varying float vSeed;',
      'void main(){',
      '  vec2 uv = gl_PointCoord - 0.5;',
      '  float d2 = dot(uv, uv);',
      '  if (d2 > 0.25) discard;',
      '  float a = smoothstep(0.25, 0.0, d2);',
      '  a *= a;',
      '  float tw = 0.55 + 0.45 * sin(uTime * 1.25 + vSeed * 43.0);',
      '  float warm = clamp(vLit + vNear * 0.9, 0.0, 1.0);',
      '  vec3 col = mix(uCream, uRose, warm);',
      '  float alpha = a * uOpacity * (0.10 + tw * 0.10 + vLit * 0.72 + vNear * 0.70);',
      '  gl_FragColor = vec4(col, alpha);',
      '}'
    ].join('\n')
  });

  var seats = new T.Points(seatGeo, seatMat);
  seats.frustumCulled = false;
  seats.renderOrder = 3;
  ring.add(seats);

  /* ══════════════════════════════════════════════════════════════════════
     CHORDS — the web across the middle, with light travelling one way
     ══════════════════════════════════════════════════════════════════════ */
  var cVerts = MAX_CHORDS * CHORD_SEGS * 2;
  var cPos = new Float32Array(cVerts * 3);
  var cT = new Float32Array(cVerts);
  var cSeed = new Float32Array(cVerts);
  var v = 0;
  var A = new T.Vector3(), B = new T.Vector3(), M = new T.Vector3(), P = new T.Vector3(), Q = new T.Vector3();

  function bez(out, a, m, b, t) {
    var it = 1 - t;
    out.x = it * it * a.x + 2 * it * t * m.x + t * t * b.x;
    out.y = it * it * a.y + 2 * it * t * m.y + t * t * b.y;
    out.z = it * it * a.z + 2 * it * t * m.z + t * t * b.z;
    return out;
  }

  for (var c = 0; c < MAX_CHORDS; c++) {
    var a0 = rnd() * TAU;
    /* Always forward around the circle, never straight across and never
       back: the direction of travel is the argument. */
    var span = 0.42 + rnd() * 1.35;
    var a1 = a0 + span;
    var seed = rnd();

    A.set(Math.cos(a0) * RING_R, 0, Math.sin(a0) * RING_R);
    B.set(Math.cos(a1) * RING_R, 0, Math.sin(a1) * RING_R);
    M.copy(A).add(B).multiplyScalar(0.5 * (0.20 + rnd() * 0.42));
    M.y += (rnd() - 0.5) * 0.24;

    for (var s = 0; s < CHORD_SEGS; s++) {
      var t0 = s / CHORD_SEGS;
      var t1 = (s + 1) / CHORD_SEGS;
      bez(P, A, M, B, t0);
      bez(Q, A, M, B, t1);
      cPos[v * 3] = P.x; cPos[v * 3 + 1] = P.y; cPos[v * 3 + 2] = P.z;
      cT[v] = t0; cSeed[v] = seed; v++;
      cPos[v * 3] = Q.x; cPos[v * 3 + 1] = Q.y; cPos[v * 3 + 2] = Q.z;
      cT[v] = t1; cSeed[v] = seed; v++;
    }
  }

  var chordGeo = new T.BufferGeometry();
  chordGeo.setAttribute('position', new T.BufferAttribute(cPos, 3));
  chordGeo.setAttribute('aT', new T.BufferAttribute(cT, 1));
  chordGeo.setAttribute('aSeed', new T.BufferAttribute(cSeed, 1));
  chordGeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, 0), RING_R + 1);

  var chordMat = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: T.AdditiveBlending,
    uniforms: {
      uTime: uTime,
      uOpacity: uOpacity,
      uCream: { value: new T.Vector3(CREAM[0], CREAM[1], CREAM[2]) },
      uRose: { value: new T.Vector3(ROSE[0], ROSE[1], ROSE[2]) }
    },
    vertexShader: [
      'attribute float aT;',
      'attribute float aSeed;',
      'varying float vT;',
      'varying float vSeed;',
      'void main(){',
      '  vT = aT; vSeed = aSeed;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime;',
      'uniform float uOpacity;',
      'uniform vec3 uCream;',
      'uniform vec3 uRose;',
      'varying float vT;',
      'varying float vSeed;',
      'void main(){',
      '  float speed = 0.075 + fract(vSeed * 7.31) * 0.085;',
      '  float head = fract(uTime * speed + vSeed);',
      '  float d = abs(vT - head);',
      '  d = min(d, 1.0 - d);',
      '  float pulse = smoothstep(0.075, 0.0, d);',
      /* Fade both tails so a chord never collides with the rim it leaves. */
      '  float ends = smoothstep(0.0, 0.12, vT) * smoothstep(1.0, 0.88, vT);',
      '  vec3 col = mix(uCream, uRose, pulse);',
      '  float alpha = (0.026 + pulse * 0.5) * ends * uOpacity;',
      '  gl_FragColor = vec4(col, alpha);',
      '}'
    ].join('\n')
  });

  var chords = new T.LineSegments(chordGeo, chordMat);
  chords.frustumCulled = false;
  chords.renderOrder = 2;
  ring.add(chords);

  /* ══════════════════════════════════════════════════════════════════════
     RISERS — one gives, another rises. Entirely shader-driven.
     ══════════════════════════════════════════════════════════════════════ */
  var rPos = new Float32Array(MAX_RISERS * 3);
  var rA = new Float32Array(MAX_RISERS);
  var rB = new Float32Array(MAX_RISERS);
  var rPhase = new Float32Array(MAX_RISERS);
  var rSpeed = new Float32Array(MAX_RISERS);
  for (var k = 0; k < MAX_RISERS; k++) {
    rA[k] = rnd() * TAU;
    rB[k] = rA[k] + 1.4 + rnd() * 2.6;
    rPhase[k] = rnd();
    rSpeed[k] = 0.055 + rnd() * 0.05;
  }
  var riserGeo = new T.BufferGeometry();
  riserGeo.setAttribute('position', new T.BufferAttribute(rPos, 3));
  riserGeo.setAttribute('aA', new T.BufferAttribute(rA, 1));
  riserGeo.setAttribute('aB', new T.BufferAttribute(rB, 1));
  riserGeo.setAttribute('aPhase', new T.BufferAttribute(rPhase, 1));
  riserGeo.setAttribute('aSpeed', new T.BufferAttribute(rSpeed, 1));
  riserGeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, 0), RING_R + 3);

  var riserMat = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: T.AdditiveBlending,
    uniforms: {
      uTime: uTime,
      uOpacity: uOpacity,
      uScale: uScale,
      uR: { value: RING_R },
      uRose: { value: new T.Vector3(ROSE[0], ROSE[1], ROSE[2]) }
    },
    vertexShader: [
      'attribute float aA;',
      'attribute float aB;',
      'attribute float aPhase;',
      'attribute float aSpeed;',
      'uniform float uTime;',
      'uniform float uScale;',
      'uniform float uR;',
      'varying float vFade;',
      'void main(){',
      '  float t = fract(uTime * aSpeed + aPhase);',
      '  vec3 a = vec3(cos(aA) * uR, 0.0, sin(aA) * uR);',
      '  vec3 b = vec3(cos(aB) * uR, 0.0, sin(aB) * uR);',
      '  vec3 m = (a + b) * 0.5;',
      '  m.y += 1.15;',
      '  float it = 1.0 - t;',
      '  vec3 p = it * it * a + 2.0 * it * t * m + t * t * b;',
      '  vFade = smoothstep(0.0, 0.16, t) * smoothstep(1.0, 0.84, t);',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_PointSize = 13.0 * (uScale / max(-mv.z, 0.1)) * (0.55 + vFade * 0.65);',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uOpacity;',
      'uniform vec3 uRose;',
      'varying float vFade;',
      'void main(){',
      '  vec2 uv = gl_PointCoord - 0.5;',
      '  float d2 = dot(uv, uv);',
      '  if (d2 > 0.25) discard;',
      '  float a = smoothstep(0.25, 0.0, d2);',
      '  gl_FragColor = vec4(uRose, a * a * vFade * 0.72 * uOpacity);',
      '}'
    ].join('\n')
  });

  var risers = new T.Points(riserGeo, riserMat);
  risers.frustumCulled = false;
  risers.renderOrder = 4;
  ring.add(risers);

  /* ══════════════════════════════════════════════════════════════════════
     EMBERS — a short warm trail behind the pointer
     ══════════════════════════════════════════════════════════════════════ */
  var ePos = new Float32Array(EMBERS * 3);
  var eVel = new Float32Array(EMBERS * 3);
  var eBirth = new Float32Array(EMBERS);
  var eRnd = new Float32Array(EMBERS * 2);
  for (var e = 0; e < EMBERS; e++) eBirth[e] = -1000;

  var emberGeo = new T.BufferGeometry();
  var ePosAttr = new T.BufferAttribute(ePos, 3); ePosAttr.setUsage(T.DynamicDrawUsage);
  var eVelAttr = new T.BufferAttribute(eVel, 3); eVelAttr.setUsage(T.DynamicDrawUsage);
  var eBirthAttr = new T.BufferAttribute(eBirth, 1); eBirthAttr.setUsage(T.DynamicDrawUsage);
  var eRndAttr = new T.BufferAttribute(eRnd, 2); eRndAttr.setUsage(T.DynamicDrawUsage);
  emberGeo.setAttribute('position', ePosAttr);
  emberGeo.setAttribute('aVel', eVelAttr);
  emberGeo.setAttribute('aBirth', eBirthAttr);
  emberGeo.setAttribute('aRnd', eRndAttr);
  emberGeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, 0), RING_R + 4);

  var emberMat = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: T.AdditiveBlending,
    uniforms: {
      uTime: uTime,
      uOpacity: uOpacity,
      uScale: uScale,
      uLife: { value: EMBER_LIFE },
      uRose: { value: new T.Vector3(ROSE[0], ROSE[1], ROSE[2]) },
      uCream: { value: new T.Vector3(CREAM[0], CREAM[1], CREAM[2]) }
    },
    vertexShader: [
      'attribute vec3 aVel;',
      'attribute float aBirth;',
      'attribute vec2 aRnd;',
      'uniform float uTime;',
      'uniform float uScale;',
      'uniform float uLife;',
      'varying float vAge;',
      'void main(){',
      '  float age = uTime - aBirth;',
      '  if (aBirth < -900.0 || age < 0.0 || age > uLife) {',
      '    vAge = 1.0; gl_PointSize = 0.0; gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return;',
      '  }',
      '  float u = age / uLife;',
      '  vec3 p = position + aVel * age * (1.0 - 0.34 * u);',
      '  p.y += 0.38 * age;',
      '  p.x += sin(aRnd.y * 6.283 + age * 2.6) * 0.07 * u;',
      '  vAge = u;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_PointSize = 9.0 * aRnd.x * (uScale / max(-mv.z, 0.1)) * (0.45 + 0.55 * (1.0 - u));',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uOpacity;',
      'uniform vec3 uRose;',
      'uniform vec3 uCream;',
      'varying float vAge;',
      'void main(){',
      '  vec2 uv = gl_PointCoord - 0.5;',
      '  float d2 = dot(uv, uv);',
      '  if (d2 > 0.25) discard;',
      '  float a = smoothstep(0.25, 0.0, d2);',
      '  float fade = smoothstep(0.0, 0.09, vAge) * (1.0 - smoothstep(0.35, 1.0, vAge));',
      '  vec3 col = mix(uCream, uRose, vAge);',
      '  gl_FragColor = vec4(col, a * a * fade * 0.62 * uOpacity);',
      '}'
    ].join('\n')
  });

  var embers = new T.Points(emberGeo, emberMat);
  embers.frustumCulled = false;
  embers.renderOrder = 5;
  ring.add(embers);

  /* ── the pool of light the ring stands in ────────────────────────────── */
  var glowMat = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: T.AdditiveBlending,
    uniforms: {
      uTime: uTime,
      uOpacity: uOpacity,
      uRose: { value: new T.Vector3(ROSE[0], ROSE[1], ROSE[2]) }
    },
    vertexShader: [
      'varying vec2 vUv;',
      'void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime;',
      'uniform float uOpacity;',
      'uniform vec3 uRose;',
      'varying vec2 vUv;',
      'void main(){',
      '  float d = length(vUv - 0.5) * 2.0;',
      '  float halo = smoothstep(1.0, 0.62, d) * smoothstep(0.32, 0.72, d);',
      '  float breathe = 0.86 + 0.14 * sin(uTime * 0.5);',
      '  gl_FragColor = vec4(uRose, halo * 0.10 * breathe * uOpacity);',
      '}'
    ].join('\n')
  });
  var glow = new T.Mesh(new T.PlaneGeometry(RING_R * 2.9, RING_R * 2.9), glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.renderOrder = 1;
  glow.frustumCulled = false;
  ring.add(glow);

  /* ══════════════════════════════════════════════════════════════════════
     QUALITY GOVERNOR

     Fill rate is what costs here, so a struggling machine is given smaller
     sprites, fewer chords, no halo and a lower pixel ratio — never fewer
     seats. Demotion is one-way: a tier that recovers only because it got
     cheaper would immediately promote itself back into the same stall.
     ══════════════════════════════════════════════════════════════════════ */
  function applyTier(next) {
    tier = Math.max(0, Math.min(TIERS.length - 1, next));
    var q = TIERS[tier];
    seatMat.uniforms.uSize.value = q.size;
    chordGeo.setDrawRange(0, q.chords * CHORD_SEGS * 2);
    riserGeo.setDrawRange(0, q.risers);
    glow.visible = q.glow;
    embers.visible = q.embers;
    var dpr = Math.min(window.devicePixelRatio || 1, q.dpr);
    if (Math.abs(renderer.getPixelRatio() - dpr) > 0.01) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    }
    uScale.value = renderer.getPixelRatio() * REF_DIST;
    canvas.dataset.tier = String(tier);
  }

  var ema = 0;
  var slowRun = 0;
  var governorFrames = 0;

  function resetGovernor() {
    ema = 0;
    slowRun = 0;
    governorFrames = 0;
  }

  function governor(dt) {
    if (tierLocked) return;
    governorFrames++;
    /* The first frames after a start carry shader compilation, the first
       buffer upload and whatever scrolling woke the observer, so they are
       never evidence about the GPU. */
    if (governorFrames < 4) return;

    /* A frame over half a second is a main-thread stall — a layout, a decode,
       a collection — not a rasteriser that cannot keep up. Demoting on one of
       those would let any transient hiccup permanently downgrade the page, so
       it counts for very little on its own. */
    if (dt > 0.55) {
      slowRun += 1;
    } else if (dt > 0.09) {
      slowRun += 4;
      ema = ema ? ema * 0.85 + dt * 0.15 : dt;
    } else {
      ema = ema ? ema * 0.85 + dt * 0.15 : dt;
      if (ema > 0.03) slowRun += 1;
      else slowRun = Math.max(0, slowRun - 2);
    }

    if (slowRun >= 24) {
      if (tier < TIERS.length - 1) {
        resetGovernor();
        applyTier(tier + 1);
      } else if (slowRun >= 90) {
        /* Sustained failure at the cheapest tier over hundreds of frames.
           A hero that stutters is worse than one that holds still, so the
           static ring takes over — but it takes this much to earn it. */
        stop();
        document.documentElement.classList.add('no-webgl');
        canvas.style.display = 'none';
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     CAMERA FRAMINGS
     ══════════════════════════════════════════════════════════════════════ */
  var FRAME_HERO = { dist: 7.95, tilt: TILT_HERO, fov: 42 };
  var FRAME_LOOP = { dist: 14.0, tilt: TILT_LOOP, fov: 40 };

  var camDist = FRAME_HERO.dist;
  var camTilt = FRAME_HERO.tilt;
  var camFov = FRAME_HERO.fov;
  var camTgt = new T.Vector3(0, 0, 0);

  /* Where the ring should sit on screen, in CSS pixels. In the hero it is
     parked in the right-hand column; in the loop it is pinned to its stage
     and rides with the scroll. */
  var wantX = 0, wantY = 0, haveX = 0, haveY = 0, offsetPrimed = false;
  var appliedOffX = NaN, appliedOffY = NaN;

  /* ══════════════════════════════════════════════════════════════════════
     POINTER
     ══════════════════════════════════════════════════════════════════════ */
  var ray = new T.Raycaster();
  var ndc = new T.Vector2(-10, -10);
  var ringPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
  ring.updateMatrixWorld(true);
  ringPlane.applyMatrix4(ring.matrixWorld);

  var hitWorld = new T.Vector3();
  var hitLocal = new T.Vector3();
  var prevHit = new T.Vector3(9999, 0, 0);
  var pointerLive = false;
  var emberHead = 0;
  var emberDirty = false;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  function onPointerMove(ev) {
    if (ev.pointerType === 'touch' || !fine.matches) return;
    ndc.x = (ev.clientX / window.innerWidth) * 2 - 1;
    ndc.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    pointerLive = true;
  }
  function onPointerOut() {
    pointerLive = false;
    prevHit.set(9999, 0, 0);
  }

  function spawnEmber(x, y, z) {
    var idx = emberHead;
    emberHead = (emberHead + 1) % EMBERS;
    ePos[idx * 3] = x; ePos[idx * 3 + 1] = y; ePos[idx * 3 + 2] = z;
    eVel[idx * 3] = (rnd() - 0.5) * 0.42;
    eVel[idx * 3 + 1] = 0.16 + rnd() * 0.4;
    eVel[idx * 3 + 2] = (rnd() - 0.5) * 0.42;
    eBirth[idx] = uTime.value;
    eRnd[idx * 2] = 0.5 + rnd() * 0.75;
    eRnd[idx * 2 + 1] = rnd();
    emberDirty = true;
  }

  function updatePointer() {
    if (!pointerLive) {
      uPointer.value.set(999, 999, 999);
      return;
    }
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(ringPlane, hitWorld)) {
      uPointer.value.set(999, 999, 999);
      return;
    }
    hitLocal.copy(hitWorld);
    ring.worldToLocal(hitLocal);
    uPointer.value.copy(hitLocal);

    /* Emit by distance travelled, not by time, so a slow hand and a fast
       one leave the same density of light. */
    if (prevHit.x < 9000) {
      var moved = hitLocal.distanceTo(prevHit);
      if (moved > 0.0001) {
        var step = 0.075;
        var n = Math.min(10, Math.floor(moved / step));
        for (var q = 1; q <= n; q++) {
          var f = (q * step) / moved;
          spawnEmber(
            prevHit.x + (hitLocal.x - prevHit.x) * f,
            prevHit.y + (hitLocal.y - prevHit.y) * f,
            prevHit.z + (hitLocal.z - prevHit.z) * f
          );
        }
        if (n > 0) prevHit.copy(hitLocal);
      }
    } else {
      prevHit.copy(hitLocal);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     IGNITION — one seat lights when somebody joins
     ══════════════════════════════════════════════════════════════════════ */
  var igniting = [];
  function ignite(count) {
    var n = count || 1;
    for (var g = 0; g < n; g++) {
      var pick = Math.floor(rnd() * SEATS);
      var guard = 0;
      while (seatLit[pick] > 0 && guard++ < 64) pick = Math.floor(rnd() * SEATS);
      igniting.push({ i: pick, t: 0 });
      for (var b = 0; b < 26; b++) {
        spawnEmber(
          seatPos[pick * 3] + (rnd() - 0.5) * 0.12,
          seatPos[pick * 3 + 1] + (rnd() - 0.5) * 0.12,
          seatPos[pick * 3 + 2] + (rnd() - 0.5) * 0.12
        );
      }
    }
  }

  function stepIgnition(dt) {
    if (!igniting.length) return;
    for (var g = igniting.length - 1; g >= 0; g--) {
      var it = igniting[g];
      it.t += dt / 0.9;
      var val = it.t >= 1 ? 1 : (1 - Math.pow(1 - it.t, 3));
      seatLit[it.i] = val;
      if (it.t >= 1) igniting.splice(g, 1);
    }
    litAttr.needsUpdate = true;
  }

  /* ══════════════════════════════════════════════════════════════════════
     VISIBILITY — nothing renders unless the hero or the loop is on screen
     ══════════════════════════════════════════════════════════════════════ */
  var heroEl = document.querySelector('.hero');
  var loopEl = document.getElementById('loop');
  var stageEl = document.getElementById('loopStage');
  var nodeEls = stageEl ? Array.prototype.slice.call(stageEl.querySelectorAll('[data-node]')) : [];
  /* Clockwise from the top once the ring has turned to face the reader:
     Give, Vote, Empower, Ask — the order the copy argues for. */
  var NODE_ANGLE = { give: Math.PI / 2, vote: 0, empower: -Math.PI / 2, ask: Math.PI };

  var heroOn = false, loopOn = false, docVisible = !document.hidden;
  var running = false, frame = 0, lastT = 0;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.target === heroEl) heroOn = en.isIntersecting;
      else if (en.target === loopEl) loopOn = en.isIntersecting;
    });
    sync();
  }, { rootMargin: '12% 0px', threshold: 0 });
  if (heroEl) io.observe(heroEl);
  if (loopEl) io.observe(loopEl);

  function shouldRun() { return (heroOn || loopOn) && docVisible && !destroyed; }

  function sync() {
    var want = shouldRun();
    if (want && !running) start();
    else if (!want && running) stop();
  }

  function start() {
    if (running || destroyed) return;
    running = true;
    canvas.dataset.animationActive = 'true';
    lastT = 0;
    resetGovernor();
    /* Coming back into view, adopt the new framing outright rather than
       swinging to it from wherever the last section left the camera. */
    offsetPrimed = false;
    snapFraming();
    frame = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    canvas.dataset.animationActive = 'false';
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  document.addEventListener('visibilitychange', function () {
    docVisible = !document.hidden;
    sync();
  });

  /* ══════════════════════════════════════════════════════════════════════
     FRAMING
     ══════════════════════════════════════════════════════════════════════ */
  var stageRect = null;

  /* Fit the whole circle inside whatever box the loop section gives it,
     rather than hoping a hard-coded distance suits every screen. */
  function loopDistance(fov) {
    if (!stageRect) return FRAME_LOOP.dist;
    var H = window.innerHeight;
    /* Narrow screens leave the ring more room, because the four labels sit
       outside the rim and there is no margin to spend. */
    var fit = window.innerWidth < 760 ? 0.72 : 0.88;
    var target = Math.min(stageRect.height, stageRect.width) * fit;
    if (target < 40) return FRAME_LOOP.dist;
    var ringH = 2 * RING_R * 0.97;
    var d = (ringH * H) / (2 * Math.tan((fov * Math.PI / 180) / 2) * target);
    return Math.max(7, Math.min(40, d));
  }

  var framing = { dist: FRAME_HERO.dist, tilt: FRAME_HERO.tilt, fov: FRAME_HERO.fov };

  function measureWant() {
    var W = window.innerWidth, H = window.innerHeight;
    if (loopOn && stageEl) {
      stageRect = stageEl.getBoundingClientRect();
      if (stageRect.width > 0) {
        wantX = stageRect.left + stageRect.width / 2;
        wantY = stageRect.top + stageRect.height / 2;
        framing.dist = loopDistance(FRAME_LOOP.fov);
        framing.tilt = FRAME_LOOP.tilt;
        framing.fov = FRAME_LOOP.fov;
        return framing;
      }
    }
    stageRect = null;
    var wide = W >= 900;
    if (wide) {
      /* Pushed well right of the measure so the headline never has to
         compete with the brightest part of the rim. */
      wantX = W * 0.78;
      wantY = H * 0.46;
      framing.dist = FRAME_HERO.dist;
      framing.tilt = TILT_HERO;
    } else {
      /* A phone has no column to spare, so the ring becomes a horizon: it
         rides high and shallow, and only its near arc crosses the hero —
         behind the lockup, above the argument. */
      wantX = W * 0.5;
      wantY = H * 0.13;
      framing.dist = FRAME_HERO.dist * 1.02;
      framing.tilt = -0.42;
    }
    framing.fov = FRAME_HERO.fov;
    return framing;
  }

  function placeCamera() {
    camera.position.set(0, Math.sin(ELEV) * camDist, Math.cos(ELEV) * camDist);
    camera.lookAt(camTgt);
    camera.fov = camFov;
    ring.rotation.x = camTilt;
    ring.updateMatrixWorld(true);
    ringPlane.set(new T.Vector3(0, 1, 0), 0);
    ringPlane.applyMatrix4(ring.matrixWorld);
  }

  function snapFraming() {
    var f = measureWant();
    camDist = f.dist; camTilt = f.tilt; camFov = f.fov;
    haveX = wantX; haveY = wantY;
    offsetPrimed = true;
    placeCamera();
  }

  function damp(cur, tgt, lambda, dt) {
    return cur + (tgt - cur) * (1 - Math.exp(-lambda * dt));
  }

  function applyCamera(dt) {
    var f = measureWant();
    if (!offsetPrimed) { haveX = wantX; haveY = wantY; offsetPrimed = true; }

    var l = 5.4;
    camDist = damp(camDist, f.dist, l, dt);
    camTilt = damp(camTilt, f.tilt, l, dt);
    camFov = damp(camFov, f.fov, l, dt);

    /* The loop framing must track its stage exactly or the labels drift, so
       it is followed hard; the hero drifts in gently. */
    var ol = loopOn ? 22 : 6;
    haveX = damp(haveX, wantX, ol, dt);
    haveY = damp(haveY, wantY, ol, dt);

    placeCamera();

    var W = window.innerWidth, H = window.innerHeight;
    var offX = -(haveX - W / 2);
    var offY = -(haveY - H / 2);
    if (Math.abs(offX - appliedOffX) > 0.25 || Math.abs(offY - appliedOffY) > 0.25 || appliedOffX !== appliedOffX) {
      camera.setViewOffset(W, H, offX, offY, W, H);
      appliedOffX = offX; appliedOffY = offY;
    } else {
      camera.updateProjectionMatrix();
    }
  }

  /* ── project the four loop labels onto the live ring ─────────────────── */
  var projV = new T.Vector3();
  var centreV = new T.Vector3();
  var labelsOn = false;

  function placeLabels() {
    if (!stageEl || !nodeEls.length) return;
    if (!loopOn || !stageRect) {
      if (labelsOn) {
        stageEl.classList.remove('is-projected');
        /* Hand the nodes back to the stylesheet rosette cleanly. */
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

    /* Project the hub too, so each label can be nudged radially outward and
       sit clear of the rim instead of on top of the seats. */
    centreV.set(0, 0, 0);
    ring.localToWorld(centreV);
    centreV.project(camera);
    var cx = (centreV.x * 0.5 + 0.5) * W - stageRect.left;
    var cy = (-centreV.y * 0.5 + 0.5) * H - stageRect.top;

    for (var n = 0; n < nodeEls.length; n++) {
      var el = nodeEls[n];
      var ang = NODE_ANGLE[el.getAttribute('data-node')];
      projV.set(Math.cos(ang) * RING_R, 0, Math.sin(ang) * RING_R);
      ring.localToWorld(projV);
      projV.project(camera);
      if (projV.z > 1) { el.style.opacity = '0'; continue; }
      el.style.opacity = '1';
      var sx = (projV.x * 0.5 + 0.5) * W - stageRect.left;
      var sy = (-projV.y * 0.5 + 0.5) * H - stageRect.top;
      var dx = sx - cx, dy = sy - cy;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      /* Only enough to lift the dot off the densest part of the band; the
         label already hangs outboard of the dot in CSS. */
      var push = Math.min(window.innerWidth < 760 ? 5 : 10, len * 0.05);
      sx += (dx / len) * push;
      sy += (dy / len) * push;
      el.style.transform = 'translate3d(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px,0) translate(-50%,-50%)';
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     RESIZE
     ══════════════════════════════════════════════════════════════════════ */
  function resize() {
    var W = window.innerWidth, H = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, TIERS[tier].dpr));
    renderer.setSize(W, H, false);
    uScale.value = renderer.getPixelRatio() * REF_DIST;
    camera.aspect = W / H;
    appliedOffX = NaN;
    camera.updateProjectionMatrix();
    if (!running) { snapFraming(); renderOnce(); }
  }

  var resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 90);
  }

  /* ══════════════════════════════════════════════════════════════════════
     LOOP
     ══════════════════════════════════════════════════════════════════════ */
  function renderOnce() {
    renderer.render(scene, camera);
  }

  function tick(now) {
    if (!running) return;
    frame = requestAnimationFrame(tick);

    var t = now * 0.001;
    var raw = lastT ? t - lastT : 1 / 60;
    var dt = Math.min(raw, 1 / 30);
    lastT = t;
    uTime.value = t;

    governor(raw);
    if (!running) return;

    /* Fade in once, on the first frame the ring is ever shown. */
    if (uOpacity.value < 1) uOpacity.value = Math.min(1, uOpacity.value + dt * 1.4);

    applyCamera(dt);
    updatePointer();
    stepIgnition(dt);

    if (emberDirty) {
      ePosAttr.needsUpdate = true;
      eVelAttr.needsUpdate = true;
      eBirthAttr.needsUpdate = true;
      eRndAttr.needsUpdate = true;
      emberDirty = false;
    }

    renderer.render(scene, camera);
    placeLabels();
  }

  /* ══════════════════════════════════════════════════════════════════════
     RESILIENCE
     ══════════════════════════════════════════════════════════════════════ */
  var destroyed = false;

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
    [seatGeo, chordGeo, riserGeo, emberGeo, glow.geometry].forEach(function (g) { g.dispose(); });
    [seatMat, chordMat, riserMat, emberMat, glowMat].forEach(function (m) { m.dispose(); });
    renderer.dispose();
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerOut);
  window.addEventListener('blur', onPointerOut);
  window.addEventListener('pagehide', destroy, { once: true });

  applyTier(tier);
  resize();
  document.body.classList.add('scene-ready');
  sync();

  window.FRDMScene = {
    ignite: ignite,
    destroy: destroy,
    stats: function () {
      return { seats: SEATS, tier: tier, chords: TIERS[tier].chords, risers: TIERS[tier].risers, running: running, locked: tierLocked };
    }
  };
})();
