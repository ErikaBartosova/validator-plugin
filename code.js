// Parameters: tolerance for snapping
const TOLERANCE_PX = 10;
const TOLERANCE_DEG = 15;

// Listen for messages from Figma UI or host app
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'validate-shape') {
    const { pieces, reference } = msg; 
    // pieces = array of {x, y, width, height, rotation}
    // reference = {imageUrl, width, height}

    // Fake validation for now (since real pixel overlay requires Canvas API)
    // We’ll simulate with bounding box + tolerance checks

    let allInside = true;

    for (const piece of pieces) {
      // Approximate center position
      const cx = piece.x + piece.width / 2;
      const cy = piece.y + piece.height / 2;

      // Check if within reference boundaries (simplified rectangle)
      if (cx < -TOLERANCE_PX || cx > reference.width + TOLERANCE_PX ||
          cy < -TOLERANCE_PX || cy > reference.height + TOLERANCE_PX) {
        allInside = false;
        break;
      }

      // Check rotation tolerance
      const normalizedRotation = ((piece.rotation % 360) + 360) % 360;
      const snapRotation = Math.round(normalizedRotation / TOLERANCE_DEG) * TOLERANCE_DEG;
      const rotationDiff = Math.abs(normalizedRotation - snapRotation);

      if (rotationDiff > TOLERANCE_DEG) {
        allInside = false;
        break;
      }
    }

    if (allInside) {
      figma.ui.postMessage({ type: 'validation-result', success: true });
    } else {
      figma.ui.postMessage({ type: 'validation-result', success: false });
    }
  }
};

// Show UI when plugin runs
figma.showUI(__html__, { width: 300, height: 200 });
