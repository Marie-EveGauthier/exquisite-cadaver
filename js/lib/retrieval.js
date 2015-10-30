
//Modify this variable after migrating the api to heroku
var API_URL = 'https://exquisite-cadaver-api.herokuapp.com/api/';

var nbPerPage = 2;

// Data retrieval functions
function startNewStory(){
    return $.getJSON(API_URL + 'Stories').then(
        function(result) {
            var newStoryId = result.length + 1;
            return $.getJSON(API_URL + 'Lines').then(
                function(linesResult){
                    var newLineId = linesResult.length;
                    return {
                        newLineId: newLineId,
                        newStoryId: newStoryId
                    };
                }
            );
        }
    );
}

function getStoriesByRating(pageNum) {
    return $.getJSON(API_URL + 'Stories?filter={"order":"rating%20DESC","skip":' + pageNum * nbPerPage + ',"limit":' + (nbPerPage + 1) + ',"where":{"incomplete":"false"}}').then(
        function(result) {
            if (result.length > nbPerPage) {  //storyNb
                var hasNextPage = true;
                result = result.slice(0, nbPerPage); //storyNb
            }
            else {
                hasNextPage = false;
            }
            
            return {
                hasNextPage: hasNextPage,
                arrayOfStories: result
            };
        }
    );
}

function getStoriesLines(story) {
    var id = story.id;
    return $.getJSON(API_URL + 'Stories/' + id + '/Lines?filter={"fields":["lineText","userId","username"]}');
    // .then(
    //     function(result){
    //         var userId = result.userId;
    //         var lineText = result.lineText;
            
    //         $.getJSON(API_URL + 'user/' + userId)
            
    //         return {
    //             lineText: lineText,
    //             username: 
    //         }
    //     }    
    // );
}



function getRandomStory() {
    var arrayOfStories = [];
    return $.getJSON(API_URL + 'Stories').then(
        function(result) {
            //collects in an array the ids of the stories that have been completed
            result.forEach(function(story) {
                if (story.incomplete === false) {
                    arrayOfStories.push(story.id);
                }
            });
        }
    ).then(
        function() {
            //this will return one of the array's id at random
            var poz = Math.floor( Math.random() * arrayOfStories.length );
            return arrayOfStories[poz];
        }
    ).then(
        function(storyId) {
            //gets all the lines from the story randomly chosen above
            return $.getJSON(API_URL + 'Stories/' + storyId + '/Lines');
        }    
    );        
}

function getIncompleteStory(){
    var arrayOfStories = [];
    return $.getJSON(API_URL + 'Stories').then(
        function(result) {
            //collects in an array the ids of the stories that haven't been completed
            result.forEach(function(story) {
                if (story.incomplete === true) {
                    arrayOfStories.push(story.id);
                }
            });
        }
    ).then(
        function() {
            if (arrayOfStories.length === 0) {
                var exist = false;
            }
            else {
                exist = true;
                //this will return one of the array's id at random
                var poz = Math.floor( Math.random() * arrayOfStories.length );
                var storyId = arrayOfStories[poz];
                
                return $.getJSON(API_URL + 'Stories/' + storyId).then(
                    function(storyInfo) {
                        var storyLength = storyInfo.length;
                        return {
                            'storyId': storyId,
                            'exist': exist,
                            'storyLength': storyLength
                        };
                    }    
                );

            }    
        }
    );       
}

function getLines(storyId){
    return $.getJSON(API_URL + 'Stories/' + storyId + '/Lines');
}



module.exports = {
    'getRandomStory': getRandomStory,
    'API_URL': API_URL,
    'getStoriesLines': getStoriesLines,
    'getStoriesByRating': getStoriesByRating,
    'getIncompleteStory': getIncompleteStory,
    'getLines': getLines,
    'startNewStory': startNewStory
};
            