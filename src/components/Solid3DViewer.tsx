import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Solid = 'sphere' | 'cone' | 'cylinder' | 'unit-circle';

export default function Solid3DViewer() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const objRef = useRef<THREE.Object3D | null>(null);
  const [solid, setSolid] = useState<Solid>('sphere');
  const [radius, setRadius] = useState(1);
  const [height, setHeight] = useState(2);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ffffff');
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / 260, 0.1, 100);
    camera.position.set(3, 3, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, 260);
    mount.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const grid = new THREE.GridHelper(10, 10, 0x999999, 0xdddddd);
    grid.position.y = -1.2;
    scene.add(grid);

    const material = new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.5, metalness: 0.1 });

    const createObject = () => {
      if (objRef.current) {
        scene.remove(objRef.current);
        (objRef.current as any).geometry?.dispose?.();
        (objRef.current as any).material?.dispose?.();
      }
      let mesh: THREE.Mesh;
      if (solid === 'sphere') {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), material);
      } else if (solid === 'cone') {
        mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 32), material);
      } else if (solid === 'cylinder') {
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 32), material);
      } else {
        // unit circle: thin torus representing circle in XZ plane
        mesh = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 8, 100), new THREE.MeshBasicMaterial({ color: 0xDC2626 }));
        mesh.rotation.x = Math.PI / 2;
      }
      objRef.current = mesh;
      scene.add(mesh);
    };

    createObject();

    // very light orbit-like control
    let isDragging = false; let prevX = 0; let prevY = 0;
    const onDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onUp = () => { isDragging = false; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging || !objRef.current) return;
      const dx = (e.clientX - prevX) / 100;
      const dy = (e.clientY - prevY) / 100;
      objRef.current.rotation.y += dx;
      objRef.current.rotation.x += dy;
      prevX = e.clientX; prevY = e.clientY;
    };
    renderer.domElement.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / 260;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, 260);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      renderer.domElement.removeEventListener('mousedown', onDown);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    // recreate geometry when parameters change
    const event = new Event('recreate');
    (window as any).dispatchEvent(event);
  }, [solid, radius, height]);

  // quick hack to re-create object by toggling key on container
  const key = `${solid}-${radius}-${height}`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <label className="text-sm">Solid:</label>
        <select value={solid} onChange={(e)=>setSolid(e.target.value as Solid)} className="border rounded px-2 py-1 text-sm">
          <option value="sphere">Sphere</option>
          <option value="cone">Cone</option>
          <option value="cylinder">Cylinder</option>
          <option value="unit-circle">Unit Circle (Trig)</option>
        </select>
        {(solid === 'sphere' || solid === 'cone' || solid === 'cylinder') && (
          <>
            <label className="text-sm ml-2">Radius:</label>
            <input type="range" min={0.5} max={3} step={0.1} value={radius} onChange={(e)=>setRadius(parseFloat(e.target.value))} />
          </>
        )}
        {(solid === 'cone' || solid === 'cylinder') && (
          <>
            <label className="text-sm ml-2">Height:</label>
            <input type="range" min={1} max={5} step={0.1} value={height} onChange={(e)=>setHeight(parseFloat(e.target.value))} />
          </>
        )}
      </div>
      <div key={key} ref={mountRef} className="w-full" style={{ height: 260 }} />
      <div className="text-xs text-gray-500 mt-2">Drag to rotate the object. Adjust parameters above.</div>
    </div>
  );
}
