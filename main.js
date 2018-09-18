const tasksList = document.getElementById('tasks-list');
const form = document.getElementById('add-tasks-form');
const myModal = document.getElementById('myModal');
let dateNow = Date.now();

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


    if(doc.data().done === true){
        $(li).css("background-color", "#50C878");
    }

    let timeFromFB = Math.round(new Date(doc.data().date).getTime());
    if (dateNow > +timeFromFB){
        $(li).css("background-color", "#DC3D2A");


        // initMap();

    }
}

// *************open edit modal window************************

$(window).click(function (event) {
    if (event.target === $('#myModal')){
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
            done: false,
            tasks: 'all'
        });
        form.name.value = '';
        form.date.value = '';
        form.description.value = '';
    });

// ****************************edit data and save a new one**********************
$('#tasks-list').on('click', '#edit', function () {

    let savedID = $(this).parent();
    let valueEditName = $(this).parent().children().first();
    let valueEditDate = $(this).parent().children().eq(1);
    let valueEditDescription = $(this).parent().children().eq(2);
    let valueEditLocation = $(this).parent().children().eq(3);
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

        $('#myModal').hide();

        valueEditName.text(editName.val());
        valueEditDate.text(editDate.val());
        valueEditDescription.text(editDescription.val());
        valueEditLocation.text(editLocation.val());
        let id = savedID.attr('data-id');
        db.collection('tasks').doc(id).update(
            {
                name: valueEditName.text(),
                date: valueEditDate.text(),
                description: valueEditDescription.text()
            }
        )
    });
});


//*****************************deleting data*******************

$('#tasks-list').on('click', '#del', function (event) {
    let li = $(event.target).parent();
    let id = $(event.target).parent().attr('data-id');
    $(li).remove();
    db.collection('tasks').doc(id).delete()

});




// ***********************                REAL-TIME SAVER               **************
db.collection('tasks').orderBy('name').onSnapshot(elements => {
    let changes = elements.docChanges();
    docsFromFirebase(changes);
});

function docsFromFirebase(elements){

    elements.forEach(element => {
        if (element.type === 'added') {
            renderTask(element.doc);}
    })
}

//*************** DONE TASKS *****************
$('#tasks-list').on('click', '#done', function (event) {
        let li = $(event.target).parent();
        let id = li.attr('data-id');
        let liId = $(event.target).parent().attr('data-id');
        $(li).css("background-color", "#50C878");
        db.collection('tasks').doc(id).update({
            done: true
        });
});


// **************  SELECTING TASKS *****************

$("#selectTasks").on('change', function () {
    tasksList.textContent = ('');
    let selectVal = $(this).val();
    if (selectVal === "overDue"){
        db.collection('tasks')
            .get()
            .then(elements => {
                let elementsDocs = elements.docs;
                let dateNow = Date.now();
                elementsDocs.filter(function (item) {
                    let itemDate = Math.round(new Date(item.data().date).getTime());
                    if(dateNow > itemDate){
                        // console.log(Math.round(new Date(item.data().date).getTime());
                        renderTask(item);
                    }
                })
                }
            )
    } else {
        db.collection('tasks')
            .orderBy(selectVal)
            .onSnapshot(elements => {
                let changes = elements.docChanges();
                docsFromFirebase(changes);
            })
    }
});

// ***************** SEARCH BY NAME *****************

$('.search').on('input', function () {
        $('#tasks-list').text('');
        let serchName = $(this).val();
        db.collection('tasks')
            .get()
            .then(elements => {
                let elementsDocs = elements.docs;
                console.log(elementsDocs);
                elementsDocs.filter(function (item) {
                    console.log(item);
                    if(serchName === item.data().name){
                        renderTask(item)
                    }
                })
            })
    // $('.search').val('');
});

//********************* SEARCH BY DATE ******************

$(".dateSearch").on('input', function () {
    $('#tasks-list').text('');
    let searchDate = $(this).val();
        db.collection('tasks')
            .get()
            .then(elements => {
                let elementsDocs = elements.docs;
                elementsDocs.filter(function (item) {
                    console.log(item);
                    if(searchDate == item.data().date){
                        renderTask(item)
                    }
                })
            })
});

$("#mapImage").click(function () {
    $("#map").slideDown();
    initMap();
});

$("#map").click(function () {
    $("#map").slideUp('fast');
});

//******************** LOAD MAP *****************
var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 49.85, lng: 24.01},
        zoom: 14
    });
};





