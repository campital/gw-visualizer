export const buildElements = async (
  a,
  b,
  transport,
  nodeSize,
  groupSize,
  showCommonNames = false
) => {
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
      if (transport[i][j] > 0.001) {
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

  // Load animal images
  const enhancedElements = await enhanceElementsWithImages(elements);
  return enhancedElements;
};

export const getGraphElements = (
  graphData,
  group,
  nodeSize,
  showCommonNames = false
) => {
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
        prevalence: node.prevalence || 0,
        size: nodeSize,
        scientific_name:
          node.scientific_name ||
          (node.name ? node.name.toString() : node.id.toString()),
        common_name:
          node.common_name ||
          (node.name ? node.name.toString() : node.id.toString()),
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
      if (edge.id === i) {
        continue;
      }

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

export const getTransport = (
  nodeId,
  transportPlan,
  cy,
  marginalDist1,
  marginalDist2
) => {
  if (!transportPlan || !cy) return [];

  const group = nodeId[0];
  const ind = parseInt(nodeId.substring(1));
  const result = [];

  console.log("=== DEBUG getTransport ===");
  console.log("nodeId:", nodeId, "group:", group, "index:", ind);
  console.log("marginalDist1:", marginalDist1);
  console.log("marginalDist2:", marginalDist2);
  console.log(
    "transportPlan shape:",
    transportPlan.length,
    "x",
    transportPlan[0]?.length
  );

  if (group === "A") {
    const massValues = transportPlan[ind];
    if (!massValues) return [];

    const marginalValue = marginalDist1 ? marginalDist1[ind] : null;
    const totalSentByThisNode = massValues.reduce((sum, val) => sum + val, 0);

    console.log("Group A - massValues:", massValues);
    console.log("Group A - marginalValue:", marginalValue);
    console.log("Group A - totalSentByThisNode:", totalSentByThisNode);

    for (let i = 0; i < massValues.length; i++) {
      if (massValues[i] !== 0) {
        const targetNode = cy.getElementById(`B${i}`);
        if (targetNode.length > 0) {
          const percentage = marginalValue
            ? (massValues[i] / marginalValue) * 100
            : totalSentByThisNode > 0
            ? (massValues[i] / totalSentByThisNode) * 100
            : 0;
          console.log(
            `Connection to B${i}: amount=${massValues[i]}, percentage=${percentage}`
          );
            result.push({
              name: targetNode.data().label,
              amount: massValues[i],
              percentage: percentage,
            });
        }
      }
    }
  } else if (group === "B") {
    const massValues = transportPlan.map((x) => x[ind]);
    const marginalValue = marginalDist2 ? marginalDist2[ind] : null;
    const totalReceivedByThisNode = massValues.reduce(
      (sum, val) => sum + val,
      0
    );

    console.log("Group B - massValues:", massValues);
    console.log("Group B - marginalValue:", marginalValue);
    console.log("Group B - totalReceivedByThisNode:", totalReceivedByThisNode);

    for (let i = 0; i < massValues.length; i++) {
      if (massValues[i] !== 0) {
        const targetNode = cy.getElementById(`A${i}`);
        if (targetNode.length > 0) {
          const percentage = marginalValue
            ? (massValues[i] / marginalValue) * 100
            : totalReceivedByThisNode > 0
            ? (massValues[i] / totalReceivedByThisNode) * 100
            : 0;

          console.log(
            `Connection to A${i}: amount=${massValues[i]}, percentage=${percentage}`
          );
          if (percentage >= 1.0) {
            result.push({
              name: targetNode.data().label,
              amount: massValues[i],
              percentage: percentage,
            });
          }
        }
      }
    }
  }

  console.log("Final result:", result);
  return result.sort((a, b) => b.percentage - a.percentage);
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
    diet_summary: data.diet_summary || "Unknown",
    diet_details: data.diet_details || {},
    has_species_data: data.has_species_data || false,
    animalImage: data.animalImage,
  };
};

// Animal image loading system
class SimpleAnimalImageLoader {
  constructor() {
    this.cache = new Map();
  }

  async getAnimalImage(genus, species, commonName) {
    const cacheKey = `${genus}_${species}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const imageUrl = await this.tryINaturalist(genus, species);

      if (imageUrl) {
        this.cache.set(cacheKey, imageUrl);
        return imageUrl;
      }
    } catch (error) {
      console.log(`Could not load image for ${genus} ${species}`);
    }

    return null;
  }

  async tryINaturalist(genus, species) {
    try {
      if (!genus || !species) return null;

      const scientificName = `${genus} ${species}`;
      console.log(`Searching iNaturalist: ${scientificName}`);

      const response = await fetch(
        `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(
          scientificName
        )}&per_page=1&rank=species`
      );

      if (!response.ok) {
        console.log(`iNaturalist response not ok: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];

        if (result.default_photo) {
          // Usar un proxy CORS para las imágenes
          const originalUrl = result.default_photo.medium_url;
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
            originalUrl
          )}`;

          console.log(`Found: ${result.name} with image`);
          return proxyUrl;
        }
      }
    } catch (error) {
      console.log("iNaturalist error:", error.message);
    }
    return null;
  }
}

// Global instance
const imageLoader = new SimpleAnimalImageLoader();

// Function to enhance elements with images
export const enhanceElementsWithImages = async (elements) => {
  console.log("Loading animal images...");

  let loaded = 0;
  let failed = 0;

  const animalElements = elements.filter(
    (el) =>
      (el.data?.group === "A" || el.data?.group === "B") &&
      el.data?.id !== "A" &&
      el.data?.id !== "B" &&
      el.data?.scientific_name &&
      el.data.scientific_name.trim()
  );

  const total = animalElements.length;
  console.log(`Total animals to process: ${total}`);

  for (let i = 0; i < animalElements.length; i++) {
    const element = animalElements[i];

    const scientificName =
      element.data.scientific_name || element.data.label || "";
    const commonName = element.data.common_name || "";

    const nameParts = scientificName.replace(/_/g, " ").split(" ");
    const genus = nameParts[0] || "";
    const species = nameParts[1] || "";

    if (!genus || !species) {
      console.log(`Skipping element without valid names: ${scientificName}`);
      continue;
    }

    console.log(`Searching: ${genus} ${species} (${commonName})`);

    try {
      const imageUrl = await imageLoader.getAnimalImage(
        genus,
        species,
        commonName
      );

      if (imageUrl) {
        element.data.animalImage = imageUrl;
        loaded++;
        console.log(`Success ${loaded}/${total}: ${genus} ${species}`);
      } else {
        failed++;
        console.log(`No image: ${genus} ${species}`);
      }

      if (i % 3 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      failed++;
      console.warn(`Error: ${genus} ${species}`);
    }
  }

  console.log(`Final result: ${loaded} images loaded, ${failed} without image`);
  return elements;
};
