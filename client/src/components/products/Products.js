import { useState, useEffect } from "react";
import ImportBar from "../import-Bar";

function Products() {
  const [formRendered, setFormRendered] = useState(false);

  // ----- FORM HIDE/SHOW -----
  useEffect(() => {
    function hideForm(e) {
      const isAddProductButton =
        e.target === document.querySelector("#addProductButton") ||
        document.querySelector("#addProductButton").contains(e.target);

      if (formRendered && !e.target.closest("table") && !isAddProductButton) {
        setFormRendered(false);
      }
    }

    if (formRendered) {
      document.addEventListener("click", hideForm); // only listen if form is rendered
    }

    return () => {
      document.removeEventListener("click", hideForm); // clean up listener
    };
  }, [formRendered]);

  function addForm(e) {
    e.stopPropagation(); // Stop the click event from reaching the document when "Add Product" is clicked
    setFormRendered((prevRendered) => !prevRendered);
  }

  // ----- HANDLERS -----

  // gathering form info

  const [name, setName] = useState("");
  const [kg, setKg] = useState("");
  const [price, setPrice] = useState("");

  function handleNameChange(e) {
    const { name, value } = e.target;

    if (name === "name") {
      setName(value);
    } else if (name === "kg") {
      setKg(value);
    } else if (name === "price") {
      setPrice(value);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const formData = {
      name: name,
      kg: kg,
      price: price,
    };
    console.log("Data gathered from the form", formData);
  }

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
              <th>square</th>
              <th>
                <button>Action</button>
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
                <td>square</td>
                <td>
                  <button>Add picture</button>
                </td>
                <td>
                  <input
                    type="text"
                    name="name"
                    onChange={handleNameChange}
                    placeholder="Blueberry"
                    required
                  />
                </td>
                <td>In Stock status</td>
                <td>
                  <input
                    type="number"
                    name="kg"
                    onChange={handleNameChange}
                    placeholder="1"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="price"
                    onChange={handleNameChange}
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
              <td>square</td>
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
