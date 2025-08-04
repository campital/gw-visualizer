<div class="legend">
    <h4>Visual Legend</h4>
    <div class="legend-item">
      <div class="legend-color group-a"></div>
      <span>Group A Nodes</span>
    </div>
    <div class="legend-item">
      <div class="legend-color group-b"></div>
      <span>Group B Nodes</span>
    </div>
    <div class="legend-item">
      <div class="legend-color group-parent"></div>
      <span>Parent Group Nodes</span>
    </div>
    <div class="legend-item">
      <div class="legend-line edge-normal"></div>
      <span>Internal Graph Edges</span>
    </div>
    <div class="legend-item">
      <div class="legend-line edge-transport dashed"></div>
      <span>Transport Edges (thickness = mass)</span>
    </div>
  </div>
  
  <style>
    .legend {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
  
    .legend h4 {
      margin-bottom: 10px;
      color: #495057;
      font-size: 16px;
    }
  
    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }
  
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-right: 10px;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  
    .legend-line {
      width: 30px;
      height: 3px;
      margin-right: 10px;
      border-radius: 2px;
    }
  
    .legend-line.dashed {
      background: repeating-linear-gradient(
        to right,
        #e74c3c,
        #e74c3c 4px,
        transparent 4px,
        transparent 8px
      );
      height: 2px;
    }
  
    .group-a {
      background: #3498db;
    }
    .group-b {
      background: #e74c3c;
    }
    .group-parent {
      background: #95a5a6;
    }
    .edge-normal {
      background: #6c757d;
    }
    .edge-transport {
      background: #e74c3c;
    }
  </style>