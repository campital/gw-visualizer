<script>
    import Legend from "./Legend.svelte";
    import SpeciesCard from "./SpeciesCard.svelte";
    import TransportSection from "./TransportSection.svelte";
    import { selectedNode } from "../stores/graphStore.js";
  </script>
  
  <div class="sidebar">
    <Legend />
    
    <h3 class="details-header">Species Details</h3>
    
    {#if $selectedNode}
      <SpeciesCard nodeId={$selectedNode} />
      <TransportSection nodeId={$selectedNode} />
    {:else}
      <div class="no-selection">Click on a species to see details</div>
    {/if}
  </div>
  
  <style>
    .sidebar {
      width: 500px;
      border-left: 2px solid #e9ecef;
      padding: 20px;
      overflow-y: auto;
      background: #ffffff;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    }
  
    .details-header {
      color: #495057;
      margin-bottom: 15px;
      font-size: 18px;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 10px;
    }
  
    .no-selection {
      text-align: center;
      color: #6c757d;
      font-style: italic;
      margin-top: 20px;
    }
  </style>