// ==========================
// 📦 Variables Globales
// ==========================
let segments = [];
const STORAGE_KEY = 'ruletaPreguntasCustom';
let preguntaSeleccionada = null;

// ==========================
// 🔗 Elementos del DOM
// ==========================
const cardsContainer = document.getElementById("cardsContainer");
const banner = document.getElementById("banner");
const bannerPregunta = document.getElementById("bannerPregunta");
const bannerRespuesta = document.getElementById("bannerRespuesta");
const bannerAnswerButton = document.getElementById("bannerAnswerButton");
const closeBanner = document.getElementById("closeBanner");

const manageButton = document.getElementById('manageButton');
const manageModal = document.getElementById('manageModal');
const closeModalButton = document.getElementById('closeModalButton');
const addQuestionButton = document.getElementById('addQuestionButton');
const questionListElement = document.getElementById('questionList');
const resetUsedBtn = document.getElementById('resetUsedButton');
const editModal = document.getElementById('editModal');
const closeEditModalButton = document.getElementById('closeEditModalButton');
const saveEditButton = document.getElementById('saveEditButton');
const shareButton = document.getElementById('shareButton');
const shareLinkInput = document.getElementById('shareLinkInput');

// ==========================
// 🧪 Preguntas por defecto
// ==========================
const defaultSegments = [
  { number: "1", pregunta: "¿Ejemplo 1?", respuesta: "Respuesta 1", used: false },
  { number: "2", pregunta: "¿Ejemplo 2?", respuesta: "Respuesta 2", used: false },
  { number: "3", pregunta: "¿Ejemplo 3?", respuesta: "Respuesta 3", used: false },
];

// ==========================
// 🔔 Notificación visual
// ==========================
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  let icon = '✅';
  if (type === 'error') icon = '❌';
  else if (type === 'clipboard') icon = '📄';
  else if (type === 'delete') icon = '🗑️';
  else if (type === 'info') icon = 'ℹ️';
  notification.innerHTML = `${icon} ${message}`;
  notification.className = `notification show ${type}`;
  setTimeout(() => {
    notification.classList.remove('show');
    notification.classList.add('hidden');
  }, 2000);
}

// ==========================
// 💾 Cargar y guardar preguntas
// ==========================
function loadQuestions() {
  const stored = localStorage.getItem(STORAGE_KEY);
  try {
    segments = stored ? JSON.parse(stored) : [...defaultSegments];
  } catch {
    segments = [...defaultSegments];
  }
  segments.forEach(s => s.used = s.used || false);
  saveQuestions();
}

function saveQuestions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
}

// ==========================
// 🔢 Obtener preguntas disponibles
// ==========================
function getAvailableSegments() {
  return segments.filter(s => !s.used).sort((a, b) => parseInt(a.number) - parseInt(b.number));
}

// ==========================
// 🃏 Renderizar cartas
// ==========================
function renderCards() {
  cardsContainer.innerHTML = '';
  const disponibles = getAvailableSegments();
  if (!disponibles.length) {
    cardsContainer.innerHTML = '<p style="font-size:1.2em;">🎉 ¡Todas las preguntas han sido usadas!</p>';
    return;
  }
  disponibles.forEach(seg => {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = seg.number;
    card.title = 'Haz clic para ver la pregunta';
    card.onclick = () => handleCardClick(seg.number);
    cardsContainer.appendChild(card);
  });
}

// ==========================
// ❓ Al hacer clic en carta
// ==========================
function handleCardClick(number) {
  const seg = segments.find(s => s.number === number);
  if (!seg || seg.used) return;
  seg.used = true;
  preguntaSeleccionada = seg;
  bannerPregunta.textContent = seg.pregunta;
  bannerRespuesta.textContent = '';
  banner.classList.add('visible');
  saveQuestions();
  renderCards();
}

// ==========================
// Mostrar respuesta
// ==========================
function mostrarRespuesta() {
  if (preguntaSeleccionada) {
    bannerRespuesta.textContent = preguntaSeleccionada.respuesta;
  }
}

// ==========================
// ♻️ Reiniciar cartas usadas
// ==========================
function resetUsedStatus() {
  segments.forEach(s => s.used = false);
  saveQuestions();
  renderCards();
  showNotification("Cartas reiniciadas", "success");
}

// ==========================
// 🧾 Lista en modal
// ==========================
function renderQuestionList() {
  questionListElement.innerHTML = '';
  segments.forEach((seg, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <span class="q-label">P${seg.number}:</span> ${seg.pregunta}<br>
        <span class="a-label">R:</span> ${seg.respuesta}
      </div>
      <button class="edit-btn" data-index="${i}">Editar</button>
      <button class="delete-btn" data-number="${seg.number}">Eliminar</button>
    `;
    questionListElement.appendChild(li);
  });
}

// ==========================
// ➕ Añadir pregunta
// ==========================
function addQuestion() {
  const q = document.getElementById('newQuestion').value.trim();
  const a = document.getElementById('newAnswer').value.trim();
  if (!q || !a) {
    showNotification("Completa ambos campos", "error");
    return;
  }
  const newNum = (segments.reduce((max, s) => Math.max(max, parseInt(s.number)), 0) + 1).toString();
  segments.push({ number: newNum, pregunta: `${newNum}. ${q}`, respuesta: a, used: false });
  saveQuestions();
  renderCards();
  renderQuestionList();
  document.getElementById('newQuestion').value = '';
  document.getElementById('newAnswer').value = '';
  showNotification("Pregunta añadida", "success");
}

// ==========================
// 🗑️ Eliminar pregunta
// ==========================
function deleteQuestion(num) {
  if (!confirm(`¿Eliminar pregunta ${num}?`)) return;
  segments = segments.filter(s => s.number !== num);
  saveQuestions();
  renderCards();
  renderQuestionList();
  showNotification(`Pregunta ${num} eliminada`, "delete");
}

// ==========================
// ✏️ Editar pregunta
// ==========================
let editingIndex = null;
function editQuestion(index) {
  editingIndex = index;
  const seg = segments[index];
  document.getElementById('editQuestion').value = seg.pregunta.replace(/^\d+\.\s*/, '');
  document.getElementById('editAnswer').value = seg.respuesta;
  editModal.classList.add('visible');
}

function saveEdit() {
  if (editingIndex === null) return;
  const q = document.getElementById('editQuestion').value.trim();
  const a = document.getElementById('editAnswer').value.trim();
  if (!q || !a) return alert("Completa ambos campos");

  const num = segments[editingIndex].number;
  segments[editingIndex].pregunta = `${num}. ${q}`;
  segments[editingIndex].respuesta = a;

  saveQuestions();
  renderCards();
  renderQuestionList();
  editModal.classList.remove('visible');
  editingIndex = null;
}

// ==========================
// 🔗 Compartir con URL corta (is.gd)
// ==========================
async function shortenUrl(longUrl) {
  try {
    const response = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`);
    if (!response.ok) throw new Error(`Error en API: ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error("Error acortando URL:", error);
    throw error;
  }
}

shareButton.addEventListener('click', async () => {
  const ruletaData = {
    title: document.querySelector('.container h1').textContent,
    segments: segments
  };
  const encodedData = encodeURIComponent(JSON.stringify(ruletaData));
  const baseUrl = window.location.origin + window.location.pathname;
  const longUrl = `${baseUrl}?data=${encodedData}`;

  try {
    showNotification("Generando enlace corto...", "info");
    const shortUrl = await shortenUrl(longUrl);
    await navigator.clipboard.writeText(shortUrl);
    shareLinkInput.style.display = "block";
    shareLinkInput.value = shortUrl;
    showNotification("¡Enlace corto copiado al portapapeles!", "clipboard");
  } catch (err) {
    console.error("Error al generar enlace corto:", err);
    try {
      await navigator.clipboard.writeText(longUrl);
      shareLinkInput.style.display = "block";
      shareLinkInput.value = longUrl;
      showNotification("¡Enlace copiado! (Usamos URL larga)", "clipboard");
    } catch (copyError) {
      console.error("Error al copiar el enlace:", copyError);
      showNotification("Error al copiar el enlace", "error");
    }
  }
});

// ==========================
// 📥 Cargar desde URL
// ==========================
function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("data")) {
    try {
      const data = JSON.parse(decodeURIComponent(params.get("data")));
      if (data.title) {
        document.querySelector('.container h1').textContent = data.title;
        localStorage.setItem('ruletaTitle', data.title);
      }
      if (Array.isArray(data.segments)) {
        segments = data.segments.map(s => ({ ...s, used: false }));
        saveQuestions();
        renderCards();
        renderQuestionList();
      }
    } catch (e) {
      console.error("❌ Error cargando datos desde URL:", e);
      showNotification("Datos inválidos en la URL", "error");
    }
  }
}

// ==========================
// 🚀 Inicialización
// ==========================
window.addEventListener('DOMContentLoaded', () => {
  loadFromUrl();
  const storedTitle = localStorage.getItem('ruletaTitle');
  const titleDisplay = document.querySelector('.container h1');
  const titleInput = document.getElementById('newTitle');
  if (storedTitle) {
    titleDisplay.textContent = storedTitle;
    titleInput.value = storedTitle;
  } else {
    titleInput.value = titleDisplay.textContent;
  }
  document.getElementById('changeTitleButton').addEventListener('click', () => {
    const newTitle = titleInput.value.trim();
    if (newTitle) {
      titleDisplay.textContent = newTitle;
      localStorage.setItem('ruletaTitle', newTitle);
      showNotification("Título cambiado");
    } else {
      showNotification("Ingresa un título válido.", "error");
    }
  });
  loadQuestions();
  renderCards();
});

// ==========================
// Eventos generales
// ==========================
bannerAnswerButton.addEventListener("click", mostrarRespuesta);
closeBanner.addEventListener("click", () => banner.classList.remove("visible"));
manageButton.addEventListener('click', () => {
  renderQuestionList();
  manageModal.classList.add('visible');
});
closeModalButton.addEventListener('click', () => manageModal.classList.remove('visible'));
addQuestionButton.addEventListener('click', addQuestion);
resetUsedBtn.addEventListener('click', resetUsedStatus);
saveEditButton.addEventListener('click', saveEdit);

questionListElement.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    deleteQuestion(e.target.getAttribute('data-number'));
  } else if (e.target.classList.contains('edit-btn')) {
    editQuestion(e.target.getAttribute('data-index'));
  }
});
closeEditModalButton.addEventListener('click', () => {
  editModal.classList.remove('visible');
  editingIndex = null;
});
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) {
    editModal.classList.remove('visible');
    editingIndex = null;
  }
});
// ==========================