const tasksList = document.getElementById('tasks-list');
const myModal = document.getElementById('myModal');
let dateNow = Date.now();
const addTaskBtn = $('#addTask');
const form = $('#add-tasks-form');

//************************* CREATING NEW TASKS ************
function renderTask(doc) {
    let li = $('<li></li>').attr('data-id', doc.id);
    let nameTask = $('<span></span>').text(doc.data().name);
    let dateTask = $('<span></span>').text(doc.data().date);
    let descriptionTask = $('<span></span>').text(doc.data().description);
    let locationArray = [doc.data().location.latitude, doc.data().location.longitude];
    let locationTask = $('<span></span>').text(locationArray);
    let deleteButton = $('<button></button>').text('delete').attr('id', 'del');
    let editButton = $('<button></button>').text('edit').attr('id', 'edit');
    let doneButton = $('<button></button>').text('done').attr('id', 'done');
    let unDoneButton = $('<button></button>').text('unDone').attr('id', 'unDone');
    li.append(nameTask, dateTask, descriptionTask, locationTask, deleteButton, editButton, doneButton, unDoneButton);
    $('#tasks-list').append(li);

    if (doc.data().done === true) {
        $(li).css("background-color", "#50C878");
    } else {
        $(li).css("background-color", "#f6f6f6");
    }

    let timeFromFB = Math.round(new Date(doc.data().date).getTime());
    if (dateNow > +timeFromFB) {
        $(li).css("background-color", "#DC3D2A");
    }
}

function renderTask2(doc) {
    let li = $('<li></li>').attr('data-id', doc.id);
    let nameTask = $('<span></span>').text(doc.name);
    let dateTask = $('<span></span>').text(doc.date)
    let descriptionTask = $('<span></span>').text(doc.description);
    let locationArray = [doc.location.latitude, doc.location.longitude];
    let locationTask = $('<span></span>').text(locationArray);
    let distanceTask = $('<span></span>').text(doc.distance);
    ;
    let deleteButton = $('<button></button>').text('delete').attr('id', 'del');
    let editButton = $('<button></button>').text('edit').attr('id', 'edit');
    let doneButton = $('<button></button>').text('done').attr('id', 'done');
    li.append(nameTask, dateTask, descriptionTask, locationTask, deleteButton, editButton, doneButton);
    $('#tasks-list').append(li);
    if (doc.done === true) {
        $(li).css("background-color", "#50C878");
    }

    let timeFromFB = Math.round(new Date(doc.date).getTime());
    if (dateNow > +timeFromFB) {
        $(li).css("background-color", "#DC3D2A");
    }
}

// *************open edit modal window************************

window.onclick = function (event) {
    if (event.target === myModal) {
        myModal.style.display = 'none';
    }
};

// ********************saving data***********************
$(addTaskBtn).on('click', function (e) {

    let taskName = $(form).find('input[name="name"]');
    let taskDate = $(form).find('input[name="date"]');
    let taskDescription = $(form).find('textarea[name="description"]');
    let taskLocation = $(form).find('input[name="location"]');
    let taskLocationValue = taskLocation.val();
    let numbers = taskLocationValue.match(/(\d+\.\d+)|(\d+)/g).map(Number);
    let lat = numbers[0];
    let long = numbers[1];
    let c = new firebase.firestore.GeoPoint(lat, long);

    db.collection('tasks').add({
        name: taskName.val(),
        date: taskDate.val(),
        description: taskDescription.val(),
        location: c,
        done: false,
        tasks: 'all'
    });
    taskName.val('');
    taskDate.val('');
    taskDescription.val('');
    taskLocation.val('');

});

// ****************************edit data and save a new one**********************

$('#tasks-list').on('click', '#edit', function () {

    let savedID = $(this).parent();
    let li = $(this).parent();
    let valueEditName = $(this).parent().children().first();
    let valueEditDate = $(this).parent().children().eq(1);
    let valueEditDescription = $(this).parent().children().eq(2);
    let valueEditLocation = $(this).parent().children().eq(3);
    let c = valueEditLocation.text();
    console.log(c);

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
        let q = editLocation.val();
        valueEditLocation.text(q);
        console.log(q);
        var numbers = q.match(/(\d+\.\d+)|(\d+)/g).map(Number);
        console.log(numbers);
        let lat = numbers[0];
        let long = numbers[1];
        let w = new firebase.firestore.GeoPoint(lat, long);
        let id = savedID.attr('data-id');

        db.collection('tasks').doc(id).update(
            {
                name: valueEditName.text(),
                date: valueEditDate.text(),
                description: valueEditDescription.text(),
                location: w
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

function docsFromFirebase(elements) {

    elements.forEach(element => {
        if (element.type === 'added') {
            renderTask(element.doc);
        }
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

//********* UNDONE TASK *************

$('#tasks-list').on('click', '#unDone', function (event) {
    let li = $(event.target).parent();
    let id = li.attr('data-id');
    let liId = $(event.target).parent().attr('data-id');
    $(li).css("background-color", "#f6f6f6");
    db.collection('tasks').doc(id).update({
        done: false
    });
});

// **************  SELECTING TASKS *****************

function calculateDistance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    // if (unit=="K") { dist = dist * 1.609344 }
    if (unit === "N") {
        dist = dist * 0.8684
    }
    return dist
}

function distanceToTask(task, myPosition) {
    var a = calculateDistance(task.location._lat, task.location._long, myPosition[0].lat, myPosition[0].lng, 'K');

    return a
}


$('#selectTasks').on('change', function () {
    tasksList.textContent = ('');
    let selectVal = $(this).val();
    if (selectVal === 'nearMe') {
        var tasks = [];
        // let distances = [];
        db.collection('tasks')
            .get()
            .then(function (elements) {
                let elementsDocs = elements.docs;
                elementsDocs.forEach(function (item) {
                    let task = item.data();
                    task.id = item.id;
                    tasks.push(task);
                });
                tasks.forEach(function (task) {

                    task.distance_to_me = distanceToTask(task, currentPosition);

                });

                tasks.sort(function (a, b) {
                    return (a.distance_to_me - b.distance_to_me)
                });
                console.log(tasks);
                // docsFromFirebase(tasks)
                tasks.forEach(function (task) {
                    console.log(task);
                    renderTask2(task)
                })

            });

        function compareDistance(tasks) {
            tasks.sort(function (taskA, taskB) {
                return taskA.distance_to_me - taskB.distance_to_me;
                console.log(tasks);
            })
        };

        compareDistance(tasks);

        console.log(tasks);

    } else if (selectVal === 'overDue') {
        db.collection('tasks')
            .get()
            .then(elements => {
                let elementsDocs = elements.docs;
                let dateNow = Date.now();
                elementsDocs.filter(item => {
                    let itemDate = Math.round(new Date(item.data().date).getTime());
                    if (dateNow > itemDate) {
                        renderTask(item)
                    }
                })
            })
            .catch(reason => {
                console.log(reason)
            })
    } else {
        db.collection('tasks')
            .orderBy(selectVal)
            .get()
            .then(elements => {
                let elementsDocs = elements.docs;
                elementsDocs.forEach(element => {
                    renderTask(element)
                })
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
                if (serchName === item.data().name) {
                    renderTask(item);
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
                if (searchDate == item.data().date) {
                    renderTask(item)
                }
            })
        })
});

$("#mapImage").click(function () {
    $("#map").slideToggle();
});

var options = {
    center: {lat: 49.84, lng: 24.02},
    zoom: 12
};
var markerOptions = {
    position: {lat: 49.79, lng: 24.06},
    map: myMap
};
var myMap;
var marker;

// ******************   ADDING GOOGLE MAP *************
function initMap() {
    myMap = new google.maps.Map(document.getElementById('map'), options);

    // *********** GETTING COORDS BY CLICK ON MAP *********

    google.maps.event.addListener(myMap, 'click', function (event) {
        console.log(event);
        var myLatLng = event.latLng;
        $(form).find('input[name="location"]').val(myLatLng);
        // **************** add marker *****************
        if (marker && marker.setMap) {
            marker.setMap(null);
        }
        marker = new google.maps.Marker({
            position: event.latLng,
            map: myMap
        })

    });
};

// ************** get current location ***********
var currentPosition = [];

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        let pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        currentPosition.push(pos);
        console.log(currentPosition);

    })
}
;

$('.search').dblclick(function () {
    $('.search').val('');
});