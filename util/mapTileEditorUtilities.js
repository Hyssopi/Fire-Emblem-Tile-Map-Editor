
import * as utilities from './utilities.js';

import {TILE_WIDTH, TILE_HEIGHT, CURSOR_TILE_HASH, EMPTY_TILE_HASH, Direction, Ids} from '../scripts/main.js';













export function isValidTileCoordinate(mapWidth, mapHeight, x, y, direction = null)
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
  
  return modifiedY >= 0 && modifiedY < mapHeight
    && modifiedX >= 0 && modifiedX < mapWidth;
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

export function getNeighborTileHashListForPosition(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, direction)
{
  let oppositeDirection = null;
  if (direction === Direction.NORTH)
  {
    oppositeDirection = Direction.SOUTH;
  }
  else if (direction === Direction.EAST)
  {
    oppositeDirection = Direction.WEST;
  }
  else if (direction === Direction.SOUTH)
  {
    oppositeDirection = Direction.NORTH;
  }
  else if (direction === Direction.WEST)
  {
    oppositeDirection = Direction.EAST;
  }
  
  let tileHash = getTileHash(mapTileHashesDisplay, mapWidth, mapHeight, x, y, direction);
  let neighborList = !tileHash || tileHash === EMPTY_TILE_HASH ? null : tileLookup[tileHash][oppositeDirection];
  return neighborList;
}





export function resetMap(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  
  let cursor =
  {
    image: new Image(),
    tileX: 0,
    tileY: 0
  };
  
  let userActionHistory =
  {
    logs: [],
    counter: -1
  };
  
  cursor.image = tileLookup[CURSOR_TILE_HASH].image;
  
  let mapWidth = document.getElementById(Ids.informationDisplayMapBlock.mapWidthTextbox).value;
  let mapHeight = document.getElementById(Ids.informationDisplayMapBlock.mapHeightTextbox).value;
  
  mapWidth = mapWidth ? mapWidth : 1;
  mapHeight = mapHeight ? mapHeight : 1;
  
  let layeredTileHashesDisplay = {};
  layeredTileHashesDisplay.map = [];
  layeredTileHashesDisplay.hover = [];
  for (let y = 0; y < mapHeight; y++)
  {
    let mapTileHashesDisplayRow = [];
    let hoverTileHashesDisplayRow = [];
    for (let x = 0; x < mapWidth; x++)
    {
      mapTileHashesDisplayRow.push(EMPTY_TILE_HASH);
      hoverTileHashesDisplayRow.push(null);
    }
    layeredTileHashesDisplay.map.push(mapTileHashesDisplayRow);
    layeredTileHashesDisplay.hover.push(hoverTileHashesDisplayRow);
  }
  
  mapTileEditorData.mapWidth = mapWidth;
  mapTileEditorData.mapHeight = mapHeight;
  mapTileEditorData.layeredTileHashesDisplay = layeredTileHashesDisplay;
  mapTileEditorData.cursor = cursor;
  mapTileEditorData.userActionHistory = userActionHistory;
  
  redrawAll(mapTileEditorData);
}

export function resizeMap(mapTileEditorData, isLog = true)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let mapWidth = document.getElementById(Ids.informationDisplayMapBlock.mapWidthTextbox).value;
  let mapHeight = document.getElementById(Ids.informationDisplayMapBlock.mapHeightTextbox).value;
  
  mapWidth = mapWidth ? mapWidth : 1;
  mapHeight = mapHeight ? mapHeight : 1;
  
  // Adding new empty rows/columns if needed
  for (let y = 0; y < mapHeight; y++)
  {
    if (layeredTileHashesDisplay.map[y])
    {
      layeredTileHashesDisplay.map.push([]);
    }
    if (layeredTileHashesDisplay.hover[y])
    {
      layeredTileHashesDisplay.hover.push([]);
    }
    for (let x = 0; x < mapWidth; x++)
    {
      if (!layeredTileHashesDisplay.map[y][x])
      {
        layeredTileHashesDisplay.map[y].push(EMPTY_TILE_HASH);
      }
      if (!layeredTileHashesDisplay.hover[y][x])
      {
        layeredTileHashesDisplay.hover[y].push(null);
      }
    }
  }
  
  // Repositioning the cursor
  if (cursor.tileX >= mapWidth)
  {
    cursor.tileX = mapWidth - 1;
  }
  if (cursor.tileY >= mapHeight)
  {
    cursor.tileY = mapHeight - 1;
  }
  
  if (isLog)
  {
    logUserActionResize(mapTileEditorData, mapWidth, mapHeight);
  }
  
  mapTileEditorData.mapWidth = mapWidth;
  mapTileEditorData.mapHeight = mapHeight;
  
  redrawAll(mapTileEditorData);
}

/*
export function exportMap(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay)
{
  exportMapAsImage(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay);
  exportMapAsTileHashes(mapWidth, mapHeight, layeredTileHashesDisplay.map);
}
*/

export function loadMapJson(mapTileEditorData, mapJson)
{
  resetMap(mapTileEditorData);
  
  let mapWidth = mapJson[0].length;
  let mapHeight = mapJson.length;
  
  //mapWidth = mapWidth ? mapWidth : 1;
  //mapHeight = mapHeight ? mapHeight : 1;
  
  document.getElementById(Ids.informationDisplayMapBlock.mapWidthTextbox).value = mapWidth;
  document.getElementById(Ids.informationDisplayMapBlock.mapHeightTextbox).value = mapHeight;
  
  let layeredTileHashesDisplay = {};
  layeredTileHashesDisplay.map = [];
  layeredTileHashesDisplay.hover = [];
  for (let y = 0; y < mapHeight; y++)
  {
    let mapTileHashesDisplayRow = [];
    let hoverTileHashesDisplayRow = [];
    for (let x = 0; x < mapWidth; x++)
    {
      mapTileHashesDisplayRow.push(mapJson[y][x]);
      hoverTileHashesDisplayRow.push(null);
    }
    layeredTileHashesDisplay.map.push(mapTileHashesDisplayRow);
    layeredTileHashesDisplay.hover.push(hoverTileHashesDisplayRow);
  }
  
  mapTileEditorData.mapWidth = mapWidth;
  mapTileEditorData.mapHeight = mapHeight;
  mapTileEditorData.layeredTileHashesDisplay = layeredTileHashesDisplay;
  
  redrawAll(mapTileEditorData);
}

export function exportMapAsTileHashes(mapWidth, mapHeight, mapTileHashesDisplay)
{
  let tileHashesOutput = [];
  for (let y = 0; y < mapHeight; y++)
  {
    let tileHashesOutputRow = [];
    for (let x = 0; x < mapWidth; x++)
    {
      tileHashesOutputRow.push(mapTileHashesDisplay[y][x]);
    }
    tileHashesOutput.push(tileHashesOutputRow);
  }
  
  let mapJsonOutput = JSON.stringify(tileHashesOutput);
  console.log(mapJsonOutput);
  
  utilities.copyTextToClipboard(mapJsonOutput);
  
  window.open('data:application/json,' + encodeURIComponent(mapJsonOutput), '_blank', 'width = 800, height = 600, resizable = 1');
}

export function exportMapAsImage(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay)
{
  let exportCanvas = document.createElement('canvas');
  let exportContext = exportCanvas.getContext('2d');
  
  exportCanvas.width = mapWidth * TILE_WIDTH;
  exportCanvas.height = mapHeight * TILE_HEIGHT;
  
  for (let y = 0; y < mapHeight; y++)
  {
    for (let x = 0; x < mapWidth; x++)
    {
      exportContext.drawImage(tileLookup[layeredTileHashesDisplay.map[y][x]].image, x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
    }
  }
  
  let url = document.createElement('a');
  url.href = exportCanvas.toDataURL();
  
  window.open(url, '_blank', 'width = ' + exportCanvas.width * 2 + ', height = ' + exportCanvas.height * 2 + ', resizable = 1');
}









export function getFillTileHash(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, strictness = 4)
{
  let northNeighborList = getNeighborTileHashListForPosition(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, Direction.NORTH);
  let eastNeighborList = getNeighborTileHashListForPosition(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, Direction.EAST);
  let southNeighborList = getNeighborTileHashListForPosition(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, Direction.SOUTH);
  let westNeighborList = getNeighborTileHashListForPosition(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, Direction.WEST);
  
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
  
  /*
  // TODO: Figure out getTileNeighborSum()
  let returnTileHash = fillTileHashes[0];
  for (let i = 1; i < fillTileHashes.length; i++)
  {
    if (getTileNeighborSum(fillTileHashes[i]) > getTileNeighborSum(returnTileHash))
    {
      returnTileHash = fillTileHashes[i];
    }
  }
  return returnTileHash;
  */
  
  /*
  // TODO: Temporary test, random
  let returnTileHash = fillTileHashes[0];
  for (let i = 1; i < fillTileHashes.length; i++)
  {
    if (getTileNeighborSum(fillTileHashes[i]) > getTileNeighborSum(returnTileHash))
    {
      returnTileHash = fillTileHashes[i];
    }
  }
  if (utilities.isRandomSuccess(10))
  {
    return returnTileHash;
  }
  else
  {
    return fillTileHashes[utilities.generateRandomInteger(0, fillTileHashes.length - 1)];
  }
  */
  
  return fillTileHashes[utilities.generateRandomInteger(0, fillTileHashes.length - 1)];
}

export function getAllUniqueNeighborTileHashes(neighborList1, neighborList2 = null, neighborList3 = null, neighborList4 = null)
{
  let allUniqueNeighborTileHashes = {};
  
  for (let i = 0; neighborList1 && i < neighborList1.length; i++)
  {
    if (allUniqueNeighborTileHashes[neighborList1[i]])
    {
      ++allUniqueNeighborTileHashes[neighborList1[i]];
    }
    else
    {
      allUniqueNeighborTileHashes[neighborList1[i]] = 1;
    }
  }
  
  for (let i = 0; neighborList2 && i < neighborList2.length; i++)
  {
    if (allUniqueNeighborTileHashes[neighborList2[i]])
    {
      ++allUniqueNeighborTileHashes[neighborList2[i]];
    }
    else
    {
      allUniqueNeighborTileHashes[neighborList2[i]] = 1;
    }
  }
  
  for (let i = 0; neighborList3 && i < neighborList3.length; i++)
  {
    if (allUniqueNeighborTileHashes[neighborList3[i]])
    {
      ++allUniqueNeighborTileHashes[neighborList3[i]];
    }
    else
    {
      allUniqueNeighborTileHashes[neighborList3[i]] = 1;
    }
  }
  
  for (let i = 0; neighborList4 && i < neighborList4.length; i++)
  {
    if (allUniqueNeighborTileHashes[neighborList4[i]])
    {
      ++allUniqueNeighborTileHashes[neighborList4[i]];
    }
    else
    {
      allUniqueNeighborTileHashes[neighborList4[i]] = 1;
    }
  }
  
  return allUniqueNeighborTileHashes;
}

export function getFillTileHashes(northNeighborList, eastNeighborList, southNeighborList, westNeighborList, strictness = 4)
{
  let allUniqueNeighborTileHashes = getAllUniqueNeighborTileHashes(northNeighborList, eastNeighborList, southNeighborList, westNeighborList);
  
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
  
  let fillTileHashes = [];
  
  for (let tileHash in allUniqueNeighborTileHashes)
  {
    //console.log(allUniqueNeighborTileHashes[tileHash]);
    if (allUniqueNeighborTileHashes[tileHash] >= strictness - invalidNeighborListCount)
    {
      fillTileHashes.push(tileHash);
    }
  }
  
  return fillTileHashes;
}









export function getFillTileHashesSplit(northNeighborList, eastNeighborList, southNeighborList, westNeighborList)
{
  let allUniqueNeighborTileHashes = getAllUniqueNeighborTileHashes(northNeighborList, eastNeighborList, southNeighborList, westNeighborList);
  
  let fillTileHashesSplit = [];
  fillTileHashesSplit[4] = [];
  fillTileHashesSplit[3] = [];
  fillTileHashesSplit[2] = [];
  fillTileHashesSplit[1] = [];
  
  for (let tileHash in allUniqueNeighborTileHashes)
  {
    let strictness = allUniqueNeighborTileHashes[tileHash];
    fillTileHashesSplit[strictness].push(tileHash);
  }
  
  return fillTileHashesSplit;
}









export function getCalibratedFillTileHashes(mapTileEditorData, x, y)
{
  let mapWidth = mapTileEditorData.mapWidth;
  let mapHeight = mapTileEditorData.mapHeight;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  
  let currentTileHashes =
  {
    north: getTileHash(layeredTileHashesDisplay.map, mapWidth, mapHeight, x, y, Direction.NORTH),
    east: getTileHash(layeredTileHashesDisplay.map, mapWidth, mapHeight, x, y, Direction.EAST),
    south: getTileHash(layeredTileHashesDisplay.map, mapWidth, mapHeight, x, y, Direction.SOUTH),
    west: getTileHash(layeredTileHashesDisplay.map, mapWidth, mapHeight, x, y, Direction.WEST),
    center: getTileHash(layeredTileHashesDisplay.map, mapWidth, mapHeight, x, y)
  }
  let calibratedTileHashes =
  {
    north: 'bc24bc25adbc371c0d6a9cbfa8e9f96d',
    east: 'bc24bc25adbc371c0d6a9cbfa8e9f96d',
    south: 'bc24bc25adbc371c0d6a9cbfa8e9f96d',
    west: 'bc24bc25adbc371c0d6a9cbfa8e9f96d',
    center: 'bc24bc25adbc371c0d6a9cbfa8e9f96d'
  }
  
  setTile(mapTileEditorData, x, y, calibratedTileHashes.north, Direction.NORTH);
  setTile(mapTileEditorData, x, y, calibratedTileHashes.east, Direction.EAST);
  setTile(mapTileEditorData, x, y, calibratedTileHashes.south, Direction.SOUTH);
  setTile(mapTileEditorData, x, y, calibratedTileHashes.west, Direction.WEST);
  setTile(mapTileEditorData, x, y, calibratedTileHashes.center);
  
}



























export function getTileNeighborList(tileLookup, tileHash, direction)
{
  return !tileHash || tileHash === EMPTY_TILE_HASH ? [] : tileLookup[tileHash][direction];
}

export function getTileNeighborSum(tileLookup, tileHash)
{
  let northNeighborList = getTileNeighborList(tileLookup, tileHash, Direction.NORTH);
  let eastNeighborList = getTileNeighborList(tileLookup, tileHash, Direction.EAST);
  let southNeighborList = getTileNeighborList(tileLookup, tileHash, Direction.SOUTH);
  let westNeighborList = getTileNeighborList(tileLookup, tileHash, Direction.WEST);
  
  return northNeighborList.length + eastNeighborList.length + southNeighborList.length + westNeighborList.length;
}









export function logUserActionResize(mapTileEditorData, newMapWidth, newMapHeight)
{
  let userActionHistory = mapTileEditorData.userActionHistory;
  
  if (mapTileEditorData.mapWidth === newMapWidth && mapTileEditorData.mapHeight === newMapHeight)
  {
    console.warn('Will not log user action resize, same old/new map width: ' + newMapWidth + ', height: ' + newMapHeight);
    return;
  }
  
  ++userActionHistory.counter;
  
  userActionHistory.logs[userActionHistory.counter] =
  {
    oldMapWidth: mapTileEditorData.mapWidth,
    oldMapHeight: mapTileEditorData.mapHeight,
    newMapWidth: newMapWidth,
    newMapHeight: newMapHeight
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



export function logUserActionTile(userActionHistory, layeredTileHashesDisplay, x, y, tileHash)
{
  if (layeredTileHashesDisplay.map[y][x] === tileHash)
  {
    console.warn('Will not log user action tile, same old/new tile hash: ' + tileHash);
    return;
  }
  
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
  if (userAction.oldTileHash)
  {
    // TODO: Check if newTileHash matches correctly
    setTile(mapTileEditorData, userAction.x, userAction.y, userAction.oldTileHash, null, false);
  }
  else if (userAction.oldMapWidth && userAction.oldMapHeight)
  {
    // TODO: Check if newMapWidth/newMapHeight
    document.getElementById(Ids.informationDisplayMapBlock.mapWidthTextbox).value = userAction.oldMapWidth;
    document.getElementById(Ids.informationDisplayMapBlock.mapHeightTextbox).value = userAction.oldMapHeight;
    
    resizeMap(mapTileEditorData, false);
  }
  
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
  if (userAction.newTileHash)
  {
    // TODO: Check if oldTileHash matches correctly
    setTile(mapTileEditorData, userAction.x, userAction.y, userAction.newTileHash, null, false);
  }
  else if (userAction.newMapWidth && userAction.newMapHeight)
  {
    // TODO: Check if oldMapWidth/oldMapHeight
    document.getElementById(Ids.informationDisplayMapBlock.mapWidthTextbox).value = userAction.newMapWidth;
    document.getElementById(Ids.informationDisplayMapBlock.mapHeightTextbox).value = userAction.newMapHeight;
    
    resizeMap(mapTileEditorData, false);
  }
  
  ++userActionHistory.counter;
}









export function getTileHash(mapTileHashesDisplay, mapWidth, mapHeight, x, y, direction = null)
{
  let tileHash = null;
  
  if (isValidTileCoordinate(mapWidth, mapHeight, x, y, direction))
  {
    if (direction === Direction.NORTH)
    {
      tileHash = mapTileHashesDisplay[y - 1][x];
    }
    else if (direction === Direction.EAST)
    {
      tileHash = mapTileHashesDisplay[y][x + 1];
    }
    else if (direction === Direction.SOUTH)
    {
      tileHash = mapTileHashesDisplay[y + 1][x];
    }
    else if (direction === Direction.WEST)
    {
      tileHash = mapTileHashesDisplay[y][x - 1];
    }
    else
    {
      tileHash = mapTileHashesDisplay[y][x];
    }
  }
  
  return tileHash;
}



export function setTile(mapTileEditorData, x, y, tileHash, direction = null, isLog = true)
{
  let mapWidth = mapTileEditorData.mapWidth;
  let mapHeight = mapTileEditorData.mapHeight;
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
  
  if (isValidTileCoordinate(mapWidth, mapHeight, modifiedX, modifiedY))
  {
    if (isLog)
    {
      logUserActionTile(userActionHistory, layeredTileHashesDisplay, modifiedX, modifiedY, tileHash);
    }
    layeredTileHashesDisplay.map[modifiedY][modifiedX] = tileHash;
  }
  else
  {
    console.error('Cannot setTile(...), out of bounds: x = ' + x + ', y = ' + y + ', Direction = ' + direction);
  }
}

export function setHoverTile(mapTileEditorData, x, y, tileHash, direction = null)
{
  let mapWidth = mapTileEditorData.mapWidth;
  let mapHeight = mapTileEditorData.mapHeight;
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
  
  if (isValidTileCoordinate(mapWidth, mapHeight, modifiedX, modifiedY))
  {
    layeredTileHashesDisplay.hover[modifiedY][modifiedX] = tileHash;
  }
  else
  {
    console.warn('Cannot setHoverTile(...), out of bounds: x = ' + x + ', y = ' + y + ', Direction = ' + direction);
  }
}

export function clearHoverTile(layeredTileHashesDisplay)
{
  for (let y = 0; y < layeredTileHashesDisplay.hover.length; y++)
  {
    for (let x = 0; x < layeredTileHashesDisplay.hover[y].length; x++)
    {
      layeredTileHashesDisplay.hover[y][x] = null;
    }
  }
}









export function redrawAll(mapTileEditorData)
{
  redrawMap(mapTileEditorData);
  redrawNeighborPanes(mapTileEditorData);
  redrawIntersectionPanes(mapTileEditorData);
  updateInformationDisplayTile(mapTileEditorData);
}




export function redrawMap(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let canvas = mapTileEditorData.canvas;
  let mapWidth = mapTileEditorData.mapWidth;
  let mapHeight = mapTileEditorData.mapHeight;
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
  
  for (let y = 0; y < mapHeight; y++)
  {
    for (let x = 0; x < mapWidth; x++)
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
  
  let cursorTileData = tileLookup[layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX]];
  
  for (let i = 0; cursorTileData[direction] && i < cursorTileData[direction].length; i++)
  {
    let neighborTileImage = new Image(TILE_WIDTH * 2, TILE_HEIGHT * 2);
    neighborTileImage.src = tileLookup[cursorTileData[direction][i]].image.src;
    neighborTileImage.addEventListener('click',
      function()
      {
        setTile(mapTileEditorData, cursor.tileX, cursor.tileY, cursorTileData[direction][i], direction);
        
        redrawAll(mapTileEditorData);
      }, false);
    neighborTileImage.addEventListener('mouseenter',
      function()
      {
        setHoverTile(mapTileEditorData, cursor.tileX, cursor.tileY, cursorTileData[direction][i], direction);
        
        redrawMap(mapTileEditorData);
      }, false);
    neighborTileImage.addEventListener('mouseout',
      function()
      {
        clearHoverTile(layeredTileHashesDisplay);
        
        redrawMap(mapTileEditorData);
      }, false);
    
    document.getElementById(Ids.neighborPane[direction]).appendChild(neighborTileImage);
  }
}

export function redrawIntersectionPanes(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let mapWidth = mapTileEditorData.mapWidth;
  let mapHeight = mapTileEditorData.mapHeight;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let y = cursor.tileY;
  let x = cursor.tileX;
  
  let northNeighborList = getNeighborTileHashListForPosition(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay.map, x, y, Direction.NORTH);
  let eastNeighborList = getNeighborTileHashListForPosition(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay.map, x, y, Direction.EAST);
  let southNeighborList = getNeighborTileHashListForPosition(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay.map, x, y, Direction.SOUTH);
  let westNeighborList = getNeighborTileHashListForPosition(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay.map, x, y, Direction.WEST);
  
  let fillTileHashesSplit = getFillTileHashesSplit(northNeighborList, eastNeighborList, southNeighborList, westNeighborList);
  
  redrawIntersectionPane(mapTileEditorData, fillTileHashesSplit[4], 4);
  redrawIntersectionPane(mapTileEditorData, fillTileHashesSplit[3], 3);
  redrawIntersectionPane(mapTileEditorData, fillTileHashesSplit[2], 2);
  redrawIntersectionPane(mapTileEditorData, fillTileHashesSplit[1], 1);
}

export function redrawIntersectionPane(mapTileEditorData, fillTileHashes, strictness)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  document.getElementById(Ids.intersectionPane[strictness]).innerHTML = '';
  
  for (let i = 0; fillTileHashes && i < fillTileHashes.length; i++)
  {
    let intersectedTileImage = new Image(TILE_WIDTH * 2, TILE_HEIGHT * 2);
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
        clearHoverTile(layeredTileHashesDisplay);
        
        redrawMap(mapTileEditorData);
      }, false);
    
    document.getElementById(Ids.intersectionPane[strictness]).appendChild(intersectedTileImage);
  }
  document.getElementById(Ids.intersectionPane[strictness]).parentElement.style.backgroundColor = fillTileHashes && fillTileHashes.length <= 0 ? 'red' : 'white';
}

export function updateInformationDisplayTile(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let tileHash = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX];
  
  document.getElementById(Ids.informationDisplayTileBlock.tileType).textContent = tileLookup[tileHash].group;
  document.getElementById(Ids.informationDisplayTileBlock.cursorPositionX).textContent = cursor.tileX + 1;
  document.getElementById(Ids.informationDisplayTileBlock.cursorPositionY).textContent = cursor.tileY + 1;
  document.getElementById(Ids.informationDisplayTileBlock.tileDescription).textContent = tileLookup[tileHash].description;
}



















export function fillMap(mapTileEditorData, x, y, minimumStrictness, isAnimate)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let mapWidth = mapTileEditorData.mapWidth;
  let mapHeight = mapTileEditorData.mapHeight;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let fillTileQueue = [];
  fillTileQueue.push({x: x, y: y});
  fillTileQueue.push({x: x, y: y - 1});
  fillTileQueue.push({x: x + 1, y: y});
  fillTileQueue.push({x: x, y: y + 1});
  fillTileQueue.push({x: x - 1, y: y});
  
  let isEmptyMap = true;
  for (let y = 0; y < mapHeight; y++)
  {
    for (let x = 0; x < mapWidth; x++)
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
    
    if (isAnimate)
    {
      redrawAll(mapTileEditorData);
    }
  }
  
  if (isAnimate)
  {
    let interval = setInterval(function()
    {
      if (fillTileQueue.length <= 0)
      {
        for (let i = 4; i >= minimumStrictness; i--)
        {
          fillMapSupplement(mapTileEditorData, i, isAnimate);
        }
        console.log('Stopping interval');
        clearInterval(interval);
        return;
      }
      
      let tileCoordinate = fillTileQueue.shift();
      
      console.log('x: ' + tileCoordinate.x + ', y: ' + tileCoordinate.y + ', fillTileQueue.length = ' + fillTileQueue.length);
      
      if (!isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y))
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
      let fillTileHash = getFillTileHash(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, 4);
      setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, fillTileHash);
      
      clearHoverTile(layeredTileHashesDisplay);
      //redrawNeighborPanes(mapTileEditorData);
      redrawAll(mapTileEditorData);
      
      if (isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        return;
      }
      
      if (isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.NORTH)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.NORTH)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x, y: tileCoordinate.y - 1});
      }
      if (isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.EAST)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.EAST)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x + 1, y: tileCoordinate.y});
      }
      if (isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.SOUTH)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.SOUTH)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x, y: tileCoordinate.y + 1});
      }
      if (isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.WEST)
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
        for (let i = 4; i >= minimumStrictness; i--)
        {
          fillMapSupplement(mapTileEditorData, i, isAnimate);
        }
        console.log('Stopping loop');
        clearHoverTile(layeredTileHashesDisplay);
        redrawNeighborPanes(mapTileEditorData);
        redrawAll(mapTileEditorData);
        break;
      }
      
      let tileCoordinate = fillTileQueue.shift();
      
      console.log('x: ' + tileCoordinate.x + ', y: ' + tileCoordinate.y + ', fillTileQueue.length = ' + fillTileQueue.length);
      
      if (!isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y))
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
      let fillTileHash = getFillTileHash(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, 4);
      setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, fillTileHash);
      
      if (isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
      {
        continue;
      }
      
      if (isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.NORTH)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.NORTH)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x, y: tileCoordinate.y - 1});
      }
      if (isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.EAST)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.EAST)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x + 1, y: tileCoordinate.y});
      }
      if (isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.SOUTH)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.SOUTH)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x, y: tileCoordinate.y + 1});
      }
      if (isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.WEST)
        && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.WEST)
      )
      {
        fillTileQueue.push({x: tileCoordinate.x - 1, y: tileCoordinate.y});
      }
    }
  }
}

export function fillMapSupplement(mapTileEditorData, strictness, isAnimate)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let mapWidth = mapTileEditorData.mapWidth;
  let mapHeight = mapTileEditorData.mapHeight;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let fillTileQueue = [];
  
  for (let y = 0; y < mapHeight; y++)
  {
    for (let x = 0; x < mapWidth; x++)
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
      
      if (!isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y))
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
      let fillTileHash = getFillTileHash(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, strictness);
      setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, fillTileHash);
      
      clearHoverTile(layeredTileHashesDisplay);
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
        clearHoverTile(layeredTileHashesDisplay);
        redrawNeighborPanes(mapTileEditorData);
        redrawAll(mapTileEditorData);
        break;
      }
      
      let tileCoordinate = fillTileQueue.shift();
      
      console.log('strictness: ' + strictness + ', x: ' + tileCoordinate.x + ', y: ' + tileCoordinate.y + ', fillTileQueue.length = ' + fillTileQueue.length);
      
      if (!isValidTileCoordinate(mapWidth, mapHeight, tileCoordinate.x, tileCoordinate.y))
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
      let fillTileHash = getFillTileHash(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, strictness);
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
  let mapWidth = mapTileEditorData.mapWidth;
  let mapHeight = mapTileEditorData.mapHeight;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  let userActionHistory = mapTileEditorData.userActionHistory;
  
  console.log('\n\n');
  console.info("*****DEBUG PRINT START*****");
  
  console.info('tileLookup:');
  console.log(tileLookup);
  console.log('\n');
  
  console.info('mapWidth:');
  console.log(mapWidth);
  console.log('\n');
  
  console.info('mapHeight:');
  console.log(mapHeight);
  console.log('\n');
  
  console.info('layeredTileHashesDisplay:');
  console.log(layeredTileHashesDisplay);
  console.log('\n');
  
  console.info('cursor:');
  console.log(cursor);
  console.log('\n');
  
  console.info('layeredTileHashesDisplay.map[' + cursor.tileY + '][' + cursor.tileX + ']:');
  console.log(layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX]);
  console.log('\n');
  
  console.info('getTileNeighborSum:');
  console.log(getTileNeighborSum(tileLookup, layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX]));
  console.log('\n');
  
  console.info('userActionHistory:');
  console.log(userActionHistory);
  console.log('\n');
  
  console.log("*****DEBUG PRINT END*****");
}










