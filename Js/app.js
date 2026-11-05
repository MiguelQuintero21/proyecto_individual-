document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const alertContainer = document.getElementById('alertContainer');
    const taskTableBody = document.getElementById('taskTableBody');

    function validFormFieldInput(data) {
        const { name, description, dueDate, status } = data;
        let errors = [];

        if (!name || name.trim() === '') {
            errors.push('El campo "Nombre" no puede estar vacío.');
        }
        if (!description || description.trim() === '') {
            errors.push('El campo "Descripción" no puede estar vacío.');
        }
        if (!dueDate) {
            errors.push('Debe seleccionar una "Fecha de entrega".');
        }
        if (!status || status === '') {
            errors.push('Debe seleccionar un "Estado".');
        }

        return errors;
    }

    function updateProgress() {
        const rows = taskTableBody.querySelectorAll('tr');
        const total = rows.length;
        const checked = taskTableBody.querySelectorAll('.task-checkbox:checked').length;
        const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
        
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const msg = document.getElementById('completedMessage');

        if (progressBar) progressBar.style.width = percent + '%';
        if (progressText) progressText.textContent = percent + '%';
        
        if (msg) {
            if (total === 0) {
                msg.textContent = 'Sin tareas registradas';
            } else if (checked === 0) {
                msg.textContent = 'Sin tareas completadas';
            } else {
                msg.textContent = `${checked} de ${total} tareas completadas`;
            }
        }
    }

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('newTaskNameInput').value;
            const description = document.getElementById('newTaskDescriptionInput').value;
            const dueDate = document.getElementById('newTaskDateInput').value;
            const status = document.getElementById('newTaskStatusInput').value;

            const formData = { name, description, dueDate, status };

            const validationErrors = validFormFieldInput(formData);

            if (validationErrors.length > 0) {


                alertContainer.innerHTML = `
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>¡Atención! Se encontraron errores:</strong>
                        <ul class="mb-0 mt-1">
                            ${validationErrors.map(err => `<li>${err}</li>`).join('')}
                        </ul>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                alertContainer.style.display = 'block';
            } else {

                
                alertContainer.innerHTML = '';
                alertContainer.style.display = 'none';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input class="form-check-input task-checkbox" type="checkbox"></td>
                    <td class="fw-bold task-title">${name}</td>
                    <td class="text-muted small">${description}</td>
                    <td class="small">${dueDate}</td>
                    <td class="text-center"><button class="btn btn-sm btn-outline-danger btn-delete">❌</button></td>
                `;
                taskTableBody.appendChild(tr);

                taskForm.reset();
                updateProgress();
            }
        });
    }

    if (taskTableBody) {
        taskTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                e.target.closest('tr').remove();
                updateProgress();
            }
        });

        taskTableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const titleEl = e.target.closest('tr').querySelector('.task-title');
                if (e.target.checked) {
                    titleEl.classList.add('text-decoration-line-through', 'text-muted');
                } else {
                    titleEl.classList.remove('text-decoration-line-through', 'text-muted');
                }
                updateProgress();
            }
        });
    }

    updateProgress();
});