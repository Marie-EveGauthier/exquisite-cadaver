var retrieval = require('./retrieval.js');
var _ = require("underscore");
var $app = $('#app');
var $buttons = $('#buttons');

//Code defining the access token of logged in users
if (window.localStorage.getItem('accessToken') === null) {
    window.localStorage.setItem('accessToken', -1);
}
if (window.localStorage.getItem('storyId') === null) {
    window.localStorage.setItem('storyId', -1);
}
if (window.localStorage.getItem('userId') === null) {
    window.localStorage.setItem('userId', -1);
}
if (window.localStorage.getItem('username') === null) {
    window.localStorage.setItem('username', "Guest");
}

//This function creates the header in each view 
var $header = $('#header');
function createHeader(options) {
    $header.html('');
    var entryTemplateText = require('raw!../views/header.ejs');
    var template = _.template( entryTemplateText );
    var compiledTemplate = template({'accessToken': window.localStorage.getItem('accessToken')});
    $header.append(compiledTemplate);
    $header.foundation();
}

//This function creates the footer in each view
var $footer = $('#footer');
function createFooter(options) {
    $footer.html('');
    var entryTemplateText = require('raw!../views/footer.ejs');
    var template = _.template( entryTemplateText );
    var compiledTemplate = template();
    $footer.append(compiledTemplate);
}

//This function could deploy the layout with template

//var $layout = $('#layout');
//function deployingLayout() {
//    var entryTemplateText = require('raw!../views/layout.ejs');
//    var template = _.template( entryTemplateText );
//    var compiledTemplate = template();
//    $layout.append(compiledTemplate);
//    }    

  

//This function permits users to choose the length of a new story:

function createStory() {
    $buttons.html('');
    $app.html('');
    createHeader();
    var entryTemplateText = require('raw!../views/createStoryLength.ejs');
    var template = _.template(entryTemplateText);
    var compiledTemplate = template();
    $app.append(compiledTemplate);
    
    createFooter();
   
    // The function that's triggered when the length button is clicked
    //This function displays the form (with the length choosen) where users write the first line of a new story
    $(".length").on('click', function() {
        var numberOfLines = $(this).val();
        var entryTemplateText = require('raw!../views/createStoryText.ejs');
        var template = _.template(entryTemplateText);
        var compiledTemplate = template({'numberOfLines': numberOfLines});
        $app.append(compiledTemplate);
        $('.length').off('click');
        
        //Triggers a click when the enter key is being pressed
        $('.newLine').keypress(function (e) {
            var key = e.which;
            if(key == 13) {
                $('#newStory').click();
                return false;  
            }
        });
        
        //The ajax function that's triggered when the button in createStory is clicked
        $('#newStory').on("click", function() {
        var newLine = $('input[class=newLine]').val();
    
        if (!newLine || newLine.length < 1) {
            //To create a modal reveal with a template to advise the user to write something
            var entryTemplateText = require('raw!../views/emptyLineRevealModal.ejs');
            var template = _.template(entryTemplateText);
            var compiledTemplate = template();
            $app.append(compiledTemplate);
            $('#emptyLine').foundation('reveal', 'open');
        }
        else {
            var jqxhr = $.ajax({method: "POST", url: retrieval.API_URL + 'Stories/newstory', data: {'length': numberOfLines, 'lineText': newLine, 'userId': window.localStorage.getItem('userId'), 'username': window.localStorage.getItem('username')}})
                .done(function(data) {
                    var entryTemplateText = require('raw!../views/thanksToSubmitStoryRevealModal.ejs');
                    var template = _.template(entryTemplateText);
                    var compiledTemplate = template();
                    $app.append(compiledTemplate);
                    $('#thanksToSubmitStory').foundation('reveal', 'open');
                    $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
                        $(document).off('closed.fndtn.reveal', '[data-reveal]');
                        window.location.href = "#choice";
                    });
                })
                .fail(function(jqXHR, textStatus) {
                    if (jqXHR.status == 401) {
                        var entryTemplateText = require('raw!../views/problemRevealModal.ejs');
                        var template = _.template(entryTemplateText);
                        var compiledTemplate = template();
                        $app.append(compiledTemplate);
                        
                        $('#problem').foundation('reveal', 'open');
                    } else {
                        entryTemplateText = require('raw!../views/problemRevealModal.ejs');
                        template = _.template(entryTemplateText);
                        compiledTemplate = template();
                        $app.append(compiledTemplate);
                        
                        $('#problem').foundation('reveal', 'open');
                    }
                });
        }
        });
    });
        

}


//This function returns the completed stories in desc order of rating, a certain number per page
function seeCompletedStories(pageNum) {
    $buttons.html('');
    $app.html(''); 
    createHeader();
    
    $app.append('<a href="#"><button> Back to Main Menu </button></a>');
    // $app.append("<h3>All stories, descending order of rating:</h3>");
    retrieval.getStoriesByRating(pageNum).then(
        function(apiResultObject) {
            var stories = apiResultObject.arrayOfStories;
            var hasNextPage = apiResultObject.hasNextPage;
           
            stories.forEach(function(story){
                var id = story.id;
                var rating = story.rating;
                
                retrieval.getStoriesLines(story).then(
                function(lines) {
                    //This is the basic if we want to implemant a template 
                    // var entryTemplate = require('raw!../views/seeCompletedStories.ejs');
                    // var template = _.template(entryTemplate);
                    // var compiledTemplate = template();
                    // $app.append(compiledTemplate);
                    $app.append("<h2>Story #" + id + "</h2>");
                    $app.append("<h3>Rating: " + rating + "</h3>");
                    $app.append("<div id='votingThanks" + id + "' data-reveal-id='voting'><img id='downvoting" + id + "' src='../images/downarrow.png'><img id='upvoting" + id + "' src='../images/uparrow.png'></div>");
                    $app.append('<ul class="no-bullet">');
                    lines.forEach(function(line){
                        $app.append("<li>" + line.lineText + "  <i class='grey'>@" + line.username + "</i></li>");
                    });
                    //Voting functions
                    var token = window.localStorage.getItem('accessToken');
                    
                    $('#upvoting' + id).on("click", function(){
                        var alreadyVoted = JSON.parse(localStorage["storyId"]);
                        console.log(alreadyVoted);
                        
                        if (token === "-1") {
                            $('#votingThanks' + id).on("click", function(){
                            var entryTemplateText = require('raw!../views/votingErrorRevealModal.ejs');
                            var template = _.template(entryTemplateText);
                            var compiledTemplate = template();
                            $app.append(compiledTemplate);
                            $('#voting').foundation('reveal', 'open');
                            $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
                                $(document).off('closed.fndtn.reveal', '[data-reveal]');
                                window.location.reload();
                            });
                        }); 
                            
                        }
                        else {
                            $.ajax({method: "PUT", url: retrieval.API_URL + 'Stories/' + id, data: {'rating': (rating + 1)}});
                            
                            // var alreadyVoted = JSON.parse(localStorage["storyId"]);
                            // alreadyVoted.append(id);
                            // localStorage["storyId"] = JSON.stringify(alreadyVoted);
                            
                        $('#votingThanks' + id).on("click", function(){
                            var entryTemplateText = require('raw!../views/votingThanksRevealModal.ejs');
                            var template = _.template(entryTemplateText);
                            var compiledTemplate = template();
                            $app.append(compiledTemplate);
                            $('#voting').foundation('reveal', 'open');
                            $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
                                $(document).off('closed.fndtn.reveal', '[data-reveal]');
                                window.location.reload();
                            });
                        });   
                        }
                    });
                    
                    $('#downvoting' + id).click(function(){
                        if (token === "-1") {
                            $('#votingThanks' + id).on("click", function(){
                                var entryTemplateText = require('raw!../views/votingErrorRevealModal.ejs');
                                var template = _.template(entryTemplateText);
                                var compiledTemplate = template();
                                $app.append(compiledTemplate);
                                $('#voting').foundation('reveal', 'open');
                                $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
                                    $(document).off('closed.fndtn.reveal', '[data-reveal]');
                                    window.location.reload();
                                });
                            }); 
                        }
                        
                        else {
                            $.ajax({method: "PUT", url: retrieval.API_URL + 'Stories/' + id, data: {'rating': (rating - 1)}});
                            
                            // var alreadyVoted = JSON.parse(localStorage["storyId"]);
                            // alreadyVoted.append(id);
                            // localStorage["storyId"] = JSON.stringify(alreadyVoted);
                            
                            $('#votingThanks' + id).on("click", function(){
                                var entryTemplateText = require('raw!../views/votingThanksRevealModal.ejs');
                                var template = _.template(entryTemplateText);
                                var compiledTemplate = template();
                                $app.append(compiledTemplate);
                                $('#voting').foundation('reveal', 'open');
                                $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
                                    $(document).off('closed.fndtn.reveal', '[data-reveal]');
                                    window.location.reload();
                                });
                            });   


                        }
                    });

                });
                
            });

            return hasNextPage;
       } 
    ).then(
        function(hasNextPage) {
            //Previous page/next page buttons
            var previousPage = $('<a href="#seeall/p' + (pageNum - 1) + '"><button class="button round">previous page</button></a>');
            var nextPage = $('<a href="#seeall/p' + (pageNum + 1) + '"><button class="button round">next page</button></a>');
    
            //disable first previous page button
            if (pageNum !== 0) {
                $buttons.append(previousPage);
            }
            //disable last next button
            if (hasNextPage === true) {
                $buttons.append(nextPage);
            }    
        }
    );
    
    createFooter();
}

//This function displays one completed story at random:
function seeCompletedStory(){
    retrieval.getRandomStory().then(
        function(lines){
            lines.forEach(function(line){
                    var storyId = lines[1].storiesId;
            
                    $app.html('');
                    $buttons.html('');
                    createHeader();
                    var entryTemplateText = require('raw!../views/seeCompletedStory.ejs');
                    var template = _.template(entryTemplateText);
                    var compiledTemplate = template({'lines':lines, 'storyId':storyId});
                    $app.append(compiledTemplate);
                    
                    $('#randomize').on("click", function(){
                        window.location.reload();
                    });
            });
        }
    ); 
    createFooter();
}


//This function chooses one incomplete story at random for the user to continue:
function getStoryToContinue() {
    $app.html('');
    $buttons.html('');
    createHeader();
    

    retrieval.getIncompleteStory().then(
        function(story) {
            var exist = story.exist;
            var storyId = story.storyId;
            var storyLength = story.storyLength;

            
            if (exist === false) {
                $app.append('There are no more stories to continue. Why not start a new one?');
            }
            else {
                //gets all the lines from the story randomly chosen above
                retrieval.getLines(storyId).then(
                    function(linesOfSelectedStory) {
                        //gets the last written line of the story to continue
                        var lastLine = linesOfSelectedStory.length;
                        var previousLine = lastLine -1;
                        //If the story doesn't have a line yet, choose another story
                        if (lastLine === 0){
                            getStoryToContinue();
                        } else{

                            //This creates (with a template) the form to continue the story     
                            var entryTemplateText = require('raw!../views/getStoryToContinue.ejs');
                            var template = _.template(entryTemplateText);
                            var compiledTemplate = template({'previousLine':previousLine, 'linesOfSelectedStory':linesOfSelectedStory, 'storyId':storyId, 'lastLine':lastLine, 'storyLength':storyLength});
                            $app.append(compiledTemplate);
                            
                            /* To add a character countdown to show how much space they have remaining
                            var maxLength = 60;
                            $('.newLine').keyup(function() {
                              var length = $(this).val().length;
                              var length = maxLength-length;
                             $('#chars').text(length);
                            
                            });   */    
                            
                            $('.newLine').keypress(function (e) {
                                 var key = e.which;
                                 if(key == 13) {
                                    $('#submit').click();
                                    return false;  
                                  }
                            });
 
                            //The ajax function that's triggered when the button is clicked
                            $('#submit').on("click", function(){
                                var newLine = $('.newLine').val();
                                console.log(newLine);
                            
                                if (newLine === undefined || newLine.length < 1) {
                                    //To create a modal reveal with a template to advise the user to write something
                                    var entryTemplateText = require('raw!../views/emptyLineRevealModal.ejs');
                                    var template = _.template(entryTemplateText);
                                    var compiledTemplate = template();
                                    $app.append(compiledTemplate);
                                    $('#emptyLine').foundation('reveal', 'open');
                                } else {
                                    var jqxhr = $.ajax({method: "POST", url: retrieval.API_URL + 'Lines/newline', data: {'lineNumber': (lastLine + 1), 'storyId': storyId, 'lineText': newLine, 'userId': window.localStorage.getItem('userId'), 'username': window.localStorage.getItem('username') }})
                                    .done(function(data) {
                                        var entryTemplateText = require('raw!../views/thanksToSubmitLineRevealModal.ejs');
                                        var template = _.template(entryTemplateText);
                                        var compiledTemplate = template();
                                        $app.append(compiledTemplate);
                                        $('#thanksToSubmitLine').foundation('reveal', 'open');
                                        $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
                                            $(document).off('closed.fndtn.reveal', '[data-reveal]');
                                            window.location.href = "#choice";
                                        });                                        
                                    })
                                    .fail(function(jqXHR, textStatus) {
                                        if (jqXHR.status == 401) {
                                            var entryTemplateText = require('raw!../views/problemRevealModal.ejs');
                                            var template = _.template(entryTemplateText);
                                            var compiledTemplate = template();
                                            $app.append(compiledTemplate);
                                            
                                            $('#problem').foundation('reveal', 'open');
                                        } else {
                                            entryTemplateText = require('raw!../views/problemRevealModal.ejs');
                                            template = _.template(entryTemplateText);
                                            compiledTemplate = template();
                                            $app.append(compiledTemplate);
                                            
                                            $('#problem').foundation('reveal', 'open');
                                        }

                                    });
            
                                }    
                            }); 
                            
                          
                        }    
                    }
                );
            }
        }
    );
    createFooter();
}

//This function gives users some options after completing their line (also the app landing page during dev)

function nextSteps() {
    $buttons.html('');
    $app.html('');
    createHeader();
    
    var entryTemplateText = require('raw!../views/nextSteps.ejs');
    var template = _.template(entryTemplateText);
    var compiledTemplate = template();
    $app.append(compiledTemplate);
    
    createFooter();
}


function userLogin() {
    $buttons.html('');
    $app.html('');
    createHeader();
    var entryTemplateText = require('raw!../views/login.ejs');
    var template = _.template( entryTemplateText );
    var compiledTemplate = template();
    $app.append(compiledTemplate);
    
    //Triggers a click when the enter key is being pressed
    $('.pass').keypress(function (e) {
        var key = e.which;
        if(key == 13) {
            $('.signin').click();
            return false;  
        }
    });
    
    $(".signin").on('click' || 'keypress', function(){
        var email = $('input[class=email]').val();
        var password = $('input[class=pass]').val();
        if (!email || !password) {
            var entryTemplateText = require('raw!../views/emailAndPasswordMissingRevealModal.ejs');
            var template = _.template(entryTemplateText);
            var compiledTemplate = template();
            $app.append(compiledTemplate);
            $('#emailAndPasswordMissing').foundation('reveal', 'open');
        }
        else {
             var jqxhr = $.ajax( {method: "POST", url: retrieval.API_URL + 'users/login', data: {'email': email, 'password': password, 'ttl': 60*60*24*7*2 }})
            .done(function(data) {
                var url = retrieval.API_URL + 'users/' + data.userId;
                var jqxhr = $.ajax( {method: "GET", url: url, data: {}})
                    .done(function(userObject){
                        window.localStorage.setItem('accessToken', data.id);
                        window.localStorage.setItem('userId', data.userId);
                        window.localStorage.setItem('username', userObject.username);
                        var entryTemplateText = require('raw!../views/welcomeBackRevealModal.ejs');
                        var template = _.template(entryTemplateText);
                        var compiledTemplate = template({'data':data});
                        $app.append(compiledTemplate);
                        $('#welcomeBack').foundation('reveal', 'open');
        
                        $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
                        $(document).off('closed.fndtn.reveal', '[data-reveal]');
                        window.location.href = "app.html";
                        });
                    });
            })
            .fail(function(jqXHR, textStatus) {
                if (jqXHR.status == 401) {
                var entryTemplateText = require('raw!../views/problemRevealModal.ejs');
                var template = _.template(entryTemplateText);
                var compiledTemplate = template();
                $app.append(compiledTemplate);
                
                $('#problem').foundation('reveal', 'open');
                } else {
                    var entryTemplateText = require('raw!../views/problemRevealModal.ejs');
                    var template = _.template(entryTemplateText);
                    var compiledTemplate = template();
                    $app.append(compiledTemplate);
                    
                    $('#problem').foundation('reveal', 'open');
                }
            });
        }    
    });    
    createFooter();
}

function userLogout() {

   var jqxhr = $.ajax({method: "POST", url: retrieval.API_URL + 'users/logout?access_token=' + window.localStorage.getItem('accessToken')})
            .done(function(data) {
                window.localStorage.setItem('accessToken', -1);
                window.localStorage.setItem('userId', -1);
                window.localStorage.setItem('username', "Guest");
                var entryTemplateText = require('raw!../views/logOutRevealModal.ejs');
                var template = _.template(entryTemplateText);
                var compiledTemplate = template();
                $app.append(compiledTemplate);
                $('#logOut').foundation('reveal', 'open');
                
                $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
                $(document).off('closed.fndtn.reveal', '[data-reveal]');
                window.location.href = "../index.html";
                });
            })
            .fail(function(jqXHR, textStatus) {
                var entryTemplateText = require('raw!../views/problemRevealModal.ejs');
                var template = _.template(entryTemplateText);
                var compiledTemplate = template();
                $app.append(compiledTemplate);
                
                $('#problem').foundation('reveal', 'open');
                
            });

}


function userReg() {
    $buttons.html('');
    $app.html('');
    createHeader();
    var entryTemplateText = require('raw!../views/register.ejs');
    var template = _.template( entryTemplateText );
    var compiledTemplate = template();
    $app.append(compiledTemplate);
    
    //Triggers a click when the enter key is pressed
    $('.confirmPassword').keypress(function (e) {
        var key = e.which;
        if(key == 13) {
            $('.signup').click();
            return false;  
        }
    });
    
    $(".signup").on('click' || 'keypress', function(){
        var username = $('input[class=user]').val();
        var email = $('input[class=email]').val();
        var password = $('input[class=password]').val();
        var password2 = $('input[class=confirmPassword]').val();
          
        if (email === "" || email === null || username === "" || username === null) {
            var entryTemplateText = require('raw!../views/registerEmailAndPasswordMissingRevealModal.ejs');
            var template = _.template(entryTemplateText);
            var compiledTemplate = template();
            $app.append(compiledTemplate);
            $('#registerEmailAndPasswordMissing').foundation('reveal', 'open');
    }
        else if (password !== password2) {
            var entryTemplateText = require('raw!../views/registerPasswordDifferentRevealModal.ejs');
            var template = _.template(entryTemplateText);
            var compiledTemplate = template();
            $app.append(compiledTemplate);
            $('#registerPasswordDifferent').foundation('reveal', 'open');
        }
        else if (password.length < 8) {
            var entryTemplateText = require('raw!../views/registerPasswordShortRevealModal.ejs');
            var template = _.template(entryTemplateText);
            var compiledTemplate = template();
            $app.append(compiledTemplate);
            $('#registerPasswordShort').foundation('reveal', 'open');
        }

        else{
            var jqxhr = $.ajax( {method: "POST", url: retrieval.API_URL + 'users/newUser', data: {'username': username, 'email': email, 'password': password}} )
            .done(function(data) {
                var entryTemplateText = require('raw!../views/registerConfirmationRevealModal.ejs');
                var template = _.template(entryTemplateText);
                var compiledTemplate = template({'data':data});
                $app.append(compiledTemplate);
                $('#registerConfirmation').foundation('reveal', 'open');
                
                $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
                $(document).off('closed.fndtn.reveal', '[data-reveal]');
                window.location.href = "app.html";
                });
            })
            .fail(function(jqXHR, textStatus) {
                var entryTemplateText = require('raw!../views/registerAlreadyExistRevealModal.ejs');
                var template = _.template(entryTemplateText);
                var compiledTemplate = template();
                $app.append(compiledTemplate);
                $('#registerAlreayExist').foundation('reveal', 'open');

            });
            
        }
    });        
    
    createFooter();
}

function resetPassword() {
    $buttons.html('');
    $app.html('');
    createHeader();
    var entryTemplateText = require('raw!../views/passwordreset.ejs');
    var template = _.template( entryTemplateText );
    var compiledTemplate = template();
    $app.append(compiledTemplate);
    
    // $('.pass').bind('keypress', function(e) {
    //     if (e.which == 13) {
    //         $('#signin').click();
    //     }
    // });
    
    $(".reset").on('click' || 'keypress', function(){
        var email = $('input[class=email]').val();
        console.log(email);
        if (!email) {
            var entryTemplateText = require('raw!../views/passwordResetEmailMissingRevealModal.ejs');
            var template = _.template( entryTemplateText );
            var compiledTemplate = template();
            $app.append(compiledTemplate);
            $('#passwordResetEmailMissing').foundation('reveal', 'open');
            
        }
        else {

            var jqxhr = $.ajax( {method: "POST", url: retrieval.API_URL + 'users/reset', data: {'email': email}} )
            .done(function(data) {
                var entryTemplateText = require('raw!../views/passwordResetConfirmationRevealModal.ejs');
                var template = _.template(entryTemplateText);
                var compiledTemplate = template({'data':data});
                $app.append(compiledTemplate);
                $('#passwordResetConfirmation').foundation('reveal', 'open');

                
                $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
                $(document).off('closed.fndtn.reveal', '[data-reveal]');
                window.location.href = "app.html";
                });
            })
            .fail(function(jqXHR, textStatus) {
                var entryTemplateText = require('raw!../views/problemRevealModal.ejs');
                var template = _.template(entryTemplateText);
                var compiledTemplate = template();
                $app.append(compiledTemplate);
                $('#problem').foundation('reveal', 'open');
            });

        }
    });
    
    createFooter();
}

function newPassword(token) {
    $buttons.html('');
    $app.html('');
    createHeader();
    var entryTemplateText = require('raw!../views/newpassword.ejs');
    var template = _.template( entryTemplateText );
    var compiledTemplate = template();
    $app.append(compiledTemplate);
    
    $(".change").on('click' || 'keypress', function(){
        var password = $('input[class=password]').val();
        var password2 = $('input[class=confirmPassword]').val();
          
        if (password !== password2) {
            alert("Passwords don't match!");
        }
        else if (password.length < 8) {
            alert("Please choose a password with at least 8 characters.");
        }
        else {
            var jqxhr = $.ajax({method: "POST", url:retrieval.API_URL + 'users/changePassword', data: {'token': token, 'newPassword': password}})
                .done(function(data) {
                    var entryTemplateText = require('raw!../views/newpasswordworked.ejs');
                    var template = _.template(entryTemplateText);
                    var compiledTemplate = template({'data':data});
                    $app.append(compiledTemplate);
                    $('#welcomeBack').foundation('reveal', 'open');
    
                    $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
                    $(document).off('closed.fndtn.reveal', '[data-reveal]');
                    window.location.href = "app.html";
                    });
                })
                .fail(function(jqXHR, textStatus) {
                    if (jqXHR.status == 401) {
                    var entryTemplateText = require('raw!../views/problemRevealModal.ejs');
                    var template = _.template(entryTemplateText);
                    var compiledTemplate = template();
                    $app.append(compiledTemplate);
                    
                    $('#problem').foundation('reveal', 'open');
                    } else {
                        var entryTemplateText = require('raw!../views/problemRevealModal.ejs');
                        var template = _.template(entryTemplateText);
                        var compiledTemplate = template();
                        $app.append(compiledTemplate);
                        
                        $('#problem').foundation('reveal', 'open');
                    }
                });
  
        }
    });        
    
    createFooter();
}


module.exports = {
    'createStory': createStory,
    'seeCompletedStories': seeCompletedStories,
    'seeCompletedStory': seeCompletedStory,
    'getStoryToContinue': getStoryToContinue,
    'nextSteps': nextSteps,
    'userLogin': userLogin,
    'userReg': userReg,
    'userLogout': userLogout,
    'resetPassword': resetPassword,
    'newPassword': newPassword
};
