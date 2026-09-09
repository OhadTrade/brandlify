import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Texture, Vector2, WebGLRenderer } from 'three';

export type MaterialReveal = {
  point: (x: number, y: number) => void;
  setActive: (active: boolean) => void;
  dispose: () => void;
};

// Image-based relief, not replacement brand geometry. Keep the approved silhouette
// and baked chrome while adding shallow displacement and a restrained moving light.
export function createMaterialReveal(canvas: HTMLCanvasElement, context: WebGL2RenderingContext, image: HTMLImageElement, onFailure: () => void, skipEntrance = false): MaterialReveal {
  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const texture = new Texture(image);
  texture.needsUpdate = true;
  const uniforms = {
    artwork: { value: texture },
    enter: { value: 0 },
    light: { value: new Vector2(0, 0) },
    sweep: { value: 0 },
  };
  const material = new ShaderMaterial({
    uniforms, transparent: true, depthTest: false,
    vertexShader: `
      varying vec2 vUv;
      uniform sampler2D artwork;
      uniform float enter;
      void main() {
        vUv = uv;
        vec3 color = texture2D(artwork, uv).rgb;
        float relief = (1.0 - min(color.r, min(color.g, color.b))) * 0.06;
        vec3 p = position;
        p.z += relief * enter;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D artwork;
      uniform float enter;
      uniform vec2 light;
      uniform float sweep;
      float ink(vec3 c) { return 1.0 - min(c.r, min(c.g, c.b)); }
      void main() {
        vec2 uv = vUv;
        float join = 1.0 - enter;
        // Curved bands converge without substituting the old triangular logo.
        float band = smoothstep(0.2, 0.8, uv.y + uv.x * 0.25);
        uv += vec2((band - 0.5) * 0.035, (0.5 - band) * 0.045) * join;
        vec3 base = texture2D(artwork, uv).rgb;
        float mask = smoothstep(0.04, 0.32, ink(base));
        vec2 texel = vec2(0.002);
        vec2 normal = vec2(
          ink(texture2D(artwork, uv + vec2(texel.x, 0.0)).rgb) - ink(texture2D(artwork, uv - vec2(texel.x, 0.0)).rgb),
          ink(texture2D(artwork, uv + vec2(0.0, texel.y)).rgb) - ink(texture2D(artwork, uv - vec2(0.0, texel.y)).rgb)
        );
        float rim = clamp(length(normal) * 3.0, 0.0, 1.0);
        float strip = exp(-pow((uv.x * 0.65 + uv.y - sweep * 1.6) * 12.0, 2.0));
        vec2 source = vec2(0.32, 0.76) + light * vec2(0.16, -0.12);
        float pool = exp(-dot(uv - source, uv - source) * 12.0);
        vec3 tint = mix(vec3(1.0, 0.48, 0.42), vec3(0.48, 0.30, 1.0), smoothstep(0.15, 0.85, uv.x));
        vec3 color = base + mask * (tint * pool * 0.035 + vec3(1.0) * rim * (strip * 0.13 + pool * 0.035));
        float edge = 1.0 - smoothstep(0.42, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
        gl_FragColor = vec4(color, edge * mix(0.06, 1.0, enter));
      }
    `,
  });
  const geometry = new PlaneGeometry(2, 2, 40, 40);
  const mesh = new Mesh(geometry, material);
  const scene = new Scene();
  scene.add(mesh);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 3;
  const target = new Vector2();
  const current = new Vector2();
  let active = false;
  let disposed = false;
  let frame = 0;
  let elapsed = skipEntrance ? 1.3 : 0;
  let previous = 0;
  let frames = 0;
  let slowFrames = 0;
  let ready = false;
  const host = canvas.parentElement!;

  const schedule = () => { if (active && !disposed && !frame) frame = requestAnimationFrame(draw); };
  const draw = (time: number) => {
    frame = 0;
    if (!active || disposed) return;
    const rawDelta = previous ? (time - previous) / 1000 : 1 / 60;
    const delta = Math.min(rawDelta, 0.05);
    previous = time;
    elapsed += delta;
    const progress = Math.min(elapsed / 1.3, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    uniforms.enter.value = ease;
    uniforms.sweep.value = progress;
    current.lerp(target, 1 - Math.exp(-delta * 9));
    uniforms.light.value.copy(current);
    mesh.rotation.set(-current.y * 0.07, current.x * 0.105, 0);
    const settle = Math.sin(progress * Math.PI) * Math.sin(progress * Math.PI * 1.3) * 0.018;
    mesh.scale.setScalar(0.96 + ease * 0.04 + settle);
    try { renderer.render(scene, camera); } catch { onFailure(); return; }
    if (disposed) return;
    if (!ready) { host.dataset.materialReady = 'true'; ready = true; }
    frames += 1;
    canvas.dataset.frames = String(frames);
    // Sustained poor frame pacing opts out instead of making a weak device work harder.
    if (frames > 8 && rawDelta > 0.05) slowFrames += 1;
    if (frames >= 32 && slowFrames > 16) { onFailure(); return; }
    if (progress < 1 || current.distanceToSquared(target) > 0.000001) schedule();
    else { previous = 0; canvas.dataset.renderState = 'idle'; }
  };
  const resize = new ResizeObserver(([entry]) => {
    if (!entry) return;
    const { width, height } = entry.contentRect;
    if (width > 0 && height > 0) { renderer.setSize(width, height, false); schedule(); }
  });
  resize.observe(host);
  const lost = (event: Event) => { event.preventDefault(); onFailure(); };
  canvas.addEventListener('webglcontextlost', lost);
  renderer.debug.onShaderError = onFailure;

  return {
    point(x, y) {
      target.set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
      canvas.dataset.renderState = active ? 'active' : 'paused';
      schedule();
    },
    setActive(value) {
      active = value;
      previous = 0;
      canvas.dataset.renderState = value ? 'active' : 'paused';
      if (value) schedule();
      else { cancelAnimationFrame(frame); frame = 0; }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      canvas.removeEventListener('webglcontextlost', lost);
      geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
