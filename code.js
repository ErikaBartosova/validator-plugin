// Validator Plugin - Tangram
// Erika Bartosova - 2025

figma.showUI(__html__, { width: 300, height: 150 });

// Default tolerance settings
const DEFAULT_TOLERANCE = {
  tolerancePx: 10,
  toleranceDeg: 15,
  ignoreCollisions: true
};

// Main message handler
figma.ui.onmessage = (msg) => {
  if (msg.type === 'validate') {
    const { pieces, targetShape, options } = msg;
    const result = validatePuzzle(pieces, targetShape, {
      ...DEFAULT_TOLERANCE,
      ...options
    });
    figma.ui.postMessage({ type: 'validationResult', result });
  }
};

// Validation function
function validatePuzzle(pieces, targetShape, options) {
  const { tolerancePx, toleranceDeg, ignoreCollisions } = options;

  // 1) If collisions are ignored → allow free drag
  if (ignoreCollisions) {
    console.log("Collision detection disabled. Free drag mode.");
  }

  // 2) Compare each piece with the reference shape
  const matches = pieces.map((piece) =>
    checkOverlayMatch(piece, targetShape, tolerancePx, toleranceDeg)
  );

  // 3) Return true only if all pieces match
  return matches.every(Boolean);
}

// Overlay match check (simplified placeholder)
function checkOverlayMatch(piece, targetShape, tolerancePx, toleranceDeg) {
  // In reality: you’d compare vector paths or use pixel overlay analysis
  // Here we simulate by comparing positions and rotation to target
  const dx = Math.abs(piece.x - targetShape[piece.id].x);
  const dy = Math.abs(piece.y - targetShape[piece.id].y);
  const dRot = Math.abs(piece.rotation - targetShape[piece.id].rotation);

  const positionOk = dx <= tolerancePx && dy <= tolerancePx;
  const rotationOk = dRot <= toleranceDeg;

  return positionOk && rotationOk;
}
