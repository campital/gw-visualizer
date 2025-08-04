//I hate ts
// @ts-nocheck

import cytoscape from "cytoscape";
import elk from "cytoscape-elk";

cytoscape.use(elk);

export const createCytoscapeInstance = (container) => {
  return cytoscape({
    container,
    elements: [],
    layout: { name: "preset" },
    style: getCytoscapeStyles()
  });
};

export const getCytoscapeStyles = () => {
  const styles = [
    {
      selector: 'node[id="A"], node[id="B"]',
      style: {
        "background-color": "#95a5a6",
        label: "data(label)",
        color: "white",
        "text-valign": "center",
        "text-halign": "center",
        "text-outline-width": 3,
        "text-outline-color": "#2c3e50",
        "font-size": "mapData(size, 40, 100, 14, 24)",
        "font-weight": "bold",
        width: "data(size)",
        height: "data(size)",
        "border-width": 3,
        "border-color": "#2c3e50",
      },
    },
    {
      selector: 'node[group="A"]',
      style: {
        "background-color": "#3498db",
        label: "data(label)",
        color: "white",
        "text-valign": "center",
        "text-halign": "center",
        "text-outline-width": 2,
        "text-outline-color": "#2980b9",
        "font-size": "mapData(size, 20, 60, 10, 16)",
        "font-weight": "bold",
        width: "data(size)",
        height: "data(size)",
        "border-width": 2,
        "border-color": "#2980b9",
      },
    },
    {
      selector: 'node[group="B"]',
      style: {
        "background-color": "#e74c3c",
        label: "data(label)",
        color: "white",
        "text-valign": "center",
        "text-halign": "center",
        "text-outline-width": 2,
        "text-outline-color": "#c0392b",
        "font-size": "mapData(size, 20, 60, 10, 16)",
        "font-weight": "bold",
        width: "data(size)",
        height: "data(size)",
        "border-width": 2,
        "border-color": "#c0392b",
      },
    },
    {
      selector: 'edge[group="A"], edge[group="B"]',
      style: {
        width: 2,
        "line-color": "#6c757d",
        "target-arrow-shape": "triangle",
        "target-arrow-color": "#6c757d",
        "curve-style": "bezier",
        opacity: 0.8,
      },
    },
    {
      selector: 'edge[group="cross"]',
      style: {
        "line-color": "#e74c3c",
        "target-arrow-color": "#e74c3c",
        "line-style": "dashed",
        opacity: 0.6,
        width: "mapData(displayWeight, 0, 1, 1, 15)",
        "curve-style": "bezier",
      },
    },
    {
      selector: "edge.highlighted",
      style: {
        "line-color": "#f39c12",
        "target-arrow-color": "#f39c12",
        opacity: 1,
        width: 4,
      },
    },
    {
      selector: "node.highlighted",
      style: {
        "border-width": 4,
        "border-color": "#f39c12",
      },
    },
    {
      selector: 'edge[group="cross"].highlighted',
      style: {
        width: "mapData(displayWeight, 0, 1, 3, 20)",
        opacity: 1,
      },
    },
    {
      selector: ".all-hide",
      style: {
        visibility: "hidden",
      },
    },
    {
      selector: "edge.highlighted.show-weights",
      style: {
        label: "data(weight)",
        "font-size": 14,
        "font-weight": "bold",
        color: "#2c3e50",
        "text-background-color": "white",
        "text-background-opacity": 0.9,
        "text-background-padding": 4,
        "text-border-width": 1,
        "text-border-color": "#dee2e6",
        "text-border-opacity": 0.8,
        "source-text-offset": 20,
        "target-text-offset": 20,
      },
    },
    {
      selector: 'edge.show-weights[group="cross"]',
      style: {
        label: "data(weight)",
        "font-size": 11,
        "font-weight": "bold",
        color: "#2c3e50",
        "text-background-color": "rgba(255,255,255,0.95)",
        "text-background-padding": 3,
        "text-border-width": 1,
        "text-border-color": "#e74c3c",
        "text-border-opacity": 0.6,
        "source-text-offset": 15,
        "target-text-offset": 15,
        "text-rotation": "autorotate",
      },
    },
  ];

  // Cast to any to bypass strict TypeScript checking for Cytoscape styles
  return styles;
};

export const refreshGraph = (cy, elements) => {
  cy.remove(cy.elements("*"));
  cy.add(elements);
  
  cy.layout({
    name: "elk",
    animate: false,
    fit: true,
    elk: {
      algorithm: "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "80",
      "elk.layered.spacing.nodeNodeBetweenLayers": "100",
      "elk.spacing.componentComponent": "150",
    },
    stop: () => {
      positionParentNodes(cy);
      cy.fit(undefined, 50);
    },
  }).run();
};

const positionParentNodes = (cy) => {
  const groupANodes = cy.nodes('[group="A"]');
  const groupBNodes = cy.nodes('[group="B"]');

  if (groupANodes.length > 0 && groupBNodes.length > 0) {
    const aBounds = groupANodes.boundingBox();
    const bBounds = groupBNodes.boundingBox();

    cy.getElementById("A").position({
      x: aBounds.x1 + aBounds.w / 2,
      y: aBounds.y1 - 60,
    });
    cy.getElementById("B").position({
      x: bBounds.x1 + bBounds.w / 2,
      y: bBounds.y1 - 60,
    });
  }
};

export const updateNodeSizes = (cy, nodeSize, groupSize) => {
  if (!cy) return;

  // Update individual nodes
  cy.nodes('[group="A"], [group="B"]').forEach((node) => {
    node.data("size", nodeSize);
  });

  // Update parent group nodes
  cy.nodes("#A, #B").forEach((node) => {
    node.data("size", groupSize);
  });

  updateFontSizes(cy, nodeSize, groupSize);
};

export const updateFontSizes = (cy, nodeSize, groupSize) => {
  if (!cy) return;

  const baseFontSize = Math.max(8, Math.min(32, nodeSize * 0.4));
  const groupFontSize = Math.max(12, Math.min(48, groupSize * 0.4));

  cy.nodes('[group="A"], [group="B"]').forEach((node) => {
    node.style("font-size", `${baseFontSize}px`);
  });

  cy.nodes("#A, #B").forEach((node) => {
    node.style("font-size", `${groupFontSize}px`);
  });
};

export const updateNodeLabels = (cy, showCommonNames) => {
  if (!cy) return;

  cy.nodes('[group="A"], [group="B"]').forEach((node) => {
    const data = node.data();
    let displayName;

    if (showCommonNames && data.common_name) {
      displayName = data.common_name;
    } else {
      displayName = data.scientific_name || data.label;
    }

    node.data("label", displayName);
  });
};

export const updateShowOTEdges = (cy, showOTEdges) => {
  if (!cy) return;
  cy.elements('edge[group="cross"]').style(
    "display",
    showOTEdges ? "element" : "none"
  );
};

export const updateShowEdgeWeights = (cy, showEdgeWeights) => {
  if (!cy) return;
  if (showEdgeWeights) {
    cy.edges('[group="cross"]').addClass("show-weights");
    cy.edges().addClass("show-weights");
  } else {
    cy.edges().removeClass("show-weights");
  }
};

export const updateShowUnselected = (cy, showUnselected) => {
  if (!cy) return;
  cy.elements().removeClass("all-hide");
  if (!showUnselected && cy.elements(".highlighted").length !== 0) {
    cy.elements().not("#A, #B, .highlighted").addClass("all-hide");
  }
};

export const handleNodeTap = (evt, selectedNodeStore, updateShowUnselectedCallback) => {
  const cy = evt.cy;
  const node = evt.target;
  
  if (node === cy) {
    cy.elements().removeClass("highlighted");
    selectedNodeStore.set(undefined);
    updateShowUnselectedCallback();
    return;
  }

  if (node.isNode()) {
    if (node.id() !== "A" && node.id() !== "B") {
      selectedNodeStore.set(node.id());
      cy.elements().removeClass("highlighted");
      node.connectedEdges().addClass("highlighted");
      node.neighborhood().addClass("highlighted");
      node.addClass("highlighted");
      updateShowUnselectedCallback();
    }
  }
};