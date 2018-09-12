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
    name.textContent = doc.data().name;
    date.textContent = doc.data().date;
    description.textContent = doc.data().description;
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
    addListenerToEditTask ();
    addEventListenerToDeleteTask();
};

function renderTask2 (doc){
    let li = $('<li></li>').attr('data-id', doc.id);
    let name = $('<span></span>').text(doc.data().name);
    let date = $('<span></span>').text(doc.data().date)
    let description = $('<span></span>').text(doc.data().description);
    let location = $('<span></span>').text(doc.data().location);
    let cross = $('<button></button>').text('delete').attr('id', 'del');
    let edit = $('<button></button>').text('edit').attr('id', 'edit');
    let done = $('<button></button>').text('done').attr('id', 'done')
    li.append(name, date, date, description, location, cross, edit, done);
    $('#tasks-list').append(li);
    addListenerToEditTask ();
    addEventListenerToDeleteTask();
}

// *************open edit modal window************************

$(window).click(function (event) {
    if (event.target == $('#myModal')){
        $('#myModal').hide();
    }
});

// ********************saving data***********************
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

// ****************************edit data and save a new one**********************
function addListenerToEditTask () {
        $('#tasks-list').on('click', '#edit', function () {

            let savedID = $(this).parent();
            let valueEditName = $(this).parent().children().first();
            let valueEditDate = $(this).parent().children().eq(1);
            let valueEditDescription = $(this).parent().children().eq(2);
            let valueEditLocation = $(this).parent().children().eq(3);
            console.log(valueEditDate,valueEditDescription,valueEditLocation)
            $('#myModal').show();
            let editName = $('#edit-text');
            let editDate = $('#edit-date');
            let editDescription = $('#edit-description');
            let editLocation = $('#edit-location');

            editName.val(valueEditName.text());
            editDate.val(valueEditDate.text());
            editDescription.val(valueEditDescription.text());
            editLocation.val(valueEditLocation.text());

            $('#save').unbind('click');
            $('#save').click(function (e) {
                e.preventDefault();
                console.log('hello')
                // e.preventDefault();
                $('#myModal').hide();
                valueEditName.text(editName.val());
                console.log(valueEditName.text(editName.val()));
                valueEditDate.text(editDate.val());
                valueEditDescription.text(editDescription.val());
                valueEditLocation.text(editLocation.val());
                $('#myModal').hide();
                let id = savedID.attr('data-id');
                console.log(id);
                db.collection('tasks').doc(id).update(
                    {
                        name: valueEditName.text(),
                        date: valueEditDate.text(),
                        description: valueEditDescription.text()
                    }
                )
            })
        })
}

//*****************************deleting data*******************
function addEventListenerToDeleteTask() {
    $('#tasks-list').on('click', '#del', function (event) {
        let id = $(event.target).parent().attr('data-id');
        db.collection('tasks').doc(id).delete();
    })
}

// ***********************real-time saver**************
db.collection('tasks').orderBy('date').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        console.log(change);
        if (change.type == 'added') {
            renderTask2(change.doc);
        } else if (change.type == 'removed') {
            let li = tasksList.querySelector('[data-id=' + change.doc.id + ']');
            tasksList.removeChild(li);
        }
    })
})