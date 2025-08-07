<script>
  import {
    uploadStatus,
    nodeSize,
    groupSize,
    showOTEdges,
    showUnselected,
    showEdgeWeights,
    showCommonNames,
    showFormatModal,
    cytoscapeInstance,
    transportPlan,
    selectedNode,
    marginalDistribution1,
    marginalDistribution2,
    selfAlignment1,
    selfAlignment2,
  } from "../stores/graphStore.js";
  import { handleFileUpload } from "../utils/fileUtils.js";
  import { buildElements } from "../utils/graphDataUtils.js";
  import { refreshGraph } from "../utils/cytoscapeUtils.js";

  let fileInput;

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    uploadStatus.set("Loading file...");

    handleFileUpload(file, async (result) => {
      if (result.success) {
        const newElements = await buildElements(
          result.data.a,
          result.data.b,
          result.data.transport,
          $nodeSize,
          $groupSize,
          $showCommonNames,
        );

        if ($cytoscapeInstance) {
          refreshGraph($cytoscapeInstance, newElements);
        } else {
          console.warn("Cytoscape instance not ready yet");
          // Esperar un poco y reintentar
          setTimeout(() => {
            if ($cytoscapeInstance) {
              refreshGraph($cytoscapeInstance, newElements);
            }
          }, 100);
        }
        transportPlan.set(result.data.transport);
        marginalDistribution1.set(result.data.marginal_distribution1 || null);
        marginalDistribution2.set(result.data.marginal_distribution2 || null);
        selfAlignment1.set(result.data.t1 || null);
        selfAlignment2.set(result.data.t2 || null);
        selectedNode.set(undefined);
        uploadStatus.set("File loaded successfully!");
      } else {
        uploadStatus.set(`Error: ${result.error}`);
      }
    });
  };

  // Update node sizes
  $: if ($cytoscapeInstance && $cytoscapeInstance.elements().length > 0) {
    // Update individual nodes
    $cytoscapeInstance.nodes('[group="A"], [group="B"]').forEach((node) => {
      node.data("size", $nodeSize);
    });

    // Update parent group nodes
    $cytoscapeInstance.nodes("#A, #B").forEach((node) => {
      node.data("size", $groupSize);
    });

    // Update font sizes
    const baseFontSize = Math.max(8, Math.min(32, $nodeSize * 0.4));
    const groupFontSize = Math.max(12, Math.min(48, $groupSize * 0.4));

    $cytoscapeInstance.nodes('[group="A"], [group="B"]').forEach((node) => {
      node.style("font-size", `${baseFontSize}px`);
    });

    $cytoscapeInstance.nodes("#A, #B").forEach((node) => {
      node.style("font-size", `${groupFontSize}px`);
    });
  }

  // Update OT edges visibility
  $: if ($cytoscapeInstance && $cytoscapeInstance.elements().length > 0) {
    $cytoscapeInstance
      .elements('edge[group="cross"]')
      .style("display", $showOTEdges ? "element" : "none");
  }

  // Update edge weights
  $: if ($cytoscapeInstance && $cytoscapeInstance.elements().length > 0) {
    if ($showEdgeWeights) {
      $cytoscapeInstance.edges('[group="cross"]').addClass("show-weights");
      $cytoscapeInstance.edges().addClass("show-weights");
    } else {
      $cytoscapeInstance.edges().removeClass("show-weights");
    }
  }

  // Update show unselected
  $: if ($cytoscapeInstance && $cytoscapeInstance.elements().length > 0) {
    $cytoscapeInstance.elements().removeClass("all-hide");
    if (
      !$showUnselected &&
      $cytoscapeInstance.elements(".highlighted").length !== 0
    ) {
      $cytoscapeInstance
        .elements()
        .not("#A, #B, .highlighted")
        .addClass("all-hide");
    }
  }

  // Update node labels common and scientific names
  $: if ($cytoscapeInstance && $cytoscapeInstance.elements().length > 0) {
    $cytoscapeInstance.nodes('[group="A"], [group="B"]').forEach((node) => {
      const data = node.data();
      let displayName;

      if ($showCommonNames && data.common_name) {
        displayName = data.common_name;
      } else {
        displayName = data.scientific_name || data.label;
      }

      node.data("label", displayName);
    });
  }
</script>

<div class="top-bar">
  <div class="file-upload-wrapper">
    <input
      bind:this={fileInput}
      type="file"
      accept=".json"
      on:change={onFileChange}
      id="file-upload"
    />
    <label for="file-upload" class="custom-file-button">
      <svg class="upload-icon" viewBox="0 0 24 24">
        <path
          d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
        />
      </svg>
      Upload JSON
    </label>
  </div>

  <div class="size-control">
    <label>Node Size:</label>
    <input type="range" min="20" max="180" bind:value={$nodeSize} />
    <span class="size-value">{$nodeSize}</span>
  </div>

  <div class="size-control">
    <label>Group Size:</label>
    <input type="range" min="40" max="120" bind:value={$groupSize} />
    <span class="size-value">{$groupSize}</span>
  </div>

  <label>
    Show OT edges:
    <input type="checkbox" bind:checked={$showOTEdges} />
  </label>

  <label>
    Show unselected:
    <input type="checkbox" bind:checked={$showUnselected} />
  </label>

  <label>
    Show edge weights:
    <input type="checkbox" bind:checked={$showEdgeWeights} />
  </label>

  <label>
    Show common names:
    <input type="checkbox" bind:checked={$showCommonNames} />
  </label>

  <button class="format-button" on:click={() => showFormatModal.set(true)}>
    JSON Format Help
  </button>

  <span class="status">{$uploadStatus}</span>
</div>

<style>
  .top-bar {
    padding: 15px;
    background: linear-gradient(135deg, #1e3c2e 0%, #2d5a3d 100%);
    color: white;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
  }

  .top-bar label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    font-size: 14px;
  }

  .size-control {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .size-control label {
    font-size: 12px;
    margin: 0;
  }

  .size-control input[type="range"] {
    width: 80px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
  }

  .size-control input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .size-control input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .size-value {
    font-size: 11px;
    min-width: 20px;
    text-align: center;
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 6px;
    border-radius: 3px;
  }

  .format-button {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .format-button:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .top-bar input[type="file"] {
    padding: 5px;
    border: none;
    border-radius: 4px;
    background: white;
    color: #333;
  }

  .top-bar input[type="checkbox"] {
    transform: scale(1.2);
  }

  .status {
    margin-left: auto;
    font-weight: bold;
    padding: 5px 10px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .file-upload-wrapper {
    position: relative;
    display: inline-block;
  }

  .file-upload-wrapper input[type="file"] {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .custom-file-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    user-select: none;
  }

  .custom-file-button:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .custom-file-button:active {
    transform: translateY(0);
  }

  .upload-icon {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
</style>
