
const taskManager = new TaskManager();
console.log(taskManager.tasks);

document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(".form-check-input");

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const card = event.target.closest(".card");
      if (!card) return;

      if (event.target.checked) {

        card.style.borderColor = "#c084fc";
        card.style.opacity = "0.8";
      } else {
        
        card.style.borderColor = "#581c87";
        card.style.opacity = "1";
      }
    });
  });
});