<script>
  import { cytoscapeInstance, transportPlan, marginalDistribution1, marginalDistribution2 } from "../stores/graphStore.js";
  import { getTransport } from "../utils/graphDataUtils.js";

  export let nodeId;

  $: allTransportConnections = getTransport(nodeId, $transportPlan, $cytoscapeInstance, $marginalDistribution1, $marginalDistribution2);
  
  // Filter conections more than 0.01%
  $: transportConnections = allTransportConnections.filter(trans => trans.percentage >= 0.01);

  // Format percentage
  function formatPercentage(percentage) {
    if (percentage >= 0.01) {
      return percentage.toFixed(1) + '%';
    } else if (percentage > 0) {
      return '<0.01%';
    } else {
      return '0%';
    }
  }
</script>

<div class="transport-section">
  <h4>Transport Connections</h4>
  {#each transportConnections as trans}
    <div class="transport-item">
      <span class="transport-species">{trans.name}</span>
      <span class="transport-amount">{formatPercentage(trans.percentage)}</span>
    </div>
  {:else}
    <div class="no-transport">No significant transport connections (>0.01%)</div>
  {/each}
  
  {#if allTransportConnections.length > transportConnections.length}
    <div class="minor-connections">
      +{allTransportConnections.length - transportConnections.length} minor connections
    </div>
  {/if}
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

  .minor-connections {
    text-align: center;
    color: #6c757d;
    font-size: 12px;
    margin-top: 8px;
    font-style: italic;
  }
</style>