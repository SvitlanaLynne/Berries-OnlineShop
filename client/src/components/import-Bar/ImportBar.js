function ImportBar({ addForm, addImportOptions }) {
  return (
    <section id="ImportBar-Container">
      <div id="import-buttons-group">
        <button onClick={addImportOptions} id="import-button">
          Import
        </button>
        <button onClick={addForm} id="add-product-button">
          Add Product
        </button>
      </div>
      <img src="" alt="Berries Project Logo" />
    </section>
  );
}

export default ImportBar;
