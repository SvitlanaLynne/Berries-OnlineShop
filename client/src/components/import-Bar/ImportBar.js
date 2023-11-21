function ImportBar({ addForm }) {
  return (
    <section id="ImportBar-Container">
      <div id="import-buttons-group">
        <button>Import</button>
        <button onClick={addForm} id="addProductButton">
          Add Product
        </button>
      </div>
      <img src="" alt="Berries Project Logo" />
    </section>
  );
}

export default ImportBar;
