// --- Parameters ---
const TOLERANCE_PX = 15;   // snap vzdálenost
const TOLERANCE_DEG = 15;  // snap rotace

// --- Messages from UI ---
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'validate-shape') {
    const { pieces, solutions } = msg;
    const success = validatePuzzle(pieces, solutions);
    figma.ui.postMessage({ type: 'validation-result', success });
  }
};

// --- Validation ---
function validatePuzzle(pieces, solutions) {
  for (const solution of solutions) {
    let match = true;
    const usedTargets = new Set();

    for (const piece of pieces) {
      let foundTarget = false;

      for (const target of solution.targets) {
        if (usedTargets.has(target.id)) continue;
        if (isClose(piece, target)) {
          usedTargets.add(target.id);
          foundTarget = true;
          break;
        }
      }

      if (!foundTarget) {
        match = false;
        break;
      }
    }

    if (match) return true;
  }
  return false;
}

function isClose(piece, target) {
  const dx = piece.x - target.x;
  const dy = piece.y - target.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > TOLERANCE_PX) return false;

  // Rotation tolerance
  const rot = ((piece.rotation % 360) + 360) % 360;
  const targetRot = ((target.rotation % 360) + 360) % 360;

  if (target.type === "square") {
    return Math.abs(rot % 90) < TOLERANCE_DEG;
  } else if (target.type === "parallelogram") {
    return Math.abs(rot % 180) < TOLERANCE_DEG;
  } else {
    return Math.abs(rot - targetRot) < TOLERANCE_DEG;
  }
}

// --- Show UI ---
figma.showUI(__html__, { width: 500, height: 500 });
