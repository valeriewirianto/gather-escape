const { API_KEY } = require("./api-key");
const { Game } = require("@gathertown/gather-game-client");
global.WebSocket = require("isomorphic-ws");

/**** setup ****/

// what's going on here is better explained in the docs:
// https://gathertown.notion.site/Gather-Websocket-API-bf2d5d4526db412590c3579c36141063
const game = new Game("qWn0akcrvzMx8Fbm\\Escape Room", () => Promise.resolve({ apiKey: API_KEY }));
// replace with your spaceId of choice ^^^^^^^^^^^

function connectToSpace(game){
  return new Promise (async (resolve, reject) => {
    game.connect();
    game.subscribeToConnection((connected) => console.log("connected?", connected));
      //game.subscribeToConnection((connected) => console.log("connected?", connected));
      await game.waitForInit();
      resolve(game.connected)
  })
}
connectToSpace(game).then((res) => {
  if(res){
    return new Promise (async (resolve, reject) => {
      await setUp('https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/UYkUM5it06GAXLt0/DP3P0YF3avDmGP13ejtsdF', true);
      let objs = game.completeMaps["mystery-mansion-cellar"].objects["20"]
      console.log(objs)
      objs = game.completeMaps["mystery-mansion-cellar"].objects["22"]
      console.log(objs)
      await placePokeball()
    })

  }
})
/**** the good stuff ****/

game.subscribeToEvent("playerMoves", (data, context) => {
 /* console.log(
    context?.player?.name ?? context.playerId,
    "moved in direction",
    data.playerMoves.direction
  );
  findTileInFrontOfPlayer("NExkiUBtSlcjeBDbXpyw7pkLKAc2")
  */
});

game.subscribeToEvent("playerInteracts", async (data, context) => {
  console.log('qqq')
  console.log(data);
  console.log("fffffffffff");
  //console.log(context);
  let playerInteracts = data.playerInteracts
  if (playerInteracts.objId == "basement chest" && playerInteracts.dataJson){
    console.log("Basement chest here!")
    console.log(JSON.parse(playerInteracts.dataJson)["adminSettingsSetHeader"])
    let {mapId, obj} = game.getObject(playerInteracts.objId);
    let properties = obj.properties;
    console.log(obj)
    let temp_obj = {
      ...obj, 
      type: 0, 
      normal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/UYkUM5it06GAXLt0/o6r122cGpRPXBHiT6q4fX2',
      properties: {...properties, closed: false},
    }
    console.log('ooo')
    console.log(temp_obj)
    game.setObject("mystery-mansion-cellar", playerInteracts.objId, temp_obj);
    game.setImpassable("mystery-mansion-cellar", 40, 33, false)
    game.setImpassable("mystery-mansion-cellar", 41, 33, false)
    //await setUp('https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/UYkUM5it06GAXLt0/o6r122cGpRPXBHiT6q4fX2', false);
  }

        
  //console.log(objs)
});

// array or map to hold what items are pickupable. Upon player connects, add them with empty hand to dict
// or only exist in dict if they are holding an item, other wise are not holding item
// map of playerIds to item they are currently holding (can be none)
var dict_player_current_item = {
};
/*
check if player holding item and pickupable item in range, if yes, swap
check if player holding item, if yes, drop
check if player not holding any item, if yes, pick up

*/
game.subscribeToEvent(
  "playerTriggersItem",
   async ({ playerTriggersItem }, context) => {
     let playerId = context.playerId;
     let closestObjectId = context.player.closestObject
     //console.log(playerTriggersItem);
     //console.log(context)
     //console.log("ooooooooooooo")
     //console.log(closestObjectId)
     //game.addInventoryItem(obj.id, 1, context.playerId)
     console.log('ppppppppp')
     console.log(closestObjectId);

     if (playerId in dict_player_current_item){ // drop item. If near another item, pick that up
      console.log(game.getPlayer(playerId));
      let obj = dict_player_current_item[playerId];
      let objectId = obj.id;
      let [tileToDropObjX, tileToDropObjY] = findTileInFrontOfPlayer(playerId)
      obj['x'] = tileToDropObjX;
      obj['y'] = tileToDropObjY;
      
      await setObject("mystery-mansion-cellar", objectId, obj);
      await clearItem(playerId)
      delete dict_player_current_item[playerId];
     }
     else if (closestObjectId){
      console.log(closestObjectId);
      console.log(game.getPlayer(playerId));
      if (game.getObject(closestObjectId)){
        let {obj} = game.getObject(closestObjectId);
        await setItem(closestObjectId, obj.normal, playerId);
        await deleteObject("mystery-mansion-cellar", closestObjectId);
        console.log("spawned")
        dict_player_current_item[playerId] = obj;
      }
      else {
        let obj = {
          id: closestObjectId,
          x: 39, 
          y: 36,
          normal: "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/jEDZjhqoI4iAKolF/tY3NKLnSH19EEstnaZ6Ix5",
          distThreshold: 2,
          type: 5, 
          width: 5, 
          height: 5, 
          previewMessage: "Press spacebar to pick up", // this is what shows up in the press x bubble
        };
        let [tileToDropObjX, tileToDropObjY] = findTileInFrontOfPlayer(playerId)
        obj['x'] = tileToDropObjX;
        obj['y'] = tileToDropObjY;
        await setObject("mystery-mansion-cellar", closestObjectId, obj);
      }
     }

     //game.deleteObject("mystery-mansion-cellar", closestObjectId);
     console.log(dict_player_current_item);
     console.log('--------')
     //game.clearItem(context.playerId);
 });

async function deleteObject(mapId, closestObjectId){
  game.deleteObject(mapId, closestObjectId);

}

async function setItem(closestObjectId, normal, playerId){
  game.setItem(closestObjectId, normal, playerId);
}

async function setObject(mapId, objectId, obj){
  game.setObject(mapId, objectId, obj);
}

async function clearItem(playerId){
  game.clearItem(playerId)
}

 async function setUp(normalImage, closed){
  setTimeout(() => {
      let objectId = "basement chest";
      let obj = {
        id: objectId,
        x: 39, 
        y: 32,
        normal: normalImage,
        distThreshold: 1,
        type: 7, 
        width: 1, 
        height: 1, 
        previewMessage: "", // this is what shows up in the press x bubble
        properties: {
          extensionData: {
            closedNormal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/UYkUM5it06GAXLt0/DP3P0YF3avDmGP13ejtsdF',
            openNormal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/UYkUM5it06GAXLt0/o6r122cGpRPXBHiT6q4fX2',
            entries:[
              {
                type: "header",                               // type of "html" element
                value: "This area is password protected!!!",  // shows to user
                key: "mainHeader",                            // header id(use as key in playerInteracts' data.dataJson)
              },
              {
                type: "text",                   // type of 'html' element
                value: "Update header...",      // placeholder value of textbox
                key: "adminSettingsSetHeader",  // textbox id
              },
            ]
          },
          closed: closed
        },
      };
    game.setObject("mystery-mansion-cellar", objectId, obj);
    game.setImpassable("mystery-mansion-cellar", 40, 33, true)
    game.setImpassable("mystery-mansion-cellar", 41, 33, true)
  }, 3000); 
}

async function placePokeball(){
  let objectId = "pokeball";
      let obj = {
        id: objectId,
        x: 39, 
        y: 36,
        normal: "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/jEDZjhqoI4iAKolF/tY3NKLnSH19EEstnaZ6Ix5",
        distThreshold: 2,
        type: 5, 
        width: 5, 
        height: 5, 
        previewMessage: "Press spacebar to pick up", // this is what shows up in the press x bubble
      };
 
      game.setObject("mystery-mansion-cellar", objectId, obj);
}

// Returns non-impassable tile (x, y) closest to playerId
/* Directions:
    1,2 S
    3,4 N
    5,6 W
    7,8 E
*/
function findTileInFrontOfPlayer(playerId){
  let {x, y, direction} = game.getPlayer(playerId);
  if(direction == 1 || direction == 2){ // player facing south
    y = y + 1;
  }
  else if(direction == 3 || direction == 4){ // player facing north
    y = y - 1;
  }
  else if(direction == 5 || direction == 6){
    x = x - 1;
  }
  else if(direction == 7 || direction == 8){
    x = x + 1;
  }
  console.log(x, y);
  return [x, y]
}

/* Much needed helper functions
- create new object and place on map
- create password door and place on map. Make tiles impassable
- create password something(chest) and place on map
- check password of door and if yes, unlock and remove impassable tiles
- unlock chest and give item
- pick up item
- drop item
- use item on something
- func to find where to drop object(non impassable tile near player, preferably in front of them if possible)
- object.proto file containing all objects
*/