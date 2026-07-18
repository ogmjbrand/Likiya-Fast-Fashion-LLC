"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { Button } from "@likiya/ui";

const BRAND_PINK = new THREE.Color("#f83599");
const BRAND_WHITE = new THREE.Color("#ffffff");
const BRAND_BLACK = new THREE.Color("#050505");

const SLIDES = [
  {
    eyebrow: "Fall/Winter — The Considered Edit",
    title: "Fast Fashion,\nCut Like Couture.",
    desc: "Runway ideas, street-ready pieces — designed to outlast the trend cycle.",
    cta: false,
  },
  {
    eyebrow: "Our Approach",
    title: "Crafted With\nIntention.",
    desc: "Every stitch, every silhouette — considered before it's ever cut.",
    cta: false,
  },
  {
    eyebrow: "The Attitude",
    title: "Street Energy,\nEditorial Precision.",
    desc: "Confidence you can wear. Conviction you can see.",
    cta: false,
  },
  {
    eyebrow: "Welcome",
    title: "This Is\nLikiya.",
    desc: "Shop the edit — new arrivals, dropped weekly.",
    cta: true,
  },
] as const;

const SPARK_COUNT = 450;
const SCROLL_VH = 350;

function BlurTitle({ text, className }: { text: string; className?: string }) {
  let charIndex = 0;
  return (
    <h2 className={className} aria-label={text.replace(/\n/g, " ")}>
      {text.split("\n").map((line, lineIndex, lines) => (
        <span key={lineIndex} aria-hidden className="block">
          {line.split("").map((char) => {
            const delay = charIndex * 0.03;
            charIndex += 1;
            return (
              <span
                key={charIndex}
                className="cinematic-char inline-block"
                style={{ transitionDelay: `${delay}s` }}
              >
                {char === " " ? " " : char}
              </span>
            );
          })}
          {lineIndex < lines.length - 1 ? <br aria-hidden /> : null}
        </span>
      ))}
    </h2>
  );
}

function createSparkTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.6, "rgba(255,255,255,0.3)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 16);
  return new THREE.CanvasTexture(canvas);
}

const BG_VERTEX = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.z += sin(pos.x * 1.4 + uTime * 0.3) * 0.04 + cos(pos.y * 1.1 + uTime * 0.22) * 0.04;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const BG_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  uniform vec3 uColorTop;
  uniform vec3 uColorBottom;

  void main() {
    vec2 uv = vUv;
    float wave = sin(uv.x * 3.0 + uTime * 0.25 + uScroll * 4.0) * 0.5
               + sin(uv.y * 4.0 - uTime * 0.18 + uScroll * 2.0) * 0.5;
    wave += sin((uv.x + uv.y) * 6.0 + uTime * 0.4) * 0.15;
    float mixVal = clamp(uv.y * 0.7 + wave * 0.12 + uMouse.y * 0.05, 0.0, 1.0);
    vec3 color = mix(uColorBottom, uColorTop, mixVal);

    float glow = smoothstep(0.9, 0.0, distance(uv, vec2(0.5 + uMouse.x * 0.08, 0.55)));
    color += uColorTop * glow * 0.1;

    float vignette = smoothstep(1.0, 0.35, distance(uv, vec2(0.5)));
    color *= mix(0.55, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Scroll-pinned WebGL hero: a real Three.js scene (not a Laocoön/bronze
 * statue GLTF — no model was supplied, so the camera instead orbits a
 * billboard playing the brand's reference video) drives a 360° camera
 * orbit, a liquid pink/black shader backdrop, and forge-style spark
 * particles as the visitor scrolls through a pinned 350vh track. Native
 * cursor is only swapped for the custom double ring while the pointer is
 * inside this section — everywhere else on the site keeps normal cursor
 * and click behavior.
 */
export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const dashRefs = useRef<Array<HTMLDivElement | null>>([]);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [cursorActive, setCursorActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!section || !sticky || !canvas || !video) return;
    const videoEl = video;

    let width = sticky.clientWidth;
    let height = sticky.clientHeight;

    const scene = new THREE.Scene();
    scene.background = BRAND_BLACK;
    scene.fog = new THREE.FogExp2("#050505", 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 4.4);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Liquid background shader, pinned to the camera so it always fills the frame.
    const bgUniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorTop: { value: BRAND_PINK },
      uColorBottom: { value: BRAND_BLACK },
    };
    const bgMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40, 24, 24),
      new THREE.ShaderMaterial({
        vertexShader: BG_VERTEX,
        fragmentShader: BG_FRAGMENT,
        uniforms: bgUniforms,
        depthWrite: false,
      }),
    );
    bgMesh.position.z = -12;
    camera.add(bgMesh);
    scene.add(camera);

    // Lighting for the particle field / subtle bloom feel.
    scene.add(new THREE.AmbientLight("#ffffff", 0.15));
    const keyLight = new THREE.SpotLight("#ffffff", 12);
    keyLight.position.set(3, 4, 3);
    keyLight.angle = Math.PI / 4;
    keyLight.penumbra = 0.9;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight("#ff8fc4", 6);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    // Video billboard — the orbit subject, in place of the spec's bronze horse GLTF.
    // Starts fully transparent and fades in once the video actually has a decoded
    // frame, so a slow load or an unsupported codec shows the shader backdrop
    // instead of a stark black rectangle.
    const modelPivot = new THREE.Group();
    scene.add(modelPivot);
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    const billboardGeometry = new THREE.PlaneGeometry(3.2, 1.8);
    const billboardMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      toneMapped: false,
      transparent: true,
      opacity: 0,
    });
    const billboard = new THREE.Mesh(billboardGeometry, billboardMaterial);
    modelPivot.add(billboard);

    const fitBillboardToVideo = () => {
      if (!video.videoWidth || !video.videoHeight) return;
      const aspect = video.videoWidth / video.videoHeight;
      const targetHeight = 1.9;
      billboard.scale.set(aspect, 1, 1);
      billboard.scale.multiplyScalar(targetHeight);
    };
    video.addEventListener("loadedmetadata", fitBillboardToVideo);
    video.play().catch(() => {});

    // Forge sparks, recolored to the brand palette (pink / white instead of orange / blue).
    const sparkGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(SPARK_COUNT * 3);
    const colors = new Float32Array(SPARK_COUNT * 3);
    const sparkData: Array<{ speedY: number; swaySpeed: number; swayRadius: number; phase: number; baseX: number; baseZ: number }> = [];

    for (let i = 0; i < SPARK_COUNT; i++) {
      const x = (Math.random() - 0.5) * 7;
      const y = (Math.random() - 0.5) * 5 - 0.5;
      const z = (Math.random() - 0.5) * 7;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const c = Math.random() < 0.6 ? BRAND_PINK : BRAND_WHITE;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sparkData.push({
        speedY: 0.15 + Math.random() * 0.3,
        swaySpeed: 0.5 + Math.random() * 1.5,
        swayRadius: 0.05 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        baseX: x,
        baseZ: z,
      });
    }
    sparkGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    sparkGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const sparks = new THREE.Points(
      sparkGeometry,
      new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        map: createSparkTexture(),
      }),
    );
    scene.add(sparks);

    // Custom cursor lerp state (updated imperatively, no React re-renders per move).
    let mouseX = 0.5;
    let mouseY = 0.5;
    let cursorX = width / 2;
    let cursorY = height / 2;
    let outerX = width / 2;
    let outerY = height / 2;

    function handlePointerMove(e: PointerEvent) {
      const rect = sticky!.getBoundingClientRect();
      cursorX = e.clientX;
      cursorY = e.clientY;
      mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    }
    sticky.addEventListener("pointermove", handlePointerMove);

    const clock = new THREE.Clock();
    let rafId = 0;

    function tick() {
      rafId = requestAnimationFrame(tick);
      const delta = clock.getDelta();

      const rect = section!.getBoundingClientRect();
      const scrollRange = rect.height - window.innerHeight;
      const progress = scrollRange > 0 ? Math.min(1, Math.max(0, -rect.top / scrollRange)) : 0;

      bgUniforms.uTime.value += delta;
      bgUniforms.uScroll.value = progress;
      bgUniforms.uMouse.value.set(mouseX, -mouseY);

      const videoReady = videoEl.readyState >= 2 ? 1 : 0;
      billboardMaterial.opacity += (videoReady - billboardMaterial.opacity) * Math.min(1, delta * 2);

      const angle = progress * Math.PI * 2;
      const radius = 4.4;
      camera.position.x = Math.sin(angle) * radius + mouseX * 0.3;
      camera.position.z = Math.cos(angle) * radius;
      camera.position.y = 0.15 + Math.sin(progress * Math.PI) * 0.5 - mouseY * 0.15;
      camera.lookAt(modelPivot.position);

      const t = clock.elapsedTime;
      const posAttr = sparkGeometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < SPARK_COUNT; i++) {
        const d = sparkData[i]!;
        let y = posAttr.getY(i) + d.speedY * delta;
        if (y > 3.2) y = -2.2;
        const sway = Math.sin(t * d.swaySpeed + d.phase) * d.swayRadius;
        posAttr.setXYZ(i, d.baseX + sway, y, d.baseZ + sway);
      }
      posAttr.needsUpdate = true;

      // Slide activation by scroll quartile.
      const activeIndex = Math.min(SLIDES.length - 1, Math.floor(progress * SLIDES.length));
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        el.classList.toggle("cinematic-slide-active", i === activeIndex);
      });
      dashRefs.current.forEach((el, i) => {
        if (!el) return;
        const fillEl = el.firstElementChild as HTMLElement | null;
        if (!fillEl) return;
        const localProgress = Math.min(1, Math.max(0, progress * SLIDES.length - i));
        fillEl.style.height = `${localProgress * 100}%`;
      });

      // Cursor lerp.
      outerX += (cursorX - outerX) * 0.15;
      outerY += (cursorY - outerY) * 0.15;
      if (cursorInnerRef.current) {
        cursorInnerRef.current.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      }
      if (cursorOuterRef.current) {
        cursorOuterRef.current.style.transform = `translate(${outerX}px, ${outerY}px) translate(-50%, -50%)`;
      }

      renderer.render(scene, camera);
    }
    tick();

    function handleResize() {
      if (!sticky) return;
      width = sticky.clientWidth;
      height = sticky.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      sticky.removeEventListener("pointermove", handlePointerMove);
      video.removeEventListener("loadedmetadata", fitBillboardToVideo);
      sparkGeometry.dispose();
      billboardGeometry.dispose();
      billboardMaterial.dispose();
      videoTexture.dispose();
      bgMesh.geometry.dispose();
      (bgMesh.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section className="section-ink relative flex h-[92vh] min-h-[620px] items-end overflow-hidden">
        <video
          src="/video/hero-cinematic.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
        <div className="container-luxury relative z-10 pb-24">
          <p className="eyebrow-pink">{SLIDES[0].eyebrow}</p>
          <h1 className="mt-4 max-w-4xl whitespace-pre-line font-cinematic text-6xl leading-[1.05] tracking-wide text-white lg:text-7xl">
            {SLIDES[0].title}
          </h1>
          <div className="mt-10">
            <Button asChild size="lg" className="rounded-none bg-white px-8 text-black hover:bg-brand-pink">
              <Link href="/collections/new-arrivals">Shop New Arrivals</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-black" style={{ height: `${SCROLL_VH}vh` }}>
      <div
        ref={stickyRef}
        onMouseEnter={() => setCursorActive(true)}
        onMouseLeave={() => setCursorActive(false)}
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ cursor: cursorActive ? "none" : "auto" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {/* Source for the WebGL video texture — kept out of `display: none`
            on purpose, since some browsers throttle/pause frame decode for
            hidden video elements, which would freeze the texture. */}
        <video
          ref={videoRef}
          src="/video/hero-cinematic.mp4"
          muted
          loop
          playsInline
          className="pointer-events-none absolute h-px w-px opacity-0"
        />

        {/* Grid overlay */}
        <div className="pointer-events-none absolute inset-x-10 top-0 h-full">
          <div className="absolute left-0 right-0 top-[70px] h-px bg-white/10" />
          <div className="absolute inset-0 flex justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="relative h-full w-px bg-white/10">
                <span className="absolute left-1/2 top-1/3 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30" />
                {i === 4 ? (
                  <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-3">
                    {SLIDES.map((_, si) => (
                      <div
                        key={si}
                        ref={(el) => {
                          dashRefs.current[si] = el;
                        }}
                        className="h-10 w-0.5 overflow-hidden rounded-full bg-white/15"
                      >
                        <div className="h-0 w-full rounded-full bg-white transition-[height]" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Text slides */}
        <div className="container-luxury pointer-events-none absolute inset-0 flex items-end pb-24">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="cinematic-slide absolute inset-x-0 bottom-24 max-w-3xl px-[var(--container-px,0)] opacity-0 transition-opacity duration-700"
            >
              <p className="eyebrow-pink">{slide.eyebrow}</p>
              <BlurTitle
                text={slide.title}
                className="mt-4 font-cinematic text-5xl leading-[1.05] tracking-wide text-white sm:text-6xl lg:text-7xl"
              />
              <p className="cinematic-desc mt-6 max-w-md text-base text-white/70">{slide.desc}</p>
              {slide.cta ? (
                <div className="cinematic-desc cinematic-cta pointer-events-none mt-8">
                  <Button asChild size="lg" className="rounded-none bg-white px-8 text-black hover:bg-brand-pink hover:text-black">
                    <Link href="/collections/new-arrivals">Shop New Arrivals</Link>
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Custom cursor */}
        <div
          ref={cursorInnerRef}
          className="pointer-events-none fixed left-0 top-0 z-[9999] size-1.5 rounded-full border-2 border-white transition-opacity duration-300"
          style={{ opacity: cursorActive ? 1 : 0 }}
        />
        <div
          ref={cursorOuterRef}
          className="pointer-events-none fixed left-0 top-0 z-[9998] size-10 rounded-full border border-white/70 transition-opacity duration-300"
          style={{ opacity: cursorActive ? 1 : 0 }}
        />
      </div>
    </section>
  );
}
