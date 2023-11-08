function Products() {
  return (
    <main id="Products_Container">
      {/* ---------- filters ---------- */}
      <aside id="filters">Filter Block</aside>
      {/* ---------- table ---------- */}
      <table>
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
      </table>
    </main>
  );
}

export default Products;
