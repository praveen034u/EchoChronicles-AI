let currentPlayerX = 0; // Player starts at position (0, 0)
let currentPlayerY = 0;
let player = null; // Initialize with player data once it's loaded
let imaginaryWorld = "fantasy"; // Default to fantasy world

let fishingRodsCount = 0;
let rareGemsCount = 0;
let healingPotionCount = 0;
let goldCount = 0;
const playerId = sessionStorage.getItem("userId");
const playerName = sessionStorage.getItem("userFullName");
const sessionId = sessionStorage.getItem("sessionId");
const s3assets = "https://chronicles-ai-assests.s3.us-east-1.amazonaws.com/assets"; // S3 bucket URL

document.getElementById("welcome-title").innerText = "Welcome "+playerName+"!";

// Initialize timer to 10 minutes (600 seconds)
let timeLeft = 600;  // 10 minutes in seconds
let experiencesCount = 0;


// Function to start and update the timer
function startTimer() {
    const timerDisplay = document.getElementById("time-left");
    
    const interval = setInterval(() => {
        // Convert timeLeft to minutes and seconds
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        // Format the timer to always show two digits
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Decrease time left by 1 second
        timeLeft--;

        // When time runs out, refresh the page
        if (timeLeft < 0) {
            clearInterval(interval); // Stop the timer
            alert("TimeUP!!!.");
            location.reload(); // Refresh the page
        }
    }, 1000); // Update every second
}
         
initializeGameRewards();

//  Function to call the generateTerrain Lambda function
async function fetchGeneratedTerrain(player, imaginaryWorld) {
    const apiUrl = "https://nee5ghu8w7.execute-api.us-east-1.amazonaws.com/dev/generateTerrain"; // Replace with your API Gateway URL

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
            player: player,
            sessionId: sessionId,
            width: 50,
            height: 50,
            landmarkPercentage: 0.5,
            imaginaryWorld: imaginaryWorld,
            prompt: null
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
        
        // Start the timer when the page is loaded
        startTimer()
        

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
     // Add CSS if not already present
     if (!document.getElementById('terrain-styles')) {
        const style = document.createElement('style');
        style.id = 'terrain-styles';
        style.textContent = `
            .terrain-container {
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: auto;
              max-height: 90vh;
              max-width: 65%;
              height: 1200px;
              padding-left: 100px;
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
              playerImage.src = s3assets+"/player-images/player1.gif"; // Path to player image
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
        // log limit to 5 - Start
        // Reference to the log container element
        const logContainer = document.getElementById("log-container");

        // Function to log messages to the bottom log panel
        function logMessageToPopup(message) {
            // Create a new paragraph element for the message
            const messageElement = document.createElement("p");
       
            messageElement.textContent = message;
    
            // Append the new message
            logContainer.appendChild(messageElement);
    
            // Keep only the latest 5 log entries
            if (logContainer.children.length > 5) {
                logContainer.removeChild(logContainer.firstChild); // Remove the oldest log entry
            }
    
            // Scroll the log panel to the bottom to show the latest log
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    // log limit to 5 - end
    
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

// Assign quest to the player when they reach a tile with a quest
function assignQuestToPlayer(player, currentTile) {
    if (currentTile.quest) {
        player.activeQuests.push(currentTile.quest);
        console.log(`Quest Assigned: ${currentTile.quest.description}`);
    } else {
        console.log("No quest available on this tile.");
    }
}

//handle quest decision
function handleQuestDecision(decision) {
    let worldMap=JSON.parse(sessionStorage.getItem('worldMap'));
    let tile = worldMap[currentPlayerX][currentPlayerY];
    if (decision === "accepted") {
        console.log("Player accepted the quest.");
        assignQuestToPlayer(player, tile);
        // Add logic for starting the quest
    } else if (decision === "declined") {
        console.log("You have declined the quest, you can continue with your game!");
        // Add logic for declining the quest
    }
}

// Function to trigger events based on terrain
function triggerEventBasedOnTerrain(tile) {
    if(tile.hasMerchant) 
    {
             logMessageToPopup("you found a wandering merchant!!");
    }
    if(tile.hasQuest) 
     {
       // tbd console.log( "Here is the quest for you :\n" + tile.quest.description);
       const questMsg = "Here is the quest for you :" + tile.quest.description + 
       "\n once you complete the quest, you will be rewarded with some exiting stuffs!!";
       logMessageToPopup(questMsg + "\n Do you accept? ", true, handleQuestDecision);
     }
     else if(tile.isLandmark) 
     {
                 logMessageToPopup("You found a landmark! it's a "+ tile.landmarkType);
     }
     else if(tile.type === "water") 
     {
                 logMessageToPopup("You are swimming! Your current position is (" + currentPlayerY + " " + currentPlayerX + ")");
     }
     else if(tile.type === "mountain") 
     {
                 logMessageToPopup("You are climbing a mountain! Your current position is (" + currentPlayerY + " " + currentPlayerX + ")");
     }
     else 
     {
                 logMessageToPopup("You are walking on grass! Your current position is (" + currentPlayerY + " " + currentPlayerX + ")");
     }
     checkForQuestCompletion(player);
     console.log("Player's Active Quests Count:", player.activeQuests.length);
 }
 
function checkForQuestCompletion(player) {
    player.activeQuests.forEach((quest, index) => {
          console.log("Quest locationX="+quest.location.calcX+" Quest locationY="+quest.location.calcY);
          console.log("Player locationX="+currentPlayerY+" Player locationY="+currentPlayerX);

        if (quest.location.calcX === currentPlayerY && quest.location.calcY === currentPlayerX) {
            logMessageToPopup(`You completed the quest: ${quest.description}`);
            player.activeQuests.splice(index, 1); // Remove the completed quest
            player.experience += quest.rewards.experience;
           
        if (quest.rewards.gold === undefined) {
            player.inventory.push(...quest.rewards.items);
            logMessageToPopup(`You received items: ${quest.rewards.items.join(', ')}`);
        } else {
            player.gold += quest.rewards.gold;
            logMessageToPopup(`You received ${quest.rewards.gold} gold and ${quest.rewards.experience} experience.`);
        }
        showAssignedQuests();
}});
 initializeGameRewards();

}

function initializeGameRewards()
{
    goldCount= player?.gold||0;
    experiencesCount= player?.experience||0;
    healingPotionCount= player?.inventory.filter(item => item === 'Healing Potion').length || 0;
    fishingRodsCount= player?.inventory.filter(item => item === 'Fishing Rod').length || 0;
    rareGemsCount= player?.inventory.filter(item => item === 'Rare Gem').length || 0;
    $('#healing-potion-count').text(`Healing posion Count= ${healingPotionCount}`);
    $('#fishing-rods-count').text(`Fishing Rods Count= ${fishingRodsCount}`);
    $('#rare-gems-count').text(`Rare Gems Count= ${rareGemsCount}`);
    $('#gold-count').text(`Gold Count= ${goldCount}`);
    $('#experiences-count').text(`Experiences= ${experiencesCount}`);

}

function logMessageToPopup(message, showQuestButtons = false, questCallback = null) {
    const consolePopup = document.getElementById("console-popup");

    if (!consolePopup) {
        console.error("Console popup element not found!");
        return;
    }

    // Create a paragraph element for the main message
    const messageElement = document.createElement("p");
    messageElement.textContent = message;

    // Append the main message
    consolePopup.appendChild(messageElement);

    // If quest buttons are needed, create Accept and Decline buttons
    if (showQuestButtons) {
        const buttonContainer = document.createElement("div");
        buttonContainer.style.marginTop = "10px";

        // Accept button
        const acceptButton = document.createElement("button");
        acceptButton.textContent = "Accept Quest";
        acceptButton.style.marginRight = "10px";
        acceptButton.onclick = () => {
            if (questCallback) questCallback("accepted");
            logMessageToPopup("You accepted the quest!");
            acceptButton.setAttribute('disabled', false);
            declineButton.setAttribute('disabled', false);
            showAssignedQuests();
        };

        // Decline button
        const declineButton = document.createElement("button");
        declineButton.textContent = "Decline Quest";
        declineButton.onclick = () => {
            if (questCallback) questCallback("declined");
            logMessageToPopup("You declined the quest.");
            acceptButton.setAttribute('disabled', false);
            declineButton.setAttribute('disabled', false);
        };       
        function handleKeyPress(event) {
            
            // Check if the quest is still active
            if (event.key === "Escape" || event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight") {
                
                acceptButton.setAttribute('disabled', false);
                declineButton.setAttribute('disabled', false);
            }
        }
        
        // Attach the event listener for keydown event
        document.addEventListener("keydown", handleKeyPress);
        

        buttonContainer.appendChild(acceptButton);
        buttonContainer.appendChild(declineButton);

        // Append buttons to the popup
        consolePopup.appendChild(buttonContainer);
    }
  // Scroll to the bottom for the latest message
    consolePopup.scrollTop = consolePopup.scrollHeight;
}

function showAssignedQuests() {
    const questContainer = document.getElementById("game-quests-assigned");
    questContainer.innerHTML = ""; // Clear previous quests

    player.activeQuests.forEach((quest) => {
        const questElement = document.createElement("div");
        questElement.textContent = quest.description;
        questContainer.appendChild(questElement);
    });
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
                console.log("x-axis="+x+" y axis="+ y);
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
    `
;

document.head.appendChild(style);

// Player model initialization
function initializePlayer(name, startingX, startingY) {
    return {
        name: name,
        activeQuests: [],
        inventory: [],
        position: { x: startingX, y: startingY },
        experience: 0,
        gold: 0,
    };
}

// Example trigger when a player clicks a button
document.getElementById("generate-terrain-button").addEventListener("click", async () => {
   
    $('#control').hide();
    const terrainContainer = document.getElementById("terrain-container");
    const worldGenImage = document.createElement("img");
    worldGenImage.src = s3assets+"/world_generation.gif"; // Path to the world generation image
    worldGenImage.alt = "World Generation";
    worldGenImage.style.width ="300px";
    worldGenImage.style.height ="300px";
    worldGenImage.style.marginTop= "150px";
    worldGenImage.style.marginLeft = "35%";
    terrainContainer.appendChild(worldGenImage);

    const playerX = "0";  // Replace with dynamic region
    const playerY = "0";  // Replace with dynamic region
    
    // Player model initialization
    player = initializePlayer(playerId, playerX, playerY);
    
    await fetchGeneratedTerrain(player, imaginaryWorld);
    saveGameState();
    $('#game-action-pannel').show();
    $('#game-log-pannel').show();
});

document.getElementById("exit-terrain-button").addEventListener("click", async () => {
    location.reload(); // Refresh the page
});

document.getElementById("flash-terrain-button").addEventListener("click", async () => {

    // Flash tiles with quests for 5 seconds
    const questTiles = [];
    worldMap.forEach((row, x) => {
        row.forEach((tile, y) => {
            if (tile.hasQuest) {
                questTiles.push({ x, y });
                const tileDiv = document.querySelector(`.row:nth-child(${x + 1}) .tile:nth-child(${y + 1})`);
                if (tileDiv) {
                    tileDiv.classList.add("flash");
                }
            }
        });
    });

    // Remove flash effect after 5 seconds
    setTimeout(() => {
        questTiles.forEach(({ x, y }) => {
            const tileDiv = document.querySelector(`.row:nth-child(${x + 1}) .tile:nth-child(${y + 1})`);
            if (tileDiv) {
                tileDiv.classList.remove("flash");
            }
        });
    }, 1000);

    // Add CSS for flashing effect
    const flashStyle = document.createElement('style');
    flashStyle.innerHTML = `
        .flash {
            animation: flash-animation 1s infinite;
        }
        @keyframes flash-animation {
            0%, 100% { background-color: yellow; }
            50% { background-color: red; }
        }
    `;
    document.head.appendChild(flashStyle);
});


function doSelection(){
    imaginaryWorld = $('input[name="worldType"]:checked').val();
    $('#generate-terrain-button').attr('disabled', false);
}