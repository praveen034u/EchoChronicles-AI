let currentPlayerX = 0; // Player starts at position (0, 0)
let currentPlayerY = 0;
let worldMap = []; // Initialize with terrain data once it's loaded

// Function to call the generateTerrain Lambda function
async function fetchGeneratedTerrain(playerId,  playerX, playerY) {
    const apiUrl = "https://nee5ghu8w7.execute-api.us-east-1.amazonaws.com/dev/generateTerrain"; // Replace with your API Gateway URL

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playerId: playerId,
                playerX:playerX,
                playerY:playerY,
                width:50,
                height:50
            })
        });

        if (!response.ok) {
            throw new Error("Failed to fetch terrain: " + response.statusText);
        }

        const data = await response.json();
        currentPlayerX = data.playerX;
        currentPlayerY = data.playerY;
        worldMap = data.terrain;
        initializeGame(worldMap);
        

    } catch (error) {
        console.error("Error fetching terrain:", error);
    }
}

function initializeGame(terrain) {
    worldMap = terrain; // Assign the generated terrain to the world map
    currentPlayerX = Math.floor(terrain.length / 2); // Start in the middle
    currentPlayerY = Math.floor(terrain[0].length / 2);
    revealTerrain(currentPlayerX, currentPlayerY, worldMap); // Reveal initial terrain
    updateTerrainUI(worldMap); // Render the initial map
}

// Function to update the UI with the terrain data
function updateTerrainUI(worldMap) {
    const terrainContainer = document.getElementById("terrain-container");
    terrainContainer.innerHTML = "";

                // display: grid;
                // gap: 1px;
                // background: #ccc;
                // padding: 10px;
                // max-width: 800px;
                // margin: 20 auto;
                // border: 2px solid rgba(0,0,0,0.1);
                //   margin: 0 auto;

     // Add CSS if not already present
     if (!document.getElementById('terrain-styles')) {
        const style = document.createElement('style');
        style.id = 'terrain-styles';
        style.textContent = `
            .terrain-container {
              border: 5px solid black;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: auto;
              max-height: 80vh;
              max-width: 80vw;
            }
            .terrain-row {
                display: flex;
            }
            .terrain-tile {
                width: 20px;
                height: 20px;
                display: inline-block;
                position: relative;
            }
            .grass { background-color: #90EE90; }
            .water { background-color:rgb(21, 120, 147); }
            .mountain { background-color: #8B4513; }
            .hidden { 
                background-color: #333;
                opacity: 0.5;
            }
            img {
              position: absolute;
              top: 0;
              left: 0;
    }   
        `;
        document.head.appendChild(style);
    }
   
   

    terrainContainer.innerHTML = ""; // Clear previous map

    worldMap.forEach((row, x) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";

        row.forEach((tile, y) => {
            const tileDiv = document.createElement("div");
            tileDiv.className = `tile ${tile.type}`;

            if (tile.isLandmark) {
                tileDiv.style.border = "2px solid gold"; // Highlight landmarks
                tileDiv.style.opacity = 1; // Always visible
            } else if (tile.discovered) {
                tileDiv.style.opacity = 1; // Fully visible
            } else {
                tileDiv.style.opacity = 0.1; // Grayed-out areas
                tileDiv.style.filter = "blur(3px)"; // Add blur effect
            }

           // Add player indicator
           if (currentPlayerX === x && currentPlayerY === y) {
              tileDiv.classList.add("player");
              const playerImage = document.createElement("img");
              playerImage.src = "player1.gif"; // Path to player image
              playerImage.alt = "Player";
              playerImage.style.width = "100%";
              playerImage.style.height = "100%";
              tileDiv.appendChild(playerImage);  
              tileDiv.setAttribute("id", "player-tile"); // Add id to player tile for scrolling
            }
          rowDiv.appendChild(tileDiv);
        });

        terrainContainer.appendChild(rowDiv);
    });
}

// Update the world as the player moves
document.addEventListener("keydown", (event) => {
    
    let direction;
    switch (event.key) {
        case "ArrowUp":
            direction = "up";
            break;
        case "ArrowDown":
            direction = "down";
            break;
        case "ArrowLeft":
            direction = "left";
            break;
        case "ArrowRight":
            direction = "right";
            break;
        default:
            return; // Ignore other keys
    }

    // Assume currentPlayerX, currentPlayerY, and worldMap are globally accessible
    const { playerX, playerY } = movePlayer(currentPlayerX, currentPlayerY, direction, worldMap);
    currentPlayerX = playerX;
    currentPlayerY = playerY;
    saveGameState();

    // Scroll to keep the player visible
    scrollToPlayer(playerX, playerY);
    
    // Re-render the world
    updateTerrainUI(worldMap); 
});

function movePlayer(playerX, playerY, direction, worldMap) {
    switch (direction) {
        case 'up': playerX--; break;
        case 'down': playerX++; break;
        case 'left': playerY--; break;
        case 'right': playerY++; break;
    }

    // Ensure the player doesn't move out of bounds
    playerX = Math.max(0, Math.min(playerX, worldMap.length - 1));
    playerY = Math.max(0, Math.min(playerY, worldMap[0].length - 1));

    // Reveal surrounding terrain
    revealTerrain(playerX, playerY, worldMap);
     
    // Trigger events based on new tile
     const currentTile = worldMap[playerX][playerY];
     if (currentTile) {
         triggerEventBasedOnTerrain(currentTile);
     }

    // Return updated player position
    return { playerX, playerY };
}

// Scroll to keep player always visible
function scrollToPlayer(playerX, playerY) {
    const playerTile = document.getElementById("player-tile");
    if (playerTile) {
        const scrollOffset = 200; // Adjust offset for better visibility
        const playerRect = playerTile.getBoundingClientRect();
        const container = document.getElementById("map-container");

        // Scroll vertically to keep player visible
        if (playerRect.top < 0 || playerRect.bottom > window.innerHeight) {
            container.scrollTop += playerRect.top - container.offsetTop - scrollOffset;
        }

        // Scroll horizontally to keep player visible
        if (playerRect.left < 0 || playerRect.right > window.innerWidth) {
            container.scrollLeft += playerRect.left - container.offsetLeft - scrollOffset;
        }
    }
}


// Function to trigger events based on terrain
function triggerEventBasedOnTerrain(tile) {
    switch (tile.type) {
        case 'grass':
            console.log("You encounter a wandering merchant!");
            break;
        case 'mountain':
            console.log("You discover a hidden cave!");
            break;
        case 'water':
            console.log("You find a sunken treasure!");
            break;
        default:
            console.log("The area is peaceful.");
    }
}

function saveGameState() {
    sessionStorage.setItem('currentPlayerX', currentPlayerX);
    sessionStorage.setItem('currentPlayerY', currentPlayerY);
    sessionStorage.setItem('worldMap', JSON.stringify(worldMap)); // Convert map to string
}

function loadGameState() {
    currentPlayerX = parseInt(sessionStorage.getItem('currentPlayerX')) || 0;
    currentPlayerY = parseInt(sessionStorage.getItem('currentPlayerY')) || 0;
    worldMap = JSON.parse(sessionStorage.getItem('worldMap')) || []; // Parse back to object
}

// Function to reveal terrain around the player
function revealTerrain(playerX, playerY, worldMap, revealRadius = 3) {
    let count=0;
    for (let x = playerX - revealRadius; x <= playerX + revealRadius; x++) {
        for (let y = playerY - revealRadius; y <= playerY + revealRadius; y++) {
            if (worldMap[x] && worldMap[x][y]) {
                worldMap[x][y].discovered = true;
                count= count+1;
                //console.log("x-axis="+x+" y axis="+ y);
            }
        }
    }
}

// Add player-specific CSS for visualization
const style = document.createElement('style');
style.innerHTML = `
    .tile {
        width: 20px;
        height: 20px;
        display: inline-block;
        border: 1px solid #ccc;
        position: relative;
    }
    .tile.water {
        background-color: rgb(21, 120, 147);
    }
    .tile.grass {
        background-color: green;
    }
    .tile.mountain {
        background-color: #8B4513;
    }
    .tile.player {
        //background-color: black;
        //border: 2px solid red;
    }
    .row {
        display: flex;
    }
    img {
        position: absolute;
        top: 0;
        left: 0;
    }`
;

document.head.appendChild(style);

// Example trigger when a player clicks a button
document.getElementById("generate-terrain-button").addEventListener("click", () => {
    const playerId = "player123";  // Replace with dynamic player ID
    const playerX = "0";  // Replace with dynamic region
    const playerY = "0";  // Replace with dynamic region

    fetchGeneratedTerrain(playerId, playerX, playerY);
});