/**
 * Creates page element for the name of the next person to vote
 */
function newVoter() {
    var key = "name" + ls_get('votesCasted');
    var name = ls_get(key);

    const newDiv = document.createElement('div');
    const newContent = document.createTextNode(name);
    newDiv.id = key;

    newDiv.appendChild(newContent);
    document.body.appendChild(newDiv);
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
    var tot = ls_get('totalUsers');
    var user = ls_get('votesCasted');

    for (let i=0; i<tot; i++) {
        var title = document.getElementById('pick' + i).getAttribute('movie-title');

        var rank = "rank" + user + i;
        ls_set(rank, title);
        ls_set(title, (parseInt(ls_get(title)) + i));
    }
}

function summary () {
    var tot = ls_get('totalUsers');

    for (let user=0; user<tot; user++) {
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
    var tot = ls_get("totalUsers");

    for (let i=0; i<tot; i++) {
        const frame = document.createElement('div');
        const icon = document.createElement('img');

        frame.setAttribute('class', 'frame');
        frame.setAttribute('icon-present', 'true');

        icon.id = 'pick' + i;
        icon.setAttribute('src', ls_get('image' + i));
        icon.setAttribute('movie-title', ls_get('movie' + i));
        
        icon.setAttribute('draggable', 'true');
        icon.setAttribute('ondragstart', 'drag(event)');
        icon.setAttribute('ondragover', 'allowDrop(event)');
        icon.setAttribute('ondrop', 'drop(event)');
        icon.setAttribute('ondragleave', 'resetMove()');
        
        icon.setAttribute('width', '200px');
        icon.setAttribute('height', '200px');

        frame.appendChild(icon);
        document.body.appendChild(frame);
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

    // base case #1, pushed as far right as possible 
    if (startId > ls_get("totalUsers")) {
        return;
    }

    // base case #2, found empty spot, no need to push further 
    if (!frame.getAttribute('icon-present')) {
        icon.setAttribute('src', ls_get('iconToMove'));
        icon.setAttribute('movie-title', ls_get('titleMove'));
        frame.setAttribute('icon-present', 'true');
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
    return localStorage.getItem(key);
}

function ls_set (key, value) {
    localStorage.setItem(key, value);
}

function declareWinner () {
    var high = 1000000;
    var winner;

    for (let i=0; i<3; i++) {
        var currTitle = ls_get(('movie' + i));
        console.log(currTitle);

        if (ls_get(currTitle) < high) {
            console.log("score"+ls_get(currTitle));
            winner = currTitle;
            high = ls_get(currTitle);
        }
    }

    console.log("Winner is: " + winner);
}
