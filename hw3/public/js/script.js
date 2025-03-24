// Check if user is authenticated upon reload
async function checkAuthStatus() {
    try {
        const response = await fetch('/check-auth', {
            credentials: 'include'
        });
        const result = await response.json();

        console.log(result);

        const username = result.user.username;

        if (result.authenticated) {
            document.getElementById('login').style.display = 'none';   
            document.getElementsByClassName('main-content')[0].style.display = 'inline';
            const rightSideNav = document.getElementById('nav-right-side');
            rightSideNav.style.display = 'block';
            rightSideNav.innerHTML = username;
            populateTable();
        }
    } catch (error) {
        console.error("Error checking authentication:", error);
    }
}
window.onload = checkAuthStatus;

// Login Logic
async function login() {
    // Get username and password
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";

    try {
        const response = await fetch(`/login`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                username : username,
                password : password
            }),
        });

        const result = await response.json();

        // Populate DOM upon successful login
        if (result.username && result.password) {
            document.getElementById('login').style.display = 'none';   
            document.getElementsByClassName('main-content')[0].style.display = 'inline';
            const rightSideNav = document.getElementById('nav-right-side');
            rightSideNav.style.display = 'block';
            rightSideNav.innerHTML = username;
        }
        populateTable();
    } catch (error) {
        console.log(error);
        alert("Invalid credentials");
    }
}

// Populate Table
async function populateTable() {
    // Fetch all games
    const games = await fetch('/api/v1/games', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json" 
        }
    });
    const gamesJson = await games.json();

    // Fetch meta data
    const metaData = await fetch('/api/v1/meta', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json" 
        }
    });
    const metaDataJson = await metaData.json();

    // Populate DOM
    if (metaDataJson) {
        const player = document.getElementById('player');
        const computer = document.getElementById('computer');
        const color = document.getElementById('color');

        const computerToken = metaDataJson.tokens.find(token => token.id === metaDataJson.theme.computerToken);
        const playerToken = metaDataJson.tokens.find(token => token.id === metaDataJson.theme.playerToken);

        for (let i = 0; i < metaDataJson.tokens.length; i++) {
            const token = metaDataJson.tokens[i];
            const option = document.createElement('option');
            option.value = token.name;
            option.text = token.name;
            player.add(option);
            computer.add(option.cloneNode(true));
        }

        computer.value = computerToken.name;
        player.value = playerToken.name;
        color.value = metaDataJson.theme.color;

        updateOptions(player, computer);
        updateOptions(computer, player);

        player.addEventListener('change', () => updateOptions(player, computer));
        computer.addEventListener('change', () => updateOptions(computer, player));
    }

    // Create rows
    for (let i = 0; i < gamesJson.length; i++) {
        const game = gamesJson[i];
        addRowToGameTable(game);
    }
}

// Ensure options are not enabled and duplicated
function updateOptions(selected, other) {
    Array.from(other.options).forEach(option => option.disabled = false);
    if(selected.value) {
        const optionToDisable = other.querySelector(`option[value="${selected.value}"]`);
        if (optionToDisable) {
            optionToDisable.disabled = true;
        }
    }
}

// Logout logic
async function logout() {
    try {
        const response = await fetch(`/logout`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json" 
            },
        });

        if (document.getElementsByClassName('game-board-content')[0].style.display === 'flex') {
            returnToMain();
        }

        // Clear DOM and return to login
        document.getElementById('login').style.display = 'flex';
        const gameBoard = document.getElementsByClassName('game-table')[0];
        const rows = gameBoard.getElementsByTagName('tr');
        for (let i = rows.length - 1; i > 0; i--) {
            gameBoard.deleteRow(i);
        }
        document.getElementById('player').innerHTML = '';
        document.getElementById('computer').innerHTML = '';
        document.getElementsByClassName('main-content')[0].style.display = 'none';
        document.getElementById('nav-right-side').style.display = 'none';
    } catch (error) {
        console.log(error);
    }
}

// Create a game, called upon 'CREATE' button pressed
async function createGame() {
    try {
        const color = document.getElementById('color').value;
        const playerTokenName = document.getElementById('player').value;
        const computerTokenName = document.getElementById('computer').value;

        const response = await fetch(`/api/v1/games`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                color : color,
                playerTokenName : playerTokenName,
                computerTokenName : computerTokenName
            }),
        });

        const result = await response.json();
        document.getElementsByClassName('main-content')[0].style.display = 'none';
        loadGame(result, 'player');
    } catch (error) {
        console.log(error);
    }
}

// Add a row to the game table
function addRowToGameTable(game) {
    // Create row and respective cells
    const gameTable = document.getElementsByClassName('game-table')[0];
    const row = gameTable.insertRow();
    const statusCell = row.insertCell();
    const playerCell = row.insertCell();
    const computerCell = row.insertCell();
    const timeStartedCell = row.insertCell();
    const timeFinishedCell = row.insertCell();
    const viewCell = row.insertCell();

    // Format status
    statusCell.innerHTML = game.status;

    // Format player select
    const playerTokenDiv = document.createElement('div');
    playerTokenDiv.classList.add('token');
    const encodedPlayerUrl = encodeURI(game.theme.playerToken.url);
    const playerTokenUrl = `url("..${encodedPlayerUrl}")`;
    playerTokenDiv.style.backgroundImage = playerTokenUrl;
    playerCell.appendChild(playerTokenDiv);

    // Format computer select
    const computerTokenDiv = document.createElement('div');
    computerTokenDiv.classList.add('token');
    const encodedComputerUrl = encodeURI(game.theme.computerToken.url);
    const computerTokenUrl = `url("..${encodedComputerUrl}")`;
    computerTokenDiv.style.backgroundImage = computerTokenUrl;
    computerCell.appendChild(computerTokenDiv);

    // Format dates
    const startDate = new Date(game.start);
    const formattedStartDate = startDate.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    timeStartedCell.innerHTML = formattedStartDate;

    if (game.end === undefined) {
        timeFinishedCell.innerHTML = '-';
    } else {
        row.classList.add('finished');
        const endDate = new Date(game.end);
        const formattedEndDate = endDate.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        timeFinishedCell.innerHTML = formattedEndDate;
    }

    // Format view button
    const viewButton = document.createElement('div');
    viewButton.classList.add('view-button');
    viewButton.innerHTML = 'view';
    viewButton.style.backgroundColor = game.theme.color;
    viewButton.id = game.id;
    viewButton.addEventListener('click', (e) => {
        viewGame(e.target.id);
    });
    viewCell.appendChild(viewButton);
}

// Load a game
function loadGame(game, player) {
    // Show game board
    const gameBoard = document.getElementsByClassName('game-board-content')[0];
    gameBoard.style.display = 'flex';
    const actualGameBoard = document.getElementsByClassName('game-board')[0];
    actualGameBoard.style.backgroundColor = game.theme.color;
    const gameState = document.getElementsByClassName('game-state')[0];
    gameState.innerHTML = game.game.status;

    // Add event listeners and add tokens to first row
    const encodedURL = encodeURI(game.theme.playerToken.url);
    const firstRow = document.getElementsByClassName('game-board-first-row')[0];
    firstRow.style.backgroundImage = 'none';
    for (let i = 0; i < firstRow.children.length; i++) {
        firstRow.children[i] = removeAllEventListeners(firstRow.children[i]);
        firstRow.children[i].style.pointerEvents = 'auto';

        firstRow.children[i].addEventListener('mouseover', (e) => {
            firstRow.children[i].style.backgroundImage = `url("..${encodedURL}")`;
        });

        firstRow.children[i].addEventListener('mouseout', (e) => {
            firstRow.children[i].style.backgroundImage = 'none';
        });
        firstRow.children[i].addEventListener('click', (e) => {
            playerMove(game, player, i);
        });
    }

    // Clear tokens from board everywhere else
    const tokens = document.getElementsByClassName('game-board-cell');
    for (let i = 0; i < tokens.length; i++) {
        if(tokens[i].children.length > 0) {
            tokens[i].children[0].remove();
        }
    }

    // Set victory/loss animation in first row
    if(game.game.status === 'VICTORY') {
        firstRow.style.zIndex = '999';
        firstRow.style.backgroundImage = "url('../assets/fireworks-exploding.gif')";
    } else if(game.game.status === 'LOSS') {
        firstRow.style.zIndex = '999';
        firstRow.style.backgroundImage = "url('../assets/crying-smiley-face.gif')";
    }
}

// Return to the table page after return is clicked
async function returnToMain() {
    const gameBoard = document.getElementsByClassName('game-board-content')[0];
    gameBoard.style.display = 'none';
    document.getElementsByClassName('main-content')[0].style.display = 'inline';

    const gameTable = document.getElementsByClassName('game-table')[0];
    const rows = gameTable.getElementsByTagName('tr');
    for (let i = rows.length - 1; i > 0; i--) {
        gameTable.deleteRow(i);
    }

    document.getElementById('player').innerHTML = '';
    document.getElementById('computer').innerHTML = '';

    populateTable();
}

// Logic for editing a game on server and on client
async function playerMove(game, player, move) {
    // Check if move is valid
    if(move < 0 || move > 6) {
        return;
    }

    // Check if game is over
    if(game.game.status === 'VICTORY' || game.game.status === 'LOSE' || game.game.status === 'TIE') {
        return;
    }

    // Send move to server
    const request = await fetch(`/api/v1/games/${game.game.id}`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ move, player }), 
    });
    const result = await request.json();

    // Find the row where the token was placed in the selected column
    const grid = result.game.grid;
    let row = null;
    for(let r = 0; r < grid.length; r++) {
        if(grid[r][move] === player) {
            row = r;
            break;
        }
    }
    
    // Add the token to the DOM based on type of player
    if(row !== null) {
        // Get the token image URL based on which player
        const tokenImgUrl = player === 'player' 
            ? encodeURI(game.theme.playerToken.url) 
            : encodeURI(game.theme.computerToken.url);
        
        // Create and add the token to the DOM
        const tokenElement = document.createElement('div');
        tokenElement.classList.add('token');
        tokenElement.classList.add('game-token');
        tokenElement.style.backgroundImage = `url("..${tokenImgUrl}")`;
        
        // Get all the rows in the game board
        const rows = document.querySelectorAll('.game-board-row');
        
        // Find the specific cell where the token should be placed
        if(rows[row]) {
            const cell = rows[row].children[move];
            if(cell) {
                cell.appendChild(tokenElement);
            }
        }
    }
    
    // Update the game status if needed
    if(result.game.status !== game.game.status) {
        const gameStateElement = document.querySelector('.game-state');
        if(gameStateElement) {
            gameStateElement.textContent = result.game.status;
        }
        game.game.status = result.game.status;
    }
    
    // If the game is still going and this was a player move, make a computer move
    if(player === 'player' && result.game.status !== 'VICORY' && result.game.status !== 'LOSS' && result.game.status !== 'TIE') {
        setTimeout(() => {
            computerMove(result);
        }, 200);
    }

    // Set victory/loss animation in first row and disable click functionality
    const firstRow = document.querySelector('.game-board-first-row');
    if(result.game.status === 'VICTORY') {
        for(let i = 0; i < 7; i++) {
            firstRow.children[i].style.pointerEvents = "none";
        }
        firstRow.style.zIndex = '999';
        firstRow.classList.add('ending-screen');
        firstRow.style.backgroundImage = "url('../assets/fireworks-exploding.gif')";
    } else if(result.game.status === 'LOSS') {
        for(let i = 0; i < 7; i++) {
            firstRow.children[i].style.pointerEvents = "none";
        }
        firstRow.style.zIndex = '999';
        firstRow.classList.add('ending-screen');
        firstRow.style.backgroundImage = "url('../assets/crying-smiley-face.gif')";
    }
}

// Function to make a computer move
async function computerMove(game) {
    // Ensure the game is still going
    let validMove = false;
    let move;
    while(!validMove && game.game.status === 'UNFINISHED') {
        move = Math.floor(Math.random() * 7);
        
        // Check if the column is not full
        if(game.game.grid && game.game.grid[0] && !game.game.grid[0][move]) {
            validMove = true;
        }
    }
    
    // If a valid move was found, make the move
    if(validMove) {
        return await playerMove(game, 'computer', move);
    }
    
    return null;
}

// Upon pressing the view button on client side
async function viewGame(gameId) {
    // Hide main content
    const mainContent = document.getElementsByClassName('main-content')[0];
    mainContent.style.display = 'none';

    // Fetch specified game
    const request = await fetch(`/api/v1/games/${gameId}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json" 
        }
    });
    const game = await request.json();

    // Show game board
    const gameBoard = document.getElementsByClassName('game-board-content')[0];
    gameBoard.style.display = 'flex';
    const actualGameBoard = document.getElementsByClassName('game-board')[0];
    actualGameBoard.style.backgroundColor = game.theme.color;

    // Clear tokens from board
    const tokens = document.getElementsByClassName('game-board-cell');
    for (let i = 0; i < tokens.length; i++) {
        if(tokens[i].children.length > 0) {
            tokens[i].children[0].remove();
        }
    }

    // Add event listeners and add tokens to first row
    const encodedURL = encodeURI(game.theme.playerToken.url);
    const firstRow = document.getElementsByClassName('game-board-first-row')[0];
    firstRow.style.backgroundImage = 'none';
    for (let i = 0; i < firstRow.children.length; i++) {
        firstRow.children[i] = removeAllEventListeners(firstRow.children[i]);

        firstRow.children[i].style.pointerEvents = 'auto';


        firstRow.children[i].addEventListener('mouseover', (e) => {
            firstRow.children[i].style.backgroundImage = `url("..${encodedURL}")`;
        });

        firstRow.children[i].addEventListener('mouseout', (e) => {
            firstRow.children[i].style.backgroundImage = 'none';
        });
        firstRow.children[i].addEventListener('click', (e) => {
            const data = { game : {
                ...game, theme: game.theme._id
            },
            theme: game.theme
            };
            console.log(data);
            playerMove(data, 'player', i);
        });
    }

    // Add tokens to board
    const gridLength = game.grid.length;
    const columnLength = game.grid[0].length;
    if(gridLength > 0) {
        for (let i = 0; i < gridLength; i++) {
            for (let j = 0; j < columnLength; j++) {
                if (game.grid[i][j]) {
                    var newEncodedURL = null;
                    if(game.grid[i][j] === 'player') {
                        newEncodedURL = encodeURI(game.theme.playerToken.url);
                    } else {
                        newEncodedURL = encodeURI(game.theme.computerToken.url);
                    }
                    const tokenDiv = document.createElement('div');
                    const tokenUrl = `url("..${newEncodedURL}")`;
                    tokenDiv.classList.add('token');
                    tokenDiv.classList.add('game-token');
                    tokenDiv.style.backgroundImage = tokenUrl;
                    tokens[(i+1) * 7 + j].appendChild(tokenDiv);
                }
            }
        }
    }

    // Set victory/loss animation in first row and disable click functionality 
    document.getElementsByClassName('game-state')[0].innerHTML = game.status;
    if(game.status === 'VICTORY') {
        for(let i = 0; i < 7; i++) {
            firstRow.children[i].style.pointerEvents = "none";
        }
        firstRow.style.zIndex = '999';
        firstRow.classList.add('ending-screen');
        firstRow.style.backgroundImage = "url('../assets/fireworks-exploding.gif')";
    } else if(game.status === 'LOSS') {
        for(let i = 0; i < 7; i++) {
            firstRow.children[i].style.pointerEvents = "none";
        }
        firstRow.style.zIndex = '999';
        firstRow.classList.add('ending-screen');
        firstRow.style.backgroundImage = "url('../assets/crying-smiley-face.gif')";
    }
}

// Remove all event listeners from an element
function removeAllEventListeners(element) {
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    return newElement;
}