<script>
  import { onMount } from 'svelte';
  import cytoscape from 'cytoscape';
  import elk from 'cytoscape-elk';

  cytoscape.use(elk);

  let cy;

  let uploadStatus = 'No file uploaded.';
  let showOTEdges = true;
  let showEdgeWeights = true;
  let showUnselected = true;
  let selectedNode;
  let transportPlan;

  const elements = [];

  onMount(() => {
    cy = cytoscape({
      container: document.getElementById('cy'),
      elements,
      layout: {
        name: 'preset',
      },
      style: [
        {
          selector: ':parent',
          style: {
            label: 'data(label)',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': -15,
            'font-size': 24,
            'font-weight': 'bold'
          }
        },
        {
          selector: 'node[group="A"], node[group="B"]',
          style: {
            'background-color': '#666',
            label: 'data(label)',
            color: 'white',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-outline-width': 2,
            'text-outline-color': '#666',
          }
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#ccc',
            'curve-style': 'bezier'
          }
        },
        {
          selector: 'edge[group="cross"]',
          style: {
            'line-color': '#f66',
            'target-arrow-color': '#f66',
            'line-style': 'dashed',
            opacity: .1
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#f00',
            'target-arrow-color': '#f00',
            opacity: 1
          }
        },
        {
          selector: 'edge[group="cross"].highlighted',
          style: {
            width: 'mapData(displayWeight, 0, 1, 2, 20)'
          }
        },
        {
          selector: '.all-hide',
          style: {
            visibility: 'hidden'
          }
        },
        {
          selector: 'edge.highlighted.show-weights',
          style: {
            label: 'data(weight)'
          }
        }
      ]
    });

    cy.on('tap', function(evt) {
      const node = evt.target;
      if (node === cy) {
        cy.elements().removeClass('highlighted');
        updateShowUnselected();
        return; // WHY?????? Otherwise pan gets stuck, update suppression
      }

      if (node.isNode()) {
        if (node.id() != 'A' && node.id() != 'B') {
          selectedNode = node.id();
          cy.elements().removeClass('highlighted');
          node.connectedEdges().addClass('highlighted');
          node.neighborhood().addClass('highlighted');
          node.addClass('highlighted');
          updateShowUnselected();
        }
      }
    });
  });

  function getTransport(nodeId) {
    let group = nodeId[0];
    let ind = parseInt(nodeId.substring(1));

    let result = [];
    if (group == 'A') {
      let massValues = transportPlan[ind];
      for (let i = 0; i < massValues.length; i++) {
        result.push({ name: cy.getElementById(`B${i}`).data().label, amount: massValues[i] });
      }
    } else {
      let massValues = transportPlan.map(x => x[ind]);
      for (let i = 0; i < massValues.length; i++) {
        result.push({ name: cy.getElementById(`A${i}`).data().label, amount: massValues[i] });
      }
    }

    return result;
  }

  function getGraphElements(graphData, group) {
    let elements = [];
    for (let node of graphData.nodes) {
      if (!Number.isInteger(node.id)) {
        throw new Error(`Non-integer id: ${node.id}!`);
      }
      
      let name = (typeof node.name === 'undefined') ? node.id.toString() : node.name;
      elements.push({ data: { id: group + node.id.toString(), label: name, group: group, parent: group } });
    }

    for (let i = 0; i < graphData.adjacency.length; i++) {
      for (let edge of graphData.adjacency[i]) {
        let weight = (typeof edge.weight === 'undefined') ? 1 : edge.weight;
        elements.push({ data: { id: `${group}${i}_${edge.id}`, source: group + i.toString(),
          target: `${group}${edge.id}`, weight: weight, group: group } });
      }
    }

    return elements;
  }

  function buildElements(a, b, transport) {
    let elements = [
      { data: { id: 'A', label: a.name === undefined ? '' : a.name } },
      { data: { id: 'B', label: b.name === undefined ? '' : b.name } }
    ];

    elements = elements.concat(getGraphElements(a, 'A'));
    elements = elements.concat(getGraphElements(b, 'B'));

    for (let i = 0; i < transport.length; i++) {
      for (let j = 0; j < transport[0].length; j++) {
        if (transport[i][j] != 0) {
          elements.push({ data: { id: `cross${i}_${j}`, source: 'A' + i.toString(),
            target: 'B' + j.toString(), weight: Math.round(transport[i][j] * 10000) / 10000, displayWeight: Math.sqrt(transport[i][j]), group: 'cross' } });
        }
      }
    }

    return elements;
  }

  function refresh(elements) {
    cy.remove(cy.elements('*'));
    cy.add(elements);

    cy.layout({ name: 'elk', animate: false, fit: true, stop: () => {
      let bbA = cy.getElementById('A').boundingBox();
      let bbB = cy.getElementById('B').boundingBox();

      cy.getElementById('A').position({ x: 0, y: 0 });
      cy.getElementById('B').position({ x: bbA.w / 2 + bbB.w / 2 + 50, y: 0 });
      cy.fit(undefined, 50);
    } }).run();

    selectedNode = undefined;

    updateShowUnselected();
    updateShowEdgeWeights();
    updateShowOTEdges();
  }

  function handleGraphUpload(ev) {
    let file = ev.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = () => {
      try {
        let gwData = JSON.parse(reader.result.toString());
        let newElements = buildElements(gwData.a, gwData.b, gwData.transport);
        refresh(newElements);
        transportPlan = gwData.transport;
        uploadStatus = 'Viewing.';
      } catch(err) {
        console.error(err);
        uploadStatus = 'Error processing file!';
      }
    };

    reader.readAsText(file);
  }

  function updateShowOTEdges() {
    cy.elements('edge[group="cross"]').style('display', showOTEdges ? 'element' : 'none');
  }

  function updateShowEdgeWeights() {
    if (showEdgeWeights) {
      cy.edges().addClass('show-weights');
    } else {
      cy.edges().removeClass('show-weights');
    }
  }

  function updateShowUnselected() {
    cy.elements().removeClass('all-hide');
    if (!showUnselected && cy.elements('.highlighted').length != 0) {
      cy.elements().not('#A, #B, .highlighted').addClass('all-hide');
    }
  }
</script>

<style>
  .layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .top-bar label {
    display: flex;
    align-items: center;
    gap: 0.4em;
    font-weight: 500;
  }

  .top-bar {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 10px 20px;
    background-color: #ffffff;
    border-bottom: 1px solid #ddd;
  }

  .controls-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  input[type="file"] {
    padding: 4px;
  }

  .main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  #cy {
    flex: 1;
    min-width: 0;
    height: 100%;
    background-color: #fdfdfd;
  }

  .sidebar {
    width: 400px;
    max-width: 100%;
    border-left: 1px solid #e0e0e0;
    padding: 16px;
    overflow-y: auto;
    background-color: #fafafa;
    box-shadow: inset 4px 0 6px -6px rgba(0, 0, 0, 0.05);
  }

  .sidebar h3 {
    margin-top: 0;
    font-size: 1.1rem;
    border-bottom: 1px solid #ccc;
    padding-bottom: 4px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    margin-top: 12px;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  thead th {
    background-color: #d6edf8;
    font-weight: 600;
    text-align: left;
    padding: 10px;
  }

  th[colspan="2"] {
    background-color: #bde3f4;
    font-size: 1rem;
    text-align: center;
  }

  td, th {
    padding: 8px 10px;
    border: 1px solid #ccc;
  }

  tbody tr:nth-child(even) {
    background-color: #f4f7fb;
  }

  tbody tr:hover {
    background-color: #e7f3ff;
  }

  td:last-child {
    text-align: center;
  }
</style>

<div class="layout">
  <div class="top-bar">
    <div class="controls-row">
      <label>
        Upload transport JSON:
        <input type="file" accept=".json" on:change={handleGraphUpload} />
      </label>
      <span>{uploadStatus}</span>
    </div>
    <div class="controls-row">
      <label>
        Show OT edges:
        <input type="checkbox" bind:checked={showOTEdges} on:change={updateShowOTEdges} />
      </label>
      <label>
        Show unselected:
        <input type="checkbox" bind:checked={showUnselected} on:change={updateShowUnselected} />
      </label>
      <label>
        Show edge weights:
        <input type="checkbox" bind:checked={showEdgeWeights} on:change={updateShowEdgeWeights} />
      </label>
    </div>
    
  </div>
  <div class="main">
    <div id="cy"></div>
    <div class="sidebar">
      <h3>Mass Transport from Selected</h3>
      {#if typeof selectedNode !== 'undefined'}
        <table>
          <thead>
            <tr>
              <th colspan="2">
                {cy.getElementById(selectedNode).data().label}
              </th>
            </tr>
            <tr>
              <th>
                Node in Other Graph
              </th>
              <th>
                Mass Transfer
              </th>
            </tr>
          </thead>
          <tbody>
            {#each getTransport(selectedNode) as trans}
              {#if trans.amount != 0}
              <tr>
                <th>
                  {trans.name}
                </th>
                <td>
                  {Math.round(trans.amount * 10000) / 10000}
                </td>
              </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</div>

