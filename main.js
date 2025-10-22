// nuestro login

const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("loginSection");
const tienda = document.getElementById("tienda");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const fechaNacimiento = document.getElementById("fechaNacimiento").value;

  if (!nombre || !fechaNacimiento) {
    Swal.fire({
      icon: "error",
      title: "Datos incompletos",
      text: "Por favor, completa todos los campos.",
      confirmButtonColor: "#b71c1c",
    });
    return;
  }

// calculamos la edad y si es menor se niega el acceso

  const edad = calcularEdad(new Date(fechaNacimiento));

  if (edad < 18) {
    Swal.fire({
      icon: "error",
      title: "Acceso denegado",
      text: "Solo mayores de edad pueden entrar al taller del herrero.",
      confirmButtonColor: "#b71c1c",
    });
  } else {
    Swal.fire({
      icon: "success",
      title: `Bienvenido, ${nombre}!`,
      text: "El herrero te espera en su tienda 🔥",
      confirmButtonColor: "#4caf50",
    }).then(() => {
      loginSection.style.display = "none";
      tienda.style.display = "block";
    });
  }
});

function calcularEdad(fecha) {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const m = hoy.getMonth() - fecha.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }
  return edad;
}

// tienda

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let compras = JSON.parse(localStorage.getItem("compras")) || [];

const divProductos = document.querySelector(".grid-productos");

// error al cargar productos desde JSON local


fetch("./productos.json")
  .then((res) => {
    if (!res.ok) throw new Error("No se pudo cargar el archivo de productos.");
    return res.json();
  })
  .then((productos) => mostrarProductos(productos))
  .catch(() => {
    Swal.fire({
      icon: "error",
      title: "Error al cargar la tienda",
      text: "No se pudieron cargar los productos del herrero 😞",
      confirmButtonColor: "#b71c1c",
    });
  });

//aca mostramos los productos disponibles

function mostrarProductos(productos) {
  productos.forEach((prod) => {
    const card = document.createElement("div");
    card.className = "producto";
    card.innerHTML = `
      <img src="${prod.img}" alt="${prod.nombre}" class="imagen-producto">
      <h3>${prod.nombre}</h3>
      <p>Precio: ${prod.precio} <img src="./recursos/moneda.png" class="icono-moneda"></p>
      <button>Agregar al Carrito</button>
    `;
    card.querySelector("button").addEventListener("click", () => agregarAlCarrito(prod));
    divProductos.appendChild(card);
  });
}

function agregarAlCarrito(producto) {
  carrito.push(producto);
  actualizarCarrito();
  Swal.fire({
    icon: "success",
    title: "¡Agregado!",
    text: `${producto.nombre} se añadió al carrito.`,
    timer: 1500,
    showConfirmButton: false,
  });
}

//actualizamos el carrito en tiempo real


function actualizarCarrito() {
  const lista = document.getElementById("carrito");
  lista.innerHTML = "";
  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.nombre} - ${item.precio} MO`;
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌";
    btnEliminar.addEventListener("click", () => eliminarItem(index));
    li.appendChild(btnEliminar);
    lista.appendChild(li);
  });
  const total = carrito.reduce((acc, item) => acc + item.precio, 0);
  document.getElementById("total").textContent = `Total: ${total} monedas de oro`;
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

//podemos eliminar de a 1 loa items


function eliminarItem(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
}

document.getElementById("vaciarCarrito").addEventListener("click", () => {
  if (carrito.length === 0) return;
  Swal.fire({
    title: "¿Vaciar carrito?",
    text: "Perderás todos los artículos actuales.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#b71c1c",
  }).then((r) => {
    if (r.isConfirmed) {
      carrito = [];
      actualizarCarrito();
    }
  });
});

document.getElementById("comprarCarrito").addEventListener("click", () => {
  if (carrito.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Carrito vacío",
      text: "Agrega algo antes de comprar, viajero.",
    });
    return;
  }

  const total = carrito.reduce((acc, item) => acc + item.precio, 0);
  const compra = {
    fecha: new Date().toLocaleString(),
    items: [...carrito],
    total,
  };

  // realizamos la compra del carrito


  compras.push(compra);
  localStorage.setItem("compras", JSON.stringify(compras));
  carrito = [];
  actualizarCarrito();
  mostrarCompras();

  Swal.fire({
    icon: "success",
    title: "¡Compra realizada!",
    text: "Tus tesoros fueron añadidos al cofre 💰",
    confirmButtonColor: "#4caf50",
  });
});

function mostrarCompras() {
  const lista = document.getElementById("compras");
  lista.innerHTML = "";
  compras.forEach((c, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>Compra ${i + 1}</strong> - ${c.fecha}<br>${c.items
      .map((i) => i.nombre)
      .join(", ")}<br>💰 Total: ${c.total} monedas de oro`;
    lista.appendChild(li);
  });
}

// podemos borrar el historial de ompras del LocalStorage


document.getElementById("borrarHistorial").addEventListener("click", () => {
  Swal.fire({
    title: "¿Borrar historial?",
    text: "Se eliminarán todas las compras registradas.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, borrar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#b71c1c",
  }).then((r) => {
    if (r.isConfirmed) {
      compras = [];
      localStorage.removeItem("compras");
      mostrarCompras();
    }
  });
});

actualizarCarrito();
mostrarCompras();
