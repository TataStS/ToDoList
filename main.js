const tasksList = document.getElementById('tasks-list');
const form = document.getElementById('add-tasks-form');
const myModal = document.getElementById('myModal');


function renderTask(doc) {

    let li = document.createElement('li');
    let name = document.createElement('span');
    let date = document.createElement('span');
    let description = document.createElement('span');
    let cross = document.createElement('button');
    let edit = document.createElement('button');
    li.setAttribute('data-id', doc.id);
    name.textContent = 'WHAT: ' + doc.data().name;
    let docDate = doc.data().date;
    date.textContent = 'WHEN: ' + docDate;
    description.textContent = 'ABOUT: ' + doc.data().description;
    cross.textContent = 'DELETE';
    edit.textContent = 'EDIT';
    edit.setAttribute('id', 'edit');
    cross.setAttribute('id', 'del');

    li.appendChild(name);
    li.appendChild(date);
    li.appendChild(description);
    li.appendChild(edit);
    li.appendChild(cross);

    tasksList.appendChild(li);

    edit.onclick = function (e) {

        myModal.style.display = 'block';
        let id = e.target.parentElement.getAttribute('data-id');

        let saveBtn = document.getElementById('save');
        let editName = document.getElementById('edit-text');
        let editDate = document.getElementById('edit-date');

        let editDescription = document.getElementById('edit-description');
        let editLocation = document.getElementById('edit-location');

        editName.value = e.target.parentElement.children[0].innerText;
        let time = e.target.parentElement.children[1].innerText;


        editDate.value = time.replace("WHEN: ", "");
        editDescription.value = e.target.parentElement.children[2].innerText;
        editLocation.value = e.target.parentElement.children[3].innerText;
        
        
        // saving edit data

        saveBtn.onclick = function (e) {
            e.preventDefault();
            console.log(editName.value);
            // name = editName.value;
            // name.textContent = 'WHAT: ' + editName.value;

            console.log(id);
            db.collection('tasks').doc(id).update(
                {
                    name: editName.value,
                    date: editDate.value,
                    description: editDescription.value
                }
            )

        }
    };

    //deleting data

    cross.addEventListener('click', (e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        db.collection('tasks').doc(id).delete();
    });

    // editing data/
    //
    // const editBtn = document.getElementById('edit');
    // editBtn.addEventListener('click', (e) => {
    //     myModal.style.display = 'block';
    //
    //     let editName = document.getElementById('edit-text');
    //     let editDate = document.getElementById('edit-date');
    //     let editDescription = document.getElementById('edit-description');
    //     let editLocation = document.getElementById('edit-location');
    // });
}

window.onclick = function (event) {
    if (event.target == myModal) {
        myModal.style.display = 'none';
    }
};

// saving data
form.addEventListener('submit', (e) => {
    e.preventDefault();

    db.collection('tasks').add({
        name: form.name.value,
        date: form.date.value,
        description: form.description.value
    });
    form.name.value = '';
    form.date.value = '';
    form.description.value = '';
});

// real-time saver

db.collection('tasks').orderBy('date').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if (change.type == 'added') {
            renderTask(change.doc);
        } else if(change.type == 'modified'){
            renderTask(change.doc);
        } else if (change.type == 'removed') {
            let li = tasksList.querySelector('[data-id=' + change.doc.id + ']');
            tasksList.removeChild(li);
        }
    })

});

// saveBtn.addEventListener('click', function () {
//     console.log('hello')
// })
