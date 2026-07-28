// Central place for animation timing so everything feels consistent (iOS-like easing)

export const easing = {
  standard: [0.32, 0.72, 0, 1],   // iOS-style deceleration
  gentle: [0.4, 0, 0.2, 1],
  bounce: [0.34, 1.56, 0.64, 1],
} as const;

export const duration = {
  fast: 0.15,
  base: 0.3,
  slow: 0.5,
} as const;