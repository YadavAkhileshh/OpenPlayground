/*!
Parametric Surface
Copyright (c) 2024 by Wakana Y.K. (https://codepen.io/wakana-k/pen/poBBRmN)
*/
"use strict";
import * as c from "three";
import { OrbitControls as u } from "three/addons/controls/OrbitControls.js";
import { ParametricGeometry as t } from "three/addons/geometries/ParametricGeometry.js";
import "three/addons/exporters/OBJExporter.js";
{
  function l(t, a) {
    t.preventDefault();
    let e = null;
    (e = t.target && t.target.dataset.index ? t.target.dataset.index : e) &&
      (o[e].children[0].material.wireframe = a);
  }
  function P(t, a, e) {
    var s = t,
      h =
        ((t += 3 * (a = a * Math.PI * 2)),
        Math.cos(a) * (6 - (5 / 4 + Math.sin(3 * t)) * Math.sin(t - 3 * a))),
      n = Math.sin(a) * (6 - (5 / 4 + Math.sin(3 * t)) * Math.sin(t - 3 * a)),
      a = -Math.sin(t - 3 * a) * (5 / 4 + Math.cos(3 * t));
    return (
      (h *= Math.cos(1.55 * s)),
      (n *= Math.cos(1.55 * s)),
      (a += 8 * Math.cos(s)),
      e.set(h, n, a)
    );
  }
  function I(t, a, e) {
    t = t * Math.PI * 2;
    var s =
        Math.cos((a = a * Math.PI * 2)) *
        (6 - (2 + Math.sin(3 * t)) * Math.sin(t - 3 * a)),
      h = Math.sin(a) * (6 - (2 + Math.sin(3 * t)) * Math.sin(t - 3 * a)),
      a = -Math.cos(t - 3 * a) * (2 + Math.sin(3 * t));
    return e.set(s, h, a);
  }
  function p(t, a, e) {
    t = (t = 1 === t ? 0 : t) * Math.PI * 2;
    let s =
        Math.cos((a = a * Math.PI * 2)) *
        (5 - (6 + Math.sin(3 * t)) * Math.sin(t - 3 * a)),
      h = Math.sin(a) * (5 - (6 + Math.sin(3 * t)) * Math.sin(t - 3 * a)),
      n = -Math.cos(t - 3 * a) * (6 + Math.sin(3 * t));
    return (
      n > 6 * 1.05 && ((n = 6 * 1.05), (s = 0), (h = 0)),
      (s *= Math.cos((n + 3) / 6)),
      (h *= Math.cos((n + 3) / 6)),
      (n *= 2),
      e.set(s, h, n)
    );
  }
  function d(t, a, e) {
    t = t * Math.PI * 2;
    var s =
        Math.cos((a = a * Math.PI * 2)) *
        (5 - (5 + Math.cos(4 * t)) * Math.cos(t - 4 * a)),
      a = Math.sin(a) * (5 - (5 + Math.cos(4 * t)) * Math.cos(t - 4 * a)),
      t = 5 + Math.sin(4 * t);
    return e.set(s, a, t);
  }
  function m(t, a, e) {
    t = t * Math.PI * 2;
    var s = Math.cos((a = a * Math.PI * 2)) * (6 - (2 + Math.sin(4 * t))),
      h = Math.sin(a) * (6 - (2 + Math.sin(4 * t))),
      a = -Math.cos(t - 4 * a) * (2 + Math.sin(4 * t));
    return e.set(s, h, a);
  }
  function w(t, a, e) {
    t = t * Math.PI * 2;
    var s = 2 + Math.sin(3 * t + 10 * (a = a * Math.PI * 2)),
      h = s * Math.cos(t) * Math.sin(a),
      t = s * Math.sin(t) * Math.cos(a),
      s = s * Math.sin(a);
    return e.set(h, t, s);
  }
  function f(t, a, e) {
    1 === a && (a = 0), (t = (t = 1 === t ? 0 : t) * Math.PI * 2);
    var s = 2 + Math.sin(6 * t + 5 * (a = a * Math.PI * 2)),
      h = s * Math.cos(t) * Math.sin(a),
      t = s * Math.sin(t) * Math.sin(a),
      s = s * Math.cos(a);
    return e.set(h, t, s);
  }
  function v(t, a, e) {
    t = (t = 1 === t ? 0 : t) * Math.PI * 2;
    var s = 2 + Math.sin(5 * t + 10 * (a *= Math.PI)),
      h = s * Math.cos(t) * Math.sin(a),
      t = s * Math.sin(t) * Math.sin(a),
      s = s * Math.cos(a);
    return e.set(h, t, s);
  }
  function D(t, a, e) {
    t *= 2;
    var s = 1 - 0.5 * (a *= 2),
      h =
        0.5 * s * Math.cos(3 * a * Math.PI) * (1 + Math.cos(t * Math.PI)) +
        0 * Math.cos(3 * a * Math.PI),
      n =
        0.5 * s * Math.sin(3 * a * Math.PI) * (1 + Math.cos(t * Math.PI)) +
        0 * Math.sin(3 * a * Math.PI),
      a = +a + 0.5 * s * Math.sin(t * Math.PI);
    return e.set(h, n, a);
  }
  function g(t, a, e) {
    (t *= Math.PI), (a = a * Math.PI * 2);
    var s = ((Math.cos(t) - Math.cos(2 * t)) * Math.cos(a)) / 4,
      a = ((Math.sin(t) - Math.sin(2 * t)) * Math.sin(a)) / 4,
      t = Math.cos(t);
    return e.set(s, a, t);
  }
  function b(t, a, e) {
    t = t * Math.PI * 2;
    var s = (2.3 * Math.exp(-Math.pow(1.5 * (a *= 3), 2)) - 1.2) * Math.cos(t),
      h = a,
      a = (2.3 * Math.exp(-Math.pow(1.5 * a, 2)) - 1.2) * Math.sin(t);
    return e.set(s, h, a);
  }
  function S(t, a, e) {
    (t = 3 * t - 1.5), (a = +a);
    var s = Math.sinh(2 * t) / (Math.cos(10 * t) + Math.cosh(2 * t)),
      a = +a,
      t = Math.sin(10 * t) / (Math.cos(10 * t) + Math.cosh(2 * t));
    return e.set(s, a, t);
  }
  function E(t, a, e) {
    t *= 2 * Math.PI;
    var s = +Math.cos((a = a * (Math.PI / 2 - 0.25) + 0.25)) * Math.cos(t),
      h = -1 / Math.tan(a),
      a = +Math.cos(a) * Math.sin(t);
    return e.set(s, h, a);
  }
  function x(t, a, e) {
    t *= 2 * Math.PI;
    var s = (a *= 20) * Math.cos(t),
      h = +Math.cos(2 * t + 2 * a),
      a = a * Math.sin(t);
    return e.set(s, h, a);
  }
  function B(t, a, e) {
    (t *= 2 * Math.PI), (a = a * (2 * Math.PI) - Math.PI);
    var s = +Math.cos(t) * Math.cos(a),
      h = +Math.sin(a) + +t,
      t = +Math.sin(t) * Math.cos(a);
    return e.set(s, h, t);
  }
  function X(t, a, e) {
    (t = +t), (a *= 2 * Math.PI);
    var s = 0.6 * Math.sqrt(t * (t - 1) * (t - 2)) * Math.sin(a),
      h = t,
      t = 0.6 * Math.sqrt(t * (t - 1) * (t - 2)) * Math.cos(a);
    return e.set(s, h, t);
  }
  function T(t, a, e) {
    (t = t * Math.PI * 2 - Math.PI), (a = a * Math.PI * 2 - Math.PI);
    var s = Math.cos(t) * (5 + 4.8 * Math.cos(a)) + Math.pow(a / Math.PI, 20),
      t = Math.sin(t) * (5 + 4.8 * Math.cos(a)) + 0.25 * Math.cos(5 * t),
      a = -2.3 * Math.log(1 - 0.3157 * a) + 6 * Math.sin(a) + 2 * Math.cos(a);
    return e.set(s, t, a);
  }
  function C(t, a, e) {
    (t *= Math.PI), (a *= 2 * Math.PI);
    var s = Math.cos(t),
      h = Math.cos(a),
      t = 0.5 * Math.sin(t) * Math.sin(a);
    return e.set(s, h, t);
  }
  function y(t, a, e) {
    (t = 2 * Math.PI * t), (a *= 2 * Math.PI);
    var s = Math.sin(7 * t) + 2,
      h =
        8 * Math.cos(t) -
        Math.cos(8 * t) -
        (7 / 8) * s * Math.sin((9 * t) / 2) * Math.cos(a),
      n = s * Math.sin(a),
      s =
        8 * Math.sin(t) -
        Math.sin(8 * t) +
        (7 / 8) * s * Math.cos((9 * t) / 2) * Math.cos(a);
    return e.set(h, n, s);
  }
  function L(t, a, e) {
    (t *= Math.PI), (a = a * Math.PI * 2);
    var s = 0.25 * Math.sin(2 * t) * Math.cos(a) ** 2,
      h = 0.25 * Math.sin(t) * Math.sin(2 * a),
      t = 0.25 * Math.cos(t) * Math.sin(2 * a);
    return e.set(s, h, t);
  }
  function q(t, a, e) {
    (t = 26.4 * t - 13.2), (a = 2 * a * 37.4 - 37.4);
    var s = Math.sqrt(0.84),
      h = 0.4 * ((s * Math.cosh(0.4 * t)) ** 2 + (0.4 * Math.sin(s * a)) ** 2),
      n = -t + (1.68 * Math.cosh(0.4 * t) * Math.sinh(0.4 * t)) / h,
      M =
        (2 *
          s *
          Math.cosh(0.4 * t) *
          (-(s * Math.cos(a) * Math.cos(s * a)) -
            Math.sin(a) * Math.sin(s * a))) /
        h,
      t =
        (2 *
          s *
          Math.cosh(0.4 * t) *
          (-(s * Math.sin(a) * Math.cos(s * a)) +
            Math.cos(a) * Math.sin(s * a))) /
        h;
    return e.set(n, t, M);
  }
  function R(t, a, e) {
    var s;
    return (
      (t *= Math.PI),
      (a = a * Math.PI * 2),
      (s = 0.5 * (1 - Math.cos(t)) * Math.sin(t) * Math.cos(a)),
      (a = 0.5 * (1 - Math.cos(t)) * Math.sin(t) * Math.sin(a)),
      (t = Math.cos(t)),
      e.set(s, a, t)
    );
  }
  function V(t, a, e) {
    var s, h;
    return (
      (t = (t = 1 === t ? 0 : t) * Math.PI * 2),
      (a *= Math.PI),
      (s = (4 * Math.sin(t) - Math.sin(3 * t)) * Math.sin(a)),
      (h = 2 * Math.cos(a)),
      (t =
        1.2 *
        (4 * Math.cos(t) - Math.cos(2 * t) - Math.cos(3 * t) / 2) *
        Math.sin(a)),
      e.set(s, h, t)
    );
  }
  function H(t, a, e) {
    (t = t * Math.PI * 2), (a = (a - 0.5) * Math.PI);
    var s =
        +Math.cos(t) *
        Math.cos(t) *
        Math.cos(t) *
        Math.cos(a) *
        Math.cos(a) *
        Math.cos(a),
      t =
        +Math.sin(t) *
        Math.sin(t) *
        Math.sin(t) *
        Math.cos(a) *
        Math.cos(a) *
        Math.cos(a),
      a = +Math.sin(a) * Math.sin(a) * Math.sin(a);
    return e.set(s, t, a);
  }
  function N(t, a, e) {
    (t = t * Math.PI * 2), (a = (a - 0.5) * Math.PI);
    var s = +Math.cos(t) * Math.cos(a) * Math.cos(a) * Math.cos(a),
      t = +Math.sin(t) * Math.cos(a) * Math.cos(a) * Math.cos(a),
      a = +Math.sin(a) * Math.sin(a) * Math.sin(a);
    return e.set(s, t, a);
  }
  function Z(t, a, e) {
    (t = t * Math.PI * 2), (a = a * Math.PI * 2);
    var s = 16 * Math.pow(Math.sin(t), 3) * Math.cos(a),
      h =
        -13 * Math.cos(t) +
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) +
        Math.cos(4 * t),
      t = -(16 * Math.pow(Math.sin(t), 3) * Math.sin(a));
    return e.set(s, h, t);
  }
  function j(t, a, e) {
    (t = t * Math.PI * 2), (a = a * Math.PI * 2);
    var s = +Math.sin(t),
      h = +Math.sin(a),
      t = +Math.sin(t + a);
    return e.set(s, h, t);
  }
  /*! from https://codepen.io/boytchev/pen/qBLKpjx */ function G(t, a, e) {
    t *= 2 * Math.PI;
    var s = (Math.cos((a *= 2 * Math.PI)) ** 20 + Math.sin(a) ** 20) ** -0.05,
      h = (4 + s * Math.cos(a + 3 * t)) * Math.cos(t),
      n = (4 + s * Math.cos(a + 3 * t)) * Math.sin(t),
      s = s * Math.sin(a + 3 * t);
    return e.set(h, n, s);
  }
  function J(t, a, e) {
    t = t * Math.PI * 2;
    var s =
        (2 +
          Math.cos((a = a * Math.PI * 2) / 2) * Math.sin(t) -
          Math.sin(a / 2) * Math.sin(2 * t)) *
        Math.cos(a),
      h =
        (2 +
          Math.cos(a / 2) * Math.sin(t) -
          Math.sin(a / 2) * Math.sin(2 * t)) *
        Math.sin(a),
      a = Math.sin(a / 2) * Math.sin(t) + Math.cos(a / 2) * Math.sin(2 * t);
    return e.set(s, h, a);
  }
  function W(t, a, e) {
    (t = t * (2 * Math.PI) - Math.PI), (a = a * (2 * Math.PI) - Math.PI);
    var s =
        Math.cos(t) *
        (2 + Math.sin(a) * Math.cos(t) - (Math.sin(2 * a) * Math.sin(t)) / 2),
      h = Math.sin(t) * Math.sin(a) + (Math.cos(t) * Math.sin(2 * a)) / 2,
      a =
        Math.sin(t) *
        (2 + Math.sin(a) * Math.cos(t) - (Math.sin(2 * a) * Math.sin(t)) / 2);
    return e.set(s, h, a);
  }
  function k(t, a, e) {
    var s, h;
    return (
      (t = 4 * t * Math.PI),
      (a = 2 * a * Math.PI),
      (s =
        (3 +
          Math.cos((3 * t) / 2) * Math.sin(a) -
          Math.sin((3 * t) / 2) * Math.sin(2 * a)) *
        Math.cos(+t / 2)),
      (h =
        (3 +
          Math.cos((3 * t) / 2) * Math.sin(a) -
          Math.sin((3 * t) / 2) * Math.sin(2 * a)) *
        Math.sin(+t / 2)),
      (t =
        Math.sin((3 * t) / 2) * Math.sin(a) +
        Math.cos((3 * t) / 2) * Math.sin(2 * a)),
      e.set(s, h, t)
    );
  }
  let a,
    e,
    n,
    s,
    h,
    M,
    i,
    o = [],
    r = [];
  var A, K, O, z, F;
  (M = new c.MeshNormalMaterial({ side: c.DoubleSide })),
    ((a = new c.PerspectiveCamera(50, 1, 1, 10)).position.z = 3),
    (a.fov = 2 * Math.atan(2 / (2 * a.position.z)) * (180 / Math.PI)),
    (i = document.getElementById("c")),
    (n = new c.WebGLRenderer({
      canvas: i,
      antialias: !0,
      alpha: !0
    })).setPixelRatio(window.devicePixelRatio),
    ((h = new t(H, 25, 25)).userData.title = "Astroidal Ellipsoid"),
    r.push(h),
    (h = new t(N, 25, 25)).rotateX(Math.PI / 2),
    h.rotateZ(-Math.PI / 8),
    r.push(h),
    (h = new t(j, 50, 50)).scale(0.5, 0.5, 0.5),
    (h.userData.title = "Sine Surface"),
    r.push(h),
    (h = new t(L, 50, 50)).scale(3, 3, 3),
    (h.userData.title = "Roman Surface"),
    r.push(h),
    (h = new t(w, 50, 200)).scale(0.3, 0.3, 0.3),
    r.push(h),
    (h = new t(q, 50, 50)).rotateZ(-Math.PI / 2),
    h.rotateX(-Math.PI / 4),
    h.scale(0.15, 0.15, 0.15),
    (h.userData.title = "breather"),
    r.push(h),
    (h = new t(y, 100, 25)).rotateZ(-Math.PI / 2),
    h.scale(0.1, 0.1, 0.1),
    (h.userData.title = "bonanJeenerKlein"),
    r.push(h),
    (h = new t(C, 20, 20)).scale(0.8, 0.8, 0.8),
    (h.userData.title = "Pillow"),
    r.push(h),
    (h = new t(B, 15, 15)).scale(0.3, 0.3, 0.3),
    (h.userData.title = "twistedSphere"),
    r.push(h),
    (h = new t(x, 50, 25)).rotateX(-Math.PI / 4),
    h.scale(0.06, 0.06, 0.06),
    (h.userData.title = "spiralWaves"),
    r.push(h),
    (h = new t(E, 25, 25)).scale(0.5, 0.5, 0.5),
    (h.userData.title = "bullet"),
    r.push(h),
    (h = new t(S, 300, 2)).rotateX(-Math.PI / 2),
    h.scale(0.4, 0.4, 0.4),
    (h.userData.title = "tanh Spiral"),
    r.push(h),
    (h = new t(b, 25, 15)).scale(0.5, 0.5, 0.5),
    (h.userData.title = "gauss Cylinder"),
    r.push(h),
    (h = new t(g, 20, 15)).rotateZ(-Math.PI / 2),
    (h.userData.title = "fish Surface"),
    r.push(h),
    (h = new t(D, 25, 50)).rotateX(-Math.PI / 2),
    h.scale(0.8, 0.8, 0.8),
    (h.userData.title = "seashell"),
    r.push(h),
    (h = new t(Z, 50, 50)).scale(0.05, 0.05, 0.05),
    r.push(h),
    (h = new t(R, 25, 25)).rotateX(-Math.PI / 2),
    (h.userData.title = "droplet"),
    r.push(h),
    (h = new t(X, 20, 25)).scale(2, 2, 2),
    (h.userData.title = "egg"),
    r.push(h),
    (h = new t(V, 70, 30)).rotateX(-Math.PI / 2),
    h.scale(0.2, 0.2, 0.2),
    (h.userData.title = "Julia's Parametric Heart Surface"),
    r.push(h),
    (h = new t(T, 25, 25)).rotateX(-Math.PI / 4),
    h.scale(0.1, 0.1, 0.1),
    (h.userData.title = "apple2"),
    r.push(h),
    (h = new t(J, 50, 50)).scale(0.3, 0.3, 0.3),
    (h.userData.title = "Klein Bottle1"),
    r.push(h),
    (h = new t(W, 50, 50)).rotateX(-Math.PI / 2),
    h.scale(0.3, 0.3, 0.3),
    (h.userData.title = "Klein Bottle2"),
    r.push(h),
    (h = new t(G, 50, 30)).scale(0.2, 0.2, 0.2),
    (h.userData.title =
      "Twisted Torus<br>(from <a target='_blank' href='https://codepen.io/boytchev/pen/qBLKpjx'>Pavel Boytchev</a>)"),
    r.push(h),
    (h = new t(k, 50, 50)).scale(0.25, 0.25, 0.25),
    (h.userData.title = "Twisted Torus2"),
    r.push(h),
    (h = new t(I, 20, 70)).scale(0.12, 0.12, 0.12),
    (h.userData.title = "Twisted Torus3"),
    r.push(h),
    (h = new t(P, 10, 100)).rotateX(Math.PI / 2),
    h.scale(0.18, 0.18, 0.18),
    (h.userData.title = "merengue1"),
    r.push(h),
    (h = new t(p, 50, 150)).rotateX(-Math.PI / 2),
    h.scale(0.1, 0.08, 0.1),
    (h.userData.title = "merengue2"),
    r.push(h),
    (h = new t(m, 100, 100)).scale(0.2, 0.2, 0.2),
    r.push(h),
    (h = new t(d, 30, 100)).scale(0.1, 0.1, 0.1),
    r.push(h),
    (h = new t(v, 100, 100)).scale(0.3, 0.3, 0.3),
    (h.userData.title = "twistedSphere2"),
    r.push(h),
    (h = new t(f, 100, 100)).scale(0.3, 0.3, 0.3),
    (h.userData.title = "twistedSphere3"),
    r.push(h),
    (A = document.getElementById("gallery")),
    (K = new IntersectionObserver((t) => {
      for (const a of t)
        a.isIntersecting
          ? (a.target.dataset.inView = !0)
          : (a.target.dataset.inView = !1);
    }));
  for (let t = 0; t < r.length; t++) {
    e = new c.Scene();
    (O = document.createElement("article")),
      (z = ((O.className = "card"), document.createElement("div"))),
      (F =
        ((z.className = "geo"),
        (z.dataset.index = t),
        (z.dataset.inView = !0),
        O.appendChild(z),
        document.createElement("div")));
    (F.className = "title"),
      (F.innerText = "Parametric surface " + (t + 1)),
      O.appendChild(F),
      (e.userData.element = z),
      A.appendChild(O),
      (a = a.clone()),
      (e.userData.camera = a),
      ((s = new u(e.userData.camera, e.userData.element)).autoRotate = !0),
      (s.minDistance = 2),
      (s.maxDistance = 10),
      (s.enablePan = !1),
      (s.enableZoom = !1),
      (s.enableDamping = !0),
      (e.userData.controls = s),
      (h = r[r.length - t - 1]).computeVertexNormals(),
      h.computeBoundingBox(),
      h.computeBoundingSphere(),
      h.center(),
      (M = M.clone()),
      e.add(new c.Mesh(h, M)),
      h.userData.title && (F.innerHTML = h.userData.title),
      o.push(e),
      z.addEventListener(
        "pointerenter",
        (t) => {
          l(t, !0);
        },
        !1
      ),
      z.addEventListener(
        "pointerleave",
        (t) => {
          l(t, !1);
        },
        !1
      ),
      z.addEventListener(
        "pointerout",
        (t) => {
          l(t, !1);
        },
        !1
      ),
      z.addEventListener(
        "pointercancel",
        (t) => {
          l(t, !1);
        },
        !1
      ),
      K.observe(z);
  }
  !(function t() {
    requestAnimationFrame(t);
    var a = i.clientWidth,
      e = i.clientHeight;
    (i.width === a && i.height === e) || n.setSize(a, e, !1),
      n.setScissorTest(!1),
      n.clear(),
      n.setScissorTest(!0),
      o.forEach(function (t) {
        var a,
          e,
          s = t.userData.element,
          h = s.getBoundingClientRect();
        "false" != s.dataset.inView &&
          ((s = h.width),
          (a = h.height),
          (s = Math.ceil(s)),
          (a = Math.ceil(a)),
          (e = h.left),
          (h =
            document.documentElement.offsetHeight -
            h.bottom -
            (document.documentElement.offsetHeight -
              n.domElement.getBoundingClientRect().bottom)),
          (e = Math.ceil(e)),
          (h = Math.ceil(h)),
          n.setViewport(e, h, s, a),
          n.setScissor(e, h, s, a),
          (e = t.userData.camera),
          t.userData.controls.update(),
          n.render(t, e));
      });
  })();
}
const e = new Lenis();
requestAnimationFrame(function t(a) {
  e.raf(a), requestAnimationFrame(t);
});
