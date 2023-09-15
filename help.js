var numUsersPrev = 0;
var totalUsers = 0;
var total = 0;

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

/**
 * Redirects page to given url when called
 * @param {String} url 
 */
function redirect (url) {
    location.href=url;
}

/**
 * Retrieves value from local storage corresponding to key
 * @param {String} key 
 * @returns value
 */
function ls_get (key) {
    return localStorage.getItem(key);
}

/**
 * Sets key-value pair in local storage
 * @param {String} key 
 * @param {*} value 
 */
function ls_set (key, value) {
    localStorage.setItem(key, value);
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
    for (var i=0; i<toAdd; i++) {
        const newInput = document.createElement('input');
        newInput.id = "name" + (numUsersPrev + i);
  
        const currentDiv = document.getElementById('flex');
        document.body.insertBefore(newInput, currentDiv);
    }

    // remove elems
    if (toRemove > 0) {
        for (var i=0; i<toRemove; i++) {
            const element = document.getElementById("name" + (numUsersPrev - i - 1));
            element.remove();
        }
    }

    ls_set('totalUsers', totalUsers);
    numUsersPrev = numUsers;
}

/**
 * Establishes group and saves all names
 */
function setGroup () {
    var tot = ls_get('totalUsers');

    for (var i=0; i<tot; i++) {
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
    ls_set('curr_name', ls_get("name" + ls_get('moviesSelected')));
    const newDiv = document.createElement('div');
    const newContent = document.createTextNode(ls_get('curr_name'));
    newDiv.appendChild(newContent);
    document.body.appendChild(newDiv);


    for (var i=0; i<3; i++) {
        console.log(ls_get(('icon_url_'+i)));
    }
}



/*

*/
var moviesSelected;
function nextName () {
    var tot = ls_get("totalUsers");

    // additional member selected, update in ls
    moviesSelected = ls_get('moviesSelected');
    moviesSelected++;
    ls_set("moviesSelected", moviesSelected);

    // all movies selected, proceed to vote
    if (moviesSelected == tot) {
        redirect('vote.html');
    } 
    // some members yet to select
    else {
        redirect('name_and_movie.html');
    }
}

function movies_to_pick () {
    var tot = ls_get("totalUsers");

    for (var i=0; i<parseInt(tot); i++) {
        var key = "movie" + i;
        var movie = ls_get(key);

        const newDiv = document.createElement("div");
        const newContent = document.createTextNode(movie);
        newDiv.id = key;

        newDiv.appendChild(newContent);
        document.body.appendChild(newDiv);
    }
}

function createTallies () {
    
    // ls_set('nerd', 0);
    // ls_set('quest', 0);
    // ls_set('cool', 0);
    // ls_set('movie'+ls_get('moviesSelected'), document.getElementById('movie').value);

    // redirect('confirm_movie.html');

}

async function logMovies() {
    var searchQuery = document.getElementById('movie').value;
    console.log(searchQuery);

    searchQuery = searchQuery.replace(/\s+/g, '-');
    var url =  'https://www.imdb.com/search/title/?title=' + searchQuery;
    var proxy_url = 'https://corsproxy.io/?' + encodeURIComponent(url);

    var response = await fetch(proxy_url);
    var imdb_html = await response.text();

    const parser = new DOMParser();
	const doc = parser.parseFromString(imdb_html, 'text/html');
    var imgs = doc.querySelectorAll('.loadlate');

    for (var i=0; i<3; i++) {
        console.log(imgs[i].getAttribute('alt'))
        console.log(imgs[i].getAttribute('loadlate'));
    }

    for (var i=0; i<3; i++) {
        // const newDiv = document.createElement('img');
        // newDiv.setAttribute('src', imgs[i].getAttribute('loadlate'));
        // newDiv.setAttribute('width', '200px');
        // newDiv.setAttribute('height', '200px');

        // document.body.appendChild(newDiv);  

        ls_set(('icon_url_'+i), imgs[i].getAttribute('loadlate'));
        ls_set(('icon_title_'+i), imgs[i].getAttribute('alt'));
    }

    redirect('confirm_movie.html');
}

function flush () {
    for (var i=0; i<3; i++) {

        // document.body.appendChild(newDiv);  

        localStorage.removeItem(('icon_url_'+i));
        localStorage.removeItem(('icon_title_'+i));
    }
}

function showOptions() {
    for (var i=0; i<3; i++) {
        var url = ls_get(('icon_url_'+i));
        var title = ls_get(('icon_title_'+i));
        console.log(url);

        const newButton = document.createElement('button');
        newButton.setAttribute('type', 'button');
        // var functMovie = 'setMovieData(' + i + ');';
        // newButton.setAttribute('onclick', ('setBorder(this); ' + functMovie));
        newButton.setAttribute('onclick', 'setBorder(this); setMovieData(this);');
        // newButton.id = 'button' + i;
        newButton.id = title;

        const newDiv = document.createElement('img');
        newDiv.setAttribute('src', url);
        newDiv.setAttribute('width', '200px');
        newDiv.setAttribute('height', '200px');
        newDiv.className = 'part';

        newButton.appendChild(newDiv);
        document.body.appendChild(newButton);
    }
   
}

function setMovieData (el) {
    var index = ls_get('moviesSelected');
    
    ls_set((index+'movie'), el.id);
    ls_set((index+'image'), el.firstChild.src);

    console.log(el.id);
    console.log(el.firstChild.src);
}

function removeOtherBorders () {
    for (var i=0; i<3; i++) {
        var title = ls_get(('icon_title_'+i));
        document.getElementById(title).removeAttribute('style');
    }
}
function setBorder (el) {
    removeOtherBorders();
    el.style.border = '3px solid green';
}