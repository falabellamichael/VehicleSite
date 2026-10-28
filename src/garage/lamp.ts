export interface Point {
  x: number;
  y: number;
}
// An 18-segment Verlet cord follows the spring-driven work light.
export function createLamp(start: Point, fromFloor: boolean) {
  const position = { ...start };
  const velocity = { x: 0, y: 0 };
  const anchor = { x: 0.74, y: fromFloor ? 1.12 : -0.12 };
  const nodes = Array.from({ length: 19 }, (_, i) => {
    const x = anchor.x + ((start.x - anchor.x) * i) / 18;
    const y = anchor.y + ((start.y - anchor.y) * i) / 18;
    return { x, y, oldX: x, oldY: y };
  });
  return {
    position,
    step(target: Point, elapsed: number, reduced: boolean) {
      const dt = Math.min(elapsed, 1 / 30);
      if (reduced) {
        position.x = target.x;
        position.y = target.y;
      } else {
        velocity.x += ((target.x - position.x) * 42 - velocity.x * 6.5) * dt;
        velocity.y += ((target.y - position.y) * 42 - velocity.y * 6.5) * dt;
        position.x += velocity.x * dt;
        position.y += velocity.y * dt;
      }
      const length =
        (Math.hypot(position.x - anchor.x, position.y - anchor.y) * 1.06) / 18;
      for (let i = 1; i < 18; i++) {
        const n = nodes[i];
        if (reduced) {
          n.x = anchor.x + ((position.x - anchor.x) * i) / 18;
          n.y = anchor.y + ((position.y - anchor.y) * i) / 18;
        } else {
          const dx = (n.x - n.oldX) * 0.93;
          const dy = (n.y - n.oldY) * 0.93;
          n.oldX = n.x;
          n.oldY = n.y;
          n.x += dx;
          n.y += dy + dt * dt * 0.35;
        }
      }
      for (let pass = 0; pass < 7; pass++) {
        nodes[0].x = anchor.x;
        nodes[0].y = anchor.y;
        nodes[18].x = position.x;
        nodes[18].y = position.y;
        for (let i = 0; i < 18; i++) {
          const a = nodes[i],
            b = nodes[i + 1];
          const dx = b.x - a.x,
            dy = b.y - a.y;
          const distance = Math.max(0.0001, Math.hypot(dx, dy));
          const correction = ((distance - length) / distance) * 0.5;
          if (i > 0) {
            a.x += dx * correction;
            a.y += dy * correction;
          }
          if (i < 17) {
            b.x -= dx * correction;
            b.y -= dy * correction;
          }
        }
      }
      return {
        position,
        nodes,
        angle: Math.max(-28, Math.min(28, velocity.x * 45)),
      };
    },
  };
}
