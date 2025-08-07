<script>
  import { cytoscapeInstance, showCommonNames, transportPlan, marginalDistribution1, marginalDistribution2, selfAlignment1, selfAlignment2 } from "../stores/graphStore.js";
  import { getSpeciesInfo } from "../utils/graphDataUtils.js";

  export let nodeId;

  $: speciesInfo = getSpeciesInfo(nodeId, $cytoscapeInstance);
  
  //Calculate self alginment value
  $: selfAlignmentValue = (() => {
    if (!nodeId) return "0";
    
    const group = nodeId[0];
    const ind = parseInt(nodeId.substring(1));
    
    if (group === "A" && $selfAlignment1) {
      const rawValue = $selfAlignment1[ind];
      const percentage = rawValue * 100;
      console.log(`Group A[${ind}]: rawValue=${rawValue}, percentage=${percentage}`);
      
      // Manejar valores muy pequeños
      if (percentage >= 0.01) {
        return percentage.toFixed(1);
      } else if (percentage > 0) {
        return "<0.01";
      } else if (percentage < 0 && percentage > -0.01) {
        return ">-0.01";
      } else if (percentage <= -0.01) {
        return percentage.toFixed(1);
      } else {
        return "0";
      }
    } else if (group === "B" && $selfAlignment2) {
      const rawValue = $selfAlignment2[ind];
      const percentage = rawValue * 100;
      console.log(`Group B[${ind}]: rawValue=${rawValue}, percentage=${percentage}`);
      
      // Handle small values
      if (percentage >= 0.01) {
        return percentage.toFixed(1);
      } else if (percentage > 0) {
        return "<0.01";
      } else if (percentage < 0 && percentage > -0.01) {
        return ">-0.01";
      } else if (percentage <= -0.01) {
        return percentage.toFixed(1);
      } else {
        return "0";
      }
    }
    return "N/A";
  })();
</script>


{#if speciesInfo}
  <div class="species-card">
    <div class="species-header">
      <div class="species-image-container">
        {#if speciesInfo.animalImage}
          <img
            src={speciesInfo.animalImage}
            alt={speciesInfo.common_name}
            class="species-image"
            loading="lazy"
          />
        {:else}
          <div class="species-image-placeholder">
            <span class="placeholder-text">No Image</span>
          </div>
        {/if}
      </div>

      <div class="species-info">
        <h4 class="species-name">
          {$showCommonNames
            ? speciesInfo.common_name.replace(/_/g, " ")
            : speciesInfo.scientific_name.replace(/_/g, " ")}
        </h4>
        <p class="species-subtitle">
          {$showCommonNames
            ? speciesInfo.scientific_name.replace(/_/g, " ")
            : speciesInfo.common_name.replace(/_/g, " ")}
        </p>
      </div>
    </div>

    <div class="taxonomy-section">
      <h5>Taxonomy</h5>
      <div class="taxonomy-grid">
        <div class="taxonomy-item">
          <span class="taxonomy-label">Order:</span>
          <span class="taxonomy-value">{speciesInfo.order}</span>
        </div>
        <div class="taxonomy-item">
          <span class="taxonomy-label">Family:</span>
          <span class="taxonomy-value">{speciesInfo.family}</span>
        </div>
        <div class="taxonomy-item">
          <span class="taxonomy-label">Genus:</span>
          <span class="taxonomy-value">{speciesInfo.genus}</span>
        </div>
      </div>
    </div>

    <div class="species-details">
      {#if speciesInfo.mass_g}
        <div class="detail-row highlight">
          <span class="detail-label">Mass:</span>
          <span class="detail-value">
            {speciesInfo.mass_g.toLocaleString()} g
            {#if speciesInfo.mass_g >= 1000}
              <span class="detail-conversion">
                ({(speciesInfo.mass_g / 1000).toFixed(1)} kg)
              </span>
            {/if}
          </span>
        </div>
      {/if}

      <div class="detail-row">
        <span class="detail-label">Diet:</span>
        <span class="detail-value">{speciesInfo.diet_summary}</span>
      </div>
      <div class="detail-row highlight">
        <span class="detail-label">Self-Alignment:</span>
        <span class="detail-value self-alignment">
          {selfAlignmentValue}%
        </span>
      </div>
    </div>

    {#if speciesInfo.diet_details && Object.keys(speciesInfo.diet_details).length > 0}
      <div class="diet-details">
        <h5>Diet Details</h5>
        <div class="diet-grid">
          {#each Object.entries(speciesInfo.diet_details) as [food, percentage]}
            <div class="diet-item">
              <span class="diet-food">{food}:</span>
              <span class="diet-percentage"
                >{(percentage * 100).toFixed(1)}%</span
              >
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .species-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 2px solid #dee2e6;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .species-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .species-header {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    align-items: flex-start;
  }

  .species-image-container {
    flex-shrink: 0;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    border: 3px solid #dee2e6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .species-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .species-image:hover {
    transform: scale(1.05);
  }

  .species-image-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #e9ecef, #f8f9fa);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-text {
    font-size: 12px;
    color: #6c757d;
    text-align: center;
  }

  .species-info {
    flex: 1;
    min-width: 0;
  }

  .species-name {
    margin: 0 0 5px 0;
    font-size: 18px;
    font-weight: bold;
    color: #2c3e50;
    line-height: 1.2;
  }

  .species-subtitle {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #7f8c8d;
    font-style: italic;
    line-height: 1.3;
  }

  .species-type {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    padding: 4px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .taxonomy-section {
    background: #ffffff;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    border-left: 4px solid #3498db;
  }

  .taxonomy-section h5 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .taxonomy-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .taxonomy-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .taxonomy-label {
    font-size: 11px;
    color: #7f8c8d;
    font-weight: 500;
    text-transform: uppercase;
  }

  .taxonomy-value {
    font-size: 13px;
    color: #2c3e50;
    font-weight: 600;
  }

  .species-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-radius: 6px;
    background: #ffffff;
    border: 1px solid #e9ecef;
    transition: background-color 0.2s ease;
  }

  .detail-row:hover {
    background: #f8f9fa;
  }

  .detail-row.highlight {
    border-left: 4px solid #e74c3c;
    background: #fff5f5;
  }

  .detail-label {
    font-size: 12px;
    color: #7f8c8d;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .detail-value {
    font-size: 14px;
    color: #2c3e50;
    font-weight: 600;
    text-align: right;
  }

  .detail-conversion {
    font-size: 12px;
    color: #7f8c8d;
    font-weight: normal;
  }

  .prevalence {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: bold;
  }

  .diet-details {
    background: #ffffff;
    border-radius: 8px;
    padding: 15px;
    border-left: 4px solid #e74c3c;
  }

  .diet-details h5 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .diet-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .diet-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 13px;
  }

  .diet-food {
    color: #2c3e50;
    font-weight: 500;
    text-transform: capitalize;
  }

  .diet-percentage {
    color: #e74c3c;
    font-weight: bold;
    font-family: monospace;
  }

  .self-alignment {
    background: linear-gradient(135deg, #9b59b6, #8e44ad);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: bold;
  }
</style>
