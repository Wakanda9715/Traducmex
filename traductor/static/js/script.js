// static/js/script.js

document.addEventListener("DOMContentLoaded", (event) => {

    // --- Lógica principal del formulario de traducción/búsqueda (SOLO BD) ---
    let mainTranslationForm = document.getElementById("mainTranslationForm");
    mainTranslationForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evita el envío del formulario tradicional

        let sourceText = document.querySelector("#sourceText");
        let valor_sourceText_original = sourceText.value.trim(); // Obtén el valor original
        if (valor_sourceText_original === "") {
            customAlert("Por favor, ingrese una palabra a buscar.", 0);
            sourceText.focus();
            return;
        }

        // ¡CONVIERTE A MINÚSCULAS ANTES DE USARLO EN LA CONSULTA!
        let valor_sourceText_minusculas = valor_sourceText_original.toLowerCase();

        let lenguajeDestino = document.querySelector("#lenguajeDestino");
        let valor_lenguajeDestino = lenguajeDestino.value;

        // Verificar que se haya seleccionado un país de destino
        if (!valor_lenguajeDestino) {
            customAlert("Por favor, seleccione un país de destino.", 0);
            return;
        }

        // URL para la búsqueda en la Base de Datos
        // Usa valor_sourceText_minusculas aquí
        const url = `/tradumex/buscar-traduccion-bd/?palabra_original=${encodeURIComponent(valor_sourceText_minusculas)}&pais_destino=${encodeURIComponent(valor_lenguajeDestino)}`;

        const resultTranslatedText = document.getElementById('resultTranslatedText');
        resultTranslatedText.value = ''; // Limpiar el resultado anterior
        resultTranslatedText.style.color = 'black'; // Restablecer color por defecto

        try {
            const response = await axios.get(url);

            const { data, status } = response;
            if (status === 200) {
                if (data.traduccion) {
                    resultTranslatedText.value = data.traduccion;
                } else {
                    resultTranslatedText.value = "No se encontró traducción para esa palabra y país.";
                    resultTranslatedText.style.color = 'orange';
                }
            } else {
                resultTranslatedText.value = "Error al obtener la traducción.";
                resultTranslatedText.style.color = 'red';
            }
        } catch (error) {
            console.error("Error al buscar en BD:", error);
            let errorMessage = 'Error al conectar con el servidor.';
            if (error.response) {
                if (error.response.data && error.response.data.error) {
                    errorMessage = `Error del servidor: ${error.response.data.error}`;
                } else {
                    errorMessage = `Error HTTP ${error.response.status}: ${error.response.statusText}`;
                }
            } else if (error.request) {
                errorMessage = "No se pudo conectar con el servidor. Verifique su conexión o que el servidor esté funcionando.";
            } else {
                errorMessage = `Error inesperado: ${error.message}`;
            }
            customAlert(errorMessage, 0);
            resultTranslatedText.value = errorMessage;
            resultTranslatedText.style.color = 'red';
        }
    });

    // --- Lógica del botón de micrófono (RECONOCIMIENTO DE VOZ) ---
    const sourceTextarea = document.getElementById("sourceText");
    const microphoneButton = document.querySelector(".microphone-icon");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'es-MX';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log('Reconocimiento de voz iniciado. Habla ahora...');
            microphoneButton.querySelector('i').classList.remove('bi-mic');
            microphoneButton.querySelector('i').classList.add('bi-mic-fill');
            microphoneButton.classList.add('recording');
        };

        recognition.onresult = (event) => {
            let transcript = event.results[0][0].transcript;

            // Paso 1: Eliminar el punto final si existe
            // La expresión regular /\.+$`/ busca uno o más puntos (escapado con \) al final de la cadena ($)
            transcript = transcript.replace(/\. +$/, ''); // Elimina punto(s) seguido de espacio(s) al final
            transcript = transcript.replace(/\.$/, '');   // Elimina punto(s) directamente al final si no hay espacios

            // Paso 2: Convertir a minúsculas
            sourceTextarea.value = transcript.toLowerCase();

            console.log('Texto reconocido (sin punto y minúsculas):', sourceTextarea.value);
            // Si la búsqueda se activa automáticamente después del dictado, deberías llamar a mainTranslationForm.submit() aquí
            // mainTranslationForm.submit(); // Considera si quieres que traduzca automáticamente al dictar
        };

        recognition.onend = () => {
            console.log('Reconocimiento de voz terminado.');
            microphoneButton.querySelector('i').classList.remove('bi-mic-fill');
            microphoneButton.querySelector('i').classList.add('bi-mic');
            microphoneButton.classList.remove('recording');
        };

        recognition.onerror = (event) => {
            console.error('Error de reconocimiento de voz:', event.error);
            customAlert(`Error al reconocer voz: ${event.error}`, 0);
            microphoneButton.querySelector('i').classList.remove('bi-mic-fill');
            microphoneButton.querySelector('i').classList.add('bi-mic');
            microphoneButton.classList.remove('recording');
        };

        microphoneButton.addEventListener("click", () => {
            try {
                recognition.start();
            } catch (error) {
                console.error('No se pudo iniciar el reconocimiento de voz:', error);
                customAlert("No se pudo iniciar la grabación de voz. Inténtelo de nuevo.", 0);
            }
        });

    } else {
        console.warn('El reconocimiento de voz no es compatible con este navegador.');
        if (microphoneButton) {
            microphoneButton.style.display = 'none';
        }
        customAlert("Tu navegador no soporta el reconocimiento de voz.", 0);
    }
    // --- FIN Lógica del botón de micrófono ---


    // --- Lógica para el botón de copiar ---
    const copyButton = document.querySelector(".copy-icon");
    const resultTranslatedTextarea = document.getElementById("resultTranslatedText");

    if (copyButton && resultTranslatedTextarea) {
        copyButton.addEventListener("click", async () => {
            const textToCopy = resultTranslatedTextarea.value;

            if (textToCopy.trim() === "") {
                customAlert("No hay texto para copiar.", 0);
                return;
            }

            try {
                await navigator.clipboard.writeText(textToCopy);
                customAlert("¡Texto copiado al portapapeles!", 1);

                const copyIcon = copyButton.querySelector('i');
                if (copyIcon) {
                    copyIcon.classList.remove('bi-copy');
                    copyIcon.classList.add('bi-check-lg');
                    setTimeout(() => {
                        copyIcon.classList.remove('bi-check-lg');
                        copyIcon.classList.add('bi-copy');
                    }, 1500);
                }

            } catch (err) {
                console.error('Error al copiar el texto: ', err);
                try {
                    resultTranslatedTextarea.select();
                    document.execCommand('copy');
                    customAlert("¡Texto copiado al portapapeles! (Método alternativo)", 1);
                } catch (fallbackErr) {
                    console.error('Fallback de copiado también falló: ', fallbackErr);
                    customAlert("No se pudo copiar el texto automáticamente. Por favor, cópielo manualmente.", 0);
                }
            }
        });
    }
    // --- FIN Lógica para el botón de copiar ---


    // --- Funciones Auxiliares ---

    /**
     * Verificar si el textarea no esta vacio, caso contario limpiar el textarea resultado de la traduccion
     */
    let textarea = document.querySelector("#sourceText");
    textarea.addEventListener("blur", function (event) {
        if (textarea.value.trim() === "") {
            document.querySelector("#resultTranslatedText").value = "";
        }
    });

    function customAlert(msj, tipo_msj) {
        const divExistente = document.querySelector(".alert");
        if (divExistente) {
            divExistente.remove();
        }

        const divRespuesta = document.createElement("div");
        divRespuesta.innerHTML = `
            <div class="alert ${
                tipo_msj == 1 ? "alert-success" : "alert-warning"
            }  alert-dismissible text-center" role="alert" style="font-size: 17px;">
                ${msj}
            </div>
        `;

        const container = document.querySelector(".first_row");
        if (container) {
            container.insertAdjacentElement("beforeend", divRespuesta);
        } else {
            document.body.insertAdjacentElement("afterbegin", divRespuesta);
        }

        setTimeout(function () {
            if (divRespuesta.parentNode) {
                divRespuesta.remove();
            }
        }, 5000);
    }
});