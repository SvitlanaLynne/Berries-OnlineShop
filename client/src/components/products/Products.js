import { useState, useEffect, useCallback } from "react";
import ImportBar from "../import-Bar";

function Products() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsLoaded, setProductsLoaded] = useState(0);
  const [formRendered, setFormRendered] = useState(false);
  const [actionDropDownShown, setActionDropDownShown] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
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
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----- HIDE/SHOW the form -----
  useEffect(() => {
    function hideForm(e) {
      const isAddProductButton =
        e.target === document.querySelector("#addProductButton") ||
        document.querySelector("#addProductButton").contains(e.target);

      if (formRendered && !e.target.closest("table") && !isAddProductButton) {
        setFormRendered(false);
      }
    }
    function hideActionDropDown(e) {
      const isActionButtonGroup =
        e.target === document.querySelector("#action-button-group") ||
        document.querySelector("#action-button-group").contains(e.target);

      if (actionDropDownShown && !isActionButtonGroup) {
        setActionDropDownShown(false);
      }
    }

    if (formRendered) {
      document.addEventListener("click", hideForm); // only listen if form is rendered
    }
    if (actionDropDownShown) {
      document.addEventListener("click", hideActionDropDown); // only listen if options are rendered
    }

    return () => {
      document.removeEventListener("click", hideForm);
      document.removeEventListener("click", hideActionDropDown); // clean up listeners
    };
  }, [formRendered, actionDropDownShown]);

  const addForm = (e) => {
    e.stopPropagation(); // Stop the click event from reaching the document when "Add Product" is clicked
    setFormRendered((prevRendered) => !prevRendered);
  };
  // ----- UPLOAD PRODUCT AND IMAGES -----
  const handleProductUpload = async () => {
    try {
      const formDataWithImages = new FormData();

      selectedFiles.forEach((file) => {
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
      await fetchData();
      await setSelectedFiles([]);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      window.alert("An unexpected error occurred. Please try again later.");
    }
  };

  // ----- DELETE ONE -----

  function handleDelete() {
    const itemsId = "______";

    fetch(`___________/${itemsId}`, {
      method: "DELETE",
      Headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Delete operation failed. ${res.status}`);
        } else {
          console.log("Deleted successfully.");
        }
      })
      .catch((err) => {
        console.log("Error while deleting: ", err);
      });
  }

  // ----- DELETE ALL -----
  function handleDeleteAll() {
    try {
      fetch(Url + "/All", {
        method: "DELETE",
        Headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Delete  ALL operation failed. ${res.status}`);
          } else {
            console.log("All has been deleted successfully.");
          }
        })
        .then(() => fetchData());
    } catch (error) {
      console.error("Error during Delete All operation:", error);
      window.alert("An unexpected error occurred while deleting all items.");
    }
  }
  // ----- HANDLERS -----

  const handleImagesSelection = (e) => {
    setSelectedFiles(Array.from(e.target.files));
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

  const handleOptionChange = (e) => {
    const selectedOption = e.target.value;

    if (selectedOption === "Delete") {
      handleDelete();
    } else if (selectedOption === "Delete All") {
      handleDeleteAll();
    }
  };

  const handleCheckedChange = () => {
    // remove from/add to the checked array
    setCheckedItems((prev) => !prev);
  };

  // function checkedAll() {}

  const handleLoadMore = () => {
    if (productsLoaded < totalProducts) setPage((prevPage) => prevPage + 1);
  };

  return (
    <>
      {/* ---------- import bar ---------- */}
      <ImportBar addForm={addForm} />

      <main id="Products-Container">
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
                    <label id="action-button" onClick={showDropDown}>
                      Action
                    </label>
                    {actionDropDownShown ? (
                      <select onChange={handleOptionChange}>
                        <option></option>
                        <option>Change Category</option>
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
              {formRendered === true ? (
                <tr id="form">
                  {/* ---------- form ---------- */}
                  <td>-</td>
                  <td>
                    <input
                      type="file"
                      multiple
                      onChange={handleImagesSelection}
                    ></input>
                    {/* <button onClick={handleImagesUpload}>Add picture</button> */}
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
                    <button onClick={handleProductUpload}>Submit</button>
                  </td>
                </tr>
              ) : (
                ""
              )}

              {/* ---------- products ---------- */}
              {data.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div id="check-box-group">
                      <input
                        type="checkbox"
                        checked={checkedItems.includes(1)}
                        onChange={handleCheckedChange}
                      />
                    </div>
                  </td>
                  <td>
                    {product.images.map((imgUrl, index) => (
                      <img
                        key={`${product.id}-${index}`}
                        src={imgUrl}
                        alt={`${product.name} ${index + 1}`}
                      />
                    ))}
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
                    <button>Edit</button>
                    <button>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <aside></aside>
        {pageLoading && <span>Loading...</span>}
        {!pageLoading && productsLoaded < totalProducts && (
          <button onClick={handleLoadMore} disabled={pageLoading}>
            Load More
          </button>
        )}
      </main>
    </>
  );
}

export default Products;
