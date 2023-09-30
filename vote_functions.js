/**
 * Creates page element for the name of the next person to vote
 */
function newVoter() {
    var key = "name" + ls_get('votesCasted');
    var name = ls_get(key);

    // const newDiv = document.createElement('div');
    const newContent = document.createTextNode(name);
    // newDiv.id = key;

    // newDiv.appendChild(newContent);
    // document.body.appendChild(newDiv);
    document.getElementById('name').appendChild(newContent);

    if (ls_get(ls_get('votesCasted') + 'win') == 1) {
        const newIcon = document.createElement('i');
        newIcon.style = 'font-size: 30px; margin-left: 10px; vertical-align: middle;'
        newIcon.className = 'fa fa-star';
        document.getElementById('name').appendChild(newIcon);
    }

    var tabText = 'FlixPix - ' + name + ': Vote';
    document.title = tabText;
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

    var tot = ls_get('totalUsers');
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
 * Records user's rankings of movies, adds to the tallies (lowest wins)
 */
function recordChoices () {
    var tot = ls_get('allowedToPick');
    var user = ls_get('votesCasted');

    for (let i=0; i<tot; i++) {
        var title = document.getElementById('pick' + i).getAttribute('movie-title');

        var rank = "rank" + user + i;
        ls_set(rank, title);
        ls_set(title, (parseInt(ls_get(title)) + i));
    }
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

/** 
 * Creates frames for movie thumbnails, sets attr. so that icons are draggable.
 * Order of icons determines user's votes
 */
function makeMovieFrames() {
    var tot = ls_get('allowedToPick');

    for (let i=0; i<tot; i++) {
        const title = ls_get('movie' + i);

        const box = document.createElement('div');
        const frame = document.createElement('div');
        const icon = document.createElement('img');

        const rankNum = document.createTextNode('Choice #' + (i + 1));
        // const movieName = document.createTextNode(title);

        const text = document.createElement('span');
        // const movietitle = document.getElementById('pick' + i).getAttribute('movie-title');
        const words = document.createTextNode(title);

        text.style = 'width:133px; text-align:center; margin-top: 10px; margin-bottom:10px;';
        text.id = 'pick' + i + 'title';
        text.appendChild(words);

        box.className = 'gen_box';
        box.style = 'flex-direction: column; align-items: center; justify-content:start; min-height: 250px;';

        frame.setAttribute('class', 'frame');
        frame.setAttribute('icon-present', 'true');

        icon.id = 'pick' + i;
        icon.setAttribute('src', ls_get('image' + i));
        icon.setAttribute('movie-title', title);
        
        icon.setAttribute('draggable', 'true');
        icon.setAttribute('ondragstart', 'drag(event)');
        icon.setAttribute('ondragover', 'allowDrop(event)');
        icon.setAttribute('ondrop', 'drop(event)');
        icon.setAttribute('ondragleave', 'resetMove()');
        
        icon.setAttribute('width', '133px');
        icon.setAttribute('height', '200px');

        frame.appendChild(icon);

        box.appendChild(rankNum);
        box.appendChild(frame);
        box.appendChild(text);

        document.getElementById('frames').appendChild(box);
        // document.body.appendChild(frame);
    }
}

/**
 * Upon picking up icon, collects info about it (title and img src)
 * @param {Event} ev 
 */
function drag(ev) {
    var idName = ev.target.id;

    ev.dataTransfer.setData("text", idName);
    ls_set("tomove", idName.substr(4, idName.length));
    ls_set("movToMove", idName);
    ls_set("movToRemove", idName);

    ls_set("iconToMove", document.getElementById(idName).getAttribute('src'));
    ls_set("titleMove", document.getElementById(idName).getAttribute('movie-title'));

}

/*    hovering over frame, record id of corresponding element    */
function allowDrop(ev) {
    var idName = ev.target.id;
    ls_set("tempIcon", ls_get("movToRemove"));

    ev.preventDefault();
    ls_set("target", idName.substr(4, idName.length));
    ls_set("movToRemove", idName);
    ls_set("iconToRemove", document.getElementById(idName).getAttribute('src'));
    ls_set("titleRemove", document.getElementById(idName).getAttribute('movie-title'));
}

/*    drop current icon on previous icon, evict    */
function drop(ev) {
    // clear spot of current icon 
    var currId = ls_get('movToMove');

    // gonna drop in original spot 
    if (currId == ls_get("movToRemove")) {
        return;
    }

    document.getElementById(currId).parentElement.removeAttribute('icon-present');

    ev.preventDefault();
    displace();
}

// newImg is new image in spot, returns previous img
function displace () {
    // nums of ids
    var tar = ls_get("target");
    var toMove = ls_get("tomove");

    if (parseInt(tar) > parseInt(toMove)) {
        pushLeft(parseInt(tar));     // up
    }
    else if (parseInt(tar) < parseInt(toMove)) {
        pushRight(parseInt(tar));    // down
    }
}

var tempImgSrc;
var tempTitle;
function pushRight(startId) {
    var destId = "pick" + startId;
    const icon = document.getElementById(destId);
    const frame = icon.parentElement;

    // var destIdTitle = 'pick' + startId + 'title';
    // const title = document.getElementById(destIdTitle);

    // base case #1, pushed as far right as possible 
    if (startId > ls_get('allowedToPick')) {
        return;
    }

    console.log(startId);
    // base case #2, found empty spot, no need to push further 
    if (!frame.getAttribute('icon-present')) {
        icon.setAttribute('src', ls_get('iconToMove'));
        icon.setAttribute('movie-title', ls_get('titleMove'));
        frame.setAttribute('icon-present', 'true');
        // title.
        console.log('move: ' + ls_get('titleMove'));
        console.log('remove: ' + ls_get('titleRemove'));
        document.getElementById('pick' + startId + 'title').innerText = ls_get('titleMove');
    }

    // recursive case, need to push image that we're replacing 
    else {
        tempImgSrc = ls_get('iconToRemove');
        icon.setAttribute('src', ls_get('iconToMove'));
        ls_set('iconToMove', tempImgSrc);
        ls_set('iconToRemove', document.getElementById("pick"+(startId+1)).getAttribute('src'));    

        tempTitle = ls_get('titleRemove');
        icon.setAttribute('movie-title', ls_get('titleMove'));
        ls_set('titleMove', tempTitle);
        ls_set('titleRemove', document.getElementById("pick"+(startId+1)).getAttribute('movie-title'));  

        document.getElementById('pick' + (startId) + 'title').innerText = icon.getAttribute('movie-title');

        pushRight(startId+1);
    }
}

function pushLeft(startId) {
    var destId = "pick"+(startId);
    const icon = document.getElementById(destId);
    const frame = icon.parentElement;

    if (startId < 0) {
        return;
    }

    // empty spot, place image, done
    if (!frame.getAttribute('icon-present')) {
        icon.setAttribute('src', ls_get('iconToMove'));
        icon.setAttribute('movie-title', ls_get('titleMove'));
        frame.setAttribute('icon-present', 'true');
        document.getElementById('pick' + startId + 'title').innerText = ls_get('titleMove');
    }

    // image in spot
    else {
        tempImgSrc = ls_get('iconToRemove');
        icon.setAttribute('src', ls_get('iconToMove'));
        ls_set('iconToMove', tempImgSrc);
        ls_set('iconToRemove', document.getElementById("pick"+(startId-1)).getAttribute('src'));   
        
        tempTitle = ls_get('titleRemove');
        icon.setAttribute('movie-title', ls_get('titleMove'));
        ls_set('titleMove', tempTitle);
        ls_set('titleRemove', document.getElementById("pick"+(startId-1)).getAttribute('movie-title')); 
        
        document.getElementById('pick' + (startId) + 'title').innerText = icon.getAttribute('movie-title');

        // recurse, keep pushing icons left
        pushLeft(startId-1);
    }
}

/**
 * When image leaves drop target (i.e. was hovering but user changed
 * mind), 
 */
function resetMove() {
    ls_set("movToRemove", ls_get("tempIcon"));
}

function redirect(url) {
    location.href=url;
}

// getter, setter functions for local storage, just to make code cleaner
function ls_get (key) {
    var currGroup = localStorage.getItem('groupId');

    return localStorage.getItem(currGroup + '_' + key);
}

function ls_set (key, value) {
    var currGroup = localStorage.getItem('groupId');

    localStorage.setItem(currGroup + '_' + key, value);
}

function ls_rem (key) {
    var currGroup = localStorage.getItem('groupId');

    localStorage.removeItem(currGroup + '_' + key);
}

function declareWinner () {
    var high = 1000000;
    var winner;

    var allowed = ls_get('allowedToPick');
    var tot = ls_get('totalUsers');
    var diff = tot - allowed;
    for (let i=0; i<tot; i++) {
        if (ls_get(i + 'win') == 1) {
            continue;
        }

        var currTitle = ls_get(('movie' + (i - diff)));
        console.log(currTitle);

        if (ls_get(currTitle) < high) {
            console.log("score"+ls_get(currTitle));
            // winner = currTitle;
            // winner = (i-diff);
            winner = i - diff;
            console.log ('winner: ' + winner);
            high = ls_get(currTitle);
        }

        ls_rem(currTitle);
    }

    console.log("Winner is: " + winner);

    const frame = document.createElement('div');
    frame.className = 'frame';

    const img = document.createElement('img');
    // img.src = localStorage.getItem(winner + '_')
    img.src = ls_get('image' + winner);
    img.style = 'width: 133px; height: 200px;'
    
    const title = document.createTextNode(ls_get('movie' + winner));
    frame.appendChild(img);
    document.getElementById('winner').appendChild(frame);
    document.getElementById('winner').appendChild(title);


    var day =  ((parseInt(ls_get('day')) + 1)) % ls_get('totalUsers');
    console.log(day);
    ls_set('day', day);
    ls_set('moviesSelected', 0);
    ls_set('votesCasted', 0);

    if (day == 0) {
        for (let i=0; i<ls_get('totalUsers'); i++) {        // full cycle complete, reset winners
            ls_set(i + 'win', 0);
        }
    }
    else {
        ls_set((winner+diff) + 'win', 1);      // mark winner
    }
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