const socket = io();

// Función para mostrar los productos
function appendProduct(producto) {
    const productList = document.getElementById("productList");
    const newProduct = document.createElement("li");
    newProduct.textContent = `${producto.nombre} - ${producto.precio}`;
    productList.appendChild(newProduct); // Agregar el nuevo producto a la lista
}

// Recibir la lista de productos del servidor
socket.on("productosActualizados", (productos) => {
    const productList = document.getElementById("productList");
    productList.innerHTML = "";
    productos.forEach((producto) => {
        appendProduct(producto);
    });
});


