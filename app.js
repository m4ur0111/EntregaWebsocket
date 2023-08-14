const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');

const PORT = 8080;

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "views")));

let productos = loadProductos(); //Cargar productos desde el archivo
let nextProductId = productos.length + 1;

app.get('/', (req, res) => {
    res.render('home', { productos }); //Pasar la lista de productos a la vista
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { productos }); //Pasar la lista de productos a la vista en tiempo real
});

// Configuración de Socket.IO
io.on("connection", (socket) => {
    socket.emit("productosActualizados", productos);

    // Escuchar evento para agregar un nuevo producto
    socket.on("nuevoProducto", (producto) => {
        producto._id = nextProductId++; // Asignar un nuevo ID autoincrementable
        productos.push(producto);
        saveProductos(productos); // Guardar productos en el archivo
        io.emit("productosActualizados", productos);
    });
    
    socket.on("eliminarProductoPorCodigo", (codigoEliminar) => {
        console.log("Eliminando producto con Código:", codigoEliminar);
        const productoAEliminar = productos.find(producto => producto.codigo === codigoEliminar);
        if (productoAEliminar) {
            const indice = productos.indexOf(productoAEliminar);
            productos.splice(indice, 1);
            saveProductos(productos);
            io.emit("productosActualizados", productos);
        } else {
            console.log("Producto no encontrado");
        }
    });
});

http.listen(PORT, () => {
    console.log("Servidor corriendo correctamente");
});

// Función para cargar productos desde el archivo
function loadProductos() {
    try {
        const data = fs.readFileSync('productos.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error al cargar productos:", error);
        return [];
    }
}

// Función para guardar productos en el archivo
function saveProductos(productos) {
    try {
        const data = JSON.stringify(productos, null, 2);
        fs.writeFileSync('productos.json', data);
        console.log("Productos guardados correctamente");
    } catch (error) {
        console.error("Error al guardar productos:", error);
    }
}
