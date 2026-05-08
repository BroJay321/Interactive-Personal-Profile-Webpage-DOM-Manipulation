// --- INITIAL DATA & STATE ---
const DEFAULTS = {
    name: "Fe Jay Pacay",
    bio: "Passionate developer and lifelong learner.",
    profilePic: "https://via.placeholder.com/150",
    skills: ["JavaScript", "HTML5", "CSS3"],
    hobbies: ["Photography", "Gaming", "Hiking"],
    education: [{ school: "Partido State University", course: "BS Information Technology", year: "2022-2026" }]
};

let state = JSON.parse(localStorage.getItem('profileData')) || { ...DEFAULTS };

const log = (msg) => console.log(`[Action]: ${msg}`);

const saveState = () => {
    localStorage.setItem('profileData', JSON.stringify(state));
};

function renderAll() {
    document.getElementById('userName').innerText = state.name;
    document.getElementById('userBio').innerText = state.bio;
    document.getElementById('profilePic').src = state.profilePic;
    
    renderList('skillList', state.skills);
    renderList('hobbyList', state.hobbies);
    renderEducation();
}

function renderList(elementId, items) {
    const list = document.getElementById(elementId);
    list.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerText = item;
        li.draggable = true;
        li.dataset.index = index;
        
        li.addEventListener('click', (e) => {
            if (!e.ctrlKey) {
                list.querySelectorAll('li').forEach(el => el.classList.remove('selected'));
            }
            li.classList.toggle('selected');
            log(`${elementId.replace('List', '')} selected: ${item}`);
        });

        li.addEventListener('dragstart', () => li.classList.add('dragging'));
        li.addEventListener('dragend', () => li.classList.remove('dragging'));

        list.appendChild(li);
    });
    setupDragAndDrop(list, items, elementId);
}

function renderEducation() {
    const container = document.getElementById('educationList');
    container.innerHTML = '';
    
    state.education.forEach((edu, index) => {
        const div = document.createElement('div');
        div.className = 'edu-item';
        div.innerHTML = `
            <div class="edu-row">
                <div class="editable-group">
                    <strong>${edu.school}</strong>
                    <button class="edit-btn" onclick="editEduField(${index}, 'school')"><i class="fas fa-pen"></i></button>
                </div>
                <div class="editable-group">
                    <span>${edu.course}</span>
                    <button class="edit-btn" onclick="editEduField(${index}, 'course')"><i class="fas fa-pen"></i></button>
                </div>
                <div class="editable-group">
                    <span>${edu.year}</span>
                    <button class="edit-btn" onclick="editEduField(${index}, 'year')"><i class="fas fa-pen"></i></button>
                </div>
                <button class="btn-sm btn-danger" onclick="deleteEdu(${index})"><i class="fas fa-trash"></i> Delete Record</button>
            </div>
        `;
        container.appendChild(div);
    });
}

window.editEduField = function(index, field) {
    const eduItems = document.querySelectorAll('.edu-item');
    const group = eduItems[index].querySelectorAll('.editable-group')[
        field === 'school' ? 0 : field === 'course' ? 1 : 2
    ];
    const displayEl = group.querySelector('strong, span');
    const editBtn = group.querySelector('.edit-btn');
    
    const currentVal = displayEl.innerText;

    const input = document.createElement('input');
    input.type = "text";
    input.value = currentVal;
    input.className = "inline-edit-input";

    displayEl.style.display = 'none';
    editBtn.style.display = 'none';
    group.prepend(input);
    input.focus();

    const save = () => {
        const newVal = input.value.trim() || currentVal;
        
        state.education[index][field] = newVal;
        saveState();
        
        renderEducation();
        log(`Education ${field} updated for record #${index + 1}`);
    };

    input.onblur = save;
    input.onkeydown = (e) => { if (e.key === 'Enter') save(); };
};

document.querySelector('.image-container').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            state.profilePic = event.target.result;
            document.getElementById('profilePic').src = state.profilePic;
            saveState();
            log("Profile picture updated");
        };
        reader.readAsDataURL(file);
    }
});

document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const el = document.getElementById(targetId);
        const currentVal = el.innerText;
        
        const input = document.createElement('input');
        input.value = currentVal;
        el.replaceWith(input);
        input.focus();

        const save = () => {
            const newVal = input.value || currentVal;
            const newEl = document.createElement(el.tagName.toLowerCase());
            newEl.id = targetId;
            newEl.innerText = newVal;
            input.replaceWith(newEl);
            
            state[targetId === 'userName' ? 'name' : 'bio'] = newVal;
            saveState();
            log(`${targetId} edited to: ${newVal}`);
        };

        input.onblur = save;
        input.onkeydown = (e) => { if (e.key === 'Enter') save(); };
    });
});

function setupAddAction(btnId, containerId, inputId, listKey, listId) {
    document.getElementById(btnId).addEventListener('click', () => {
        document.getElementById(containerId).classList.toggle('hidden');
        document.getElementById(inputId).focus();
    });

    document.getElementById(inputId).addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            state[listKey].push(e.target.value.trim());
            e.target.value = '';
            document.getElementById(containerId).classList.add('hidden');
            saveState();
            renderList(listId, state[listKey]);
            log(`${listKey} added: ${state[listKey].at(-1)}`);
        }
    });
}

setupAddAction('addSkillBtn', 'skillInputContainer', 'newSkillInput', 'skills', 'skillList');
setupAddAction('addHobbyBtn', 'hobbyInputContainer', 'newHobbyInput', 'hobbies', 'hobbyList');

function setupDelete(btnId, listId, listKey) {
    document.getElementById(btnId).addEventListener('click', () => {
        const selected = Array.from(document.querySelectorAll(`#${listId} .selected`));
        if (selected.length === 0) return;
        
        const valuesToRemove = selected.map(li => li.innerText);
        state[listKey] = state[listKey].filter(item => !valuesToRemove.includes(item));
        
        saveState();
        renderList(listId, state[listKey]);
        log(`${listKey} deleted: ${valuesToRemove.join(', ')}`);
    });
}

setupDelete('deleteSkillBtn', 'skillList', 'skills');
setupDelete('deleteHobbyBtn', 'hobbyList', 'hobbies');

function setupDragAndDrop(listElement, dataArray, listId) {
    listElement.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(listElement, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (afterElement == null) {
            listElement.appendChild(dragging);
        } else {
            listElement.insertBefore(dragging, afterElement);
        }
    });

    listElement.addEventListener('drop', () => {
        const newOrder = Array.from(listElement.querySelectorAll('li')).map(li => li.innerText);
        const key = listId === 'skillList' ? 'skills' : 'hobbies';
        state[key] = newOrder;
        saveState();
        log(`${key} reordered`);
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.getElementById('resetBtn').addEventListener('click', () => {
    if(confirm("Reset all data to defaults?")) {
        localStorage.clear();
        state = { ...DEFAULTS, education: [...DEFAULTS.education], skills: [...DEFAULTS.skills], hobbies: [...DEFAULTS.hobbies] };
        renderAll();
        log("Data reset to defaults");
    }
});

window.deleteEdu = (index) => {
    state.education.splice(index, 1);
    saveState();
    renderEducation();
    log("Education record deleted");
};

document.getElementById('addEduBtn').addEventListener('click', () => {
    const school = prompt("School Name:");
    if (!school) return;
    state.education.push({ school, course: "New Course", year: "Year" });
    saveState();
    renderEducation();
    log("Education added");
});

renderAll();