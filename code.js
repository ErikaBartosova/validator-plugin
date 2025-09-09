const TOLERANCE_PX = 12;
const TOLERANCE_DEG = 15;

// zprávy z UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'validate-shape') {
    const { pieces, targets } = msg;
    const success = validatePuzzle(pieces, targets);
    figma.ui.postMessage({ type: 'validation-result', success });
  }

  if (msg.type === 'load-solution') {
    // najdeme ve Figmě vektor s názvem (např. "Camel shape")
    const node = figma.currentPage.findOne(n => n.name === msg.shapeName);
    if (node) {
      const svg = await node.exportAsync({ format: "SVG" });
      const svgString = new TextDecoder("utf-8").decode(svg);
      // pošleme do UI
      figma.ui.postMessage({ type: 'solution-loaded', svg: svgString, name: msg.shapeName });
    } else {
      figma.ui.postMessage({ type: 'solution-error', error: 'Shape not found in file.' });
    }
  }
};

// validace – porovnání pozic dílků s targety
function validatePuzzle(pieces, targets) {
  let match = true;
  const used = new Set();

  for (const piece of pieces) {
    let found = false;
    for (const target of targets) {
      if (used.has(target.id)) continue;
      if (isClose(piece, target)) {
        used.add(target.id);
        found = true;
        break;
      }
    }
    if (!found) {
      match = false;
      break;
    }
  }
  return match;
}

function isClose(piece, target) {
  const dx = piece.x - target.x;
  const dy = piece.y - target.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > TOLERANCE_PX) return false;

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

figma.showUI(__html__, { width: 600, height: 500 });
