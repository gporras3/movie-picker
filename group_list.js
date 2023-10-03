/**
 * Used to display all previous groups that were created. Selecting
 * group changes the current id and thus data we look at 
 */
function displayGroupList () {
    const totGroups = parseInt(localStorage.getItem('totalGroups')) + 1;     // indexed at 0

    var idx = 0;
    for (let i=0; i<totGroups; i++) {
        // when group deleted, leaves gap in group indexes, this skips to next valid index
        while (!localStorage.getItem(idx + '_totalUsers')) {
            idx++;
        }

        // white box containing name and day
        const groupWrapper = document.createElement('div');
        groupWrapper.id = 'group' + idx;
        groupWrapper.className = 'group-button';

            // button with group name and day text; clicking anywhere changes group
            const groupButton = document.createElement('button');
            groupButtonAttr(groupButton, idx);
                
                const groupText = newTextDiv('Group: ' + localStorage.getItem(idx + '_groupName'));    // can't use ls_get here because currId may not match idx
                groupText.firstChild.style = 'font-size: 35px;';
                groupText.style = 'margin-left: 0px;';

                const day = localStorage.getItem(idx + '_day');
                const tot = localStorage.getItem(idx + '_totalUsers');
                const dayText = newTextDiv('Day: ' + (parseInt(day) + 1) + '/' + tot);
                dayText.firstChild.style = 'font-size: 35px;';
                dayText.style = 'margin-left: 0px;';

            groupButton.appendChild(groupText);
            groupButton.appendChild(dayText);
        
            // flex box with edit and trash buttons
            const iconBox = document.createElement('div');
            iconBox.style = 'display: flex; flex-direction: column; border: none; justify-content: space-around; margin: 0; width: calc(10%);';

                const trashButton = document.createElement('button');
                trashButtonAttr(trashButton, idx);

                const editButton = document.createElement('button');
                editButtonAttr(editButton, idx);

            iconBox.appendChild(editButton);
            iconBox.appendChild(trashButton);

        groupWrapper.appendChild(groupButton);
        groupWrapper.appendChild(iconBox);
        document.getElementById('groups').appendChild(groupWrapper);

        idx++;  // increment for next group
    }
}

/**
 * Makes group buttons clickable. Clicking changes group id and takes user to 
 * movie selection page
 * @param {Element} button 
 * @param {Int} id 
 */
function groupButtonAttr (button, id) {
    button.setAttribute('type', 'button');
    button.setAttribute('onclick', 'changeCurrId(this); changeDay(); redirect("name_and_movie.html");');
    button.className = 'innerWrapper';
    button.style = 'background-color: var(--group-bg); color: var(--navy-blue); border: none; padding: 10px 10px; width: calc(90%);';
    button.id = id;
}

/**
 * Makes trash button clickable. Clicking permanently deletes group from memory
 * @param {Element} button 
 * @param {Int} id 
 */
function trashButtonAttr (button, id) {
    button.setAttribute('type', 'button');
    button.setAttribute('onclick', 'deleteGroup('+id+');');
    button.className = 'fa fa-trash-o editGroupIcon';
    button.style = 'color: var(--trash-red); font-size: 30px;';
}

/**
 * Makes edit button clickable. Clicking changes group id and opens up edit popup
 * @param {Element} button 
 * @param {Int} id 
 */
function editButtonAttr (button, id) {
    button.setAttribute('type', 'button');
    button.setAttribute('onclick', 'changeCurrId(this); openEditPopup();'); 
    button.className = 'fa fa-edit editGroupIcon';
    button.style = 'color: var(--navy-blue); font-size: 30px;';
    button.id = id;
}

/**
 * Creates div element with input text embedded in span
 * @param {String} text 
 * @returns Element
 */
function newTextDiv (text) {
    const newDiv = document.createElement('div');
    const newSpan = document.createElement('span');
    const newText = document.createTextNode(text);
    newSpan.appendChild(newText);
    newDiv.appendChild(newSpan);

    return newDiv;
}

/**
 * Helper function to change groupId var when we select our group. Also used 
 * when we want to edit group/user names
 */
function changeCurrId (el) {
    localStorage.setItem('groupId', el.id);
}

/**
 * Upon selecting a previous group, change the day in cycle by allowing
 * one less user to select a movie (all previous winners in cycle may
 * not select but can still vote). Reset user index to 0 (needed to 
 * print names correctly when choosing/voting)
 */
function changeDay () {
    ls_set('allowedToPick', parseInt(ls_get('totalUsers')) - parseInt(ls_get('day')));
    ls_set('userIdx', 0);
}

/**
 * Delete all data associated with given group. Includes removal
 * of names, group name, day, etc.
 * @param {Int} id 
 */
function deleteGroup (id) {
    const tot = localStorage.length;

    // iterate through ls backwards, ensuring no data is skipped over
    for (let i=tot-1; i>=0; i--) {
        const key = localStorage.key(i);
        if (key.charAt(0) == id) {
            localStorage.removeItem(key);
        }
    }

    // remove page element with group button
    document.getElementById('group' + id).remove();

    // decrement total number of groups
    var prev = localStorage.getItem('totalGroups');
    localStorage.setItem('totalGroups', --prev);
}

/**
 * Opens up popup menu to edit the group name, edit user names, and/or 
 * add/remove users
 */
function openEditPopup () {
    document.getElementById('editPopup').classList.add('show');

    ls_set('pendingTotal', ls_get('totalUsers'));

    document.getElementById('editPopup').style = 'backdrop-filter: blur(5px);'

    var idx = 0;
    const oldTot = ls_get('totalUsers');
    for (let x=0; x<oldTot; x++) {
        // when name deleted, leaves gap in user indexes, this skips to next valid index
        // while (!ls_get('name' + idx)) {
        //     idx++;
        // }

        const userDiv = createUserDiv(x, idx, true);
        

            if (oldTot == 1) {
                userDiv.children[1].children[1].setAttribute('disabled', 'true');     // prevent deleting at 1 user (group min)
            }

        document.getElementById('nameList').appendChild(userDiv);
        idx++;
    }
}

/**
 * Closes popup and clears all data inside, allowing it to be reused
 * on next edit click 
 */
function closePopup () {
    document.getElementById('editPopup').classList.remove('show');      // hide popup

    const names = document.getElementById('nameList');
    // remove all user divs (input, trash combos) from popup box
    while (names.firstChild) {
        names.removeChild(names.lastChild);
    }

    // remove all removeName() functions added to onclick event (weren't used)
    document.getElementById('editButton').setAttribute('onclick', 'editGroup(this); closePopup(); location.reload();');
}

function createUserDiv (i, userIdx, existing) {

    const numUsersPrev = ls_get('pendingTotal');

    const wrapper = document.createElement('div');
    wrapper.className = 'innerWrapper';
    wrapper.id = 'name' + userIdx;

        // shows user number
        const userNum = document.createElement('div');
        const userNumText = document.createTextNode('User ' + (i + 1));
        userNum.id = 'user' + userIdx;
        userNum.style = 'margin-top: 10px; margin-right: auto; margin-left: 5px; color: var(--navy-blue); font: small-caps bold 16px Calibri';
        userNum.appendChild(userNumText);

        // div to hold input box and trash icon
        const userDiv = document.createElement('div');
        userDiv.className = 'gen_box';
        userDiv.style = 'border: none; margin-top: 3px;';

            // input box to change name if desired
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.id = 'input' + userIdx;
            // newInput.style.width = '300px';
            newInput.style = 'width: 300px; height: 25px; font-size: 18px;';

            // newInput.style = 'border: none;'
            if (existing) {
                newInput.value = ls_get('name' + userIdx);
            }
            else {
                newInput.placeholder = 'Name';
            }
            
            // trash icon to delete user (not done until confirmed)
            const trash = document.createElement('button');
            // trash.style.background = 'transparent';
            // trash.

            trashButtonAttr(trash, userIdx);
            trash.style.background = 'transparent';
            trash.style.lineHeight = '25px';
            trash.style.width = '44px';

            // const funct = userIdx;
            trash.setAttribute('onclick', 'hideName('+userIdx+'); addOnclickFunct('+userIdx+');');

        userDiv.append(newInput);
        userDiv.append(trash);

    wrapper.appendChild(userNum);
    wrapper.appendChild(userDiv);

    return wrapper;
}

/**
 * Removes user from group by removing ls vars. In addition to 
 * removing name, resets day in cycle to 0 and adjusts total
 * number of users
 * @param {Int} id 
 */
function removeName (id) {
    ls_rem('name' + id);
    ls_set('day', 0);
}

/**
 * Before permanently removing name from ls (by pressing confirm),
 * names are first hidden in edit menu. Thus, serves as a preview
 * of what group will be once changes confirmed. Also, prevents 
 * @param {Int} id 
 */
function hideName (id) {
    document.getElementById('name' + id).className = 'hidden';

    var numUsersPrev = ls_get('pendingTotal');
    ls_set('pendingTotal', --numUsersPrev);

    rewriteUserNums();

    // prevent deleting at 1 user (group min)
    if (document.getElementById('nameList').querySelectorAll('.innerWrapper').length == 1) {
        document.getElementById('nameList').querySelector('.innerWrapper').children[1].children[1].setAttribute('disabled', 'true');     // children[1] is trash icon
    }
}

function addUser () {
    const pend = parseInt(ls_get('pendingTotal'));
    const idx = document.getElementById('nameList').childElementCount;

    if (document.getElementById('name' + idx)) {
        document.getElementById('name' + idx).className = 'innerWrapper';
        removeOnclickFunct(pend);
    }
    else {
        const userDiv = createUserDiv(pend, idx, false);
        document.getElementById('nameList').appendChild(userDiv);
    }

    document.getElementById('name0').children[1].children[1].removeAttribute('disabled');

    ls_set('pendingTotal', parseInt(pend) + 1);
}

function rewriteUserNums() {
    const names = document.getElementById('nameList');
    // const numBoxes = names.childElementCount;
    const numVisible = ls_get('pendingTotal');

    var idx = 0;
    for (let i=0; i<numVisible; i++) {
        while (names.children[idx].className == 'hidden') {
            idx++;
        }

        document.getElementById('user' + idx).innerText = 'User ' + (i+1);
        idx++;
    }
}

/**
 * Adds the given function to the edit button's onclick event 
 * function list. Namely, it adds removeName() to the list so 
 * that any names the user wants to remove are committed upon 
 * the button click
 * @param {String} funct 
 */
function setOnclickFunct() {
    var tot = ls_get('pendingTotal');
    var functList = '';
    for (let i=0; i<tot; i++) {
        if (ls_get('funct' + i)) {
            functList = ls_get('funct' + i) + functList;
        }
    }

    const confButton = document.getElementById('editButton');

    var onclick = confButton.getAttribute('onclick');
    onclick = functList + onclick;
    confButton.setAttribute('onclick', onclick);
}

function addOnclickFunct(idx) {
    var funct = 'removeName('+idx+');';
    ls_set('funct' + idx, funct);
    setOnclickFunct();
}

function removeOnclickFunct(idx) {
    ls_set('funct' + idx, '');
    setOnclickFunct();
}

/**
 * Commits all changes desired in popup edit menu by modifying any 
 * relevant local storage vars (i.e. names and/or group name)
 */
function editGroup () {
    // update group name in ls
    const newGroupName = document.getElementById('nameEdit').value;
    if (newGroupName != '') {
        ls_set('groupName', newGroupName);
    }

    for (let i=0; i<ls_get('totalUsers'); i++) {
        ls_rem('name' + i);
    }

    const newTot = ls_get('pendingTotal');
    var idx = 0;
    for (let i=0; i<newTot; i++) {
        while (document.getElementById('name' + idx).className == 'hidden') {
            idx++;
        }
        ls_set('name' + i, document.getElementById('input' + idx).value);
        ls_set('day', 0);
        ls_set('totalUsers', newTot);
        idx++;
    }
}