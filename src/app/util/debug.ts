import { BufferGeometry, Line, LineBasicMaterial, Scene, Vector3 } from 'three';

export function addAnimPathHelper(positions: number[], color: string, scene: Scene) {
    const points = [];

    for (let i = 0; i < positions.length; i += 3) {
      points.push(new Vector3(positions[i], positions[i + 1], positions[i + 2]));
    }

    const material = new LineBasicMaterial({color: color});
    const geometry = new BufferGeometry().setFromPoints(points);
    const line = new Line(geometry, material);
    scene.add(line);
}
