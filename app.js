let products = JSON.parse(localStorage.getItem("products")) || [];

function openProducts() {
  let name = prompt("Enter Product Name:");

  if (!name) return;

  products.push({
    name: name
  });

  localStorage.setItem("products", JSON.stringify(products));

  showProducts();
}

function showProducts() {
  let list = "Products List\n\n";

  if (products.length === 0) {
    list += "No Products";
  } else {
    products.forEach((p, i) => {
      list += (i + 1) + ". " + p.name + "\n";
    });
  }

  alert(list);
}

console.log("YmoKart Started");
