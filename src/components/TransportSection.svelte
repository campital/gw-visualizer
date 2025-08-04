<script>
    import { cytoscapeInstance, transportPlan } from "../stores/graphStore.js";
    import { getTransport } from "../utils/graphDataUtils.js";
  
    export let nodeId;
  
    $: transportConnections = getTransport(nodeId, $transportPlan, $cytoscapeInstance);
  </script>
  
  <div class="transport-section">
    <h4>Transport Connections</h4>
    {#each transportConnections as trans}
      <div class="transport-item">
        <span class="transport-species">{trans.name}</span>
        <span class="transport-amount">{trans.amount.toExponential(3)}</span>
      </div>
    {:else}
      <div class="no-transport">No transport connections</div>
    {/each}
  </div>
  
  <style>
    .transport-section {
      margin-top: 20px;
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
    }
  
    .transport-section h4 {
      color: #495057;
      margin: 0 0 15px 0;
      font-size: 16px;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 5px;
    }
  
    .transport-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
  
    .transport-item:last-child {
      border-bottom: none;
    }
  
    .transport-species {
      font-size: 14px;
      color: #2c3e50;
      font-weight: 500;
    }
  
    .transport-amount {
      font-size: 14px;
      color: #e74c3c;
      font-weight: bold;
      font-family: monospace;
    }
  
    .no-transport {
      text-align: center;
      color: #6c757d;
      font-style: italic;
      padding: 10px 0;
    }
  </style>