<script>
    import { cytoscapeInstance, showCommonNames } from "../stores/graphStore.js";
    import { getSpeciesInfo } from "../utils/graphDataUtils.js";
  
    export let nodeId;
  
    $: speciesInfo = getSpeciesInfo(nodeId, $cytoscapeInstance);
  </script>
  
  {#if speciesInfo}
    <div class="species-card">
      <div class="species-header">
        <div>
          <h4 class="species-name">
            {$showCommonNames
              ? speciesInfo.common_name
              : speciesInfo.scientific_name}
          </h4>
          <p class="species-subtitle">
            {$showCommonNames
              ? speciesInfo.scientific_name
              : speciesInfo.common_name}
          </p>
        </div>
        <span class="species-type">{speciesInfo.animal_type}</span>
      </div>
  
      <div class="species-details">
        <div class="detail-row">
          <span class="detail-label">Order:</span>
          <span class="detail-value">{speciesInfo.order}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Family:</span>
          <span class="detail-value">{speciesInfo.family}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Genus:</span>
          <span class="detail-value">{speciesInfo.genus}</span>
        </div>
        {#if speciesInfo.mass_g}
          <div class="detail-row">
            <span class="detail-label">Mass:</span>
            <span class="detail-value">
              {speciesInfo.mass_g.toLocaleString()} g
            </span>
          </div>
        {/if}
        <div class="detail-row">
          <span class="detail-label">Diet:</span>
          <span class="detail-value">{speciesInfo.diet_summary}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Prevalence:</span>
          <span class="detail-value">
            {(speciesInfo.prevalence * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  {/if}
  
  <style>
    .species-card {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
  
    .species-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
  
    .species-name {
      margin: 0 0 5px 0;
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
    }
  
    .species-subtitle {
      margin: 0;
      font-size: 14px;
      color: #7f8c8d;
      font-style: italic;
    }
  
    .species-type {
      background: #3498db;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
  
    .species-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
      border-bottom: 1px solid #e9ecef;
    }
  
    .detail-row:last-child {
      border-bottom: none;
    }
  
    .detail-label {
      font-size: 12px;
      color: #7f8c8d;
      font-weight: 500;
      text-transform: uppercase;
    }
  
    .detail-value {
      font-size: 14px;
      color: #2c3e50;
      font-weight: 500;
      text-align: right;
    }
  </style>