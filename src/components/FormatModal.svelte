<script>
  import { showFormatModal } from "../stores/graphStore.js";

  const closeModal = () => {
    showFormatModal.set(false);
  };

  const handleBackdropClick = () => {
    closeModal();
  };

  const handleModalClick = (event) => {
    event.stopPropagation();
  };
</script>

<div class="modal-backdrop" on:click={handleBackdropClick}>
  <div class="modal" on:click={handleModalClick}>
    <div class="modal-header">
      <h3>Expected JSON Format</h3>
      <button class="close-button" on:click={closeModal}> × </button>
    </div>
    <div class="modal-content">
      <div class="json-example">
        {`{
    "a": {
      "nodes": [
        {"id": 0, "name": "A0", "prevalence": 0.25},
        {"id": 1, "name": "A1", "prevalence": 0.25}
      ],
      "adjacency": [
        [{"id": 1, "weight": 0.5}], 
        [{"id": 0}]
      ]
    },
    "b": {
      "nodes": [
        {"id": 0, "name": "B0", "prevalence": 0.2},
        {"id": 1, "name": "B1", "prevalence": 0.2}
      ],
      "adjacency": [
        [{"id": 1}], 
        [{"id": 0}]
      ]
    },
    "transport": [[0.1, 0.9], [0.8, 0.2]]
  }`}
      </div>
      <div class="format-notes">
        <h4>Notes:</h4>
        <ul>
          <li>"weight" in adjacency is optional (defaults to 1)</li>
          <li>"name" can be string or integer</li>
          <li>
            Additional fields like "common_name", "scientific_name", "order",
            "family", "genus", "mass_g", "animal_type", "diet_summary", etc. are
            supported
          </li>
          <li>
            "transport" is a 2D array representing mass transfer between groups
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    max-height: 80vh;
    width: 90%;
    overflow: hidden;
    animation: modalSlideIn 0.3s ease-out;
  }

  @keyframes modalSlideIn {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 20px;
  }

  .close-button {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .modal-content {
    padding: 20px;
    overflow-y: auto;
    max-height: calc(80vh - 80px);
  }

  .json-example {
    font-size: 11px;
    background: #f8f9fa;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    white-space: pre;
    font-family: "Courier New", monospace;
    border: 1px solid #dee2e6;
  }

  .format-notes {
    margin-top: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #667eea;
  }

  .format-notes h4 {
    margin: 0 0 10px 0;
    color: #495057;
    font-size: 16px;
  }

  .format-notes ul {
    margin: 0;
    padding-left: 20px;
  }

  .format-notes li {
    margin-bottom: 5px;
    color: #6c757d;
    font-size: 14px;
  }
</style>
