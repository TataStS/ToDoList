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

};
// modal window
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
            console.log(change);
            if (change.type == 'added') {
                renderTask(change.doc);
            } else if(change.type == 'modified'){
                console.log("Modified task:087 ", change.doc.data());
            } else if (change.type == 'removed') {
                let li = tasksList.querySelector('[data-id=' + change.doc.id + ']');
                tasksList.removeChild(li);
            }
        })
    })


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
                // e.preventDefault();
                console.log('hello')
                e.preventDefault();
                valueEditName.text(editName.val());
                console.log(valueEditName.text(editName.val()));
                valueEditDate.text(editDate.val());
                valueEditDescription.text(editDescription.val());
                valueEditLocation.text(editLocation.val());

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
//editing date
// $('#tasks-list').on('click', '#edit', function (event) {
//     // myModal.style.display = 'block';
//     $('#myModal').show();
//     // let id = e.target.parentElement.getAttribute('data-id');
//     let id = $(event.target).parent().attr('data-id');
//
//
//     console.log(id);
//     console.log($(event.target).parent().children(1).text());
//
//
//     let editName = document.getElementById('edit-text');// value from modal window for editing data
//     $('#edit-text').val()
//     let editDate = document.getElementById('edit-date');
//     let editDescription = document.getElementById('edit-description');
//     let editLocation = document.getElementById('edit-location');
//     editName.value = event.target.parentElement.children[0].innerText;
//
//     let time = event.target.parentElement.children[1].innerText;
//
//     editDate.value = time.replace("WHEN: ", "");
//     editDescription.value = event.target.parentElement.children[2].innerText;
//     editLocation.value = event.target.parentElement.children[3].innerText;
// });


//deleting data
$('#tasks-list').on('click', '#del', function (event) {
    let id = $(event.target).parent().attr('data-id');
    db.collection('tasks').doc(id).delete();
})

//send and save edit data
// $('#save').on('click', function (e) {
//     e.preventDefault();
//     console.log(e)

    // let id = $(event.target).parent().attr('data-id');
    // db.collection('tasks').doc(id).update(
    //         {
    //             name: editName.value,
    //             date: editDate.value,
    //             description: editDescription.value
    //         }
    //     )
// })

// function saveEditDate() {
//     $('#save').on('click', function () {
//         console.log('hello')
//     })
// }