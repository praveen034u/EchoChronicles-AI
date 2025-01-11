// Create game constants and initial data
const npcDialogues = {
    merchant: [
      "Adventurer! Can you help me? The Goblin King stole a precious artifact from my shop.",
      "I will reward you handsomely if you return it.",
    ],
    goblinKing: [
      "You dare challenge me? The artifact is mine!",
      "Prepare for battle, weakling!",
    ],
  };
  
  const quests = [
    {
      id: 1,
      title: "Retrieve the Stolen Artifact",
      description: "Find the artifact taken by the Goblin King and return it to the merchant.",
      status: "incomplete",
    },
  ];
  
  // Game State
  let currentNPC = null;
  let currentQuest = null;
  
  // Handle NPC interactions
  function interactWithNPC(npc) {
    currentNPC = npc;
    const dialogueBox = document.getElementById("dialogue-box");
    dialogueBox.innerHTML = `<p>${npcDialogues[npc][0]}</p>`;
    document.getElementById("action-buttons").innerHTML = `
      <button onclick="acceptQuest()">Accept Quest</button>
      <button onclick="declineQuest()">Decline Quest</button>
    `;
  }
  
  // Accept a quest
  function acceptQuest() {
    if (currentNPC === "merchant") {
      currentQuest = quests[0];
      currentQuest.status = "in-progress";
      updateQuestLog();
      showMessage("Quest Accepted: " + currentQuest.title);
      document.getElementById("dialogue-box").innerHTML = `<p>${npcDialogues[currentNPC][1]}</p>`;
    }
  }
  
  // Decline a quest
  function declineQuest() {
    showMessage("You declined the quest.");
    document.getElementById("dialogue-box").innerHTML = "";
  }
  
  // Complete a quest
  function completeQuest() {
    if (currentQuest && currentQuest.status === "in-progress") {
      currentQuest.status = "complete";
      updateQuestLog();
      showMessage("You completed the quest!");
    } else {
      showMessage("No quest to complete.");
    }
  }
  
  // Update quest log UI
  function updateQuestLog() {
    const questLog = document.getElementById("quest-log");
    questLog.innerHTML = `
      <h3>Quest Log</h3>
      ${
        currentQuest
          ? `<p><strong>${currentQuest.title}</strong>: ${currentQuest.description} (Status: ${currentQuest.status})</p>`
          : "<p>No active quests.</p>"
      }
    `;
  }
  
  // Show messages to the player
  function showMessage(message) {
    const messageBox = document.getElementById("message-box");
    messageBox.innerHTML = `<p>${message}</p>`;
  }
  
  // Explore the world
  function exploreWorld() {
    showMessage("You explore the surrounding area and find a hidden path.");
  }
  