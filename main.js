var numUsersPrev = 0;
var totalUsers = 0;
var totalGroups = -1;

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

    const contButton = document.getElementById('continue');
    
    if (isNaN(numUsers) || numUsers <= 0) {
        numUsers = 0;
        contButton.setAttribute('disabled', 'true');
        contButton.className = 'user-button-gray';
    }
    else {
        contButton.removeAttribute('disabled');
        contButton.className = 'user-button';
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
        const userNum = document.createElement('div');
        const userNumText = document.createTextNode('User ' + (numUsersPrev + i + 1));
        const newInput = document.createElement('input');

        userNum.id = 'user' + (numUsersPrev + i);
        userNum.style = 'margin: 0; float: left; color: var(--navy-blue); font: small-caps bold 16px Calibri';
        userNum.appendChild(userNumText);
        
        newInput.id = 'name' + (numUsersPrev + i);
        newInput.style = 'height: 25px; margin-bottom: 5px; font-size: 18px;';
        newInput.placeholder = 'Name';

        document.getElementById('nameBoxes').appendChild(userNum);
        document.getElementById('nameBoxes').appendChild(newInput);
    }

    // remove elems
    if (toRemove > 0) {
        for (let i=0; i<toRemove; i++) {
            const userNum = document.getElementById('user' + (numUsersPrev - i - 1))
            const nameBox = document.getElementById('name' + (numUsersPrev - i - 1));
            
            userNum.remove();
            nameBox.remove();
        }
    }

    numUsersPrev = numUsers;
}

/**
 * Upon new group creation, group given id (starting with 0). Total number of 
 * groups also incremented. Day set to 0 (all group members may choose movie)
 */
function newGroup () {
    // at least one group exists already
    if (localStorage.getItem('totalGroups')) {
        const prevTot = localStorage.getItem('totalGroups');
        const newTot = parseInt(prevTot) + 1;

        // var idx = 0;
        // while (localStorage.getItem(idx + '_groupName')) {
        //     idx++;
        // }
        const newIdx = parseInt(localStorage.getItem('lastGroupIdx')) + 1;


        localStorage.setItem('groupId', newIdx);
        localStorage.setItem('totalGroups', newTot);
        localStorage.setItem('lastGroupIdx', newIdx);
    }
    // no group exists yet
    else {
        localStorage.setItem('groupId', 0);
        localStorage.setItem('totalGroups', 0);
        localStorage.setItem('lastGroupIdx', 0);
    }

    ls_set('day', 0);
}

/**
 * Initializes group and saves all user names
 */
function setGroup () {
    newGroup();

    ls_set('groupName', document.getElementById('groupName').value);
    ls_set('totalUsers', totalUsers);
    ls_set('allowedToPick', totalUsers);
    ls_set('moviesSelected', 0);            // how many users selected a movie
    ls_set('votesCasted', 0);               // how many users ranked the movies
    ls_set('userIdx', 0);                   // current user's index

    const tot = totalUsers;
    for (let i=0; i<tot; i++) {
        const key = 'name' + i;
        ls_set(key, document.getElementById(key).value);
        ls_set(i + 'win', 0);
    }

    redirect('name_and_movie.html');
}

////////////////////////////////////
// USER MOVIE SELECTION FUNCTIONS //
////////////////////////////////////

/**
 * Prints name of the next person to select their movie. Also
 * customizes tab name based on user selecting
 */
function printName () {
    // skip all winners (they can't pick)
    var idx = ls_get('userIdx');
    while (ls_get(idx + 'win') == 1) {
        idx++;
        ls_set('userIdx', idx);
    }

    // insert name div
    const name = ls_get('name' + idx);
    const nameText = document.createTextNode(name);
    document.getElementById('name').prepend(nameText);

    // change tab text
    document.title = 'Pick-a-Flick - ' + name + ': Select a Movie';
}

/**
 * Allows user to hit 'Enter' to search for their movie instead
 * of clicking the arrow button
 */
function allowEnterKey () {
    const input = document.getElementById('movie');
    input.addEventListener('keypress', function(event) {
        if (event.key === "Enter") {
            document.getElementById('confirm').click();
        }
    });
}

/**
 * Takes user input and searches imdb for movies/shows matching query.
 * Retrieves html of search page and extracts title and image sources 
 * of top 3 hits
 */
async function searchImdb () {
    var searchQuery = document.getElementById('movie').value;
    searchQuery = searchQuery.replace(/\s+/g, '-');

    const url = "https://www.imdb.com/search/title/?title=" + searchQuery;
    const proxy_url = "https://corsproxy.io/?" + encodeURIComponent(url);     // credit to corsproxy.io for handling cors error

    const response = await fetch(proxy_url);
    const imdb_html = await response.text();

    const parser = new DOMParser();
	const doc = parser.parseFromString(imdb_html, 'text/html');
    const imgs = doc.querySelectorAll('.loadlate');

    for (let i=0; i<3; i++) {
        if(imgs.length != 0) {
            ls_set(('url' + i), imgs[i].getAttribute('loadlate'));
            ls_set(('title' + i), imgs[i].getAttribute('alt'));    
        }
        else {
            const inputBox = document.getElementById('movie');
            inputBox.style.border = '3px solid #b11b1b';
            inputBox.value = '';
            inputBox.placeholder = 'Invalid Selection';
            return;
        }
    }

    redirect('confirm_movie.html');
}

/**
 * Makes 3 boxes with the top 3 imdb hits matching search query.
 * Clicking the box will change the movie data (title, image) 
 * associated with the current user
 */
function displaySearchHits () {
    for (let i=0; i<3; i++) {
        const url = ls_get(('url' + i));
        const title = ls_get(('title' + i));

        const box = document.createElement('div');
        box.className = 'innerWrapper';
        box.style = 'justify-content: start; min-height: 250px;';

            const titleElem = document.createElement('span');
            const titleText = document.createTextNode(title);

            titleElem.style = 'width: 133px; text-align: center; margin-top: 10px;'
            titleElem.appendChild(titleText);

            const frame = document.createElement('button');
            frame.setAttribute('type', 'button');
            frame.setAttribute('onclick', 'setBorder(this); setMovieData(this);');
            frame.id = title;
            frame.className = 'frame';

                const icon = document.createElement('img');
                icon.setAttribute('src', url);
                icon.setAttribute('width', '133px');
                icon.setAttribute('height', '200px');
                icon.className = 'popout';

            frame.appendChild(icon);

        box.appendChild(frame);
        box.appendChild(titleElem);

        document.getElementById('frames').appendChild(box);
    }
}

/**
 * Changes the movie data (title, image) associated with user
 * based on their selection. Also initializes a tally for that 
 * movie
 * @param {ThisParameterType} el 
 */
function setMovieData (el) {
    const user = ls_get('userIdx');
    const confirmButton = document.getElementById('confirm');
    
    // non-duplicate, user can select
    if (!ls_get(el.id)) {
        ls_set(('movie' + user), el.id);                // title
        ls_set(('image' + user), el.firstChild.src);    // image url
        ls_set('tempTally', el.id);                     // tally
        confirmButton.removeAttribute('disabled');
        confirmButton.className = 'user-button';
    }
    // duplicate choice, user must pick something else
    else {
        confirmButton.setAttribute('disabled', 'true');
        confirmButton.className = 'user-button-gray';
    }
}

/**
 * Used to highlight the image of the movie chosen
 * @param {ThisParameterType} el 
 */
function setBorder (el) {
    removeOtherBorders();
    el.style.border = '3px solid var(--magenta)';
}

/**
 * Removes all other borders of images displayed, highlighting
 * the movie the user has chosen
 */
function removeOtherBorders () {
    const buttons = document.getElementsByClassName('frame');

    for (let i=0; i<3; i++) {
        buttons[i].removeAttribute('style');
    }
}

/**
 * Additional user confirmed their movie choice, move to next user (or vote page)
 */
function nextName () {
    ls_set(ls_get('tempTally'), 0);                               // tally

    // clears local storage of unselected movie data
    for (let i=0; i<3; i++) {
        ls_rem('url' + i);
        ls_rem('title' + i);
    }

    // additional member selected, update in ls
    var moviesSelected = ls_get('moviesSelected');
    ls_set('moviesSelected', ++moviesSelected);    
    
    var ptr = ls_get('userIdx');
    ls_set('userIdx', ++ptr);
    
    const tot = ls_get('allowedToPick');
    if (moviesSelected == tot) {
        if (tot == 1) {
            redirect('winner.html');    // when 1 user remains, they automatically win
        }
        else {
            redirect('vote.html');
        }
    } 
    else {
        redirect('name_and_movie.html');    // some members yet to select
    }
}

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
    const currGroup = localStorage.getItem('groupId');
    return localStorage.getItem(currGroup + '_' + key);
}

/**
 * Sets key-value pair in local storage
 * @param {String} key 
 * @param {*} value 
 */
function ls_set (key, value) {
    const currGroup = localStorage.getItem('groupId');
    localStorage.setItem(currGroup + '_' + key, value);
}

/**
 * Removes key-value pair in local storage
 * @param {String} key 
 */
function ls_rem (key) {
    const currGroup = localStorage.getItem('groupId');
    localStorage.removeItem(currGroup + '_' + key);
}

/**
 * Creates the navigation bar on each page
 */
function navbar () {
    const navbar = `
        <div class="navbar">
            <div class="gen_box" style="height: inherit;">
                <button type="button" class="fa fa-home home" style="font-size: 30px;" onclick="redirect('index.html')"></button>
                <span class="navtext">About</span>
                <span class="navtext">Explore</span>
                <span class="navtext">History</span>
                <span class="navtext">Groups</span>
            </div>
            <div class="gen_box">
                <span id="groupNavbar" style="color: var(--white); margin: 0px 20px;"></span>
                <span id="dayNavbar" style="color: var(--white); margin-right: 20px;"></span>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('afterbegin', navbar);
}

/**
 * Customizes the navigation bar to include group name and day
 * in cycle. Only for pages after group creation (movie select,
 * vote, etc.)
 */
function customNavbar () {
    const groupName = ls_get('groupName');
    const nameText = document.createTextNode('Group: ' + groupName);
    document.getElementById('groupNavbar').appendChild(nameText);

    const day = parseInt(ls_get('day'));
    const tot = ls_get('totalUsers');
    const dayText = document.createTextNode('Day: ' + (day + 1) + '/' + tot);
    document.getElementById('dayNavbar').appendChild(dayText);
}

////////////////////////
// PAGE LOAD WRAPPERS //
////////////////////////

/**
 * Wrapper for index.html functions to be executed on page load
 */
function index_load () {
    navbar();
}

/**
 * Wrapper for new_group.html functions to be executed on page load
 */
function new_group_load () {
    navbar();
}

/**
 * Wrapper for name_and_movie.html functions to be executed on page load
 */
function name_and_movie_load () {
    navbar();
    customNavbar();
    printName();
    allowEnterKey();
}

/**
 * Wrapper for confirm_movie.html functions to be executed on page load
 */
function confirm_movie_load () {
    navbar(); 
    customNavbar(); 
    printName(); 
    displaySearchHits();
}