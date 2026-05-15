/* =========================================
   ESTADO Y VARIABLES DEL MINIJUEGO
   ========================================= */
const juegoInicioDiv = document.getElementById('juego-inicio');
const juegoPantallaDiv = document.getElementById('juego-pantalla');
const btnIniciarJuego = document.getElementById('btn-iniciar-juego');
const juegoPreguntaSpan = document.getElementById('juego-pregunta');
const juegoOpcionesDiv = document.getElementById('juego-opciones');
const juegoFeedbackDiv = document.getElementById('juego-feedback');

const txtAciertos = document.getElementById('puntos-aciertos');
const txtRacha = document.getElementById('puntos-racha');

let juegoActivo = false;
let opcionCorrecta = null;
let aciertos = 0;
let rachaActual = 0;

/* Inicializar Eventos del Juego */
btnIniciarJuego.onclick = iniciarJuego;

function iniciarJuego() {
    // Validar que tengamos suficientes pictogramas cargados para poder jugar
    if (pictogramas.length < 3) {
        alert("Por favor, busca y guarda al menos 3 pictogramas en tu teclado para poder jugar.");
        return;
    }
    juegoInicioDiv.classList.add('hidden');
    juegoPantallaDiv.classList.remove('hidden');
    juegoActivo = true;
    generarNuevaRonda();
}

/* =========================================
   LOGICA DEL JUEGO: GENERADOR DE RONDAS RANDOM
   ========================================= */
function generarNuevaRonda() {
    // Limpiar feedbacks anteriores
    juegoFeedbackDiv.textContent = "";
    juegoFeedbackDiv.className = "text-2xl font-bold mb-6 h-8";
    juegoOpcionesDiv.innerHTML = "";

    // 1. Clonar y barajar la lista general de pictogramas del usuario
    const poolCopiar = [...pictogramas];
    const poolBarajado = poolCopiar.sort(() => 0.5 - Math.random());

    // 2. Elegir las 3 opciones que participarán esta ronda
    const seleccionadas = poolBarajado.slice(0, 3);

    // 3. De las 3 elegidas, definir cuál va a ser la respuesta correcta
    opcionCorrecta = seleccionadas[Math.floor(Math.random() * seleccionadas.length)];
    
    // 4. Mostrar la pregunta en texto
    juegoPreguntaSpan.textContent = opcionCorrecta.palabra.toUpperCase();

    // Locución por voz artificial de la pregunta para apoyar la accesibilidad cognitiva
    window.speechSynthesis.cancel();
    const instruccionVoz = new SpeechSynthesisUtterance(`¿Cuál es el pictograma de: ${opcionCorrecta.palabra}?`);
    window.speechSynthesis.speak(instruccionVoz);

    // 5. Renderizar los 3 contenedores de tarjetas para las opciones
    seleccionadas.forEach(picto => {
        const card = document.createElement('div');
        // El id/clase "pictograma-img" permite que el método "detectarHover" nativo lo identifique como objetivo válido
        card.className = 'bg-white rounded-3xl shadow-xl hover:scale-105 border-4 border-purple-200 p-4 cursor-pointer transition-all flex flex-col items-center justify-center w-full aspect-square max-w-[180px] mx-auto';
        
        card.innerHTML = `
            <img src="${picto.img}" data-palabra="${picto.palabra}" class="w-[80%] h-[80%] object-contain pictograma-img">
        `;

        // Evento de Selección (Funciona tanto por Clic normal como por Hover de Nariz)
        card.onclick = () => verificarRespuesta(picto.palabra, card);

        juegoOpcionesDiv.appendChild(card);
    });
}

/* =========================================
   VALIDACIÓN DE RESPUESTAS & FEEDBACK ANIMADO
   ========================================= */
function verificarRespuesta(palabraSeleccionada, elementoCard) {
    if (!juegoActivo) return;

    window.speechSynthesis.cancel();

    if (palabraSeleccionada === opcionCorrecta.palabra) {
        // --- CASO CORRECTO ---
        aciertos++;
        rachaActual++;
        txtAciertos.textContent = aciertos;
        txtRacha.textContent = rachaActual;

        elementoCard.classList.add('animacion-correcto');
        juegoFeedbackDiv.textContent = "🌟 ¡Excelente! ¡Lo lograste! 🎉";
        juegoFeedbackDiv.classList.add('text-green-500');

        const vozCorrecto = new SpeechSynthesisUtterance("¡Excelente! ¡Lo lograste!");
        window.speechSynthesis.speak(vozCorrecto);

        // Bloquear clics temporales mientras cambia de ronda
        juegoActivo = false;
        setTimeout(() => {
            juegoActivo = true;
            generarNuevaRonda();
        }, 2000);

    } else {
        // --- CASO INCORRECTO ---
        rachaActual = 0; // Romper racha de aciertos consecutivos
        txtRacha.textContent = rachaActual;

        elementoCard.classList.add('animacion-incorrecto');
        juegoFeedbackDiv.textContent = "💪 Inténtalo otra vez, ¡tú puedes!";
        juegoFeedbackDiv.classList.add('text-orange-500');

        const vozIncorrecto = new SpeechSynthesisUtterance("Inténtalo otra vez, ¡tú puedes!");
        window.speechSynthesis.speak(vozIncorrecto);

        // Remover animación de error tras su ejecución para permitir reintentar la misma ronda
        setTimeout(() => {
            elementoCard.classList.remove('animacion-incorrecto');
        }, 600);
    }
}