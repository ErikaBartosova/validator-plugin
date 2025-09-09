const TOLERANCE_PX = 12;
const TOLERANCE_DEG = 15;

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'validate-shape') {
    const { pieces, targets } = msg;
    const success = validatePuzzle(pieces, targets);
    figma.ui.postMessage({ type: 'validation-result', success });
  }

  if (msg.type === 'load-solution') {
    const node = figma.currentPage.findOne(n => n.name === msg.shapeName);
    if (node) {
      // reset proporcí (zabrání deformacím)
      node.rescale(1);

      const svg = await node.exportAsync({ format: "SVG" });
      const svgString = new TextDecoder("utf-8").decode(svg);

      // spočítáme targety z podsložek
      const targets = [];
      let idCounter = 0;
      node.findAll(n => n.type === "VECTOR" || n.type === "FRAME").forEach(child => {
        if (!child.absoluteBoundingBox) return;
        const bb = child.absoluteBoundingBox;
        const cx = bb.x + bb.width / 2 - node.absoluteBoundingBox.x;
        const cy = bb.y + bb.height / 2 - node.absoluteBoundingBox.y;
        const rot = child.rotation || 0;
        const id = child.name || `piece${idCounter++}`;

        let type = "triangle";
        if (id.toLowerCase().includes("square")) type = "square";
        if (id.toLowerCase().includes("parallelogram")) type = "parallelogram";

        targets.push({ id, x: cx, y: cy, rotation: rot, type });
      });

      figma.ui.postMessage({ 
        type: 'solution-loaded', 
        svg: svgString, 
        name: msg.shapeName, 
        targets 
      });
    } else {
      figma.ui.postMessage({ type: 'solution-error', error: 'Shape not found in file.' });
    }
  }
};

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
