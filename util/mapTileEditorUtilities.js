
import * as utilities from './utilities.js';

import {TILE_WIDTH, TILE_HEIGHT, EMPTY_TILE_HASH, Direction, Ids} from '../scripts/main.js';













export function isValidTileCoordinate(mapTileHashesDisplay, x, y, direction = null)
{
  let modifiedX = x;
  let modifiedY = y;
  
  if (direction === Direction.NORTH)
  {
    modifiedY = y - 1;
  }
  else if (direction === Direction.EAST)
  {
    modifiedX = x + 1;
  }
  else if (direction === Direction.SOUTH)
  {
    modifiedY = y + 1;
  }
  else if (direction === Direction.WEST)
  {
    modifiedX = x - 1;
  }
  
  return modifiedY >= 0 && modifiedY < mapTileHashesDisplay.length
    && modifiedX >= 0 && modifiedX < mapTileHashesDisplay[0].length;
}

export function isEmptyTile(mapTileHashesDisplay, x, y, direction = null)
{
  let modifiedX = x;
  let modifiedY = y;
  
  if (direction === Direction.NORTH)
  {
    modifiedY = y - 1;
  }
  else if (direction === Direction.EAST)
  {
    modifiedX = x + 1;
  }
  else if (direction === Direction.SOUTH)
  {
    modifiedY = y + 1;
  }
  else if (direction === Direction.WEST)
  {
    modifiedX = x - 1;
  }
  
  return mapTileHashesDisplay[modifiedY][modifiedX] === EMPTY_TILE_HASH;
}

export function getRandomTileHash(tileLookup)
{
  let keys = Object.keys(tileLookup);
  return keys[utilities.generateRandomInteger(0, keys.length - 1)];
}

export function getLayeredTopTileHash(layeredTileHashesDisplay, x, y)
{
  if (layeredTileHashesDisplay.hover[y][x] != null)
  {
    return layeredTileHashesDisplay.hover[y][x];
  }
  else
  {
    return layeredTileHashesDisplay.map[y][x];
  }
}







export function getFillTileHash(tileLookup, mapTileHashesDisplay, x, y, strictness = 4)
{
  let northTileHash = (y - 1 >= 0) ? mapTileHashesDisplay[y - 1][x] : null;
  let eastTileHash = (x + 1 < mapTileHashesDisplay[0].length) ? mapTileHashesDisplay[y][x + 1] : null;
  let southTileHash = (y + 1 < mapTileHashesDisplay.length) ? mapTileHashesDisplay[y + 1][x] : null;
  let westTileHash = (x - 1 >= 0) ? mapTileHashesDisplay[y][x - 1] : null;
  
  let northNeighborList = !northTileHash || northTileHash === EMPTY_TILE_HASH ? null : tileLookup[northTileHash][Direction.SOUTH];
  let eastNeighborList = !eastTileHash || eastTileHash === EMPTY_TILE_HASH ? null : tileLookup[eastTileHash][Direction.WEST];
  let southNeighborList = !southTileHash || southTileHash === EMPTY_TILE_HASH ? null : tileLookup[southTileHash][Direction.NORTH];
  let westNeighborList = !westTileHash || westTileHash === EMPTY_TILE_HASH ? null : tileLookup[westTileHash][Direction.EAST];
  
  /*
  console.log('northNeighborList');
  console.log(northNeighborList);
  console.log('eastNeighborList');
  console.log(eastNeighborList);
  console.log('southNeighborList');
  console.log(southNeighborList);
  console.log('westNeighborList');
  console.log(westNeighborList);
  console.log('\n\n');
  */
  
  let fillTileHashes = getFillTileHashes(northNeighborList, eastNeighborList, southNeighborList, westNeighborList, strictness);
  
  /*
  console.log('\n\n\n\n\n\n\n\n');
  console.log(fillTileHashes);
  console.log('\n\n\n\n\n\n\n\n');
  */
  
  if (!fillTileHashes || fillTileHashes.length <= 0)
  {
    return EMPTY_TILE_HASH;
  }
  
  return fillTileHashes[utilities.generateRandomInteger(0, fillTileHashes.length - 1)];
}

export function getFillTileHashes(northNeighborList, eastNeighborList, southNeighborList, westNeighborList, strictness = 4)
{
  let allUniqueNeighborTileHashes = {};
  
  for (let i = 0; northNeighborList && i < northNeighborList.length; i++)
  {
    if (allUniqueNeighborTileHashes[northNeighborList[i]])
    {
      ++allUniqueNeighborTileHashes[northNeighborList[i]];
    }
    else
    {
      allUniqueNeighborTileHashes[northNeighborList[i]] = 1;
    }
  }
  
  for (let i = 0; eastNeighborList && i < eastNeighborList.length; i++)
  {
    if (allUniqueNeighborTileHashes[eastNeighborList[i]])
    {
      ++allUniqueNeighborTileHashes[eastNeighborList[i]];
    }
    else
    {
      allUniqueNeighborTileHashes[eastNeighborList[i]] = 1;
    }
  }
  
  for (let i = 0; southNeighborList && i < southNeighborList.length; i++)
  {
    if (allUniqueNeighborTileHashes[southNeighborList[i]])
    {
      ++allUniqueNeighborTileHashes[southNeighborList[i]];
    }
    else
    {
      allUniqueNeighborTileHashes[southNeighborList[i]] = 1;
    }
  }
  
  for (let i = 0; westNeighborList && i < westNeighborList.length; i++)
  {
    if (allUniqueNeighborTileHashes[westNeighborList[i]])
    {
      ++allUniqueNeighborTileHashes[westNeighborList[i]];
    }
    else
    {
      allUniqueNeighborTileHashes[westNeighborList[i]] = 1;
    }
  }
  
  let invalidNeighborListCount = 0;
  if (!northNeighborList)
  {
    ++invalidNeighborListCount;
  }
  if (!eastNeighborList)
  {
    ++invalidNeighborListCount;
  }
  if (!southNeighborList)
  {
    ++invalidNeighborListCount;
  }
  if (!westNeighborList)
  {
    ++invalidNeighborListCount;
  }
  
  let fillTileHashes4 = [];
  
  for (let key in allUniqueNeighborTileHashes)
  {
    //console.log(allUniqueNeighborTileHashes[key]);
    if (allUniqueNeighborTileHashes[key] >= strictness - invalidNeighborListCount)
    {
      fillTileHashes4.push(key);
    }
  }
  
  //console.log('allUniqueNeighborTileHashes:');
  //console.log(allUniqueNeighborTileHashes);
  
  //console.log('fillTileHashes:');
  //console.log(fillTileHashes[4]);
  
  
  return fillTileHashes4;
  
  
}















export function logUserAction(userActionHistory, layeredTileHashesDisplay, x, y, tileHash)
{
  ++userActionHistory.counter;
  
  userActionHistory.logs[userActionHistory.counter] =
  {
    x: x,
    y: y,
    oldTileHash: layeredTileHashesDisplay.map[y][x],
    newTileHash: tileHash
  };
  
  // Clear user action entries after the most recent user action
  while (userActionHistory.counter + 1 < userActionHistory.logs.length)
  {
    //console.log((userActionHistory.counter + 1) + ' < ' + userActionHistory.logs.length);
    userActionHistory.logs.pop();
  }
  
  /*
  //console.log(userActionHistory);
  //userActionHistory = userActionHistory.splice(0, userActionHistory.counter);
  */
}

export function undo(mapTileEditorData)
{
  let userActionHistory = mapTileEditorData.userActionHistory;
  
  if (userActionHistory.counter < 0)
  {
    console.warn('Cannot undo anymore.');
    console.warn(userActionHistory);
    return;
  }
  
  let userAction = userActionHistory.logs[userActionHistory.counter];
  // TODO: Check if newTileHash matches correctly
  setTile(mapTileEditorData, userAction.x, userAction.y, userAction.oldTileHash, null, false);
  
  --userActionHistory.counter;
}

export function redo(mapTileEditorData)
{
  let userActionHistory = mapTileEditorData.userActionHistory;
  
  if (userActionHistory.counter + 1 >= userActionHistory.logs.length)
  {
    console.warn('Cannot redo anymore.');
    console.warn(userActionHistory);
    return;
  }
  
  let userAction = userActionHistory.logs[userActionHistory.counter + 1];
  // TODO: Check if newTileHash matches correctly
  setTile(mapTileEditorData, userAction.x, userAction.y, userAction.newTileHash, null, false);
  
  ++userActionHistory.counter;
}













export function setTile(mapTileEditorData, x, y, tileHash, direction = null, isLog = true)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let userActionHistory = mapTileEditorData.userActionHistory;
  
  let modifiedX = x;
  let modifiedY = y;
  
  if (direction === Direction.NORTH)
  {
    modifiedY = y - 1;
  }
  else if (direction === Direction.EAST)
  {
    modifiedX = x + 1;
  }
  else if (direction === Direction.SOUTH)
  {
    modifiedY = y + 1;
  }
  else if (direction === Direction.WEST)
  {
    modifiedX = x - 1;
  }
  
  if (isValidTileCoordinate(layeredTileHashesDisplay.map, modifiedX, modifiedY))
  {
    if (isLog)
    {
      logUserAction(userActionHistory, layeredTileHashesDisplay, modifiedX, modifiedY, tileHash);
    }
    layeredTileHashesDisplay.map[modifiedY][modifiedX] = tileHash;
  }
  else
  {
    console.error('Cannot setTile(...), out of bounds: x = ' + x + ', y = ' + y + ', Direction = ' + direction);
  }
  
  //redrawMap(mapTileEditorData);
}

export function setHoverTile(mapTileEditorData, x, y, tileHash, direction = null)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  
  let modifiedX = x;
  let modifiedY = y;
  
  if (direction === Direction.NORTH)
  {
    modifiedY = y - 1;
  }
  else if (direction === Direction.EAST)
  {
    modifiedX = x + 1;
  }
  else if (direction === Direction.SOUTH)
  {
    modifiedY = y + 1;
  }
  else if (direction === Direction.WEST)
  {
    modifiedX = x - 1;
  }
  
  if (isValidTileCoordinate(layeredTileHashesDisplay.map, modifiedX, modifiedY))
  {
    layeredTileHashesDisplay.hover[modifiedY][modifiedX] = tileHash;
  }
  else
  {
    console.warn('Cannot setHoverTile(...), out of bounds: x = ' + x + ', y = ' + y + ', Direction = ' + direction);
  }
  
  //redrawMap(mapTileEditorData);
}

export function clearHoverTile(mapTileEditorData)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  
  for (let y = 0; y < layeredTileHashesDisplay.hover.length; y++)
  {
    for (let x = 0; x < layeredTileHashesDisplay.hover[y].length; x++)
    {
      layeredTileHashesDisplay.hover[y][x] = null;
    }
  }
  
  //redrawMap(mapTileEditorData);
}









export function redrawAll(mapTileEditorData)
{
  redrawMap(mapTileEditorData);
  redrawNeighborPanes(mapTileEditorData);
  redrawIntersectionPane(mapTileEditorData);
}




export function redrawMap(mapTileEditorData)
{
  let canvas = mapTileEditorData.canvas;
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let context = canvas.getContext('2d');
  
  // Clear the entire canvas
  let point1 = context.transformedPoint(0, 0);
  let point2 = context.transformedPoint(canvas.width, canvas.height);
  context.clearRect(point1.x, point1.y, point2.x - point1.x, point2.y - point1.y);
  
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.restore();
  
  for (let y = 0; y < layeredTileHashesDisplay.map.length; y++)
  {
    for (let x = 0; x < layeredTileHashesDisplay.map[y].length; x++)
    {
      let layeredTopTileHash = getLayeredTopTileHash(layeredTileHashesDisplay, x, y);
      context.drawImage(tileLookup[layeredTopTileHash].image, x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
    }
  }
  
  context.drawImage(cursor.image, cursor.tileX * TILE_WIDTH, cursor.tileY * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
}

export function redrawNeighborPanes(mapTileEditorData)
{
  redrawNeighborPane(mapTileEditorData, Direction.NORTH);
  redrawNeighborPane(mapTileEditorData, Direction.EAST);
  redrawNeighborPane(mapTileEditorData, Direction.SOUTH);
  redrawNeighborPane(mapTileEditorData, Direction.WEST);
}

export function redrawNeighborPane(mapTileEditorData, direction)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  document.getElementById(Ids.neighborPane[direction]).innerHTML = '';
  
  let neighborData = tileLookup[layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX]];
  
  for (let i = 0; neighborData[direction] && i < neighborData[direction].length; i++)
  {
    let neighborTileImage = new Image(TILE_WIDTH * 4, TILE_HEIGHT * 4);
    neighborTileImage.src = tileLookup[neighborData[direction][i]].image.src;
    neighborTileImage.addEventListener('click',
      function()
      {
        setTile(mapTileEditorData, cursor.tileX, cursor.tileY, neighborData[direction][i], direction);
        
        redrawAll(mapTileEditorData);
      }, false);
    neighborTileImage.addEventListener('mouseenter',
      function()
      {
        setHoverTile(mapTileEditorData, cursor.tileX, cursor.tileY, neighborData[direction][i], direction);
        
        redrawMap(mapTileEditorData);
      }, false);
    neighborTileImage.addEventListener('mouseout',
      function()
      {
        clearHoverTile(mapTileEditorData);
        
        redrawMap(mapTileEditorData);
      }, false);
    
    document.getElementById(Ids.neighborPane[direction]).appendChild(neighborTileImage);
  }
}

// TODO: Fix up
// TODO: Is not recalled after doing 'g'
export function redrawIntersectionPane(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  document.getElementById('intersectionPaneStrictId4').innerHTML = '';
  
  let y = cursor.tileY;
  let x = cursor.tileX;
  
  let northTileHash = (y - 1 >= 0) ? layeredTileHashesDisplay.map[y - 1][x] : null;
  let eastTileHash = (x + 1 < layeredTileHashesDisplay.map[0].length) ? layeredTileHashesDisplay.map[y][x + 1] : null;
  let southTileHash = (y + 1 < layeredTileHashesDisplay.map.length) ? layeredTileHashesDisplay.map[y + 1][x] : null;
  let westTileHash = (x - 1 >= 0) ? layeredTileHashesDisplay.map[y][x - 1] : null;
  
  let northNeighborList = !northTileHash || northTileHash === EMPTY_TILE_HASH ? null : tileLookup[northTileHash][Direction.SOUTH];
  let eastNeighborList = !eastTileHash || eastTileHash === EMPTY_TILE_HASH ? null : tileLookup[eastTileHash][Direction.WEST];
  let southNeighborList = !southTileHash || southTileHash === EMPTY_TILE_HASH ? null : tileLookup[southTileHash][Direction.NORTH];
  let westNeighborList = !westTileHash || westTileHash === EMPTY_TILE_HASH ? null : tileLookup[westTileHash][Direction.EAST];
  
  let fillTileHashes = getFillTileHashes(northNeighborList, eastNeighborList, southNeighborList, westNeighborList);
  
  for (let i = 0; fillTileHashes && i < fillTileHashes.length; i++)
  {
    let intersectedTileImage = new Image(TILE_WIDTH * 4, TILE_HEIGHT * 4);
    intersectedTileImage.src = tileLookup[fillTileHashes[i]].image.src;
    intersectedTileImage.addEventListener('click',
      function()
      {
        setTile(mapTileEditorData, cursor.tileX, cursor.tileY, fillTileHashes[i]);
        
        redrawAll(mapTileEditorData);
      }, false);
    intersectedTileImage.addEventListener('mouseenter',
      function()
      {
        setHoverTile(mapTileEditorData, cursor.tileX, cursor.tileY, fillTileHashes[i]);
        
        redrawMap(mapTileEditorData);
      }, false);
    intersectedTileImage.addEventListener('mouseout',
      function()
      {
        clearHoverTile(mapTileEditorData);
        
        redrawMap(mapTileEditorData);
      }, false);
    
    document.getElementById('intersectionPaneStrictId4').appendChild(intersectedTileImage);
  }
}























export function fillMap(mapTileEditorData, x, y, isAnimate)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let fillTileQueue = [];
  fillTileQueue.push({x: x, y: y});
  fillTileQueue.push({x: x, y: y - 1});
  fillTileQueue.push({x: x + 1, y: y});
  fillTileQueue.push({x: x, y: y + 1});
  fillTileQueue.push({x: x - 1, y: y});
  
  let isEmptyMap = true;
  for (let y = 0; y < layeredTileHashesDisplay.map.length; y++)
  {
    for (let x = 0; x < layeredTileHashesDisplay.map[y].length; x++)
    {
      if (layeredTileHashesDisplay.map[y][x] !== EMPTY_TILE_HASH)
      {
        isEmptyMap = false;
        break;
      }
    }
    if (!isEmptyMap)
    {
      break;
    }
  }
  
  if (isEmptyMap)
  {
    let randomTileHash = getRandomTileHash(tileLookup);
    setTile(mapTileEditorData, x, y, randomTileHash);
    
    redrawAll(mapTileEditorData);
  }
  
  if (isAnimate)
  {
    let interval = setInterval(function()
    {
      if (fillTileQueue.length <= 0)
      {
        fillMapSupplement(mapTileEditorData, isAnimate, 4);
        fillMapSupplement(mapTileEditorData, isAnimate, 3);
        fillMapSupplement(mapTileEditorData, isAnimate, 2);
        fillMapSupplement(mapTileEditorData, isAnimate, 1);
        console.log('Stopping interval');
        clearInterval(interval);
        return;
      }
      
      let tileCoordinate = fillTileQueue.shift();
      
      console.log('x: ' + tileCoordinate.x + ', y: ' + tileCoordinate.y + ', fillTileQueue.length = ' + fillTileQueue.length);
      
      if (!isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        return;
      }
      
      if (!isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        return;
      }
      
      cursor.tileX = tileCoordinate.x;
      cursor.tileY = tileCoordinate.y;
      
      //setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, getRandomTileHash(tileLookup));
      let fillTileHash = getFillTileHash(tileLookup, layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, 4);
      setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, fillTileHash);
      
      clearHoverTile(mapTileEditorData);
      //redrawNeighborPanes(mapTileEditorData);
      redrawAll(mapTileEditorData);
      
      if (isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        return;
      }
      
      if (isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.NORTH)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.NORTH)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x, y: tileCoordinate.y - 1});
      }
      if (isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.EAST)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.EAST)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x + 1, y: tileCoordinate.y});
      }
      if (isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.SOUTH)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.SOUTH)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x, y: tileCoordinate.y + 1});
      }
      if (isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.WEST)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.WEST)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x - 1, y: tileCoordinate.y});
      }
    }, 100);
  }
  else
  {
    // TODO: Fix true
    while (true)
    {
      if (fillTileQueue.length <= 0)
      {
        fillMapSupplement(mapTileEditorData, isAnimate, 4);
        fillMapSupplement(mapTileEditorData, isAnimate, 3);
        fillMapSupplement(mapTileEditorData, isAnimate, 2);
        fillMapSupplement(mapTileEditorData, isAnimate, 1);
        console.log('Stopping loop');
        clearHoverTile(mapTileEditorData);
        redrawNeighborPanes(mapTileEditorData);
        redrawAll(mapTileEditorData);
        break;
      }
      
      let tileCoordinate = fillTileQueue.shift();
      
      console.log('x: ' + tileCoordinate.x + ', y: ' + tileCoordinate.y + ', fillTileQueue.length = ' + fillTileQueue.length);
      
      if (!isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        continue;
      }
      
      if (!isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        continue;
      }
      
      cursor.tileX = tileCoordinate.x;
      cursor.tileY = tileCoordinate.y;
      
      //setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, getRandomTileHash(tileLookup));
      let fillTileHash = getFillTileHash(tileLookup, layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, 4);
      setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, fillTileHash);
      
      if (isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        continue;
      }
      
      if (isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.NORTH)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.NORTH)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x, y: tileCoordinate.y - 1});
      }
      if (isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.EAST)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.EAST)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x + 1, y: tileCoordinate.y});
      }
      if (isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.SOUTH)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.SOUTH)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x, y: tileCoordinate.y + 1});
      }
      if (isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.WEST)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.WEST)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x - 1, y: tileCoordinate.y});
      }
    }
  }
}

export function fillMapSupplement(mapTileEditorData, isAnimate, strictness = 4)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let fillTileQueue = [];
  
  for (let y = 0; y < layeredTileHashesDisplay.map.length; y++)
  {
    for (let x = 0; x < layeredTileHashesDisplay.map[y].length; x++)
    {
      if (layeredTileHashesDisplay.map[y][x] === EMPTY_TILE_HASH)
      {
        fillTileQueue.push({x: x, y: y});
      }
    }
  }
  
  if (isAnimate)
  {
    let interval = setInterval(function()
    {
      if (fillTileQueue.length <= 0)
      {
        console.log('Stopping interval');
        clearInterval(interval);
        return;
      }
      
      let tileCoordinate = fillTileQueue.shift();
      
      console.log('strictness: ' + strictness + ', x: ' + tileCoordinate.x + ', y: ' + tileCoordinate.y + ', fillTileQueue.length = ' + fillTileQueue.length);
      
      if (!isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        return;
      }
      
      if (!isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        return;
      }
      
      cursor.tileX = tileCoordinate.x;
      cursor.tileY = tileCoordinate.y;
      
      //setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, getRandomTileHash(tileLookup));
      let fillTileHash = getFillTileHash(tileLookup, layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, strictness);
      setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, fillTileHash);
      
      clearHoverTile(mapTileEditorData);
      //redrawNeighborPanes(mapTileEditorData);
      redrawAll(mapTileEditorData);
      
      if (isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        return;
      }
    }, 100);
  }
  else
  {
    // TODO: Fix true
    while (true)
    {
      if (fillTileQueue.length <= 0)
      {
        console.log('Stopping loop');
        clearHoverTile(mapTileEditorData);
        redrawNeighborPanes(mapTileEditorData);
        redrawAll(mapTileEditorData);
        break;
      }
      
      let tileCoordinate = fillTileQueue.shift();
      
      console.log('strictness: ' + strictness + ', x: ' + tileCoordinate.x + ', y: ' + tileCoordinate.y + ', fillTileQueue.length = ' + fillTileQueue.length);
      
      if (!isValidTileCoordinate(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        continue;
      }
      
      if (!isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        continue;
      }
      
      cursor.tileX = tileCoordinate.x;
      cursor.tileY = tileCoordinate.y;
      
      //setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, getRandomTileHash(tileLookup));
      let fillTileHash = getFillTileHash(tileLookup, layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, strictness);
      setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, fillTileHash);
      
      if (isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        continue;
      }
    }
  }
}

































export function printDebug(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  let userActionHistory = mapTileEditorData.userActionHistory;
  
  console.log('\n\n');
  console.info("*****DEBUG PRINT START*****");
  
  console.info('tileLookup:');
  console.log(tileLookup);
  console.log('\n');
  
  console.info('layeredTileHashesDisplay:');
  console.log(layeredTileHashesDisplay);
  console.log('\n');
  
  console.info('cursor:');
  console.log(cursor);
  console.log('\n');
  
  console.info('userActionHistory:');
  console.log(userActionHistory);
  console.log('\n');
  
  console.info('layeredTileHashesDisplay.map[' + cursor.tileY + '][' + cursor.tileX + ']:');
  console.log(layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX]);
  console.log('\n');
  
  console.log("*****DEBUG PRINT END*****");
}










