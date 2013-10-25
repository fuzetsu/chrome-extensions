var username = localStorage.username,
    txtPword = $('#txtPword'),
    txtUname = $('#txtUname'),
    myForm = $('.form'),
    btnShowMarks = $('#btnShowMarks'),
    errorField = $('p.error'),
    baseUrl = "https://cegep-heritage.omnivox.ca/",
    marksPageUrl = baseUrl + "intr/Module/ServicesExterne/Skytech.aspx?IdServiceSkytech=Skytech_Omnivox&lk=%2festd%2fcvie%3fmodule%3dnote%26item%3dintro",
    loginPageBase = baseUrl + "intr/Module/Identification/Login/";

// check if logged in
checkLoggedIn(function(isLoggedIn) {
    if (isLoggedIn) {
        // open marks page
        chrome.tabs.create({
            url: marksPageUrl
        });
    } else {
        // not logged in so: hide the loading image
        $('.loading').hide();
        // show the form
        myForm.show();
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

myForm.on('submit', function(e) {
    // get the uname and pword from the input fields
    var username = txtUname.val(),
        password = txtPword.val();
    // clear any past errors
    errorField.text("");
    // if both fields exist
    if (username && password) {
        // load marks
        loadMarks(username, password);
    } else {
        // otherwise print errror
        errorField.text("Please enter both your username and password.");
    }
    // prevent default submit action
    return false;
});

function loadMarks(username, password) {
    // get the omnivox login page
    $.ajax({
        method: 'get',
        url: baseUrl,
        error: function() {
            errorField.text("Unable to get login page. Is your network down?");
        },
        success: function(data) {
            // create context
            var context = $(document.createElement('div')).append(data);
            // extract the form from the page
            var form = $('form', context).first();
            // setup postdata using passed uname and pword combo
            var postData = "TypeIdentification=Etudiant&NoDA=" + username + "&PasswordEtu=" + password + "&k=" + form.find('[name=k]').val();
            // log user in by posting data
            logIn(form.attr('method'), form.attr('action'), postData);
        }
    });
}

function logIn(method, action, postData) {
    $.ajax({
        method: method,
        url: loginPageBase + action,
        data: postData,
        error: function() {
            errorField.text("Invalid username or password. Please try again.");
        },
        success: function() {
            // store uname in localStorage since it has been verified by successful post
            localStorage.username = username;
            // create tab with marks here
            chrome.tabs.create({
                url: marksPageUrl
            });
            // set session cookie
            chrome.cookies.set({
                url: baseUrl,
                name: "IsSessionInitialise",
                value: "True"
            });
        }
    });
}

function checkLoggedIn(callback) {
    $.get(baseUrl, function(data) {
        // if we are logged in
        if (data.indexOf('Calendar of Events') != -1) {
            callback(true);
        } else {
            callback(false);
        }
    });
}