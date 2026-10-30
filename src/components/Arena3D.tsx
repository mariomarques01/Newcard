import { useEffect, useRef, useState } from 'react';

/** Decorative GLB layer. Gameplay and touch targets stay in React above the canvas. */
export function Arena3D() {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let disposed = false;
    let release = () => {};
    const controller = new AbortController();
    const start = async () => {
      const [THREE, { GLTFLoader }, { mergeGeometries }] = await Promise.all([
        import('three'), import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/utils/BufferGeometryUtils.js'),
      ]);
      if (disposed || !host.current) return;
      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      const element = host.current;
      element.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-13, 13, 19.5, -19.5, .1, 1000);
      camera.position.set(0, 35, 24);
      camera.quaternion.set(-.4660856724, 0, 0, .8847396374);
      scene.add(new THREE.HemisphereLight(0xc7eaff, 0x6e4429, 2));
      const sun = new THREE.DirectionalLight(0xffdfb0, 3);
      sun.position.set(-12, 28, 15); scene.add(sun);
      const geometries = new Set<import('three').BufferGeometry>();
      const materials = new Set<import('three').Material>();
      const textures = new Set<import('three').Texture>();
      const render = () => { if (!disposed && !document.hidden) renderer.render(scene, camera); };
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        if (!width || !height) return;
        const aspect = width / height;
        const halfHeight = Math.max(19.5, 13 / aspect);
        camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
        camera.top = halfHeight; camera.bottom = -halfHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false); render();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      const lost = (event: Event) => { event.preventDefault(); setStatus('fallback'); };
      const restored = () => { setStatus('ready'); resize(); };
      renderer.domElement.addEventListener('webglcontextlost', lost);
      renderer.domElement.addEventListener('webglcontextrestored', restored);
      document.addEventListener('visibilitychange', render);
      release = () => {
        observer.disconnect(); document.removeEventListener('visibilitychange', render);
        renderer.domElement.removeEventListener('webglcontextlost', lost);
        renderer.domElement.removeEventListener('webglcontextrestored', restored);
        geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
        textures.forEach(t => t.dispose()); renderer.dispose(); renderer.forceContextLoss();
        renderer.domElement.remove();
      };
      resize();
      const response = await fetch(`${import.meta.env.BASE_URL}assets/arena/elemental-arena.glb`, { signal: controller.signal });
      if (!response.ok) throw new Error(`Arena HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      if (disposed) return;
      const gltf = await new GLTFLoader().parseAsync(bytes, '');
      gltf.scene.updateMatrixWorld(true);
      // Bake transforms and batch the static scene by material: hundreds of meshes → ~13 draws.
      const groups = new Map<import('three').Material, import('three').BufferGeometry[]>();
      gltf.scene.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        geometries.add(object.geometry);
        const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
        meshMaterials.forEach(material => {
          materials.add(material);
          Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); });
        });
        if (Array.isArray(object.material)) return;
        const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
        geometries.add(geometry);
        const batch = groups.get(object.material) || [];
        batch.push(geometry); groups.set(object.material, batch);
      });
      if (disposed) {
        geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); return;
      }
      groups.forEach((batch, material) => {
        const merged = mergeGeometries(batch, false);
        if (merged) { geometries.add(merged); scene.add(new THREE.Mesh(merged, material)); }
        else batch.forEach(geometry => scene.add(new THREE.Mesh(geometry, material)));
      });
      setStatus('ready'); resize();
    };
    start().catch(error => {
      if (!disposed && error.name !== 'AbortError') { release(); setStatus('fallback'); }
    });
    return () => { disposed = true; controller.abort(); release(); };
  }, []);
  return <div ref={host} className="arena-3d" data-status={status} aria-hidden="true" />;
}
