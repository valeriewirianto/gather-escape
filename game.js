const { API_KEY, GAME_ID } = require("./api-key");
const { Game } = require("@gathertown/gather-game-client");
const ASSET_CDN = require("./cdn.json")
global.WebSocket = require("isomorphic-ws");

const game = new Game(GAME_ID, () => Promise.resolve({ apiKey: API_KEY }));

let dict_player_current_item = {};
let pickupable_object_ids = [];

const MAP_CELLAR = "mystery-mansion-cellar"
const MAP_CONSERVATORY = "mystery-mansion-conservatory"
const MAP_LOUNGE = "mystery-mansion-lounge"
const MAP_KITCHEN = "mystery-mansion-kitchen"
const MAP_MAIN = "mystery-mansion-main"
const MAP_DINING = "mystery-mansion-dining-room"
const MAP_FOYER = "mystery-mansion-hall"
const MAP_STUDY = "mystery-mansion-study"

function connectToSpace(game){
    return new Promise (async (resolve, reject) => {
      game.connect();
      game.subscribeToConnection((connected) => console.log("connected?", connected));
      await game.waitForInit();
      resolve(game.connected);
    })
}

connectToSpace(game).then((res) => {
    if(res){
        return new Promise (async (resolve, reject) => {
            await setUp();
        })
    }
})

async function setUp(){
    cleanUp()

    // Basement Cellar
    placePasswordDoor(MAP_CELLAR, "passwordDoorCellar", 39, 29, "The door needs a password to open. On it says \"Tree\"", "password", "12435678910");
    let noteCellar = createNote(32, 37, "cellarNoteFromChest", "Hey Dinesh! I think it's best if we \npreorder the donuts for the office");
    placeLockedChest(MAP_CELLAR, "lockedChestCellar", 32, 36, "A locked chest. On it says \"Who Am I? Proposed Frisbee Golf as Team Social. Proceeds to beat everyone in Frisbee Golf. Sus?\"", "password", "Lucas", noteCellar);
    
    // Lounge
    placePasswordDoor(MAP_MAIN, "passwordDoorLounge", 2, 10, "The word 'SLOMPS' was invented by which great Linguist of team DMS?", "password", "ming");

    let chestLoungeObj = returnPickupableObject(11, 3, "leaf", ASSET_CDN["LEAF"]);
    placeLockedChest(MAP_LOUNGE, "lockedChestLounge", 11, 2, "A locked chest. On it are the numbers 75 65 70 75 65 ", "password", "kafka", chestLoungeObj);

    // Study
    let noteStudy = createNote(2, 6, "noteFromStudyChest", "Who is attending the dinner? Let's find out: Did a presentation in the office advertising Gather. Stopped using Gather one month later");
    placeLockedChest(MAP_STUDY, "lockedStudy", 2, 5, "A locked chest that accepts numbers only. On it says \"[_,_,_,_,_,_]\". (Input purely numbers only, no spaces)", "password", "956234", noteStudy);

    // wait some time to avoid being rate limited
    await new Promise(r => setTimeout(r, 2000));

    // Main
    let noteMain = createNote(17, 18, "mainNoteFromChest", "Who is attending the dinner? Let's find out: 'As great as Alexander The Great'");
    placeLockedChest(MAP_MAIN, "lockedChestMainHeart", 17, 17, "A locked chest accepting 5 characters.", "password", "lease", noteMain);
    let noteMainCandle = createNote(21, 26, "mainNoteFromCandleChest", "Who is attending the dinner? Let's find out: Avid Montreal Foodie who likes Chipotle");
    placeLockedChest(MAP_MAIN, "lockedChestCandleMain", 20, 26, "A locked chest that accepts numbers. On it says \"Light through the night, but weak against winds\"", "password", "312", noteMainCandle);
    let noteMainDepthBreath = createNote(28, 6, "mainNoteFromChestDepthBreadth", "That's a lot of employees attending the dinner tonight...let's order them by who joined first.");
    placeLockedChest(MAP_MAIN, "lockedChestMain", 28, 5, "A locked chest. On it says \"Depth First\"", "password", "stack", noteMainDepthBreath);

    // wait some time to avoid being rate limited
    await new Promise(r => setTimeout(r, 2000));

    placePasswordDoor(MAP_MAIN, "doorEnteringToFoyer", 19, 11, "A locked door. On it says \"1994\"", "password", "62581"); // door to foyer
    placePasswordDoor(MAP_MAIN, "doorEnteringToParlor", 34, 9, "Another limerick to ace, I only accept kebab case, two of them are names, ordered just the same, but there's a third non-name in place", "password", "valerie-akram-daapi"); // door to parlor

    // Kitchen 
    let noteKitchen = createNote(9, 9, "kitchenNoteFromChest", "Who is attending the dinner? Let's find out: 'Who am I? DRPTOCU'");
    placeLockedChest(MAP_KITCHEN, "lockedChestCrossroadsKitchen", 9, 8, "\"I took the one less traveled by, And that has made all the difference\"", "password", "difference", noteKitchen);
    
    // Conservatory
    let chestThinkObj = returnPickupableObject(7, 6, "cat", ASSET_CDN["CAT"]);
    placeLockedChest(MAP_CONSERVATORY, "lockedChestConservatoryThink", 8, 6, "A number lock...", "password", "8", chestThinkObj);

    let chestDiveObj = createNote(18, 6, "receivedObjectFromChestConservatoryDive", "I only love the one right after the second summer");
    placeLockedChest(MAP_CONSERVATORY, "lockedChestConservatoryDive", 18, 5, "A number lock...", "password", "12", chestDiveObj);

    let chestLearnObj = createNote(5, 5, "receivedObjectFromChestConservatoryLearn", "When at a crossroads, I look at the very end");
    placeLockedChest(MAP_CONSERVATORY, "lockedChestConservatoryLearn", 5, 4, "A number lock...", "password", "5", chestLearnObj);

    // Dining Room
    placePasswordDoor(MAP_MAIN, "passwordDoorDining", 32, 25 ," This is a limerick, I see. I only will take CSV. First name's enough. Can't be that tough. Just know that the order is key.", "password", "alex,kevin,kareem,robert");
    
    // wait some time to avoid being rate limited
    await new Promise(r => setTimeout(r, 2000));
    
    let chestCodenameObjOne = returnPickupableObject(2, 3, "redBall", ASSET_CDN["RED_BALL"]);
    placeLockedChest(MAP_DINING, "lockedChestDiningOne", 2, 2, "DRINK 2", "password", "bottle,lemonade", chestCodenameObjOne);
    let chestCodenameObjTwo = createNote(6, 3, "receivedObjectFromChestCodenameTwo", "For entry into the parlor: daapi");
    placeLockedChest(MAP_DINING, "lockedChestDiningTwo", 6, 2, "BEE 2", "password", "battery,beijing", chestCodenameObjTwo);
    let chestCodenameObjThree = returnPickupableObject(10, 3, "spanner", ASSET_CDN["SPANNER"]);
    placeLockedChest(MAP_DINING, "lockedChestDiningThree", 10, 2, "GALAXY 2", "password", "black hole,saturn", chestCodenameObjThree);

    // Hall(foyer)
    game.setImpassable(MAP_FOYER, 5, 1, true);
    game.setImpassable(MAP_FOYER, 6, 1, true);

    placePasswordDoor(MAP_FOYER, "doorFoyer", 4, 0, "A locked door...but this one doesn't require a typed in password.", "Anything you input here will be pointless.", ")@*$(@*$(@*$jfiewufjewiuwoierjeoirj");

    let chestFoyerObj = returnPickupableObject(9, 4, "laptop", ASSET_CDN["LAPTOP"]);
    placeLockedChest(MAP_FOYER, "lockedChestFoyer", 9, 3, "By process of elimination you already know who I am. I've been on the team the longest and I know it ALL, for my name is _______!", "password", "randall", chestFoyerObj);
   }


async function cleanUp(){
  try{
    game.deleteObject(MAP_CELLAR, "cellarNoteFromChest")
    game.deleteObject(MAP_CONSERVATORY, "receivedObjectFromChestConservatoryLearn")
    game.deleteObject(MAP_CONSERVATORY, "receivedObjectFromChestConservatoryDive")
    game.deleteObject(MAP_CONSERVATORY, "cat")
    game.deleteObject(MAP_LOUNGE, "leaf")
    game.deleteObject(MAP_KITCHEN, "receivedObjectFromChestKitchen")
    game.deleteObject(MAP_KITCHEN, "kitchenNoteFromChest")
    game.deleteObject(MAP_MAIN, "mainNoteFromChest")
    game.deleteObject(MAP_MAIN, "mainNoteFromCandleChest")
    game.deleteObject(MAP_DINING, "receivedObjectFromChestCodenameOne")
    game.deleteObject(MAP_DINING, "receivedObjectFromChestCodenameTwo")
    game.deleteObject(MAP_DINING, "receivedObjectFromChestCodenameThree")
    game.deleteObject(MAP_FOYER, "laptop")
    game.deleteObject(MAP_DINING, "spanner")
    game.deleteObject(MAP_DINING, "redBall")
    game.deleteObject(MAP_STUDY, "noteFromStudyChest")
    game.deleteObject(MAP_MAIN, "mainNoteFromChestDepthBreadth")
  }
  catch(e){
    console.log("No object")
  }
}

game.subscribeToEvent("playerInteracts", async (data, context) => {
    let playerInteracts = data.playerInteracts;
    let mapId = playerInteracts.mapId;
    let objId = playerInteracts.objId;
    let { obj } = game.getObject(objId); // get obj
    //console.log(data);
    console.log(obj);

    if (playerInteracts.dataJson){ // if user has inputted value at password door, check password
        let inputtedPassword = JSON.parse(playerInteracts.dataJson)[objId + "TextboxPlaceholder"];
        checkPassword(obj, objId, mapId, inputtedPassword)
    }
});


game.subscribeToEvent(
  "playerTriggersItem",
   async ({ playerTriggersItem }, context) => {
     //console.log(context);
     let playerId = context.playerId;
     let closestObjectId = context.player.closestObject
     let mapId = context.player.map; 

     if (playerId in dict_player_current_item){ // if player holding an item, drop it
      let obj = dict_player_current_item[playerId];
      let objectId = obj.id;
      let [tileToDropObjX, tileToDropObjY] = findTileInFrontOfPlayer(playerId)
      obj['x'] = tileToDropObjX;
      obj['y'] = tileToDropObjY;
      
      game.setObject(mapId, objectId, obj);
      game.clearItem(playerId)
      delete dict_player_current_item[playerId];
     }
     else if (closestObjectId){ // player not holding item and near a pickupable object
      
      // user not allowed to pick up object, exit and do nothing
      if (pickupable_object_ids.indexOf(closestObjectId) == -1){
        return;
      }
      let [frontOfPlayerX, frontOfPlayerY] = findTileInFrontOfPlayer(playerId)
      console.log(game.getObject(closestObjectId));
      if (game.getObject(closestObjectId)){
        let {obj} = game.getObject(closestObjectId, mapId);
        let {playerX, playerY} = game.getPlayer(playerId);
        if ((obj.x == frontOfPlayerX && obj.y == frontOfPlayerY) || (obj.x == playerX && obj.y == playerY)){ // if obj directly in front of player
            game.setItem(closestObjectId, obj.normal, playerId);
            game.deleteObject(mapId, closestObjectId);
            dict_player_current_item[playerId] = obj;
        }
      }
      /*else { // object has magically dissapeared likely due to weird race conditions so we place it on the floor and pretend like everything is A-okay
        let obj = {
          id: closestObjectId,
          x: 39, 
          y: 36,
          normal: "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/jEDZjhqoI4iAKolF/tY3NKLnSH19EEstnaZ6Ix5",
          distThreshold: 1,
          type: 5, 
          width: 5, 
          height: 5, 
          previewMessage: "Press spacebar to pick up", // this is what shows up in the press x bubble
        };
        let [tileToDropObjX, tileToDropObjY] = findTileInFrontOfPlayer(playerId)
        obj['x'] = tileToDropObjX;
        obj['y'] = tileToDropObjY;
        game.setObject("mystery-mansion-cellar", closestObjectId, obj);
      }*/
     }
 });

game.subscribeToEvent("playerShootsConfetti", async (data, context) => {
  //console.log(context);
  if(context.player.map == MAP_FOYER){
    let inRangeToDoor = [[5, 2], [6, 2], [5, 3], [6, 3], [5, 4], [6, 4]] ;
    let playerCurrentTile =  [context.player.x, context.player.y];
    inRangeToDoor = JSON.stringify(inRangeToDoor);
    playerCurrentTile = JSON.stringify(playerCurrentTile);
    if((inRangeToDoor.indexOf(playerCurrentTile) != -1) && (context.player.direction == 3) || (context.player.direction == 4)){ // player standing on tile in range of door and facing north
      checkFoyerPuzzle();
    }
  }

});

function checkFoyerPuzzle(){
  try{
    let redBall = game.getObject("redBall");
    let leaf = game.getObject("leaf");
    let spanner = game.getObject("spanner");
    let cat = game.getObject("cat");
    let laptop = game.getObject("laptop");

    if( arraysEqual([redBall.obj.x, redBall.obj.y], [5, 7]) && arraysEqual([cat.obj.x, cat.obj.y], [6, 6]) && arraysEqual([leaf.obj.x, leaf.obj.y], [3, 6]) && arraysEqual([spanner.obj.x, spanner.obj.y], [6, 5]) && arraysEqual([laptop.obj.x, laptop.obj.y], [8, 6])){
      console.log("TRUE")
      game.setImpassable(MAP_FOYER, 5, 1, false);
      game.setImpassable(MAP_FOYER, 6, 1, false);
      game.deleteObject(MAP_FOYER, "doorFoyer");
      
      return true;
    }
  }
  catch(e){

  }
  return false;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function returnPickupableObject(x, y, id, normal){
        let obj = {
          id: id,
          x: x, 
          y: y,
          normal: normal,
          distThreshold: 1,
          type: 5, 
          width: 1, 
          height: 1, 
          previewMessage: "Press spacebar to pick up", // this is what shows up in the press x bubble
        };
   
        pickupable_object_ids.push(id);
        return obj;
  }

// Returns the (x, y) coordinates of the tile directly in front of a player, regardless of whether the tile is passable or not
function findTileInFrontOfPlayer(playerId){
    let {x, y, direction} = game.getPlayer(playerId);
    if(direction == 1 || direction == 2){ // player facing south
      y = y + 1;
    }
    else if(direction == 3 || direction == 4){ // player facing north
      y = y - 1;
    }
    else if(direction == 5 || direction == 6){ // player facing west
      x = x - 1;
    }
    else if(direction == 7 || direction == 8){ // player facing east
      x = x + 1;
    }
    //console.log(x, y);
    return [x, y];
}

function createNote(x, y, id, text){
    let noteObj = {
        id: id,
        x: x,
        y: y,
        normal: 'https://cdn.gather.town/v0/b/gather-town.appspot.com/o/internal-dashboard-upload%2FZV64T7uzChV9N2Vi?alt=media&token=c6de8057-b19a-48b1-835b-78c25f08426e',
        type: 6,
        width: 1,
        height: 1,
        color: '#fbdbfc',
        orientation: 0,
        highlighted: 'https://cdn.gather.town/v0/b/gather-town.appspot.com/o/internal-dashboard-upload%2FqbDxtuJpAwjYl7ox?alt=media&token=bdc0ab0e-a632-489f-a8bd-c932c7264031',
        previewMessage: 'Press x for note',
        distThreshold: 1,
        properties: { message: text },
      }
      //console.log(noteObj)
      return noteObj;
}

// Create and place a locked chest at coordinates <x, y> in map <mapId>
function placeLockedChest(mapId, objectId, x, y, headerValue, textboxPlaceholder, password, objectReceived){
  //console.log(objectReceived)
    let objLockedChest = {
        id: objectId,
        x: x, 
        y: y,
        normal: ASSET_CDN["CHEST_CLOSED"],
        distThreshold: 1,
        type: 7, 
        width: 1, 
        height: 1, 
        previewMessage: "", // this is what shows up when walking near the chest. Default is Press x to interact
        properties: { 
            extensionData: {
                closedNormal: ASSET_CDN["CHEST_CLOSED"],
                openNormal: ASSET_CDN["CHEST_OPENED"],
                entries:[
                    {
                    type: "header",                 // type of "html" element
                    value: headerValue,             // shows to user
                    key: objectId + "Header",       // header id(use as key in playerInteracts' data.dataJson)
                    },
                    {
                    type: "text",                          // type of 'html' element
                    value: textboxPlaceholder,             // placeholder value of textbox
                    key: objectId + "TextboxPlaceholder",  // textbox id
                    },
                ]
            },
        closed: true,
        password: password,
        objectReceived: objectReceived,
        isA: "chest",
      },
    };
  game.setObject(mapId, objectId, objLockedChest);
  game.setImpassable(mapId, x, y, true)
}


let closedPasswordDoorImage = 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/UYkUM5it06GAXLt0/DP3P0YF3avDmGP13ejtsdF'
let openedPasswordDoorImage = 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/UYkUM5it06GAXLt0/o6r122cGpRPXBHiT6q4fX2'

// Create and place a password door at coordinates <x, y> in map <mapId>
function placePasswordDoor(mapId, objectId, x, y, headerValue, textboxPlaceholder, password){
    let objPasswordDoor = {
        id: objectId,
        x: x, 
        y: y,
        normal: closedPasswordDoorImage,
        distThreshold: 2,
        type: 7, 
        width: 2, 
        height: 1, 
        previewMessage: "", // this is what shows up when walking near the door. Default is Press x to interact
        properties: { 
            isA: "door",
            extensionData: {
                closedNormal: closedPasswordDoorImage,
                openNormal: openedPasswordDoorImage,
                entries:[
                    {
                    type: "header",                 // type of "html" element
                    value: headerValue,             // shows to user
                    key: objectId + "Header",       // header id(use as key in playerInteracts' data.dataJson)
                    },
                    {
                    type: "text",                          // type of 'html' element
                    value: textboxPlaceholder,             // placeholder value of textbox
                    key: objectId + "TextboxPlaceholder",  // textbox id
                    },
                ]
            },
        closed: true,
        password: password,
      },
    };
  game.setObject(mapId, objectId, objPasswordDoor);
  game.setImpassable(mapId, x + 1, y + 1, true)
  game.setImpassable(mapId, x + 2, y + 1, true)
}

// Checks if password user inputted is correct at object <objId>. If yes, will open
function checkPassword(obj, objId, mapId, inputtedPassword){
    let properties = obj.properties;
    let correctPassword = properties.password;
    let type = obj.properties.isA;
    
    if (inputtedPassword != undefined && inputtedPassword.toLowerCase() == correctPassword.toLowerCase()){ // inputted correct password, open
        let openImage = properties.extensionData.openNormal;
        let openedObj = { // update obj so it is open
            ...obj, 
            type: 0, 
            normal: openImage,
            properties: {...properties, closed: false},
            previewMessage: "It opened!",
        }
        if(type == "door"){ // it's a door so make tiles passable now
          console.log(obj.x)
          console.log(obj.y)
            game.setImpassable(mapId, obj.x + 1, obj.y + 1, false);
            game.setImpassable(mapId, obj.x + 2, obj.y + 1, false);
        }
        else if(type == "chest"){ // it's a chest which spits out an object
            openedObj["y"] = openedObj["y"] - 1
            objectReceived = obj.properties.objectReceived;
            game.setObject(mapId, objectReceived.id, objectReceived);
        }
        game.setObject(mapId, objId, openedObj);
    }
    else{
        game.notify("Wrong password entered.");
    }
}