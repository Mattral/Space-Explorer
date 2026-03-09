import * as THREE from 'three';
import { missions, SpacecraftMission } from '@/data/missions';

/**
 * Render all spacecraft mission trajectories as animated paths in the 3D scene.
 * Returns a group containing all mission paths + probe meshes.
 */
export const createMissionPaths = (scene: THREE.Scene): THREE.Group => {
  const group = new THREE.Group();
  group.name = 'missionPaths';

  missions.forEach((mission) => {
    const color = new THREE.Color(mission.color);

    // Build a CatmullRom spline through waypoints for smooth trajectory
    const points = mission.waypoints.map(
      (wp) => new THREE.Vector3(wp.position[0], wp.position[1], wp.position[2])
    );
    if (points.length < 2) return;

    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    const curvePoints = curve.getPoints(256);

    // Trail line
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.55,
      linewidth: 1,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.name = `mission-path-${mission.id}`;
    group.add(line);

    // Dashed overlay for depth
    const dashMat = new THREE.LineDashedMaterial({
      color,
      transparent: true,
      opacity: 0.2,
      dashSize: 3,
      gapSize: 2,
    });
    const dashLine = new THREE.Line(lineGeo.clone(), dashMat);
    dashLine.computeLineDistances();
    group.add(dashLine);

    // Probe mesh at the last waypoint (current/final position)
    const probePos = points[points.length - 1];
    const probeGeo = new THREE.OctahedronGeometry(1.2, 1);
    const probeMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
    });
    const probe = new THREE.Mesh(probeGeo, probeMat);
    probe.position.copy(probePos);
    probe.name = `mission-probe-${mission.id}`;
    probe.userData = { missionId: mission.id };
    group.add(probe);

    // Probe glow
    const glowGeo = new THREE.SphereGeometry(2.5, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(probePos);
    group.add(glow);

    // Waypoint markers
    mission.waypoints.forEach((wp, idx) => {
      if (idx === 0 || idx === points.length - 1) return; // skip launch & current
      const markerGeo = new THREE.SphereGeometry(0.5, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(wp.position[0], wp.position[1], wp.position[2]);
      group.add(marker);
    });

    // Mission name label
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = mission.color;
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mission.name.toUpperCase(), 256, 40);
    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.7 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(probePos);
    sprite.position.y += 5;
    sprite.scale.set(30, 4, 1);
    group.add(sprite);
  });

  scene.add(group);
  return group;
};

/**
 * Animate mission probe meshes (pulsing glow)
 */
export const animateMissions = (group: THREE.Group, simTime: number) => {
  group.children.forEach((child) => {
    if (child.name.startsWith('mission-probe-')) {
      child.rotation.y = simTime * 2;
      child.rotation.x = Math.sin(simTime) * 0.3;
    }
  });
};
