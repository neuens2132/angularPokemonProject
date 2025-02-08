
var feeds = null;
var sid = null;
var time = null;
let button = document.getElementById("load-button");


function loadNews() {
    let feedSelect = document.getElementsByClassName("feed-select")[0];

    // create XMLHttpRequest
    let xhr = new XMLHttpRequest();

    let baseURL = "http://138.49.184.106:3000/api/v1/feeds";
    xhr.open("GET", baseURL, true);

    xhr.onreadystatechange = function() {
        // If the statechange is appropriate
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                // Parse JSON into js object
                let rawData = JSON.parse(xhr.responseText);
                feeds = rawData.feeds;

                // Create options
                for (let i = 0; i < feeds.length; i++) {
                    let option = document.createElement("option");
                    feedSelect.appendChild(option);
                    option.text = feeds[i].name;
                    option.value = feeds[i].name;
                }

                // Load values and initial feed
                sid = rawData.sid;
                time = rawData.time;
                loadFeed();

            } catch (e) {
                console.log(e);
            }
        }
    };

    // Sending the request
    xhr.send();
}

function loadFeed() {
    let feedSelect = document.getElementsByClassName("feed-select")[0];
    let websiteContainer = document.getElementsByClassName("website-container")[0];
    let feedName = feedSelect.value;
    let desiredMapping = feeds.find(feed => feed.name === feedName).mapping || null;

    // Clear the feed on new feed load
    removeAllButFirstChild(websiteContainer);
    
    // create XMLHttpRequest
    let xhr = new XMLHttpRequest();

    // URL including sid and desired feed
    let baseURL = "http://138.49.184.106:3000/api/v1/feeds/" + sid + "/" + feedName;
    xhr.open("GET", baseURL, true);

    xhr.onreadystatechange = function() {
        // If the statechange is appropriate
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                // Parse JSON into js object
                let rawData = JSON.parse(xhr.responseText);
                let articles = rawData.items;

                for (let i = 0; i < articles.length; i++) {
                    // Create div for a given article
                    let article = document.createElement("div");
                    websiteContainer.appendChild(article);

                    // Create a div for the headline
                    let headline = document.createElement("div");
                    headline.classList.add("headline");
                    headline.innerHTML = articles[i][desiredMapping.title];
                    article.appendChild(headline);

                    // Create a div for the timestamp
                    let timestamp = document.createElement("div");
                    timestamp.className = "timestamp";
                    timestamp.innerHTML = articles[i][desiredMapping.pubDate];
                    article.appendChild(timestamp);

                    // Create a div for the description
                    let description = document.createElement("div");
                    description.className = "description";
                    description.innerHTML = articles[i][desiredMapping.contentSnippet];
                    article.appendChild(description);

                }

            // Error catching
            } catch (e) {
                console.log(e);
            }
        }
    };

    // Sending the request
    xhr.send();

}

// remove all of the elements in website container except for option-container
function removeAllButFirstChild(div) {
    while (div.childNodes.length > 2) {
        div.removeChild(div.lastChild);
    }
}

// load the different types of news feeds onload
window.onload = loadNews;




