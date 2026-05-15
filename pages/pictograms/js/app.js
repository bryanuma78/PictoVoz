import { supabase } from '/pages/Login/supabase.js';

/* =========================================
   DOM: SELECCIÓN DE ELEMENTOS
   ========================================= */
const bienvenida = document.getElementById('bienvenida');
const bienvenidaMobile = document.getElementById('bienvenida-mobile');
const cerrarBtn = document.getElementById('cerrar-sesion-btn');
const cerrarBtnMobile = document.getElementById('cerrar-sesion-btn-mobile');
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

const inputBusqueda = document.getElementById('input-busqueda');
const btnAgregar = document.getElementById('btn-agregar');
const btnEditar = document.getElementById('btn-editar');
const btnEliminar = document.getElementById('btn-eliminar');
const btnGuardar = document.getElementById('btn-guardar');
const btnPuntero = document.getElementById('btn-puntero');

const contenedor = document.getElementById('contenedor-pictogramas');
const resultadosDiv = document.getElementById('resultados-busqueda');
const mensajeModo = document.getElementById('mensaje-modo');

const modal = document.getElementById('modal-eliminar');
const textoModal = document.getElementById('texto-modal');
const confirmarEliminar = document.getElementById('confirmar-eliminar');
const cancelarEliminar = document.getElementById('cancelar-eliminar');

const videoElement = document.getElementById("videoCam");
const canvasElement = document.getElementById("canvasCam");
const canvasCtx = canvasElement.getContext("2d");
const cursorVirtual = document.getElementById("cursorVirtual");

/* =========================================
   ESTADO DE LA APLICACIÓN (VARIABLES)
   ========================================= */
let userId = null;
let modoActual = null;
let pictogramas = [];
let pictoAEliminar = null;
let punteroActivo = true;

const pictogramasDefecto = [
    { palabra: "Hola", img: "/images/pictogramas/hola.png", fijo: true },
    { palabra: "Comer", img: "/images/pictogramas/comer.png", fijo: true },
    { palabra: "Beber", img: "/images/pictogramas/beber.png", fijo: true }
];

/* =========================================
   GESTIÓN DE USUARIOS & AUTENTICACIÓN (SUPABASE)
   ========================================= */
async function verificarUsuario() {
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        const user = data?.user;
        if (user) {
            userId = user.id;
            const nombre = user.user_metadata?.full_name || user.email;
            bienvenida.textContent = `${nombre}`;
            bienvenidaMobile.textContent = `${nombre}`;
            cargarPictogramas();
        } else {
            location.href = '/pages/Login/login.html';
        }
    } catch (err) {
        console.error(err);
        location.href = '/pages/Login/login.html';
    }
}

// Eventos de Cierre de Sesión
cerrarBtn.onclick = async () => {
    await supabase.auth.signOut();
    location.href = '/pages/Login/login.html';
};

cerrarBtnMobile.onclick = async () => {
    await supabase.auth.signOut();
    location.href = '/pages/Login/login.html';
};

// Inicializar validación
verificarUsuario();

/* =========================================
   PERSISTENCIA DE DATOS (CRUD SUPABASE)
   ========================================= */
async function cargarPictogramas() {
    const { data } = await supabase
        .from('pictogramas_usuario')
        .select('*')
        .eq('user_id', userId);

    pictogramas = [
        ...pictogramasDefecto,
        ...(data || [])
    ];
    renderizarPictogramas();
}

async function guardarPictograma(p) {
    await supabase.from('pictogramas_usuario').insert([
        {
            user_id: userId,
            palabra: p.palabra,
            img: p.img
        }
    ]);
}

async function eliminarPictogramaDB(p) {
    await supabase
        .from('pictogramas_usuario')
        .delete()
        .eq('user_id', userId)
        .eq('palabra', p.palabra);
}

/* =========================================
   INTERFAZ DE USUARIO: INTERACCIONES & MODOS
   ========================================= */
function mostrarMensajeModo(texto, color) {
    mensajeModo.textContent = texto;
    mensajeModo.className = `mt-4 text-white font-bold px-4 py-2 rounded-xl shadow-md max-w-md mx-auto ${color}`;
    mensajeModo.classList.remove('hidden');

    setTimeout(() => {
        mensajeModo.classList.add('hidden');
    }, 2500);
}

// Menú Móvil Toggle
menuBtn.onclick = () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
};

// Selectores de Modo de Trabajo
btnEditar.onclick = () => {
    modoActual = 'editar';
    renderizarPictogramas();
    mostrarMensajeModo("✏️ Estás en modo editar", "bg-yellow-500");
};

btnEliminar.onclick = () => {
    modoActual = 'eliminar';
    renderizarPictogramas();
    mostrarMensajeModo("🗑️ Estás en modo eliminar", "bg-red-500");
};

btnGuardar.onclick = () => {
    modoActual = null;
    renderizarPictogramas();
    mostrarMensajeModo("✅ Cambios guardados", "bg-green-500");
};

btnPuntero.onclick = () => {
    punteroActivo = !punteroActivo;
    if (punteroActivo) {
        cursorVirtual.style.display = "block";
        videoElement.parentElement.style.display = "block";
        btnPuntero.innerHTML = "🖱️ Desactivar Puntero";
        mostrarMensajeModo("✅ Puntero activado", "bg-green-500");
    } else {
        cursorVirtual.style.display = "none";
        videoElement.parentElement.style.display = "none";
        btnPuntero.innerHTML = "🖱️ Activar Puntero";
        mostrarMensajeModo("⛔ Puntero desactivado", "bg-red-500");
    }
};

// Acciones del Modal
cancelarEliminar.onclick = () => modal.classList.add('hidden');

confirmarEliminar.onclick = async () => {
    if (pictoAEliminar) {
        const { picto, index } = pictoAEliminar;
        await eliminarPictogramaDB(picto);
        pictogramas.splice(index, 1);
        renderizarPictogramas();
    }
    modal.classList.add('hidden');
};

/* =========================================
   RENDERIZADO DINÁMICO DE ELEMENTOS
   ========================================= */
function renderizarPictogramas() {
    contenedor.innerHTML = '';

    pictogramas.forEach((picto, index) => {
        const cont = document.createElement('div');
        cont.className = 'flex flex-col items-center';

        const div = document.createElement('div');
        div.className = 'bg-white rounded-3xl shadow-lg hover:scale-110 transition p-2 md:p-4 cursor-pointer w-[85px] h-[85px] sm:w-[95px] sm:h-[95px] md:w-[110px] md:h-[110px] flex items-center justify-center border-4 border-green-200';
        div.innerHTML = `
            <img src="${picto.img}" class="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[80px] md:h-[80px] object-contain pictograma-img">
        `;

        /* MODO LOCAL: HABLAR (SÍNTESIS DE VOZ) */
        if (!modoActual) {
            div.onclick = () => {
                speechSynthesis.cancel();
                speechSynthesis.speak(new SpeechSynthesisUtterance(picto.palabra));
            };
        }

        /* MODO INTERFAZ: DISPARAR MODAL ELIMINAR */
        if (modoActual === 'eliminar' && !picto.fijo) {
            div.onclick = () => {
                pictoAEliminar = { picto, index };
                textoModal.textContent = `¿Eliminar "${picto.palabra}"?`;
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            };
        }

        cont.appendChild(div);

        /* MODO INTERFAZ: RENDERIZAR INPUTS PARA EDITAR / TEXTOS */
        if (modoActual === 'editar' && !picto.fijo) {
            const input = document.createElement('input');
            input.value = picto.palabra;
            input.className = 'mt-2 px-2 py-1 rounded-lg border-2 border-green-300 text-center w-[80px] md:w-[100px] text-sm';
            
            input.onchange = async () => {
                pictogramas[index].palabra = input.value;
                await supabase
                    .from('pictogramas_usuario')
                    .update({ palabra: input.value })
                    .eq('user_id', userId)
                    .eq('img', picto.img);
            };
            cont.appendChild(input);
        } else {
            const span = document.createElement('span');
            span.className = 'mt-2 font-bold text-sm md:text-base';
            span.textContent = picto.palabra;
            cont.appendChild(span);
        }

        contenedor.appendChild(cont);
    });
}

/* =========================================
   INTEGRACIÓN CON API ARASAAC (BUSCADOR)
   ========================================= */
btnAgregar.onclick = async () => {
    mostrarMensajeModo("🔍 Estás en modo buscar", "bg-blue-500");
    const termino = inputBusqueda.value.trim();
    if (!termino) return;

    const res = await fetch(`https://api.arasaac.org/api/pictograms/es/search/${encodeURIComponent(termino)}`);
    const data = await res.json();
    resultadosDiv.innerHTML = '';

    data.slice(0, 20).forEach(p => {
        const url = `https://static.arasaac.org/pictograms/${p._id}/${p._id}_300.png`;
        const img = document.createElement('img');
        img.src = url;
        img.className = 'w-full max-w-[100px] rounded-2xl cursor-pointer hover:scale-110 transition mx-auto';

        img.onclick = async () => {
            const nuevo = { palabra: termino, img: url, fijo: false };
            pictogramas.push(nuevo);
            await guardarPictograma(nuevo);
            modoActual = null;
            renderizarPictogramas();
            resultadosDiv.innerHTML = '';
            inputBusqueda.value = '';
        };

        resultadosDiv.appendChild(img);
    });
};

/* =========================================
   CÁMARA, DETECTOR FACIAL (MEDIAPIPE) & CURSOR
   ========================================= */
let rostroX = window.innerWidth / 2;
let rostroY = window.innerHeight / 2;
let suavizadoX = rostroX;
let suavizadoY = rostroY;

let ultimoElemento = null;
let hoverInicio = 0;
const TIEMPO_HOVER = 1200;
const TIEMPO_COOLDOWN = 3000;
const cooldownMap = new Map();

const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});

faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
});
camera.start();

function onResults(results) {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks.length > 0 && punteroActivo) {
        const landmarks = results.multiFaceLandmarks[0];
        const nose = landmarks[1]; // Landmark central de la nariz

        const x = nose.x * canvasElement.width;
        const y = nose.y * canvasElement.height;

        // Dibujar cuadro de referencia en el Canvas flotante
        canvasCtx.strokeStyle = "#00ff00";
        canvasCtx.lineWidth = 4;
        canvasCtx.strokeRect(x - 40, y - 40, 80, 80);

        // Mapeo e inversión de espejo para las coordenadas de la pantalla
        rostroX = window.innerWidth - (nose.x * window.innerWidth);
        rostroY = nose.y * window.innerHeight;

        // Suavizado cinemático (Lerp) para evitar temblores
        suavizadoX += (rostroX - suavizadoX) * 0.15;
        suavizadoY += (rostroY - suavizadoY) * 0.15;

        cursorVirtual.style.left = `${suavizadoX}px`;
        cursorVirtual.style.top = `${suavizadoY}px`;

        detectarHover();
    }
    canvasCtx.restore();
}

/* =========================================
   SISTEMA DE ACCESIBILIDAD: HOVER INTELIGENTE
   ========================================= */
function detectarHover() {
    const elemento = document.elementFromPoint(suavizadoX, suavizadoY);
    if (!elemento) return;

    const esPictograma = elemento.tagName === "IMG" && elemento.closest("#contenedor-pictogramas");

    if (!esPictograma) {
        ultimoElemento = null;
        return;
    }

    /* Validar Permanencia del cursor */
    if (elemento === ultimoElemento) {
        if (Date.now() - hoverInicio > TIEMPO_HOVER) {
            ejecutarClick(elemento);
            hoverInicio = Date.now() + 999999; // Evita ejecuciones en bucle continuas
        }
    } else {
        ultimoElemento = elemento;
        hoverInicio = Date.now();
    }
}

function ejecutarClick(elemento) {
    const ahora = Date.now();
    const ultimoClick = cooldownMap.get(elemento) || 0;

    /* Cooldown activo para evitar spam de clics fortuitos */
    if (ahora - ultimoClick < TIEMPO_COOLDOWN) {
        return;
    }

    cooldownMap.set(elemento, ahora);

    // Feedback visual de disparo de clic
    elemento.style.transform = "scale(1.25)";
    elemento.style.transition = "0.2s";

    setTimeout(() => {
        elemento.style.transform = "";
    }, 300);

    elemento.click();
}