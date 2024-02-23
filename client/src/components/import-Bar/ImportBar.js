import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faFolderOpen } from "@fortawesome/free-solid-svg-icons";

function ImportBar({ addForm, addImportOptions }) {
  return (
    <section id="import-bar-container">
      <button onClick={addForm} id="add-product-button">
        Add Product
        <FontAwesomeIcon
          className="custom-icon"
          id="icon-plus"
          icon={faSquarePlus}
        />
      </button>
      <button id="import-button" onClick={addImportOptions}>
        Import
        <FontAwesomeIcon
          className="custom-icon"
          id="icon-folder"
          icon={faFolderOpen}
        />
      </button>
    </section>
  );
}

export default ImportBar;
