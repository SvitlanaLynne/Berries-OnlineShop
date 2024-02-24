import { useState, useEffect, useCallback } from "react";
import ImportBar from "../import-Bar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faFileExcel,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Url from "../../config";

function Products() {
  const initialBulkEditFormState = {
    availability: true,
    kg: "",
    price: "",
  };
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsLoaded, setProductsLoaded] = useState(0);
  const [formShown, setFormShown] = useState(false);
  const [actionDropDownShown, setActionDropDownShown] = useState(false);
  const [importShown, setImportShown] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedCSV, setSelectedCSV] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [bulkEditForm, setBulkEditForm] = useState(initialBulkEditFormState);
  const [editFormData, setEditFormData] = useState({
    name: "",
    availability: true,
    kg: "",
    price: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    availability: true,
    kg: "",
    price: "",
  });

  // ----- GET PRODUCTS -----

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        Url + `/products?page=${page}&pageSize=${pageSize}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const { data, total } = await response.json();
      setTotalProducts(total);
      setProductsLoaded((prev) => prev + data.length);
      setData((prevData) => [...prevData, ...data]);
    } catch (error) {
      window.alert("Unexpected error. Unable to reach the server.");
    } finally {
      setIsLoading(false);
      setPageLoading(false);
    }
  }, [
    page,
    pageSize,
    setTotalProducts,
    setProductsLoaded,
    setData,
    setIsLoading,
    setPageLoading,
  ]);

  useEffect(() => {
    fetchData();
    console.log("fetchData triggered");
  }, [fetchData, page, pageSize]);

  // ----- HIDE/SHOW elements -----
  useEffect(() => {
    const hideForm = (e) => {
      const isAddProductButton =
        e.target === document.querySelector(".add-product-button") ||
        document.querySelector(".add-product-button").contains(e.target);

      if (formShown && !e.target.closest("table") && !isAddProductButton) {
        setFormShown(false);
      }
    };
    const hideActionDropDown = (e) => {
      const isActionButtonGroup =
        e.target === document.querySelector("#action-button-group") ||
        document.querySelector("#action-button-group").contains(e.target);

      if (actionDropDownShown && !isActionButtonGroup) {
        setActionDropDownShown(false);
      }
    };

    const hideImport = (e) => {
      const isImport =
        e.target === document.querySelector("#import-button") ||
        document.querySelector("#import-button").contains(e.target);

      const isChildButtons = e.target.closest("#import-options-group");

      if (importShown && !isImport && !isChildButtons) {
        setImportShown(false);
      }
    };

    if (formShown) {
      document.addEventListener("click", hideForm); // only listen if form is rendered
    }
    if (actionDropDownShown) {
      document.addEventListener("click", hideActionDropDown); // only listen if options are rendered
    }
    if (importShown) {
      document.addEventListener("click", hideImport); // only listen if Import options are shown
    }

    return () => {
      document.removeEventListener("click", hideForm);
      document.removeEventListener("click", hideActionDropDown); // clean up listeners
      document.removeEventListener("click", hideImport);
    };
  }, [formShown, actionDropDownShown, importShown]);

  const addForm = (e) => {
    e.stopPropagation(); // Stop the click event from reaching the document when "Add Product" is clicked
    setFormShown((prevDisplay) => !prevDisplay);
  };

  const addImportOptions = (e) => {
    e.stopPropagation();
    setImportShown((prevDisplay) => !prevDisplay);
  };

  // ----- INSERT ONE PRODUCT WITH IMAGES -----
  const handleProductUpload = async () => {
    try {
      // Append images
      const formDataWithImages = new FormData();

      selectedImages.forEach((file) => {
        formDataWithImages.append("images", file);
      });

      // Append data from the form
      for (const key in formData) {
        formDataWithImages.append(key, formData[key]);
      }

      const serverResponse = await fetch(`${Url}/upload/form`, {
        method: "POST",
        body: formDataWithImages,
      });

      if (!serverResponse.ok) {
        const errorMessage = await serverResponse.text();
        console.error(
          `Error during form and image upload. Status: ${serverResponse.status}, Message: ${errorMessage}`
        );
        window.alert(errorMessage);
        return;
      }

      console.log("Form and images submitted successfully");
      setData([]);
      await fetchData();
      setSelectedImages([]);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      window.alert("An unexpected error occurred. Please try again later.");
    }
  };

  // ----- INSERT MANY FROM FILE -----
  // ---- Upload Bulk Data from CSV  ----
  const openUploadWindow = () => {
    document.getElementById("fileUploadWindow").style.display = "flex";
  };

  const closeUploadWindow = () => {
    document.getElementById("fileUploadWindow").style.display = "none";
  };

  const importProductsFromFile = async () => {
    try {
      // form with appended file
      const formData = new FormData();
      formData.append("file", selectedCSV[0]);

      // post
      const serverResponse = await fetch(`${Url}/import/products`, {
        method: "POST",
        body: formData,
      });

      if (!serverResponse.ok) {
        const errorMessage = await serverResponse.text();
        console.error(
          `Error during CSV file upload. Status: ${serverResponse.status}, Message: ${errorMessage}`
        );
        window.alert(errorMessage);
        return;
      }
      setSelectedCSV([]);
      closeUploadWindow();
      setData([]);
      fetchData();
    } catch (error) {
      console.log("Error while uploading file to the server", error);
      window.alert(
        "Error while uploading file to the server. Please try again later."
      );
    }
  };

  // ---- Upload Bulk Images  ----
  const openUploadImagesWindow = () => {
    document.getElementById("imagesUploadWindow").style.display = "flex";
  };
  const closeImagesUploadWindow = () => {
    document.getElementById("imagesUploadWindow").style.display = "none";
  };

  const importBulkImages = async () => {
    try {
      const formDataWithImages = new FormData();

      selectedImages.forEach((file) => {
        formDataWithImages.append("images", file);
      });

      const serverResponse = await fetch(`${Url}/upload/bulk-images`, {
        method: "POST",
        body: formDataWithImages,
      });

      if (!serverResponse.ok) {
        const errorMessage = await serverResponse.text();
        console.error(
          `Error while bulk upload of images. Status: ${serverResponse.status}, Message: ${errorMessage}`
        );
        window.alert(errorMessage);
        return;
      }

      console.log("Bulk image import was successful");
      await fetchData();
      setSelectedImages([]);
      closeImagesUploadWindow();
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      window.alert("An unexpected error occurred. Please try again later.");
    }
  };

  // ----- EDIT ONE  -----

  const enableEdit = (productId) => {
    const productToEdit = data.find((product) => product._id === productId);

    setEditFormData({
      name: productToEdit.name,
      kg: productToEdit.kg,
      price: productToEdit.price,
    });

    setIsEditing(productId);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditFormData((prevState) => ({
      ...prevState,
      [name]: value,
      availability: formData.kg !== "0",
    }));
  };

  const productEdit = async (productId) => {
    try {
      const formData = new FormData();

      // Append images
      if (selectedImages.length > 0) {
        formData.append("image", selectedImages[0], selectedImages[0].name);
      }
      // Append form data
      formData.append("_id", productId);
      for (const key in editFormData) {
        formData.append(key, editFormData[key]);
      }

      // console FormData
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const serverResponse = await fetch(`${Url}/product/${productId}`, {
        method: "PATCH",
        body: formData,
      });

      if (!serverResponse.ok) {
        const errorMessage = await serverResponse.text();
        console.error(
          `Error during editing. Status: ${serverResponse.status}, Message: ${errorMessage}`
        );
        window.alert(errorMessage);
        return;
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      window.alert("An unexpected error occurred. Please try again later.");
    } finally {
      setData([]);
      await fetchData();
      setSelectedImages([]);
      setIsEditing(null);
    }
  };

  // ----- BULK EDIT   -----

  const openBulkEditWindow = () => {
    if (checkedItems.length <= 1) {
      window.alert("Please select several products to modify");
      return;
    }
    document.getElementById("bulkEditWindow").style.display = "flex";
  };
  const closeBulkEditWindow = () => {
    document.getElementById("bulkEditWindow").style.display = "none";
  };

  const handleBulkChange = (e) => {
    const { name, value } = e.target;

    setBulkEditForm((prevForm) => ({
      ...prevForm,
      [name]: value,
      availability: formData.kg !== "0",
    }));
  };

  const bulkEdit = async () => {
    try {
      const formDataBulk = new FormData();

      for (const id of checkedItems) {
        formDataBulk.append("_id", id);
      }

      for (const key in bulkEditForm) {
        formDataBulk.append(key, bulkEditForm[key]);
      }

      // console FormData
      for (const [key, value] of formDataBulk.entries()) {
        console.log(`${key}: ${value}`);
      }

      const serverResponse = await fetch(`${Url}/bulk`, {
        method: "PATCH",
        body: formDataBulk,
      });

      if (!serverResponse.ok) {
        const errorMessage = await serverResponse.text();
        console.error(
          `Error during Bulk editing. Status: ${serverResponse.status}, Message: ${errorMessage}`
        );
        window.alert(errorMessage);
        return;
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      window.alert("An unexpected error occurred. Please try again later.");
    } finally {
      setData([]);
      await fetchData();
      setCheckedItems([]);
      closeBulkEditWindow();
      setBulkEditForm(initialBulkEditFormState);
    }
  };

  // ----- DELETE ONE -----

  async function Delete(ProductId) {
    //reassuring
    const confirmDel = async () => {
      return new Promise((resolve) => {
        document.getElementById("deleteProductWindow").style.display = "flex";

        const deleteButton = document.getElementById("deleteButton");
        const cancelButton = document.getElementById("cancelButton");
        const closeModalButton = document.getElementById("closeModal");

        const onDeleteClick = () => {
          resolve(true);
          document.getElementById("deleteProductWindow").style.display = "none";
          cleanUpListeners();
        };

        const onCancelClick = () => {
          resolve(false);
          document.getElementById("deleteProductWindow").style.display = "none";
          cleanUpListeners();
        };

        const onCloseModalClick = () => {
          resolve(false);
          document.getElementById("deleteProductWindow").style.display = "none";
          cleanUpListeners();
        };

        const cleanUpListeners = () => {
          deleteButton.removeEventListener("click", onDeleteClick);
          cancelButton.removeEventListener("click", onCancelClick);
          closeModalButton.removeEventListener("click", onCloseModalClick);
        };

        deleteButton.addEventListener("click", onDeleteClick);
        cancelButton.addEventListener("click", onCancelClick);
        closeModalButton.addEventListener("click", onCloseModalClick);
      });
    };

    if (await confirmDel()) {
      try {
        const response = await fetch(Url + `/product/${ProductId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Delete operation failed. ${response.status}`);
        }

        console.log("The item has been deleted successfully.");
      } catch (error) {
        console.error("Unsuccessful Delete:", error);
        window.alert("An unexpected error occurred while deleting the item.");
      } finally {
        setPage(1);
        setData([]);
        await fetchData();
      }
    }
  }

  // ---- DELETE BULK -----

  const DeleteBulk = async () => {
    if (checkedItems.length <= 1) {
      window.alert("Please select several products to modify");
      return;
    }
    const confirmBulkDel = async () => {
      return new Promise((resolve) => {
        document.getElementById("bulkDeleteWindow").style.display = "flex";

        const deleteButton = document.getElementById("bulkDeleteButton");
        const cancelButton = document.getElementById("bulkCancelButton");
        const closeModalButton = document.getElementById("bulkDelCloseModal");

        const onDeleteClick = () => {
          resolve(true);
          document.getElementById("bulkDeleteWindow").style.display = "none";
          cleanUpListeners();
        };

        const onCancelClick = () => {
          resolve(false);
          document.getElementById("bulkDeleteWindow").style.display = "none";
          cleanUpListeners();
        };

        const onCloseModalClick = () => {
          resolve(false);
          document.getElementById("bulkDeleteWindow").style.display = "none";
          cleanUpListeners();
        };

        const cleanUpListeners = () => {
          deleteButton.removeEventListener("click", onDeleteClick);
          cancelButton.removeEventListener("click", onCancelClick);
          closeModalButton.removeEventListener("click", onCloseModalClick);
        };

        deleteButton.addEventListener("click", onDeleteClick);
        cancelButton.addEventListener("click", onCancelClick);
        closeModalButton.addEventListener("click", onCloseModalClick);
      });
    };

    if (await confirmBulkDel()) {
      try {
        const queryParams = checkedItems.map((id) => `_id=${id}`).join("&");
        const response = await fetch(`${Url}/bulkDel?${queryParams}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Bulk Deletion failed. ${response.status}`);
        }
        console.log("All selected items have been Deleted successfully.");
      } catch (error) {
        console.error("An unexpected error occurred:", error);
        window.alert("An unexpected error occurred. Please try again later.");
      } finally {
        setData([]);
        await fetchData();
        setCheckedItems([]);
      }
    }
  };

  // ----- DELETE ALL -----
  async function DeleteAll() {
    try {
      const response = await fetch(Url + "/All", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Delete ALL operation failed. ${response.status}`);
      }

      console.log("All items have been deleted successfully.");
      setPage(1);
      setData([]);
    } catch (error) {
      console.error("Error during Delete All operation:", error);
      window.alert("An unexpected error occurred while deleting all items.");
    }
  }
  // ----- HANDLERS -----
  const handleActionChange = (e) => {
    const selectedAction = e.target.value;

    switch (selectedAction) {
      case "Bulk Delete":
        DeleteBulk();
        break;
      // case "Delete All":
      //   DeleteAll();
      //   break;
      case "Bulk Edit":
        openBulkEditWindow();
        break;
      default:
        console.log("No action selected");
        break;
    }
  };

  const handleCheckedChange = (productId) => {
    setCheckedItems((prevItems) => {
      if (!prevItems.includes(productId)) {
        return [...prevItems, productId];
      } else {
        return prevItems.filter((x) => x !== productId);
      }
    });
  };

  const handleImagesSelection = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };
  const handleCSVSelection = (e) => {
    setSelectedCSV(Array.from(e.target.files));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
      availability: formData.kg !== "0",
    }));
  };

  const showDropDown = () => {
    setActionDropDownShown((prev) => !prev);
  };

  // function checkedAll() {}

  const handleLoadMore = () => {
    if (productsLoaded < totalProducts) setPage((prevPage) => prevPage + 1);
  };

  //------ RETURN ------

  return (
    <div id="main-container">
      {/* ---------- IMPORT BAR ---------- */}

      <ImportBar addForm={addForm} addImportOptions={addImportOptions} />
      {importShown === true ? (
        <div id="import-options-group">
          <button
            className="add-product-button"
            onClick={() => openUploadWindow()}
          >
            Import Products from File
            <FontAwesomeIcon
              className="custom-icon"
              id="icon-folder"
              icon={faFileExcel}
            />
          </button>
          <button
            className="add-product-button"
            onClick={() => openUploadImagesWindow()}
          >
            Bulk Add Images
            <FontAwesomeIcon
              className="custom-icon"
              id="icon-folder"
              icon={faImage}
            />
          </button>
        </div>
      ) : (
        ""
      )}

      <main id="products-container">
        <div class="sunshine"></div>
        <div class="particles"></div>
        {/* ---------- filters ---------- */}
        {/* <aside id="filters">Filter Block</aside> */}

        {/* ---------- TABLE ---------- */}
        {/* ------- head ------- */}
        {isLoading === true ? (
          <span>Loading...</span>
        ) : (
          <table>
            <colgroup>
              <col id="col-checkbox" />
              <col id="col-image" />
              <col id="col-name" />
              <col id="col-in-stock" />
              <col id="col-kg" />
              <col id="col-price" />
              <col id="col-buttons" />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <input className="checkbox" type="checkbox" />
                </th>
                {/* ------- action menu ------- */}
                <th>
                  <div id="action-button-group">
                    <button id="action-button" onClick={() => showDropDown()}>
                      Action
                    </button>
                    {actionDropDownShown ? (
                      <select onChange={handleActionChange}>
                        <option></option>
                        <option>Bulk Edit</option>
                        <option>Bulk Delete</option>
                        <option disabled>Delete All</option>
                      </select>
                    ) : (
                      ""
                    )}
                  </div>
                </th>
                {/* --------------------------- */}
                <th>Name</th>
                <th>In Stock</th>
                <th>Kg</th>
                <th>
                  <span>Price </span>
                  <span id="currency">(CAD/kg)</span>
                </th>
                <th></th>
              </tr>
            </thead>
            {/* ------- body ------- */}
            <tbody>
              {/* ---------- add product form ---------- */}
              {formShown === true ? (
                <tr className="add-product-form">
                  <td className="first-td"></td>
                  <td>
                    <div className="file-choose">
                      <input
                        type="file"
                        multiple
                        onChange={handleImagesSelection}
                      ></input>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Blueberry"
                      required
                    />
                  </td>
                  <td></td>
                  <td>
                    <input
                      type="number"
                      name="kg"
                      value={formData.kg}
                      onChange={handleInputChange}
                      placeholder="1"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="8"
                      required
                    />
                  </td>
                  <td className="last-td">
                    <div id="submit-cancel-buttons-group">
                      <button onClick={() => handleProductUpload()}>
                        Submit
                      </button>
                      <button onClick={() => setFormShown(false)}>
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                ""
              )}

              {/* ---------- products ---------- */}
              {data.map((product) => {
                {
                  /* ---------- edit form ---------- */
                }
                return isEditing === product._id ? (
                  <tr className="add-product-form" key={product._id} id="form">
                    <td className="first-td"></td>
                    <td>
                      <div className="file-choose">
                        <input
                          type="file"
                          multiple
                          onChange={handleImagesSelection}
                        ></input>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        required
                      />
                    </td>
                    <td>In Stock status</td>
                    <td>
                      <input
                        type="number"
                        name="kg"
                        value={editFormData.kg}
                        onChange={handleEditChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditChange}
                        required
                      />
                    </td>
                    <td className="last-td">
                      <button onClick={() => productEdit(product._id)}>
                        Submit
                      </button>
                      <button onClick={() => setIsEditing(null)}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  //  -------------------------------------
                  <tr key={product._id}>
                    <td className="first-td">
                      <div id="check-box-group">
                        <input
                          className="checkbox"
                          type="checkbox"
                          checked={checkedItems.includes(product._id)}
                          onChange={() => handleCheckedChange(product._id)}
                        />
                      </div>
                    </td>
                    <td>
                      {product.images.map((imgUrl, index) => {
                        if (
                          imgUrl.includes(`${product.name + ".jpg"}`) ||
                          imgUrl.includes(
                            `${product.name.toLowerCase() + ".jpg"}`
                          ) ||
                          imgUrl.includes(`${product.name + ".png"}`) ||
                          imgUrl.includes(
                            `${product.name.toLowerCase() + ".png"}`
                          )
                        ) {
                          return (
                            <img
                              key={`${product._id}-${index}`}
                              src={imgUrl}
                              alt={`${product.name} ${index + 1}`}
                            />
                          );
                        }
                        return null;
                      })}
                    </td>
                    <td>{product.name}</td>
                    <td>
                      {product.availability === true ? (
                        <span>Available</span>
                      ) : (
                        <span>Out of Stock</span>
                      )}
                    </td>
                    <td>{product.kg}</td>
                    <td>{product.price}</td>
                    <td className="last-td">
                      <div id="edit-delete-buttons-group">
                        <button
                          id="edit-button"
                          onClick={() => enableEdit(product._id)}
                        >
                          Edit
                        </button>
                        <button
                          id="delete-button"
                          onClick={() => Delete(product._id)}
                        >
                          X
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <aside></aside>
        {pageLoading && <span>Loading...</span>}
        {!pageLoading && productsLoaded < totalProducts && (
          <button onClick={() => handleLoadMore()} disabled={pageLoading}>
            Load More
          </button>
        )}
        {/* // ----------a window appears "Import from File" ------------- */}
        <div id="fileUploadWindow" className="modalWindow">
          <span className="closeX" onClick={() => closeUploadWindow()}>
            X
          </span>
          <form className="modal-window-content-container">
            <span>Bulk Import from File</span>
            <div className="file-choose">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVSelection}
              ></input>
            </div>
            <button
              className="modal-window-buttons-group"
              onClick={() => importProductsFromFile()}
            >
              Upload
            </button>
          </form>
        </div>
        {/* ------------- a window appears "Import Bulk Images" ------------- */}
        <div id="imagesUploadWindow" className="modalWindow">
          <span className="closeX" onClick={() => closeImagesUploadWindow()}>
            X
          </span>
          <form className="modal-window-content-container">
            <span>Import Bulk Images</span>
            <div className="file-choose">
              <input
                type="file"
                multiple
                onChange={handleImagesSelection}
              ></input>
            </div>
            <button
              className="modal-window-buttons-group"
              onClick={() => importBulkImages()}
            >
              Submit
            </button>
          </form>
        </div>
        {/* ------------- a window appears "Delete one confirmation" ------------- */}
        <div id="deleteProductWindow" className="modalWindow">
          <span className="closeX" id="closeModal">
            X
          </span>
          <div className="modal-window-content-container">
            <span>Are you sure you'd like to delete this item?</span>
            <div className="modal-window-buttons-group">
              <button id="deleteButton">Delete</button>
              <button id="cancelButton">Cancel</button>
            </div>
          </div>
        </div>
        {/* ------------- a window appears "Delete Bulk confirmation" ------------- */}
        <div id="bulkDeleteWindow" className="modalWindow">
          <span className="closeX" id="bulkDelCloseModal">
            X
          </span>
          <div className="modal-window-content-container">
            <span>
              You are about to delete selected items. Please confirm to proceed.
            </span>
            <div className="modal-window-buttons-group">
              <button id="bulkDeleteButton">Delete</button>
              <button id="bulkCancelButton">Cancel</button>
            </div>
          </div>
        </div>
        {/* ------------- a window appears "Edit Bulk" ------------- */}
        <div id="bulkEditWindow" className="modalWindow">
          <span className="closeX" onClick={() => closeBulkEditWindow()}>
            X
          </span>
          <span>Bulk Edit</span>
          <form className="modal-window-content-container">
            <div id="kg-price-input-group">
              <div>
                <label>Kg</label>
                <input
                  type="number"
                  name="kg"
                  value={bulkEditForm.kg}
                  onChange={handleBulkChange}
                  placeholder="1"
                />
              </div>
              <div>
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={bulkEditForm.price}
                  onChange={handleBulkChange}
                  placeholder="8"
                />
              </div>
            </div>
            <div className="modal-window-buttons-group">
              <button onClick={() => bulkEdit()}>Submit</button>
              <button onClick={() => closeBulkEditWindow()}>Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Products;
