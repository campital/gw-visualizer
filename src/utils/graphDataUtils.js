export const buildElements = (a, b, transport, nodeSize, groupSize, showCommonNames = false) => {
    const elements = [];
  
    // Add parent group elements
    elements.push(
      { data: { id: "A", label: "Group A", size: groupSize } },
      { data: { id: "B", label: "Group B", size: groupSize } }
    );
  
    // Add graph A elements
    const elementsA = getGraphElements(a, "A", nodeSize, showCommonNames);
    elements.push(...elementsA);
  
    // Add graph B elements  
    const elementsB = getGraphElements(b, "B", nodeSize, showCommonNames);
    elements.push(...elementsB);
  
    // Add transport edges
    for (let i = 0; i < transport.length; i++) {
      for (let j = 0; j < transport[0].length; j++) {
        if (transport[i][j] !== 0) {
          elements.push({
            data: {
              id: `cross${i}_${j}`,
              source: "A" + i.toString(),
              target: "B" + j.toString(),
              weight: transport[i][j],
              displayWeight: Math.sqrt(transport[i][j]),
              group: "cross",
            },
          });
        }
      }
    }
  
    return elements;
  };
  
  export const getGraphElements = (graphData, group, nodeSize, showCommonNames = false) => {
    const elements = [];
  
    // Add nodes
    for (const node of graphData.nodes) {
      if (!Number.isInteger(node.id)) {
        throw new Error(`Non-integer id: ${node.id}!`);
      }
  
      // Determine display name based on toggle
      let displayName;
      if (showCommonNames && node.common_name) {
        displayName = node.common_name;
      } else if (node.name) {
        displayName = node.name.toString();
      } else {
        displayName = node.id.toString();
      }
  
      const nodeElement = {
        data: {
          id: group + node.id.toString(),
          label: displayName,
          group: group,
          parent: group,
          //Idk what prevalence is, should check if we can get that info
          prevalence: node.prevalence || 0,
          size: nodeSize,
          scientific_name: node.scientific_name || (node.name ? node.name.toString() : node.id.toString()),
          common_name: node.common_name || (node.name ? node.name.toString() : node.id.toString()),
          order: node.order || "Unknown",
          family: node.family || "Unknown",
          genus: node.genus || "Unknown",
          mass_g: node.mass_g || null,
          animal_type: node.animal_type || "Unknown",
          diet_summary: node.diet_summary || "Unknown",
          diet_details: node.diet_details || {},
          vertebrate: node.vertebrate || false,
          has_species_data: node.has_species_data || false,
        },
      };
      
      elements.push(nodeElement);
    }
  
    // Add internal edges
    for (let i = 0; i < graphData.adjacency.length; i++) {
      for (const edge of graphData.adjacency[i]) {
        const weight = typeof edge.weight === "undefined" ? 1 : edge.weight;
        
        const edgeElement = {
          data: {
            id: `${group}${i}_${edge.id}`,
            source: group + i.toString(),
            target: `${group}${edge.id}`,
            weight: weight,
            group: group,
          },
        };
        
        elements.push(edgeElement);
      }
    }
  
    return elements;
  };
  
  export const getTransport = (nodeId, transportPlan, cy) => {
    if (!transportPlan || !cy) return [];
  
    const group = nodeId[0];
    const ind = parseInt(nodeId.substring(1));
    const result = [];
  
    if (group === "A") {
      const massValues = transportPlan[ind];
      if (!massValues) return [];
      
      for (let i = 0; i < massValues.length; i++) {
        if (massValues[i] !== 0) {
          const targetNode = cy.getElementById(`B${i}`);
          if (targetNode.length > 0) {
            result.push({
              name: targetNode.data().label,
              amount: massValues[i],
            });
          }
        }
      }
    } else if (group === "B") {
      const massValues = transportPlan.map((x) => x[ind]);
      for (let i = 0; i < massValues.length; i++) {
        if (massValues[i] !== 0) {
          const targetNode = cy.getElementById(`A${i}`);
          if (targetNode.length > 0) {
            result.push({
              name: targetNode.data().label,
              amount: massValues[i],
            });
          }
        }
      }
    }
  
    return result.sort((a, b) => b.amount - a.amount);
  };
  
  export const getSpeciesInfo = (nodeId, cy) => {
    if (!cy || !nodeId) return null;
    
    const node = cy.getElementById(nodeId);
    if (!node.length) return null;
  
    const data = node.data();
    return {
      scientific_name: data.scientific_name || "Unknown",
      common_name: data.common_name || "Unknown", 
      order: data.order || "Unknown",
      family: data.family || "Unknown",
      genus: data.genus || "Unknown",
      mass_g: data.mass_g,
      animal_type: data.animal_type || "Unknown",
      diet_summary: data.diet_summary || "Unknown",
      diet_details: data.diet_details || {},
      vertebrate: data.vertebrate || false,
      has_species_data: data.has_species_data || false,
      prevalence: data.prevalence || 0,
    };


    
  };