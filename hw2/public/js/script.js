var XToken = null;

async function getCards() {
    // Grab the main content div
    const contentBody = document.getElementById("main-card-content");
    const contentBodyChildren = contentBody.children;

    // Remove all of the children, prep for new cards
    while(contentBodyChildren.length > 0) {
        contentBody.removeChild(contentBodyChildren[0]);
    }

    // Empty Rating input box
    document.getElementById('rating').value = "";

    // Show the loading svg
    const loading = document.getElementById("loading-overlay");
    loading.style.display = "flex";

    // Call the server
    const query = document.getElementById("query").value.trim();
    const response = await fetch(`/api/v1/cards?search=${encodeURIComponent(query)}`, {
        headers: {
            "X-Token" : XToken
        }
    });
    const result = await response.json();

    // Create the left side of the main page
    const cards = document.createElement("div");
    cards.classList.add("main-card-content-left");
    cards.id = 'main-card-content-left';
    const cardsArray = Object.values(result.cards);
    console.log(cardsArray);

    if(cardsArray.length > 0) {
        // Populate the first image
        const firstImage = cardsArray[0].imageUrl;
            
        // For each card, manage all of the DOM details
        cardsArray.forEach( (card) => {
            const innerCard = document.createElement("div");
            innerCard.classList.add("main-card-content-left-inner");
            innerCard.id = card.id;
            innerCard.innerHTML = card.name;
            innerCard.addEventListener('mouseenter', handleHover);
            const tag = document.createElement("div");
            tag.classList.add("tag");
            if(card.kind == "POKEMON") {
                tag.classList.add("pokemon-tag");
                tag.innerHTML = "P";
            } else {
                tag.classList.add("magic-tag");
                tag.innerHTML = "M";
            }
            innerCard.appendChild(tag);
            cards.appendChild(innerCard);
        });

        // Append the first image to the DOM
        contentBody.appendChild(cards);
        const img = document.createElement("img");
        img.classList.add("main-card-content-right");
        img.src = firstImage;
        contentBody.appendChild(img);
    } else {
        // Create an error div
        const errorDiv = document.createElement("div");
        errorDiv.classList.add('noCards');
        errorDiv.innerHTML = `No cards contain the filter: ${query}`;
        contentBody.appendChild(errorDiv);
    }
    // Remove the loading screen
    loading.style.display = "none";
}

async function handleHover(event) {
    // Call the server
    const cardId = event.currentTarget.id;
    const cardData = await fetch("/api/v1/cards/" + cardId);
    const result = await cardData.json();

    // Remove the card image
    const cardContent = document.getElementById('main-card-content');
    const cardPicture = document.getElementsByClassName('main-card-content-right')
    cardContent.removeChild(cardPicture[0]);

    // Append image of hovered div's card
    const img = document.createElement("img");
    img.classList.add("main-card-content-right");
    img.id = result.id;
    img.src = result.imageUrl;
    cardContent.appendChild(img);

    // Grab a given cards rating
    const rating = await fetch("/api/v1/cards/" + result.id + "/rating", {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "X-Token": XToken
        }
    });
    const ratingResult = await rating.json();

    // Change the rating div's value
    const ratingDiv = document.getElementById('rating');
    ratingDiv.value = ratingResult.Rating;
}

async function login() {
    // Grab the entered username and password
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`/login`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            username : username,
            password : password
        }),
    })

    const result = await response.json();

    if(result.headers) {
        XToken = result.headers['X-Token'];
    }

    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
    if(XToken) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        const rightSideNav = document.getElementById('nav-right-side');
        rightSideNav.style.display = 'block';
        rightSideNav.innerHTML = username;
    } else {
        alert("Invalid username or password");
    }
}

async function logout() {
    const response = await fetch(`/logout`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-Token": XToken 
        },
    })
    const result = await response.json();

    XToken = null;
    document.getElementById('login').style.display = 'grid';
    document.getElementById('query').value = "";
    document.getElementById('rating').value = "";
    document.getElementById('main-card-content').innerHTML = "";
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('nav-right-side').style.display = 'none';
}

async function updateUserRating() {
    const ratingDiv = document.getElementById('rating');
    const newRating = ratingDiv.value;
    const cardDiv = document.getElementsByClassName('main-card-content-right');
    const cardId = cardDiv[0].id;

    const request = await fetch('/api/v1/cards/' + cardId + '/rating', {
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            "X-Token": XToken 
        },
        body: JSON.stringify({
            "Rating": newRating
        }) 
    });

    const result = await request.json();
    
    console.log(result);
}