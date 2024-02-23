function ImportBar({ addForm, addImportOptions }) {
  return (
    <section id="import-bar-container">
      <button onClick={addForm} id="add-product-button">
        Add Product
      </button>
      <button id="import-button" onClick={addImportOptions}>
        Import
      </button>
    </section>
  );
}

export default ImportBar;
