export const handleFileUpload = (file, callback) => {
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const gwData = JSON.parse(reader.result.toString());
        console.log("Parsed JSON data:", gwData);
        
        validateFileStructure(gwData);
        callback({ success: true, data: gwData });
      } catch (err) {
        console.error("File processing error:", err);
        callback({ success: false, error: err.message });
      }
    };
  
    reader.onerror = () => {
      callback({ success: false, error: "Error reading file!" });
    };
  
    reader.readAsText(file);
  };
  
  const validateFileStructure = (gwData) => {
    if (!gwData.a || !gwData.b || !gwData.transport) {
      throw new Error(
        "Invalid file format. Expected structure: {a: {...}, b: {...}, transport: [...]}"
      );
    }
  
    if (!gwData.a.nodes || !gwData.a.adjacency) {
      throw new Error(
        "Invalid graph A format. Expected: {nodes: [...], adjacency: [...]}"
      );
    }
  
    if (!gwData.b.nodes || !gwData.b.adjacency) {
      throw new Error(
        "Invalid graph B format. Expected: {nodes: [...], adjacency: [...]}"
      );
    }
  
    if (!Array.isArray(gwData.transport)) {
      throw new Error("Transport must be a 2D array");
    }
  };