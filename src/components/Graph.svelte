<script>
    import { onMount } from "svelte";
    import TopBar from "./TopBar.svelte";
    import Sidebar from "./Sidebar.svelte";
    import FormatModal from "./FormatModal.svelte";
    import { createCytoscapeInstance } from "../utils/cytoscapeUtils.js";
    import { 
      cytoscapeInstance, 
      showFormatModal, 
      selectedNode,
      showUnselected 
    } from "../stores/graphStore.js";
  
    let cyContainer;
  
    onMount(() => {
      const cy = createCytoscapeInstance(cyContainer);
      cytoscapeInstance.set(cy);
  
      cy.on("tap", function (evt) {
        const node = evt.target;
        
        if (node === cy) {
          cy.elements().removeClass("highlighted");
          selectedNode.set(undefined);
          updateShowUnselected(cy);
          return;
        }
  
        if (node.isNode()) {
          if (node.id() !== "A" && node.id() !== "B") {
            selectedNode.set(node.id());
            cy.elements().removeClass("highlighted");
            node.connectedEdges().addClass("highlighted");
            node.neighborhood().addClass("highlighted");
            node.addClass("highlighted");
            updateShowUnselected(cy);
          }
        }
      });
    });
  
    // Topbar Select function
    function updateShowUnselected(cy) {
      cy.elements().removeClass("all-hide");
      if (!$showUnselected && cy.elements(".highlighted").length !== 0) {
        cy.elements().not("#A, #B, .highlighted").addClass("all-hide");
      }
    }
  </script>
  
  <div class="layout">
    <TopBar />
    <div class="main">
      <div bind:this={cyContainer} class="cytoscape-container"></div>
      <Sidebar />
    </div>
  </div>
  
  {#if $showFormatModal}
    <FormatModal />
  {/if}
  
  <style>
    .layout {
      margin: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
      font-family: Arial, sans-serif;
    }
  
    .main {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
  
    .cytoscape-container {
      flex: 1;
      min-width: 0;
      height: 100%;
      background: #f8f9fa;
    }
  </style>