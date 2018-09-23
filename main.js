const tasksList = document.getElementById('tasks-list');
const form = document.getElementById('add-tasks-form');
const myModal = document.getElementById('myModal');
let dateNow = Date.now();

function renderTask (doc){
    let li = $('<li></li>').attr('data-id', doc.id);
    let nameTask = $('<span></span>').text(doc.data().name);
    let dateTask = $('<span></span>').text(doc.data().date)
    let descriptionTask = $('<span></span>').text(doc.data().description);
    let locationArray = [doc.data().location.latitude, doc.data().location.longitude];
    let locationTask = $('<span></span>').text(locationArray);
    let distanceTask = $('<span></span>').text(doc.data().distance);;
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
        var taskLocation = form.location.value;
        var numbers = taskLocation.match(/(\d+\.\d+)|(\d+)/g).map(Number);
        let lat = numbers[0];
        let long = numbers[1];
        let c = new firebase.firestore.GeoPoint(lat, long);
        // let num1 = numbers.concat(numbers)
        // console.log(num1)
        db.collection('tasks').add({
            name: form.name.value,
            date: form.date.value,
            description: form.description.value,
            location: c,
            distance : form.distance.value,
            done: false,
            tasks: 'all'
        });
        form.name.value = '';
        form.date.value = '';
        form.description.value = '';
        form.location.value = '';
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



function calculateDistance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
}
let distanceArray = [];
function distanceToTask(task, myPosition) {
    var a = calculateDistance(task.location._lat, task.location._long, myPosition[0].lat, myPosition[0].lng, 'K');
    distanceArray.push(a)
    return a
}
console.log(distanceArray);


    distanceArray.sort(function (a, b) {
        return (a - b);
    });

console.log(distanceArray);

// ************** get current location ***********

$("#selectTasks").on('change', function () {
    tasksList.textContent = ('');
    let selectVal = $(this).val();
    if(selectVal === "nearMe"){
        // let user_position = getCurrentPosition();
        var tasks = [];
        let distances = [];
    db.collection('tasks')
        .get()
        .then(function (elements) {
            let elementsDocs = elements.docs;
            elementsDocs.forEach(function (item) {

            tasks.push(item.data())
        });

            tasks.forEach(function (task) {

                task.distance_to_me = distanceToTask(task, currentPosition);
                // console.log(task.distance_to_me);

            });

    });


    function compareDistance (taskA, taskB){
        return taskA.distance_to_me - taskB.distance_to_me
    }
    

    tasks.sort(compareDistance);
    for (var i = 0; i < tasks.length; i++){
        alert(tasks[i].distance_to_me)
    }

    console.log(tasks);
        // tasks.sort((task, other_task) => task.distance_to_me - other_task.distance_to_me);
        // console.log(tasks)
    }
   else if (selectVal === "overDue"){
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
    $("#map").slideToggle();
    // initMap();
});



//******************** LOAD MAP *****************
// var map;
// function initMap() {
//     map = new google.maps.Map(document.getElementById('map'), {
//         center: {lat: 49.84, lng: 24.02},
//         zoom: 12
//     });
// };



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
// ******************   new map *************
function initMap() {
    myMap = new google.maps.Map(document.getElementById('map'), options);

    // *********** GETTING COORDS BY CLICK ON MAP *********

    google.maps.event.addListener(myMap, 'click', function(event) {
        console.log(event);
        var myLatLng = event.latLng;
        $('#add-tasks-form').find('input[name="location"]').val(myLatLng);
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

var currentPosition = [];

if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function (position) {
        let pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        currentPosition.push(pos);
        console.log(currentPosition);

    })}
    
    console.log(currentPosition);



// function calculateDistance() {
//    
// }

// var someArr = [];
// db.collection('tasks')
//     .get()
//     .then(function (elements) {
//         let elementsDocs = elements.docs;
//         elementsDocs.forEach(function (item) {
//         console.log(item.data());
//         someArr.push(item.data())
//     })
// console.log(someArr)
//     })

