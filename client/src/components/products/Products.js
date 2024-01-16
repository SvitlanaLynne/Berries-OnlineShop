import { useState, useEffect, useCallback } from "react";
import ImportBar from "../import-Bar";

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

  const Url = "http://localhost:5050";

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
        e.target === document.querySelector("#add-product-button") ||
        document.querySelector("#add-product-button").contains(e.target);

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

      // formDataBulk.append("_id", checkedItems);

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

  function Delete(productId) {
    console.log("Product ID", productId);
    fetch(`/product/${productId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Delete operation failed. ${res.status}`);
        } else {
          console.log("Deleted successfully.");
        }
      })
      .catch((error) => {
        console.log("Error while deleting: ", error);
      });
  }

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
      case "Delete":
        Delete();
        break;
      case "Delete All":
        DeleteAll();
        break;
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
    <div id="main-Container">
      {/* ---------- import bar ---------- */}

      <ImportBar addForm={addForm} addImportOptions={addImportOptions} />
      {importShown === true ? (
        <div id="import-options-group">
          <button onClick={() => openUploadWindow()}>
            Import Products from File
          </button>
          <button onClick={() => openUploadImagesWindow()}>
            Bulk Add Images
          </button>
        </div>
      ) : (
        ""
      )}

      <main id="Products-Container">
        {/* // ----------a window appears ------------- */}
        <div id="fileUploadWindow" className="modalWindow">
          <span className="closeX" onClick={() => closeUploadWindow()}>
            &times;
          </span>
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVSelection}
            ></input>
            <button onClick={() => importProductsFromFile()}>Upload</button>
          </div>
        </div>
        {/* ------------- a window appears ------------- */}
        <div id="imagesUploadWindow" className="modalWindow">
          <span className="closeX" onClick={() => closeImagesUploadWindow()}>
            &times;
          </span>
          <div>
            <input
              type="file"
              multiple
              onChange={handleImagesSelection}
            ></input>
            <button onClick={() => importBulkImages()}>Submit</button>
          </div>
        </div>
        {/* ------------- a window appears ------------- */}
        <div id="bulkEditWindow" className="modalWindow">
          <span className="closeX" onClick={() => closeBulkEditWindow()}>
            &times;
          </span>
          <div>
            <label>Kg</label>
            <input
              type="number"
              name="kg"
              value={bulkEditForm.kg}
              onChange={handleBulkChange}
              placeholder="1"
            />
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={bulkEditForm.price}
              onChange={handleBulkChange}
              placeholder="8"
            />
            <button onClick={() => bulkEdit()}>Submit</button>
            <button onClick={() => closeBulkEditWindow()}>Cancel</button>
          </div>
        </div>
        {/* ---------- filters ---------- */}
        <aside id="filters">Filter Block</aside>

        {/* ---------- table ---------- */}
        {isLoading === true ? (
          <span>Loading...</span>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>
                  <div id="action-button-group">
                    <label id="action-button" onClick={() => showDropDown()}>
                      Action
                    </label>
                    {actionDropDownShown ? (
                      <select onChange={handleActionChange}>
                        <option></option>
                        <option>Bulk Edit</option>
                        <option>Delete</option>
                        <option>Delete All</option>
                      </select>
                    ) : (
                      ""
                    )}
                  </div>
                </th>
                <th>Name</th>
                <th>In Stock</th>
                <th>Kg</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {formShown === true ? (
                <tr id="form">
                  {/* ---------- form ---------- */}
                  <td>-</td>
                  <td>
                    <input
                      type="file"
                      multiple
                      onChange={handleImagesSelection}
                    ></input>
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
                  <td>In Stock status</td>
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
                  <td>
                    <button onClick={() => handleProductUpload()}>
                      Submit
                    </button>
                    <button onClick={() => setFormShown(false)}>Cancel</button>
                  </td>
                </tr>
              ) : (
                ""
              )}

              {/* ---------- products ---------- */}
              {data.map((product) => {
                // console.log("PRODUCT ID", product._id);
                return isEditing === product._id ? (
                  <tr key={product._id} id="form">
                    {/* ---------- inline form ---------- */}
                    <td>-</td>
                    <td>
                      <input
                        type="file"
                        multiple
                        onChange={handleImagesSelection}
                      ></input>
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
                    <td>
                      <button onClick={() => productEdit(product._id)}>
                        Submit
                      </button>
                      <button onClick={() => setIsEditing(null)}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  //  ---------- non-edited items ----------
                  <tr key={product._id}>
                    <td>
                      <div id="check-box-group">
                        <input
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
                    <td>
                      <button onClick={() => enableEdit(product._id)}>
                        Edit
                      </button>
                      <button onClick={() => Delete(product._id)}>
                        Delete
                      </button>
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
      </main>
    </div>
  );
}

export default Products;
