// USER MANAGEMENT MODULE
// Handles Create, Edit, List, and Delete operations

window.handleCreateUser = function (e) {
    e.preventDefault();
    const username = document.getElementById('newUsername').value.toLowerCase().trim();
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    let juzgado = document.getElementById('newJuzgado').value;
    const hasVacancia = document.getElementById('newVacancia').checked;

    // Check Mode
    const form = document.getElementById('userForm');
    const mode = form.dataset.mode || 'create';

    if (role === 'admin') juzgado = 'Todos';
    if (!username || !password) return;

    if (mode === 'edit') {
        // UPDATE LOGIC
        db.collection("users").doc(username).update({
            password,
            role,
            juzgado,
            hasVacancia,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert("✅ Usuario actualizado exitosamente");
            resetUserForm();
        }).catch((error) => {
            alert("Error actualizando usuario: " + error.message);
        });
    } else {
        // CREATE LOGIC
        db.collection("users").doc(username).set({
            username,
            password,
            role,
            juzgado,
            hasVacancia,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert("✅ Usuario creado exitosamente");
            resetUserForm();
        }).catch((error) => {
            alert("Error creando usuario: " + error.message);
        });
    }
}

function resetUserForm() {
    const form = document.getElementById('userForm');
    form.reset();
    form.dataset.mode = 'create';
    document.getElementById('newUsername').disabled = false;
    const btn = form.querySelector('button[type="submit"]');
    btn.innerText = "Crear Usuario";
    btn.classList.remove('btn-warning');
    btn.classList.remove('btn-danger'); // Remove custom red class
    btn.classList.add('btn-primary');
}

window.editUser = function (id) {
    console.log("Editing user:", id);
    db.collection("users").doc(id).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('newUsername').value = data.username;
            document.getElementById('newUsername').disabled = true; // LOCK ID
            document.getElementById('newPassword').value = data.password;
            document.getElementById('newRole').value = data.role;
            document.getElementById('newJuzgado').value = data.juzgado;
            document.getElementById('newVacancia').checked = data.hasVacancia || false;

            // UI Switch to Edit Mode
            const form = document.getElementById('userForm');
            form.dataset.mode = 'edit';
            const btn = form.querySelector('button[type="submit"]');
            btn.innerText = "EDITAR USUARIO"; // Texto en mayúsculas como énfasis
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-danger'); // Usar clase Roja Vistosa

            if (typeof toggleJuzgadoInput === 'function') {
                toggleJuzgadoInput();
            }
        }
    });
}

window.renderUserList = function () {
    db.collection("users").onSnapshot((snapshot) => {
        const tbody = document.getElementById('userListBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        snapshot.forEach((doc) => {
            const user = doc.data();
            tbody.innerHTML += `
            <tr>
                <td style="color:white;">${user.username}</td>
                <td style="color:white;">${user.role === 'admin' ? '<span class="badge badge-primary">Admin</span>' : 'Usuario'}</td>
                <td style="color:white;">${user.juzgado}</td>
                <td style="white-space: nowrap;">
                    <button class="btn-sm" onclick="editUser('${doc.id}')" title="Editar Usuario" 
                        style="width: 32px; height: 32px; padding: 0; border:none; border-radius:4px; cursor:pointer; background-color: #007bff; display: inline-flex; align-items: center; justify-content: center; margin-right: 5px;">
                        <i class="fas fa-edit" style="color: white; font-size: 14px;"></i>
                    </button>
                    <button class="btn-sm" onclick="deleteUser('${doc.id}')" title="Borrar Usuario"
                        style="width: 32px; height: 32px; padding: 0; border:none; border-radius:4px; cursor:pointer; background-color: #dc3545; display: inline-flex; align-items: center; justify-content: center;">
                        <i class="fas fa-trash" style="color: white; font-size: 14px;"></i>
                    </button>
                </td>
            </tr>
            `;
        });
    });
}

window.deleteUser = function (id) {
    if (confirm("¿Borrar usuario?")) {
        db.collection("users").doc(id).delete();
    }
}
