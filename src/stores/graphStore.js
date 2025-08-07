import { writable, derived } from 'svelte/store';


export const uploadStatus = writable("No file uploaded.");
export const showOTEdges = writable(true);
export const showEdgeWeights = writable(true);
export const showUnselected = writable(true);
export const showCommonNames = writable(false);
export const showFormatModal = writable(false);
export const selectedNode = writable(undefined);
export const transportPlan = writable(null);
export const nodeSize = writable(40);
export const groupSize = writable(60);
export const cytoscapeInstance = writable(null);
export const marginalDistribution1 = writable(null);
export const marginalDistribution2 = writable(null);
export const selfAlignment1 = writable(null);
export const selfAlignment2 = writable(null);

// Verify if we have data
export const hasData = derived(
  [cytoscapeInstance],
  ([$cy]) => $cy && $cy.elements().length > 0
);