var username = localStorage.username,
    txtPword = $('#txtPword'),
    txtUname = $('#txtUname'),
    myForm = $('.form'),
    loading = $('.loading'),
    errorField = $('p.error'),
    subBtns = $('button[type=submit]'),
    baseUrl = "https://cegep-heritage.omnivox.ca/",
    marksPageUrl = baseUrl + "intr/Module/ServicesExterne/Skytech.aspx?IdServiceSkytech=Skytech_Omnivox&lk=%2festd%2fcvie%3fmodule%3dnote%26item%3dintro",
    loginPageBase = baseUrl + "intr/Module/Identification/Login/",
    checkLoggedIn = chrome.extension.getBackgroundPage().checkLoggedIn,
    updateMarks = chrome.extension.getBackgroundPage().setNumNewMarks;

// check if logged in
checkLoggedIn(function(isLoggedIn) {
    if (isLoggedIn) {
        // open marks page
        chrome.tabs.create({
            url: marksPageUrl
        });
        // close the popup
        window.close();
    } else {
        toggleLoading();
        // if the username was successfully retrieved from localstorage
        if (username) {
            // set the field to the retrieved value
            txtUname.val(username);
            // and focus on the password field
            txtPword.focus();
        } else {
            // if it wasn't found just focus on the uname field
            txtUname.focus();
        }
    }
});

// indicates which submit button was clicked
subBtns.click(function(e) {
    subBtns.removeAttr('clicked');
    $(this).attr('clicked', 'true');
});

myForm.on('submit', function(e) {
    // get the uname and pword from the input fields
    var password = txtPword.val(),
        clickedBtn = $('button[clicked=true]').prop('id');
    username = txtUname.val();
    // clear any past errors
    errorField.text("");
    // if both fields exist
    if (username && password) {
        // login, conditionally showing marks
        doLogin(username, password, clickedBtn == 'btnShowMarks');
    } else {
        // otherwise print errror
        errorField.text("Please enter both your username and password.");
    }
    // prevent default submit action
    return false;
});

function doLogin(username, password, openMarks) {
    // indicate that we are loading
    toggleLoading();
    // get the omnivox login page
    $.ajax({
        method: 'get',
        url: baseUrl,
        error: function() {
            errorField.text("Unable to get login page. Is your network down?");
            toggleLoading();
        },
        success: function(data) {
            // create context
            var context = $(document.createElement('div')).append(data);
            // extract the form from the page
            var form = $('form', context).first();
            // setup postdata using passed uname and pword combo
            var postData = "TypeIdentification=Etudiant&NoDA=" + username + "&PasswordEtu=" + password + "&k=" + form.find('[name=k]').val();
            // log user in by posting data
            logIn(form.attr('method'), form.attr('action'), postData, {
                success: function() {
                    // store uname in localStorage since it has been verified by successful post
                    localStorage.username = username;
                    // update the number marks badge
                    updateMarks();
                    if (openMarks) {
                        // create tab with marks here
                        chrome.tabs.create({
                            url: marksPageUrl
                        });
                    }
                    // close the popup
                    window.close();
                },
                fail: function() {
                    errorField.text("Invalid username or password. Please try again.");
                    toggleLoading();
                }
            });
        }
    });
}

function toggleLoading() {
    loading.toggle();
    myForm.toggle();
}

function logIn(method, action, postData, callbacks) {
    $.ajax({
        method: method,
        url: loginPageBase + action,
        data: postData,
        error: function() {
            callbacks.fail();
        },
        success: function() {
            // set session cookie
            chrome.cookies.set({
                url: baseUrl,
                name: "IsSessionInitialise",
                value: "True"
            });
            callbacks.success();
        }
    });
}
