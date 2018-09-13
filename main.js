const tasksList = document.getElementById('tasks-list');
const form = document.getElementById('add-tasks-form');
const myModal = document.getElementById('myModal');

function renderTask (doc){
    let li = $('<li></li>').attr('data-id', doc.id);
    let nameTask = $('<span></span>').text(doc.data().name);
    let dateTask = $('<span></span>').text(doc.data().date)
    let descriptionTask = $('<span></span>').text(doc.data().description);
    let locationTask = $('<span></span>').text(doc.data().location);
    let deleteButton = $('<button></button>').text('delete').attr('id', 'del');
    let editButton = $('<button></button>').text('edit').attr('id', 'edit');
    let doneButton = $('<button></button>').text('done').attr('id', 'done')
    li.append(nameTask, dateTask, descriptionTask, locationTask, deleteButton, editButton, doneButton);
    $('#tasks-list').append(li);

    addListenerToEditTask ();
    addEventListenerToDeleteTask();

        if(doc.data().done === true){
            $('li').css("background-color", "#50C878");
        }
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
            description: form.description.value,
            done: false
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
    docsFromFirebase(changes);
})

function docsFromFirebase(snapshots) {
    snapshots.forEach(snapshot => {
        console.log(snapshot);
        if (snapshot.type === 'added') {
            renderTask(snapshot.doc);
        } else if (snapshot.type === 'removed') {
            let li = tasksList.querySelector('[data-id=' + snapshot.doc.id + ']');
            tasksList.removeChild(li);
        }
    })
}

 $('#tasks-list').on('click', '#done', function (event) {
     let li = $(event.target).parent();
     let id = li.attr('data-id');
     li.css("background-color", "#50C878");
     db.collection('tasks').doc(id).update({
         done: true
     })
 })


