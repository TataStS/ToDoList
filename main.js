const tasksList = document.getElementById('tasks-list');
const form = document.getElementById('add-tasks-form');

//create element and render task

function renderTask(doc){
    let li = document.createElement('li');
    let name = document.createElement('span');
    let date = document.createElement('span');
    let description = document.createElement('span');
    let cross = document.createElement('button');
    let edit = document.createElement('button');


    li.setAttribute('data-id', doc.id);
    name.textContent = 'WHAT: ' + doc.data().name;
    date.textContent = 'WHEN: ' + doc.data().date;
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

    //deleting data

    cross.addEventListener('click',(e)=>{
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        db.collection('tasks').doc(id).delete();
    })
}

//getting data
// db.collection("tasks").orderBy('date').get().then((obj) => {
//     obj.docs.forEach(doc => {
//         renderTask(doc);
//     })
// })

// saving data
form.addEventListener('submit', (e) => {
    e.preventDefault();


    db.collection('tasks').add(
        {
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
        if(change.type == 'added'){
            renderTask(change.doc);
        } else if (change.type  == 'removed'){
            let li = tasksList.querySelector('[data-id=' + change.doc.id + ']');
            tasksList.removeChild(li);
        }
    })

});