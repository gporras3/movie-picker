var numUsersPrev = 0;
var totalUsers = 0;
// var total = 0;
var totalGroups = -1;
// localStorage.setItem('groupId', 0);
// var currGroup = 0;

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

/**
 * Redirects page to given url when called
 * @param {String} url 
 */
function redirect (url) {
    location.href = url;
}

/**
 * Retrieves value from local storage corresponding to key
 * @param {String} key 
 * @returns value
 */
function ls_get (key) {
    var currGroup = localStorage.getItem('groupId');
    return localStorage.getItem(currGroup + key);
}

/**
 * Sets key-value pair in local storage
 * @param {String} key 
 * @param {*} value 
 */
function ls_set (key, value) {
    var currGroup = localStorage.getItem('groupId');
    localStorage.setItem(currGroup + key, value);
}

function ls_rem (key) {
    var currGroup = localStorage.getItem('groupId');
    localStorage.removeItem(currGroup + key);
}

//////////////////////////////
// GROUP CREATION FUNCTIONS //
//////////////////////////////

/**
 * Decreases the number of users (name boxes) that appear on screen
 */
function decreaseUsers () {
    if (totalUsers > 0) {
        totalUsers--;
        document.getElementById('numUsers').value = totalUsers;
        createNameBoxes();
    }
}

/**
 * Increases the number of users (name boxes) that appear on screen
 */
function increaseUsers () {
    totalUsers++;
    document.getElementById('numUsers').value = totalUsers;
    createNameBoxes();
}

/**
 * Based on group size specified, adds or removes input elements for everyone's name
 */
function createNameBoxes () {
    var toAdd = 0;
    var toRemove = 0;

    var numUsers = parseInt(document.getElementById('numUsers').value);

    if (isNaN(numUsers) || numUsers < 0) {
        numUsers = 0;
    }

    totalUsers = numUsers;

    if (numUsersPrev < numUsers) {            // need to add
        toAdd = numUsers - numUsersPrev;
    }
    else if (numUsersPrev > numUsers) {       // need to remove
        toRemove = numUsersPrev - numUsers;
    }

    // add elems
    for (let i=0; i<toAdd; i++) {
        const newInput = document.createElement('input');
        newInput.id = "name" + (numUsersPrev + i);
  
        const currentDiv = document.getElementById('flex');
        document.body.insertBefore(newInput, currentDiv);
    }

    // remove elems
    if (toRemove > 0) {
        for (let i=0; i<toRemove; i++) {
            const nameBox = document.getElementById('name' + (numUsersPrev - i - 1));
            nameBox.remove();
        }
    }

    ls_set('totalUsers', totalUsers);
    numUsersPrev = numUsers;
}

/**
 * Establishes group and saves all names
 */
function setGroup () {
    var groupNum = localStorage.getItem('totalGroups');
    localStorage.setItem(groupNum + 'groupName', document.getElementById('groupName').value);      // prepend id 

    ls_set('allowedToPick', ls_get('totalUsers') - ls_get('day'));
    console.log(ls_get('allowedToPick'));
    var tot = ls_get('totalUsers');

    for (let i=0; i<tot; i++) {
        var key = "name" + i;
        ls_set(key, document.getElementById(key).value);
    }

    ls_set('moviesSelected', 0);    // how many users selected a movie
    ls_set('votesCasted', 0);       // how many users ranked the movies

    redirect('name_and_movie.html');
}

/**
 * Prints name of the next person to select their movie
 */
function printName () {
    var currName = ls_get('name' + ls_get('moviesSelected'));
    const newDiv = document.createElement('div');
    const newContent = document.createTextNode(currName);
    newDiv.appendChild(newContent);
    document.body.appendChild(newDiv);
}

/**
 * Additional user confirmed their movie choice, move to next user (or vote page)
 */
var moviesSelected;
function nextName () {
    ls_set(ls_get('tempTally'), 0);                               // tally

    // var tot = ls_get('totalUsers');
    var tot = ls_get('allowedToPick');

    for (let i=0; i<tot; i++) {
        ls_rem('url' + i);
        ls_rem('title' + i);
    }

    // additional member selected, update in ls
    moviesSelected = ls_get('moviesSelected');
    ls_set('moviesSelected', ++moviesSelected);

    // all movies selected, proceed to vote
    if (moviesSelected == tot) {
        redirect('vote.html');
    } 
    // some members yet to select
    else {
        redirect('name_and_movie.html');
    }
}

/**
 * Takes user input and searches imdb for movies/shows matching query.
 * Retrieves html of search page and extracts title and image sources 
 * of top 3 hits
 */
async function logMovieData() {
    var searchQuery = document.getElementById('movie').value;
    searchQuery = searchQuery.replace(/\s+/g, '-');

    var url = "https://www.imdb.com/search/title/?title=" + searchQuery;
    var proxy_url = "https://corsproxy.io/?" + encodeURIComponent(url);     // credit to corsproxy.io for handling cors error

    var response = await fetch(proxy_url);
    var imdb_html = await response.text();

    const parser = new DOMParser();
	const doc = parser.parseFromString(imdb_html, 'text/html');
    var imgs = doc.querySelectorAll('.loadlate');

    for (let i=0; i<3; i++) {
        ls_set(('url' + i), imgs[i].getAttribute('loadlate'));
        ls_set(('title' + i), imgs[i].getAttribute('alt'));
    }

    redirect('confirm_movie.html');
}

/**
 * Makes 3 boxes with the top 3 imdb hits matching search query.
 * Clicking the box will change the movie data (title, image) 
 * associated with the current user
 */
function displaySearchHits() {
    for (let i=0; i<3; i++) {
        var url = ls_get(('url' + i));
        var title = ls_get(('title' + i));

        const newButton = document.createElement('button');
        newButton.setAttribute('type', 'button');
        newButton.setAttribute('onclick', 'setBorder(this); setMovieData(this);');
        newButton.id = title;

        const newImg = document.createElement('img');
        newImg.setAttribute('src', url);
        newImg.setAttribute('width', '200px');
        newImg.setAttribute('height', '200px');
        newImg.className = "popout";

        newButton.appendChild(newImg);
        document.body.appendChild(newButton);
    }
}

/**
 * Changes the movie data (title, image) associated with user
 * based on their selection. Also initializes a tally for that 
 * movie
 * @param {ThisParameterType} el 
 */
function setMovieData (el) {
    var index = ls_get('moviesSelected');
    
    // non-duplicate, user can select
    if (!ls_get(el.id)) {
        ls_set(('movie' + index), el.id);               // title
        ls_set(('image' + index), el.firstChild.src);   // image url
        ls_set('tempTally', el.id);                     // tally
        document.getElementById('confirm').removeAttribute('disabled');
    }
    // duplicate choice, user must pick something else
    else {
        document.getElementById('confirm').setAttribute('disabled', 'true');
    }

    console.log(el.id);
    console.log(el.firstChild.src);
}

/**
 * Used to highlight the image of the movie chosen
 * @param {ThisParameterType} el 
 */
function setBorder (el) {
    removeOtherBorders();
    el.style.border = '3px solid green';
}

/**
 * Removes all other borders of images displayed, highlighting
 * the movie the user has chosen
 */
function removeOtherBorders () {
    for (let i=0; i<3; i++) {
        var title = ls_get(('title' + i));
        document.getElementById(title).removeAttribute('style');
    }
}

function resetStorage () {
    localStorage.clear();
}


function newGroup () {
    // localStorage.clear();
    console.log("cleared");
    // ++totalGroups;
    
    // console.log(newTot);

    if (localStorage.getItem('totalGroups')) {
        var prev = localStorage.getItem('totalGroups');
        var newTot = parseInt(prev) + 1;

        localStorage.setItem('groupId', newTot);
        localStorage.setItem('totalGroups', newTot);

    }

    else {
        localStorage.setItem('groupId', 0);
        localStorage.setItem('totalGroups', 0);
    }

    ls_set('day', 0);
    // totalGroups++;
    // ls_set('allowedToPick', );
}

// issue is total groups isnt changing. likely need to increment within local Storage

function displayGroupList () {
    var totGroups = parseInt(localStorage.getItem('totalGroups')) + 1;     // indexed at 0
    console.log(totGroups);

    for (let i=0; i<totGroups; i++) {
        var groupName = localStorage.getItem(i + 'groupName');  // can't use ls_get here because don't want index 

        const newDiv = document.createElement('div');
        const newButton = document.createElement('button');


        newButton.setAttribute('type', 'button');
        newButton.setAttribute('onclick', 'changeCurrId(this); redirect("name_and_movie.html");');
        newButton.id = i;

        const newContent = document.createTextNode(groupName);
        newButton.appendChild(newContent);

        newDiv.appendChild(newButton);
        document.body.appendChild(newDiv);
    }
}

function changeCurrId (el) {
    localStorage.setItem('groupId', el.id);
    // console.log(el.id);
}

function prevGroup () {
    // var totalUsers = 
    // for



    ls_set('allowedToPick', parseInt(ls_get('totalUsers')) - parseInt(ls_get('day')));
    console.log("allowed: " + ls_get('allowedToPick'));
    // ls_set('allowedToPick', ls_get('totalUsers') - ls_get('day'));
    // console.l
}

// function allowedToPick () {
//     ls_set('allowedToPick', ls_get('totalUsers') - ls_get('day'));
// }