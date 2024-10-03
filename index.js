// Referencias a los elementos del DOM
const ruleta = document.getElementById("ruleta"); // El elemento visual de la ruleta
const root = document.documentElement; // El elemento raíz de CSS (para manipular variables CSS)
const formContainer = document.getElementById("formContainer"); // Contenedor del formulario de configuración
const ganadorTextoElement = document.getElementById("ganadorTexto"); // Elemento para mostrar el ganador
const colores = ["a93226","8e44ad","3498db","16a085","2ecc71","f39c12",
  "d35400","8E402A","231A24","424632","1F3438","025669","008F39","763C28"]; // Lista de colores asignados a las secciones de la ruleta

// Definición de los diferentes conceptos que aparecerán en la ruleta con sus respectivas probabilidades
const uno = { nombre: "Unitaria", probabilidad: 14.28571428571429 };
const dos = { nombre: "Integración", probabilidad: 14.28571428571429 };
const tres = { nombre: "Funcionales", probabilidad: 14.28571428571429 };
const cuatro = { nombre: "extremo", probabilidad: 14.28571428571429 };
const cinco = { nombre: "Aceptación", probabilidad: 14.28571428571429 };
const seis = { nombre: "Rendimiento", probabilidad: 14.28571428571429 };
const siete = { nombre: "Humo", probabilidad: 14.28571428571429 };

// Enlaces a más información para cada concepto
const linksGanadores = {
  "Unitaria": "../info/unitaria.html",
  "Integración": "../info/integracion.html",
  "Funcionales": "../info/funcionales.html",
  "extremo": "../info/extremo.html",
  "Aceptación": "../info/aceptacion.html",
  "Rendimiento": "../info/rendimiento.html",
  "Humo": "../info/humo.html"
};

// Variables auxiliares
let opcionesContainer; // Contenedor de las opciones dentro de la ruleta
let opciones = Array.from(document.getElementsByClassName("opcion")); // Lista de elementos DOM de las opciones
let animacionCarga; // Intervalo para la animación de carga mientras se sortean los resultados
let sorteando = false; // Estado que indica si la ruleta está en proceso de sorteo
let suma = 0; // Suma de probabilidades (no utilizado actualmente)
let conceptos = [uno, dos, tres, cuatro, cinco, seis, siete]; // Lista de conceptos

/* Función para sortear un ganador */
function sortear() {
  sorteando = true; // Indica que el sorteo está en curso
  ganadorTextoElement.textContent = "."; // Reinicia el texto del ganador
  // Animación de puntos suspensivos mientras se realiza el sorteo
  animacionCarga = setInterval(() => {
    switch (ganadorTextoElement.textContent) {
      case ".":
        ganadorTextoElement.textContent = "..";
        break;
      case "..":
        ganadorTextoElement.textContent = "...";
        break;
      default:
        ganadorTextoElement.textContent = ".";
        break;
    }
  }, 500);

  // Genera un número aleatorio para determinar el ganador
  const nSorteo = Math.random();
  /** 
   * Calcula los grados que la ruleta debe girar 
   * para simular el sorteo. Se suman 10 vueltas completas.
   */
  const giroRuleta = (1 - nSorteo) * 360 + 360 * 10;
  root.style.setProperty("--giroRuleta", giroRuleta + "deg"); // Actualiza el ángulo de rotación en CSS
  ruleta.classList.toggle("girar", true); // Activa la animación de giro

  // Acumula la probabilidad para determinar qué opción es la ganadora
  let pAcumulada = 0;
  conceptos.forEach((concepto) => {
    if (
      nSorteo * 100 > pAcumulada &&
      nSorteo * 100 <= pAcumulada + concepto.probabilidad
    ) {
      ganador = concepto.nombre;
    }
    pAcumulada += concepto.probabilidad;
  });
}

// Evento que ocurre cuando la animación de la ruleta termina
ruleta.addEventListener("animationend", () => {
  ruleta.style.transform = "rotate(" + getCurrentRotation(ruleta) + "deg)"; // Mantiene la rotación final de la ruleta
  ruleta.classList.toggle("girar", false); // Desactiva la animación
  sorteando = false; // Marca que el sorteo ha finalizado
  ganadorTextoElement.textContent = ganador; // Muestra el ganador en pantalla
  clearInterval(animacionCarga); // Detiene la animación de puntos suspensivos
});

/** 
 * Crea todas las partes visuales de la ruleta 
 * según los conceptos definidos
 */
function ajustarRuleta() {
  // Elimina la ruleta previa y crea una nueva
  if (opcionesContainer) ruleta.removeChild(opcionesContainer);
  opcionesContainer = document.createElement("div");
  opcionesContainer.id = "opcionesContainer";
  ruleta.appendChild(opcionesContainer);

  let pAcumulada = 0;
  // Crea las secciones de la ruleta con los colores y textos correspondientes
  conceptos.forEach((concepto, i) => {
    // Crea los triángulos de cada opción
    const opcionElement = document.createElement("div");
    opcionElement.classList.toggle("opcion", true);
    opcionElement.style = `
      --color: #${colores[i % colores.length]};
      --deg:${probabilidadAGrados(pAcumulada)}deg;
      ${getPosicionParaProbabilidad(concepto.probabilidad)}`;
    opcionElement.addEventListener("click", () => onOpcionClicked(i));
    opcionesContainer.appendChild(opcionElement);

    // Crea el texto del nombre en cada opción
    const nombreElement = document.createElement("p");
    nombreElement.textContent = concepto.nombre;
    nombreElement.classList.add("nombre");
    nombreElement.style = `width : calc(${
      concepto.probabilidad
    } * var(--escala) * 1.5/ 80);
    transform: rotate(${
      probabilidadAGrados(concepto.probabilidad) / 2 +
      probabilidadAGrados(pAcumulada)
    }deg)`;
    opcionesContainer.appendChild(nombreElement);

    // Crea los separadores entre las opciones
    const separadorElement = document.createElement("div");
    separadorElement.style = `transform: rotate(${probabilidadAGrados(
      pAcumulada
    )}deg)`;
    separadorElement.classList.add("separador");
    opcionesContainer.appendChild(separadorElement);

    pAcumulada += concepto.probabilidad; // Acumula la probabilidad
  });

  // Reinicia la posición de la ruleta y el texto inicial
  ruleta.style.transform = "rotate(0deg)";
  ganadorTextoElement.textContent = "¡Gira la Ruleta para iniciar!";
}

// Evento para el botón de sorteo
document.getElementById("sortear").addEventListener("click", () => {
  if (!sorteando) sortear(); // Si no está sorteando, inicia el sorteo
});

/** 
 * Dada una probabilidad en %, devuelve un clip-path que forma el ángulo 
 * correspondiente para representar gráficamente la sección en la ruleta 
 */
function getPosicionParaProbabilidad(probabilidad) {
  if (probabilidad === 100) {
    return ""; // Si la probabilidad es del 100%, no se necesita ajustar el clip-path
  }
  if (probabilidad >= 87.5) {
    const x5 = Math.tan(probabilidadARadianes(probabilidad)) * 50 + 50;
    return `clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0 0, ${x5}% 0, 50% 50%)`; 
  }
  if (probabilidad >= 75) {
    const y5 = 100 - (Math.tan(probabilidadARadianes(probabilidad - 75)) * 50 + 50);
    return `clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0% ${y5}%, 50% 50%)`; 
  }
  if (probabilidad >= 62.5) {
    const y5 = 100 - (0.5 - 0.5 / Math.tan(probabilidadARadianes(probabilidad))) * 100;
    return `clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0% ${y5}%, 50% 50%)`; 
  }
  if (probabilidad >= 50) {
    const x4 = 100 - (Math.tan(probabilidadARadianes(probabilidad)) * 50 + 50);
    return `clip-path: polygon(50% 0, 100% 0, 100% 100%, ${x4}% 100%, 50% 50%)`; 
  }
  if (probabilidad >= 37.5) {
    const x4 = 100 - (Math.tan(probabilidadARadianes(probabilidad)) * 50 + 50);
    return `clip-path: polygon(50% 0, 100% 0, 100% 100%, ${x4}% 100%, 50% 50%)`; 
  }
  if (probabilidad >= 25) {
    const y3 = Math.tan(probabilidadARadianes(probabilidad - 25)) * 50 + 50;
    return `clip-path: polygon(50% 0, 100% 0, 100% ${y3}%, 50% 50%)`; 
  }
  if (probabilidad >= 12.5) {
    const y3 = (0.5 - 0.5 / Math.tan(probabilidadARadianes(probabilidad))) * 100;
    return `clip-path: polygon(50% 0, 100% 0, 100% ${y3}%, 50% 50%)`; 
  }
  if (probabilidad >= 0) {
    const x2 = Math.tan(probabilidadARadianes(probabilidad)) * 50 + 50;
    return `clip-path: polygon(50% 0, ${x2}% 0, 50% 50%)`; 
  }
}

// Selecciona todas las cartas de la página
const cards = document.querySelectorAll(".card");
cards.forEach((card) => {
  // Añade efecto hover cuando el ratón pasa sobre la carta
  card.addEventListener("mouseover", () => {
    card.classList.add("hover");
  });

  // Elimina el efecto hover cuando el ratón deja la carta
  card.addEventListener("mouseout", () => {
    card.classList.remove("hover");
  });

  // Selecciona una carta al hacer clic, deselecciona las demás
  card.addEventListener("click", () => {
    cards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
  });
});

/**
 * Obtiene el ángulo de rotación actual de un elemento (en este caso, la ruleta)
 */
function getCurrentRotation(el) {
  var st = window.getComputedStyle(el, null); // Obtiene el estilo computado del elemento
  var tm =
    st.getPropertyValue("-webkit-transform") ||
    st.getPropertyValue("-moz-transform") ||
    st.getPropertyValue("-ms-transform") ||
    st.getPropertyValue("-o-transform") ||
    st.getPropertyValue("transform") ||
    "none"; // Obtiene el valor de la propiedad 'transform' o equivalente
  if (tm != "none") {
    var values = tm.split("(")[1].split(")")[0].split(","); // Extrae los valores de la matriz de transformación
    var angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI)); // Convierte la matriz en un ángulo
    return angle < 0 ? angle + 360 : angle; // Ajusta el ángulo para que esté en el rango de 0 a 360 grados
  }
  return 0; // Si no hay transformación, retorna 0
}

/**
 * Convierte una probabilidad del 1 al 100% en grados (0 a 360)
 */
function probabilidadAGrados(probabilidad) {
  return (probabilidad * 360) / 100;
}

/**
 * Convierte una probabilidad del 1 al 100% en radianes (0 a 2π)
 */
function probabilidadARadianes(probabilidad) {
  return (probabilidad / 100) * 2 * Math.PI;
}

// Evento que ocurre al finalizar la animación de giro de la ruleta
ruleta.addEventListener("animationend", () => {
  ruleta.style.transform = "rotate(" + getCurrentRotation(ruleta) + "deg)"; // Mantiene la rotación actual de la ruleta
  ruleta.classList.toggle("girar", false); // Detiene la animación de giro
  sorteando = false; // Indica que el sorteo ha terminado
  ganadorTextoElement.textContent = ganador; // Muestra el ganador en el texto correspondiente
  clearInterval(animacionCarga); // Detiene la animación de puntos suspensivos

  // Obtiene los elementos del modal
  const modal = document.getElementById("resultadoModal");
  const modalTexto = document.getElementById("resultadoTexto");
  const closeModal = document.querySelector(".close");

  // Elimina event listeners antiguos para evitar duplicación
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    // Clona el elemento para eliminar event listeners antiguos
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);

    // Agrega un nuevo event listener para manejar la selección de tarjetas
    newCard.addEventListener("click", () => {
      // Verifica si la tarjeta seleccionada coincide con el ganador
      if (newCard.id === ganador) {
        // Usa fetch para cargar contenido de la página del ganador y mostrarlo en el modal
        fetch(linksGanadores[ganador])
          .then(response => response.text())
          .then(data => {
            // Muestra el contenido dentro del modal
            modalTexto.innerHTML = `<h1>¡Correcto!</h1>` + data;
          })
          .catch(error => {
            modalTexto.textContent = `No se pudo cargar la información del ganador: ${ganador}`;
          });
      } else {
        modalTexto.textContent = "Incorrecto. Inténtalo de nuevo";
      }
      // Muestra el modal
      modal.style.display = "block";
    });
  });

  // Evento para cerrar el modal cuando se hace clic en el botón de cierre
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Cierra el modal si se hace clic fuera del contenido del modal
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

// Ajusta las opciones de la ruleta cuando se carga la página
ajustarRuleta();
