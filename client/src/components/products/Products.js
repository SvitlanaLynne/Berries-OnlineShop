import { useState, useEffect } from "react";
import ImportBar from "../import-Bar";

function Products() {
  const [formRendered, setFormRendered] = useState(false);
  const [actionDropDownShown, setActionDropDownShown] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [formData, setFormData] = useState({
    picture: "",
    name: "",
    availability: true,
    kg: "",
    price: "",
  });

  const Url = "http://localhost:5050";

  // ----- HIDE/SHOW -----
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

  function addForm(e) {
    e.stopPropagation(); // Stop the click event from reaching the document when "Add Product" is clicked
    setFormRendered((prevRendered) => !prevRendered);
  }

  // ----- HANDLERS -----

  function handleInputChange(e) {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    try {
      fetch(Url + "/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.log("Error during posting the form data", error);
      return;
    }

    console.log("Form submitted with the following data:", formData);
  }

  function showDropDown() {
    setActionDropDownShown((prev) => !prev);
  }

  function handleOptionChange(e) {
    const selectedOption = e.target.value;

    if (selectedOption === "Delete") {
      handleDelete();
    } else if (selectedOption === "Delete All") {
      handleDeleteAll();
    }
  }

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
  function handleDeleteAll() {
    fetch(Url + "/All", {
      method: "DELETE",
      Headers: { "Content-Type": "application/json" },
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Delete  ALL operation failed. ${res.status}`);
      } else {
        console.log("All has been deleted successfully.");
      }
    });
  }

  function handleCheckedChange() {
    // remove from/add to the checked array

    setCheckedItems((prev) => !prev);
  }

  // function checkedAll() {}

  return (
    <>
      {/* ---------- import bar ---------- */}
      <ImportBar addForm={addForm} />

      <main id="Products-Container">
        {/* ---------- filters ---------- */}
        <aside id="filters">Filter Block</aside>

        {/* ---------- table ---------- */}
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
                  <button>Add picture</button>
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
                  <button onClick={handleSubmit}>Submit</button>
                </td>
              </tr>
            ) : (
              ""
            )}

            {/* ---------- products ---------- */}
            <tr>
              <td>
                <div id="check-box-group">
                  <input
                    type="checkbox"
                    checked={checkedItems.includes(1)}
                    onChange={handleCheckedChange}
                  />
                </div>
              </td>
              <td>picture</td>
              <td>Strawberry</td>
              <td>Available</td>
              <td>5</td>
              <td>6</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    </>
  );
}

export default Products;
