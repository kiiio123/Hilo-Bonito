export const motion = Object.freeze({
  spring: 15,
  wheelSpring: 19,
  wheelIdle: 155,
  wheelProjection: 0.10,
  dragProjection: 0.16,
  epsilon: 0.001,
  speedEpsilon: 0.018
});

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function springStep(position, velocity, target, elapsed, stiffness) {
  const dt = clamp(elapsed, 0, 0.064);
  const offset = position - target;
  const decay = Math.exp(-stiffness * dt);
  const impulse = (velocity + stiffness * offset) * dt;

  return {
    position: target + (offset + impulse) * decay,
    velocity: (velocity - stiffness * impulse) * decay
  };
}

export function normalizeWheel(delta, mode, viewport) {
  return delta * (mode === 1 ? 17 : mode === 2 ? viewport : 1);
}

export function snapChapter(position, anchor, speed, max, projection, threshold = 0.12) {
  const boundedSpeed = clamp(speed, -4, 4);
  const projected = position + boundedSpeed * projection;
  let next = Math.round(projected);
  const displacement = position - anchor;
  if (next === anchor && Math.abs(displacement) >= threshold) {
    next = anchor + Math.sign(displacement);
  }
  return clamp(next, 0, max);
}
