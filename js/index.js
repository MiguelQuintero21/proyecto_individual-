// js/index.js

// PARTE 1: Instancia de TaskManager y verificación en consola
const taskManager = new TaskManager();
console.log(taskManager.tasks);

// PARTE 2: Interacción para marcar y desmarcar una tarea como completada sin recargar
document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(".form-check-input");

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const card = event.target.closest(".card");
      if (!card) return;

      if (event.target.checked) {
        // Cambio visual de tarea completada (borde brillante y opacidad)
        card.style.borderColor = "#c084fc";
        card.style.opacity = "0.8";
      } else {
        // Restaurar estado pendiente
        card.style.borderColor = "#581c87";
        card.style.opacity = "1";
      }
    });
  });
});