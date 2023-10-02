/**
 * Creates page element for the name of the next person to vote. Also
 * adds star next to their name if they were a winner in the current 
 * cycle
 */
function newVoterName() {
    const key = 'name' + ls_get('votesCasted');
    const name = ls_get(key);

    const nameText = document.createTextNode(name);
    document.getElementById('name').appendChild(nameText);

    // add star icon next to winners of current cycle 
    if (ls_get(ls_get('votesCasted') + 'win') == 1) {
        const star = document.createElement('i');
        star.style = 'font-size: 30px; margin-left: 10px; vertical-align: middle;'
        star.className = 'fa fa-star';
        document.getElementById('name').appendChild(star);
    }

    document.title = 'FlixPix - ' + name + ': Vote';
}

/**
 * Current voter done voting, move to next voter or winner page
 */
function nextVoter() {
    // store user's votes
    recordChoices();

    // additional vote casted, update in ls
    var votes = ls_get('votesCasted');
    ls_set('votesCasted', ++votes);

    const tot = ls_get('totalUsers');
    // all votes casted, proceed to winner
    if (votes == tot) {
        redirect('winner.html');
    } 
    // some members yet to vote
    else {
        location.reload();
    }
}

/**
 * Records user's rankings of movies, adds to the tallies (lowest wins).
 * Rankings stored to be shown in summary. First place gets 0 pts, second
 * gets 1 pt, etc.
 */
function recordChoices() {
    const tot = ls_get('allowedToPick');
    const user = ls_get('votesCasted');

    var idx = 0;
    for (let i=0; i<tot; i++) {
        // skips "ghost" data from previous winners
        while (ls_get(idx + 'win') == 1) {
            idx++;
        }

        const title = document.getElementById('pick' + i).getAttribute('movie-title');
        ls_set(title, (parseInt(ls_get(title)) + idx));

        const rank = 'rank' + user + i;
        ls_set(rank, title);
        idx++;
    }
}

/** 
 * Creates frames for movie thumbnails, sets attr. so that icons are draggable.
 * Order of icons determines user's votes
 */
function makeMovieFrames() {
    const tot = ls_get('allowedToPick');

    var idx = 0;
    for (let i=0; i<tot; i++) {
        // skips "ghost" data from previous winners
        while (ls_get(idx + 'win') == 1) {
            idx++;
        }

        const title = ls_get('movie' + idx);

        const box = document.createElement('div');
        box.className = 'innerWrapper';
            // text that tells user what choice the box is
            const rankNum = document.createTextNode('Choice #' + (i + 1));

            // frame with movie icon
            const frame = document.createElement('div');
            frame.setAttribute('class', 'frame');
            frame.setAttribute('icon-present', 'true');    

                const icon = document.createElement('img');
                icon.style = 'width: 133px; height: 200px;'
                icon.id = 'pick' + i;

                icon.setAttribute('src', ls_get('image' + idx));
                icon.setAttribute('movie-title', title);
                
                icon.setAttribute('draggable', 'true');
                icon.setAttribute('ondragstart', 'drag(event)');
                icon.setAttribute('ondragover', 'allowDrop(event)');
                icon.setAttribute('ondrop', 'drop(event)');
                icon.setAttribute('ondragleave', 'resetIdToEvict()');
                
            frame.appendChild(icon);

            // text with movie title
            const movie = document.createElement('span');
            movie.style = 'width: 133px; text-align: center; margin: 10px 0px;';
            movie.id = 'pick' + i + 'title';
            
                const titleText = document.createTextNode(title);

            movie.appendChild(titleText);

        box.appendChild(rankNum);
        box.appendChild(frame);
        box.appendChild(movie);

        document.getElementById('frames').appendChild(box);
        idx++;
    }
}

/**
 * Upon picking up icon, collects info about it (title and img src)
 * @param {Event} ev 
 */
function drag(ev) {
    const idName = ev.target.id;

    ev.dataTransfer.setData('text', idName);
    ls_set('endId', idName.substr(4, idName.length));      // just gets number of id (e.g. get 0 from pick0)
    ls_set('idInHand', idName);
    ls_set('idToEvict', idName);

    ls_set('iconInHand', document.getElementById(idName).getAttribute('src'));
    ls_set('titleInHand', document.getElementById(idName).getAttribute('movie-title'));
}

/**
 * Hovering over frame, record id of corresponding element
 * @param {Event} ev 
 */
function allowDrop(ev) {
    const idName = ev.target.id;
    ls_set('tempId', ls_get('idToEvict'));

    ev.preventDefault();
    ls_set('startId', idName.substr(4, idName.length));
    ls_set('idToEvict', idName);

    ls_set('iconToEvict', document.getElementById(idName).getAttribute('src'));
    ls_set('titleToEvict', document.getElementById(idName).getAttribute('movie-title'));
}

/**
 * Drop current icon on previous icon, evict
 * @param {Event} ev 
 * @returns None
 */
function drop(ev) {
    const currId = ls_get('idInHand');

    // drop in original spot 
    if (currId == ls_get('idToEvict')) {
        return;
    }

    // clear spot of current icon 
    document.getElementById(currId).parentElement.removeAttribute('icon-present');

    ev.preventDefault();   
    displace();             // start moving icons
}

/**
 * Determines which direction we need to shift icons down 
 */
function displace() {
    const startId = parseInt(ls_get('startId'));        // first icon we push out - where we want icon in hand to land
    const endId = parseInt(ls_get('endId'));            // empty spot left by picking up icon in hand

    if (startId > endId) {
        pushLeft(startId);
    }
    else if (startId < endId) {
        pushRight(startId);
    }
}

/**
 * Recursive function that pushes all icons down to the right 
 * @param {Int} startId 
 * @returns None
 */
function pushRight(startId) {
    const destId = 'pick' + startId;
    const icon = document.getElementById(destId);
    const frame = icon.parentElement;

    // base case #1, pushed as far right as possible 
    if (startId > ls_get('allowedToPick')) {
        return;
    }

    // base case #2, found empty spot, no need to push further 
    if (!frame.getAttribute('icon-present')) {
        icon.setAttribute('src', ls_get('iconInHand'));
        icon.setAttribute('movie-title', ls_get('titleInHand'));
        frame.setAttribute('icon-present', 'true');
        document.getElementById('pick' + startId + 'title').innerText = ls_get('titleInHand');
    }

    // recursive case, need to push image that we're replacing 
    else {
        icon.setAttribute('src', ls_get('iconInHand'));
        ls_set('iconInHand', ls_get('iconToEvict'));
        ls_set('iconToEvict', document.getElementById('pick' + (startId + 1)).getAttribute('src'));    

        icon.setAttribute('movie-title', ls_get('titleInHand'));
        ls_set('titleInHand', ls_get('titleToEvict'));
        ls_set('titleToEvict', document.getElementById('pick' + (startId + 1)).getAttribute('movie-title'));  

        document.getElementById('pick' + startId + 'title').innerText = icon.getAttribute('movie-title');   // update title text to match image

        // recurse, keep pushing icons right
        pushRight(startId + 1);
    }
}

/**
 * Recursive function that pushes all icons down to the left
 * @param {Int} startId 
 * @returns None
 */
function pushLeft(startId) {
    const destId = 'pick' + startId;
    const icon = document.getElementById(destId);
    const frame = icon.parentElement;

    // base case #1, pushed as far left as possible 
    if (startId < 0) {
        return;
    }

    // base case #2, found empty spot, no need to push further 
    if (!frame.getAttribute('icon-present')) {
        icon.setAttribute('src', ls_get('iconInHand'));
        icon.setAttribute('movie-title', ls_get('titleInHand'));
        frame.setAttribute('icon-present', 'true');
        document.getElementById('pick' + startId + 'title').innerText = ls_get('titleInHand');
    }

    // recursive case, need to push image that we're replacing 
    else {
        icon.setAttribute('src', ls_get('iconInHand'));
        ls_set('iconInHand', ls_get('iconToEvict'));
        ls_set('iconToEvict', document.getElementById('pick' + (startId - 1)).getAttribute('src'));   
        
        icon.setAttribute('movie-title', ls_get('titleInHand'));
        ls_set('titleInHand', ls_get('titleToEvict'));
        ls_set('titleToEvict', document.getElementById('pick' + (startId - 1)).getAttribute('movie-title')); 
        
        document.getElementById('pick' + startId + 'title').innerText = icon.getAttribute('movie-title');   // update title text to match image

        // recurse, keep pushing icons left
        pushLeft(startId - 1);
    }
}

/**
 * When image leaves drop target (i.e. was hovering but user changed
 * mind), reset eviction id to self (thus, no shifting will be done) 
 */
function resetIdToEvict() {
    ls_set('idToEvict', ls_get('tempId'));
}

function declareWinner () {
    var high = 1000000;
    var winner;

    const tot = ls_get('allowedToPick');
    var idx = 0;
    for (let i=0; i<tot; i++) {
        while(ls_get(idx + 'win') == 1) {
            idx++;
        }
        // change this to while loop probably because gaps may exist

        var currTitle = ls_get(('movie' + idx));

        if (ls_get(currTitle) < high) {
            winner = idx;
            high = ls_get(currTitle);
        }

        console.log(currTitle + ': ' + ls_get(currTitle));
        console.log(idx);
        ls_rem(currTitle);
        idx++;
    }

    // frame that holds image of winning movie
    const frame = document.createElement('div');
    frame.className = 'frame';

        const img = document.createElement('img');
        img.src = ls_get('image' + winner);
        img.style = 'width: 133px; height: 200px;'

    frame.appendChild(img);

    // text of winning movie title
    const title = document.createTextNode(ls_get('movie' + winner));

    document.getElementById('winner').appendChild(frame);
    document.getElementById('winner').appendChild(title);

    // prepare group for next day in cycle 
    const day = ((parseInt(ls_get('day')) + 1)) % ls_get('totalUsers');
    ls_set('day', day);
    ls_set('moviesSelected', 0);
    ls_set('votesCasted', 0);

    // handle winner flags
    if (day == 0) {
        var idx = 0;
        for (let i=0; i<ls_get('totalUsers'); i++) {        // full cycle complete, reset winners
            while (!ls_get('name' + idx)) {
                idx++;
            }
            
            ls_set(i + 'win', 0);
            idx++;
        }
    }
    else {
        ls_set((winner) + 'win', 1);      // mark winner
    }
}

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

function navbar () {
    var navbar = `
        <div class="navbar">
            <span class="navtext">About</span>
            <span class="navtext">Explore</span>
            <span class="navtext">History</span>
            <span class="navtext">Groups</span>
            <span class="navtextRight" id="dayNavbar"></span>
            <span class="navtextRight" id="groupNavbar"></span>
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






function summary () {
    var tot = ls_get('allowedToPick');
    var numUsers = ls_get('totalUsers');

    for (let user=0; user<numUsers; user++) {
        for (let pick=0; pick<tot; pick++) {
            console.log(ls_get('rank' + user + pick));
        }
    }
}

function storeEndData () {
    // names

    // group size

    // day number 

    // winner data (title, icon url)
}