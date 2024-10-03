//Referencias a objetos
const ruleta = document.getElementById("ruleta");
let opcionesContainer;
let opciones = Array.from(document.getElementsByClassName("opcion"));
const root = document.documentElement;
const formContainer = document.getElementById("formContainer");
const modal = document.querySelector("dialog");
const ganadorTextoElement = document.getElementById("ganadorTexto");
let ganador = "Felicidades Acertaste!";
let animacionCarga;
let sorteando = false;
const colores = [
  "a93226",
  "8e44ad",
  "3498db",
  "16a085",
  "2ecc71",
  "f39c12",
  "d35400",
  "8E402A",
  "231A24",
  "424632",
  "1F3438",
  "025669",
  "008F39",
  "763C28",
];

/** Contiene la suma actual de probabilidades en base 100 */
let suma = 0;
const uno = {
  nombre: "Unitaria",
  probabilidad: 14.28571428571429,
};
const dos = {
  nombre: "Integración",
  probabilidad: 14.28571428571429,
};
const tres = {
  nombre: "Funcionales",
  probabilidad: 14.28571428571429,
};
const cuatro = {
  nombre: "De extremo a extremo",
  probabilidad: 14.28571428571429,
};
const cinco = {
  nombre: "Aceptación",
  probabilidad: 14.28571428571429,
};
const seis = {
  nombre: "Redimiento",
  probabilidad: 14.28571428571429,
};
const siete = {
  nombre: "Humo",
  probabilidad: 14.28571428571429,
};

let conceptos = [uno, dos, tres, cuatro, cinco, seis, siete];
function sortear() {
  sorteando = true;
  ganadorTextoElement.textContent = ".";
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
  const nSorteo = Math.random();
  /** Cantidad de grados que debe girar la ruleta */
  const giroRuleta = (1 - nSorteo) * 360 + 360 * 10; //10 vueltas + lo aleatorio;
  root.style.setProperty("--giroRuleta", giroRuleta + "deg");
  ruleta.classList.toggle("girar", true);
  /** Acumulador de probabilidad para calcular cuando una probabilidad fue ganadora */
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

/** Desacopla lo que ocurre al terminar de girar la ruleta de la función girar */
ruleta.addEventListener("animationend", () => {
  ruleta.style.transform = "rotate(" + getCurrentRotation(ruleta) + "deg)";
  ruleta.classList.toggle("girar", false);
  sorteando = false;
  ganadorTextoElement.textContent = ganador;
  clearInterval(animacionCarga);
});

/** Crea todas las partes del elemento ruleta según la lista de conceptos */
function ajustarRuleta() {
  // Primero borro la ruleta anterior y creo una nueva.
  if (opcionesContainer) ruleta.removeChild(opcionesContainer);
  opcionesContainer = document.createElement("div");
  opcionesContainer.id = "opcionesContainer";
  ruleta.appendChild(opcionesContainer);
  let pAcumulada = 0;
  conceptos.forEach((concepto, i) => {
    //Creo triangulos de colores
    const opcionElement = document.createElement("div");
    opcionElement.classList.toggle("opcion", true);
    opcionElement.style = `
			--color: #${colores[i % colores.length]};
			--deg:${probabilidadAGrados(pAcumulada)}deg;
			${getPosicionParaProbabilidad(concepto.probabilidad)}`;
    opcionElement.addEventListener("click", () => onOpcionClicked(i));
    opcionesContainer.appendChild(opcionElement);
    //Creo textos
    const nombreElement = document.createElement("p");
    nombreElement.textContent = concepto.nombre;
    nombreElement.classList.add("nombre");
    nombreElement.style = `width : calc(${
      concepto.probabilidad
    } * var(--escala) * 1.5 / 80);
			transform: rotate(${
        probabilidadAGrados(concepto.probabilidad) / 2 +
        probabilidadAGrados(pAcumulada)
      }deg)`;
    opcionesContainer.appendChild(nombreElement);
    //Creo separadores
    const separadorElement = document.createElement("div");
    separadorElement.style = `transform: rotate(${probabilidadAGrados(
      pAcumulada
    )}deg)`;
    separadorElement.classList.add("separador");
    opcionesContainer.appendChild(separadorElement);
    pAcumulada += concepto.probabilidad;
    //Reseteo la posición y el cartel
    ruleta.style.transform = "rotate(0deg)";
    ganadorTextoElement.textContent = "¡Click en Girar para iniciar!";
  });
}

//Eventos de botones
document.getElementById("sortear").addEventListener("click", () => {
  if (!sorteando) sortear();
});

/** Desde una probabilidad en % devuelve un clip-path que forma el ángulo correspondiente a esa probabilidad */
function getPosicionParaProbabilidad(probabilidad) {
  if (probabilidad === 100) {
    return "";
  }
  if (probabilidad >= 87.5) {
    const x5 = Math.tan(probabilidadARadianes(probabilidad)) * 50 + 50;
    return `clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0 0, ${x5}% 0, 50% 50%)`;
  }
  if (probabilidad >= 75) {
    const y5 =
      100 - (Math.tan(probabilidadARadianes(probabilidad - 75)) * 50 + 50);
    return `clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0% ${y5}%, 50% 50%)`;
  }
  if (probabilidad >= 62.5) {
    const y5 =
      100 - (0.5 - 0.5 / Math.tan(probabilidadARadianes(probabilidad))) * 100;
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
    const y3 =
      (0.5 - 0.5 / Math.tan(probabilidadARadianes(probabilidad))) * 100;
    return `clip-path: polygon(50% 0, 100% 0, 100% ${y3}%, 50% 50%)`;
  }
  if (probabilidad >= 0) {
    const x2 = Math.tan(probabilidadARadianes(probabilidad)) * 50 + 50;
    return `clip-path: polygon(50% 0, ${x2}% 0, 50% 50%)`;
  }
}
// Selecciona todas las cartas
const cards = document.querySelectorAll(".card");
cards.forEach((card) => {
  card.addEventListener("mouseover", () => {
    card.classList.add("hover");
  });

  card.addEventListener("mouseout", () => {
    card.classList.remove("hover");
  });
  card.addEventListener("click", () => {
    cards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
  });
});

function getCurrentRotation(el) {
  var st = window.getComputedStyle(el, null);
  var tm =
    st.getPropertyValue("-webkit-transform") ||
    st.getPropertyValue("-moz-transform") ||
    st.getPropertyValue("-ms-transform") ||
    st.getPropertyValue("-o-transform") ||
    st.getPropertyValue("transform") ||
    "none";
  if (tm != "none") {
    var values = tm.split("(")[1].split(")")[0].split(",");
    var angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
    return angle < 0 ? angle + 360 : angle;
  }
  return 0;
}

/** Recibe un Nº base 1 y devuelve un Nº base 360 */
function probabilidadAGrados(probabiliad) {
  return (probabiliad * 360) / 100;
}

/** Recibe un Nº base 1 y devuelve radianes */
function probabilidadARadianes(probabilidad) {
  return (probabilidad / 100) * 2 * Math.PI;
}

ajustarRuleta();
