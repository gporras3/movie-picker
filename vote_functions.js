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
    var tot = ls_get('totalUsers');
    var votes = ls_get('votesCasted');
    votes++;
    ls_set('votesCasted', votes);

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
 * Records user's rankings of movies, adds to the tallies
 */
function recordChoices () {
    var tot = ls_get('totalUsers');
    var currName = ls_get("name" + ls_get('votesCasted'));

    for (var i=0; i<tot; i++) {
        var title = document.getElementById("pick"+i).getAttribute("movie-title");

        ls_set(("choice" + i + currName), title);
        ls_set(title, (parseInt(ls_get(title))+i));
    }
}

/** 
 * Creates frames for movie thumbnails, sets attr. so that icons are draggable
 * order of icons determines user's votes
 */
function makeMovieFrames() {
    var tot = ls_get("totalUsers");

    for (var i=0; i<tot; i++) {
        const frame = document.createElement("div");
        const icon = document.createElement("img");

        frame.setAttribute('class', 'frame');
        frame.setAttribute('icon-present', 'true');

        icon.id = "pick"+i;
        icon.setAttribute('ondrop', 'drop(event)');
        icon.setAttribute('ondragover', 'allowDrop(event)');
        icon.setAttribute('ondragleave', 'resetMove()');

        // if(i==1) {
        //     icon.setAttribute('src', 'cool.jpg');
        //     icon.setAttribute('movie-title', 'cool');
        // }
        // else if (i==2){
        //     icon.setAttribute('src', 'quest.png');
        //     icon.setAttribute('movie-title', 'quest');

        // }
        // else {
        //     icon.setAttribute('src', 'nerd.png');
        //     icon.setAttribute('movie-title', 'nerd');
        // }
        icon.setAttribute('src', ls_get(i+'image'));
        icon.setAttribute('movie-title', ls_get(i+'movie'));
        

        icon.setAttribute('draggable', 'true');
        icon.setAttribute('ondragstart', 'drag(event)');
        icon.setAttribute('width', '200px');
        icon.setAttribute('height', '200px');

        frame.appendChild(icon);
        document.body.appendChild(frame);
    }
}

// target   - icon we want to evict 
// current  - icon we are moving 
// 

function resetMove() {
    ls_set("movToRemove", ls_get("tempIcon"));
    // ls_set("titleRemove", document.getElementById(idName).getAttribute('movie-title'));

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
  
/*    pick up icon, get its info (idname, img src)    */
function drag(ev) {
    var idName = ev.target.id;

    ev.dataTransfer.setData("text", idName);
    ls_set("tomove", idName.substr(4, idName.length));
    ls_set("movToMove", idName);
    ls_set("movToRemove", idName);
    // ls_set("titleRemove", document.getElementById(idName).getAttribute('movie-title'));


    ls_set("iconToMove", document.getElementById(idName).getAttribute('src'));
    ls_set("titleMove", document.getElementById(idName).getAttribute('movie-title'));

}

/*    drop current icon on previous icon, evict    */
function drop(ev) {
    // clear spot of current icon 
    var currId = ls_get('movToMove');
    // console.log("current"+currId);

    // gonna drop in original spot 
    if (currId == ls_get("movToRemove")) {
        return;
    }

    document.getElementById(currId).parentElement.removeAttribute('icon-present');

    ev.preventDefault();
    // var data = ev.dataTransfer.getData("text");
    // ev.target.appendChild(document.getElementById(data));

    // document.getElementById()
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

    var destId = "pick"+(startId);
    const icon = document.getElementById(destId);
    const frame = icon.parentElement;

    if (startId > ls_get("totalUsers")) {
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
        ls_set('iconToRemove', document.getElementById("pick"+(startId+1)).getAttribute('src'));    

        tempTitle = ls_get('titleRemove');
        icon.setAttribute('movie-title', ls_get('titleMove'));
        ls_set('titleMove', tempTitle);
        ls_set('titleRemove', document.getElementById("pick"+(startId+1)).getAttribute('movie-title'));  

        // recurse, keep pushing icons right
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

function tallyVotes () {

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

    for (var i=0; i<3; i++) {
        var currTitle = ls_get((i+'movie'));
        console.log(currTitle);

        if (ls_get(currTitle) < high) {
            console.log("score"+ls_get(currTitle));
            winner = currTitle;
            high = ls_get(currTitle);
        }
    }

    console.log("Winner is: " + winner);
}
