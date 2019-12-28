
import * as utilities from './utilities.js';

import {TILE_WIDTH, TILE_HEIGHT, CURSOR_TILE_HASH, EMPTY_TILE_HASH, Direction, Ids, BackgroundColor} from '../scripts/main.js';


/**
 * Checks to see if input coordinate is valid for the map size.
 * 
 * @param mapWidth Tile width of the map
 * @param mapHeight Tile height of the map
 * @param x Horizontal tile position, starting from the left (0)
 * @param y Vertical tile position, starting from the top (0)
 * @param direction Modified direction of the input coordinate
 * @returns True if input coordinate is valid, false otherwise
 */
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

/**
 * Checks to see if input coordinate on map is empty tile.
 * 
 * @param mapTileHashesDisplay 2D array containing tile hashes representing the tiles on the map
 * @param x Horizontal tile position, starting from the left (0)
 * @param y Vertical tile position, starting from the top (0)
 * @param direction Modified direction of the input coordinate
 * @returns True if input coordinate on map is empty tile, false otherwise
 */
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

/**
 * Get a random tile hash from all possible tile hashes.
 * 
 * @param tileLookup Contains the data for all tiles, tile hash is the key
 * @returns Random tile hash from all possible tile hashes
 */
export function getRandomTileHash(tileLookup)
{
  let keys = Object.keys(tileLookup);
  return keys[utilities.generateRandomInteger(0, keys.length - 1)];
}

/**
 * Gets the top tile hash of the map and hover layers. Hover layer having higher priority to be shown.
 * 
 * @param layeredTileHashesDisplay Contains the 2D array for map (mapTileHashesDisplay) and 2D array for hover
 * @param x Horizontal tile position, starting from the left (0)
 * @param y Vertical tile position, starting from the top (0)
 * @returns Top tile hash of the map and hover layers
 */
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

/**
 * Get the tile hash of the given input coordinate. Returns null if the input coordinate is invalid.
 * 
 * @param mapWidth Tile width of the map
 * @param mapHeight Tile height of the map
 * @param mapTileHashesDisplay 2D array containing tile hashes representing the tiles on the map
 * @param x Horizontal tile position, starting from the left (0)
 * @param y Vertical tile position, starting from the top (0)
 * @param direction Modified direction of the input coordinate
 * @returns Tile hash of the given input coordinate, null if the input coordinate is invalid
 */
export function getTileHash(mapWidth, mapHeight, mapTileHashesDisplay, x, y, direction = null)
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

/**
 * Get the neighbor's tile neighbor list for the input coordinate. This is used to calculate the list of possible tiles at the input coordinate based on the neighbors.
 * 
 * @param tileLookup Contains the data for all tiles, tile hash is the key
 * @param mapWidth Tile width of the map
 * @param mapHeight Tile height of the map
 * @param mapTileHashesDisplay 2D array containing tile hashes representing the tiles on the map
 * @param x Horizontal tile position, starting from the left (0)
 * @param y Vertical tile position, starting from the top (0)
 * @param direction Direction from the input coordinate
 * @returns Neighbor's tile neighbor list for the input coordinate
 */
export function getNeighborTileHashListForXYPosition(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, direction)
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
  
  let tileHash = getTileHash(mapWidth, mapHeight, mapTileHashesDisplay, x, y, direction);
  return getTileNeighborList(tileLookup, tileHash, oppositeDirection);
}

/**
 * Get the neighbor list at the direction for the input coordinate.
 * 
 * @param tileLookup Contains the data for all tiles, tile hash is the key
 * @param tileHash Tile hash, used as key for the tileLookup to obtain the tile's data
 * @param direction Direction from the input coordinate
 * @returns Neighbor list at the direction for the input coordinate
 */
export function getTileNeighborList(tileLookup, tileHash, direction)
{
  return !tileHash || tileHash === EMPTY_TILE_HASH ? null : tileLookup[tileHash][direction];
}

/**
 * Get the total sum count of all neighbor tiles for a given tile.
 * 
 * @param tileLookup Contains the data for all tiles, tile hash is the key
 * @param tileHash Tile hash, used as key for the tileLookup to obtain the tile's data
 * @returns Total sum count of all neighbor tiles for a given tile
 */
export function getTileNeighborSum(tileLookup, tileHash)
{
  let northNeighborList = getTileNeighborList(tileLookup, tileHash, Direction.NORTH);
  let eastNeighborList = getTileNeighborList(tileLookup, tileHash, Direction.EAST);
  let southNeighborList = getTileNeighborList(tileLookup, tileHash, Direction.SOUTH);
  let westNeighborList = getTileNeighborList(tileLookup, tileHash, Direction.WEST);
  
  let northNeighborListLength = northNeighborList ? northNeighborList.length : 0;
  let eastNeighborListLength = eastNeighborList ? eastNeighborList.length : 0;
  let southNeighborListLength = southNeighborList ? southNeighborList.length : 0;
  let westNeighborListLength = westNeighborList ? westNeighborList.length : 0;
  
  return northNeighborListLength + eastNeighborListLength + southNeighborListLength + westNeighborListLength;
}

/**
 * Reset the map.
 * 
 * @param mapTileEditorData Contains the data used by the editor
 */
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
  
  let mapWidth = document.getElementById(Ids.toolbar.mapControlBlock.mapWidthTextbox).valueAsNumber;
  let mapHeight = document.getElementById(Ids.toolbar.mapControlBlock.mapHeightTextbox).valueAsNumber;
  
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

/**
 * Resize the map.
 * 
 * @param mapTileEditorData Contains the data used by the editor
 * @param isLog Whether to log the action to the userActionHistory
 */
export function resizeMap(mapTileEditorData, isLog)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let mapWidth = document.getElementById(Ids.toolbar.mapControlBlock.mapWidthTextbox).valueAsNumber;
  let mapHeight = document.getElementById(Ids.toolbar.mapControlBlock.mapHeightTextbox).valueAsNumber;
  
  mapWidth = mapWidth ? mapWidth : 1;
  mapHeight = mapHeight ? mapHeight : 1;
  
  // Adding new empty rows/columns if needed
  for (let y = 0; y < mapHeight; y++)
  {
    if (!layeredTileHashesDisplay.map[y])
    {
      layeredTileHashesDisplay.map.push([]);
    }
    if (!layeredTileHashesDisplay.hover[y])
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

/**
 * Load map from JSON data.
 * 
 * @param mapTileEditorData Contains the data used by the editor
 * @param mapJson 2D array containing the tile hashes of the map read from the JSON file
 */
export function loadMapJson(mapTileEditorData, mapJson)
{
  resetMap(mapTileEditorData);
  
  let mapWidth = mapJson[0].length;
  let mapHeight = mapJson.length;
  
  document.getElementById(Ids.toolbar.mapControlBlock.mapWidthTextbox).valueAsNumber = mapWidth;
  document.getElementById(Ids.toolbar.mapControlBlock.mapHeightTextbox).valueAsNumber = mapHeight;
  
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

/**
 * Opens a new window containing the JSON data of the current map. User can save the page as a JSON file. Also copies the JSON data to the clipboard.
 * 
 * @param mapWidth Tile width of the map
 * @param mapHeight Tile height of the map
 * @param mapTileHashesDisplay 2D array containing tile hashes representing the tiles on the map
 */
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
  //console.log(mapJsonOutput);
  
  utilities.copyTextToClipboard(mapJsonOutput);
  
  window.open('data:application/json,' + encodeURIComponent(mapJsonOutput), '_blank', 'width = 800, height = 600, resizable = 1');
  
  console.info('Save the opened new window as a JSON file.\nCtrl+S --> Map1.json (example)');
}

/**
 * Opens a new window containing the map image of the current map. User can save the page as a PNG file.
 * 
 * @param tileLookup Contains the data for all tiles, tile hash is the key
 * @param mapWidth Tile width of the map
 * @param mapHeight Tile height of the map
 * @param mapTileHashesDisplay 2D array containing tile hashes representing the tiles on the map
 */
export function exportMapAsImage(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay)
{
  let exportCanvas = document.createElement('canvas');
  let exportContext = exportCanvas.getContext('2d');
  
  exportCanvas.width = mapWidth * TILE_WIDTH;
  exportCanvas.height = mapHeight * TILE_HEIGHT;
  
  for (let y = 0; y < mapHeight; y++)
  {
    for (let x = 0; x < mapWidth; x++)
    {
      exportContext.drawImage(tileLookup[mapTileHashesDisplay[y][x]].image, x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
    }
  }
  
  let url = document.createElement('a');
  url.href = exportCanvas.toDataURL();
  
  window.open(url, '_blank', 'width = ' + exportCanvas.width * 2 + ', height = ' + exportCanvas.height * 2 + ', resizable = 1');
}

/**
 * Get a tile hash for the given input coordinate from calculations based on the neighbors and strictness.
 * 
 * @param tileLookup Contains the data for all tiles, tile hash is the key
 * @param mapWidth Tile width of the map
 * @param mapHeight Tile height of the map
 * @param mapTileHashesDisplay 2D array containing tile hashes representing the tiles on the map
 * @param x Horizontal tile position, starting from the left (0)
 * @param y Vertical tile position, starting from the top (0)
 * @param strictness Strictness used in the calculations
 * @returns Tile hash for the given input coordinate from calculations based on the neighbors and strictness
 */
export function getFillTileHash(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, strictness)
{
  let possibleTileHashLists = [];
  possibleTileHashLists.push(getNeighborTileHashListForXYPosition(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, Direction.NORTH));
  possibleTileHashLists.push(getNeighborTileHashListForXYPosition(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, Direction.EAST));
  possibleTileHashLists.push(getNeighborTileHashListForXYPosition(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, Direction.SOUTH));
  possibleTileHashLists.push(getNeighborTileHashListForXYPosition(tileLookup, mapWidth, mapHeight, mapTileHashesDisplay, x, y, Direction.WEST));
  
  let fillTileHashes = getFillTileHashes(possibleTileHashLists, strictness);
  
  return getOneTileHash(fillTileHashes);
}

/**
 * Get a tile hash randomly from a list of tile hashes.
 * 
 * @param tileHashes List of tile hashes
 * @returns A tile hash randomly from a list of tile hashes
 */
export function getOneTileHash(tileHashes)
{
  if (!tileHashes || tileHashes.length <= 0)
  {
    return EMPTY_TILE_HASH;
  }
  
  /*
  // TODO: Figure out getTileNeighborSum()
  let returnTileHash = tileHashes[0];
  for (let i = 1; i < tileHashes.length; i++)
  {
    if (getTileNeighborSum(tileHashes[i]) > getTileNeighborSum(returnTileHash))
    {
      returnTileHash = tileHashes[i];
    }
  }
  return returnTileHash;
  */
  
  /*
  // TODO: Temporary test, random
  let returnTileHash = tileHashes[0];
  for (let i = 1; i < tileHashes.length; i++)
  {
    if (getTileNeighborSum(tileHashes[i]) > getTileNeighborSum(returnTileHash))
    {
      returnTileHash = tileHashes[i];
    }
  }
  if (utilities.isRandomSuccess(10))
  {
    return returnTileHash;
  }
  else
  {
    return tileHashes[utilities.generateRandomInteger(0, tileHashes.length - 1)];
  }
  */
  
  return tileHashes[utilities.generateRandomInteger(0, tileHashes.length - 1)];
}

/**
 * Get a list of unique tile hashes, key is tile hash and value is the number of duplicates/repeats.
 * 
 * @param tileHashLists List of lists of tile hashes
 * @returns A list of unique tile hashes, key is tile hash and value is the number of duplicates/repeats
 */
export function getAllUniqueTileHashes(tileHashLists)
{
  let allUniqueTileHashes = {};
  
  for (let tileHashList of tileHashLists)
  {
    if (!tileHashList)
    {
      continue;
    }
    for (let tileHash of tileHashList)
    {
      if (allUniqueTileHashes[tileHash])
      {
        ++allUniqueTileHashes[tileHash];
      }
      else
      {
        allUniqueTileHashes[tileHash] = 1;
      }
    }
  }
  
  return allUniqueTileHashes;
}

/**
 * Get a list of tile hashes from calculations based on the valid neighbor lists and strictness.
 * 
 * @param possibleTileHashLists List of possible lists of tile hashes
 * @param strictness Strictness used in the calculations
 * @returns A list of tile hashes from calculations based on the valid neighbor lists and strictness
 */
export function getFillTileHashes(possibleTileHashLists, strictness)
{
  let allUniqueTileHashes = getAllUniqueTileHashes(possibleTileHashLists);
  
  if (possibleTileHashLists.length != 4)
  {
    console.warn('getFillTileHashes, possibleTileHashLists is not length 4, something must be wrong');
  }
  
  // Count up the number of invalid neighbor lists
  let invalidNeighborListCount = 0;
  for (let possibleTileHashList of possibleTileHashLists)
  {
    if (!possibleTileHashList)
    {
      ++invalidNeighborListCount;
    }
  }
  
  let fillTileHashes = [];
  
  for (let tileHash in allUniqueTileHashes)
  {
    // Add the tileHash based on strictness, adjusted with the amount of invalid neighbors
    if (allUniqueTileHashes[tileHash] >= strictness - invalidNeighborListCount)
    {
      fillTileHashes.push(tileHash);
    }
  }
  
  return fillTileHashes;
}

/**
 * Get a list of tile hashes split by strictness.
 * 
 * @param possibleTileHashLists List of possible lists of tile hashes
 * @returns A list of tile hashes split by strictness
 */
export function getFillTileHashesSplit(possibleTileHashLists)
{
  let allUniqueTileHashes = getAllUniqueTileHashes(possibleTileHashLists);
  
  if (possibleTileHashLists.length != 4)
  {
    console.warn('getFillTileHashesSplit, possibleTileHashLists is not length 4, something must be wrong');
  }
  
  let fillTileHashesSplit = [];
  fillTileHashesSplit[4] = [];
  fillTileHashesSplit[3] = [];
  fillTileHashesSplit[2] = [];
  fillTileHashesSplit[1] = [];
  
  for (let tileHash in allUniqueTileHashes)
  {
    let strictness = allUniqueTileHashes[tileHash];
    fillTileHashesSplit[strictness].push(tileHash);
  }
  
  return fillTileHashesSplit;
}















export function calibrateTileHashes(mapTileEditorData, originX, originY, minimumStrictness, calibrateRange, isAnimate)
{
  let inputFillTileQueue = [];
  
  if (!calibrateRange || calibrateRange < 0)
  {
    console.warn('calibrateRange is not valid');
    calibrateRange = 0;
  }
  
  for (let y = originY - calibrateRange; y <= originY + calibrateRange; y++)
  {
    for (let x = originX - calibrateRange; x <= originX + calibrateRange; x++)
    {
      if (isValidTileCoordinate(mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, x, y))
      {
        setTile(mapTileEditorData, x, y, EMPTY_TILE_HASH);
        inputFillTileQueue.push({x: x, y: y});
      }
    }
  }
  
  for (let i = 4; i >= minimumStrictness; i--)
  {
    fillMapSupplement(mapTileEditorData, i, isAnimate, inputFillTileQueue);
  }
  
  mapTileEditorData.cursor.tileX = originX;
  mapTileEditorData.cursor.tileY = originY;
  
  redrawAll(mapTileEditorData);
}



export function fillMap(mapTileEditorData, x, y, minimumStrictness, isAnimate)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  
  let fillTileQueue = [];
  
  fillTileQueue.push({x: x, y: y});
  fillTileQueue.push({x: x, y: y - 1});
  fillTileQueue.push({x: x + 1, y: y});
  fillTileQueue.push({x: x, y: y + 1});
  fillTileQueue.push({x: x - 1, y: y});
  
  let isEmptyMap = true;
  for (let loopY = 0; loopY < mapTileEditorData.mapHeight; loopY++)
  {
    for (let loopX = 0; loopX < mapTileEditorData.mapWidth; loopX++)
    {
      if (layeredTileHashesDisplay.map[loopY][loopX] !== EMPTY_TILE_HASH)
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
      
      fillMapProcessNextFillTileQueue(mapTileEditorData, fillTileQueue, isAnimate);
    }, 100);
  }
  else
  {
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
      
      fillMapProcessNextFillTileQueue(mapTileEditorData, fillTileQueue, isAnimate);
    }
  }
}

// Note: strictness set to 4
function fillMapProcessNextFillTileQueue(mapTileEditorData, fillTileQueue, isAnimate)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let tileCoordinate = fillTileQueue.shift();
  
  //console.log('x: ' + tileCoordinate.x + ', y: ' + tileCoordinate.y + ', fillTileQueue.length = ' + fillTileQueue.length);
  
  if (!isValidTileCoordinate(mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, tileCoordinate.x, tileCoordinate.y))
  {
    return;
  }
  
  if (!isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
  {
    return;
  }
  
  cursor.tileX = tileCoordinate.x;
  cursor.tileY = tileCoordinate.y;
  
  let fillTileHash = getFillTileHash(tileLookup, mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, 4);
  setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, fillTileHash);
  
  if (isAnimate)
  {
    clearHoverTile(layeredTileHashesDisplay);
    redrawAll(mapTileEditorData);
  }
  
  if (isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
  {
    return;
  }
  
  if (isValidTileCoordinate(mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.NORTH)
    && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.NORTH)
  )
  {
    fillTileQueue.push({x: tileCoordinate.x, y: tileCoordinate.y - 1});
  }
  if (isValidTileCoordinate(mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.EAST)
    && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.EAST)
  )
  {
    fillTileQueue.push({x: tileCoordinate.x + 1, y: tileCoordinate.y});
  }
  if (isValidTileCoordinate(mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.SOUTH)
    && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.SOUTH)
  )
  {
    fillTileQueue.push({x: tileCoordinate.x, y: tileCoordinate.y + 1});
  }
  if (isValidTileCoordinate(mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, tileCoordinate.x, tileCoordinate.y, Direction.WEST)
    && isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, Direction.WEST)
  )
  {
    fillTileQueue.push({x: tileCoordinate.x - 1, y: tileCoordinate.y});
  }
}

export function fillMapSupplement(mapTileEditorData, strictness, isAnimate, inputFillTileQueue = [])
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  
  let fillTileQueue = [];
  
  if (inputFillTileQueue.length > 0)
  {
    for (let tilePosition of inputFillTileQueue)
    {
      fillTileQueue.push({x: tilePosition.x, y: tilePosition.y});
    }
  }
  
  if (fillTileQueue.length === 0)
  {
    for (let y = 0; y < mapTileEditorData.mapHeight; y++)
    {
      for (let x = 0; x < mapTileEditorData.mapWidth; x++)
      {
        if (layeredTileHashesDisplay.map[y][x] === EMPTY_TILE_HASH)
        {
          fillTileQueue.push({x: x, y: y});
        }
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
      
      fillMapSupplementProcessNextFillTileQueue(mapTileEditorData, fillTileQueue, strictness, isAnimate);
    }, 100);
  }
  else
  {
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
      
      fillMapSupplementProcessNextFillTileQueue(mapTileEditorData, fillTileQueue, strictness, isAnimate);
    }
  }
}

function fillMapSupplementProcessNextFillTileQueue(mapTileEditorData, fillTileQueue, strictness, isAnimate)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let tileCoordinate = fillTileQueue.shift();
  
  //console.log('strictness: ' + strictness + ', x: ' + tileCoordinate.x + ', y: ' + tileCoordinate.y + ', fillTileQueue.length = ' + fillTileQueue.length);
  
  if (!isValidTileCoordinate(mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, tileCoordinate.x, tileCoordinate.y))
  {
    return;
  }
  
  if (!isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
  {
    return;
  }
  
  cursor.tileX = tileCoordinate.x;
  cursor.tileY = tileCoordinate.y;
  
  let fillTileHash = getFillTileHash(tileLookup, mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y, strictness);
  setTile(mapTileEditorData, tileCoordinate.x, tileCoordinate.y, fillTileHash);
  
  if (isAnimate)
  {
    clearHoverTile(layeredTileHashesDisplay);
    redrawAll(mapTileEditorData);
  }
  
  if (isEmptyTile(layeredTileHashesDisplay.map, tileCoordinate.x, tileCoordinate.y))
  {
    return;
  }
}
























export function setTile(mapTileEditorData, x, y, tileHash, direction = null, isLog = true)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  let userActionHistory = mapTileEditorData.userActionHistory;
  
  // Use cursor's position if x or y are null
  x = (x != null) ? x : cursor.tileX;
  y = (y != null) ? y : cursor.tileY;
  
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
  
  if (isValidTileCoordinate(mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, modifiedX, modifiedY))
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
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  x = x ? x : cursor.tileX;
  y = y ? y : cursor.tileY;
  
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
  
  if (isValidTileCoordinate(mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, modifiedX, modifiedY))
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
    userActionHistory.logs.pop();
  }
  
  updateUndoRedoButtonStates(userActionHistory);
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
    userActionHistory.logs.pop();
  }
  
  updateUndoRedoButtonStates(userActionHistory);
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
    document.getElementById(Ids.toolbar.mapControlBlock.mapWidthTextbox).valueAsNumber = userAction.oldMapWidth;
    document.getElementById(Ids.toolbar.mapControlBlock.mapHeightTextbox).valueAsNumber = userAction.oldMapHeight;
    
    resizeMap(mapTileEditorData, false);
  }
  
  --userActionHistory.counter;
  
  updateUndoRedoButtonStates(userActionHistory);
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
    document.getElementById(Ids.toolbar.mapControlBlock.mapWidthTextbox).valueAsNumber = userAction.newMapWidth;
    document.getElementById(Ids.toolbar.mapControlBlock.mapHeightTextbox).valueAsNumber = userAction.newMapHeight;
    
    resizeMap(mapTileEditorData, false);
  }
  
  ++userActionHistory.counter;
  
  updateUndoRedoButtonStates(userActionHistory);
}

export function updateUndoRedoButtonStates(userActionHistory)
{
  document.getElementById(Ids.toolbar.editBlock.undoButton).disabled = userActionHistory.counter < 0;
  document.getElementById(Ids.toolbar.editBlock.redoButton).disabled = userActionHistory.counter + 1 >= userActionHistory.logs.length;
}





export function redrawAll(mapTileEditorData)
{
  let userActionHistory = mapTileEditorData.userActionHistory;
  
  redrawMap(mapTileEditorData);
  redrawNeighborPanes(mapTileEditorData);
  redrawIntersectionPanes(mapTileEditorData);
  updateInformationDisplayTile(mapTileEditorData);
  updateUndoRedoButtonStates(userActionHistory);
}

export function redrawMap(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let canvas = mapTileEditorData.canvas;
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
  
  for (let y = 0; y < mapTileEditorData.mapHeight; y++)
  {
    for (let x = 0; x < mapTileEditorData.mapWidth; x++)
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
  
  document.getElementById(Ids.sidebar.neighborPane[direction]).innerHTML = '';
  
  let cursorDirectionNeighborList = getTileNeighborList(tileLookup, layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX], direction);
  
  for (let i = 0; cursorDirectionNeighborList && i < cursorDirectionNeighborList.length; i++)
  {
    let neighborTileImage = new Image(TILE_WIDTH * 3, TILE_HEIGHT * 3);
    neighborTileImage.src = tileLookup[cursorDirectionNeighborList[i]].image.src;
    neighborTileImage.addEventListener('click',
      function()
      {
        setTile(mapTileEditorData, cursor.tileX, cursor.tileY, cursorDirectionNeighborList[i], direction);
        
        redrawAll(mapTileEditorData);
      }, false);
    neighborTileImage.addEventListener('mouseenter',
      function()
      {
        setHoverTile(mapTileEditorData, cursor.tileX, cursor.tileY, cursorDirectionNeighborList[i], direction);
        
        redrawMap(mapTileEditorData);
      }, false);
    neighborTileImage.addEventListener('mouseout',
      function()
      {
        clearHoverTile(layeredTileHashesDisplay);
        
        redrawMap(mapTileEditorData);
      }, false);
    
    document.getElementById(Ids.sidebar.neighborPane[direction]).appendChild(neighborTileImage);
  }
  
  document.getElementById(Ids.sidebar.neighborPane[direction]).parentElement.style.backgroundColor = cursorDirectionNeighborList && cursorDirectionNeighborList.length > 0 ? BackgroundColor.valid : BackgroundColor.invalid;
}

export function redrawIntersectionPanes(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let y = cursor.tileY;
  let x = cursor.tileX;
  
  let possibleTileHashLists = [];
  possibleTileHashLists.push(getNeighborTileHashListForXYPosition(tileLookup, mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, layeredTileHashesDisplay.map, x, y, Direction.NORTH));
  possibleTileHashLists.push(getNeighborTileHashListForXYPosition(tileLookup, mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, layeredTileHashesDisplay.map, x, y, Direction.EAST));
  possibleTileHashLists.push(getNeighborTileHashListForXYPosition(tileLookup, mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, layeredTileHashesDisplay.map, x, y, Direction.SOUTH));
  possibleTileHashLists.push(getNeighborTileHashListForXYPosition(tileLookup, mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, layeredTileHashesDisplay.map, x, y, Direction.WEST));
  
  let fillTileHashesSplit = getFillTileHashesSplit(possibleTileHashLists);
  
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
  
  document.getElementById(Ids.sidebar.intersectionPane[strictness]).innerHTML = '';
  
  for (let i = 0; fillTileHashes && i < fillTileHashes.length; i++)
  {
    let intersectedTileImage = new Image(TILE_WIDTH * 3, TILE_HEIGHT * 3);
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
    
    document.getElementById(Ids.sidebar.intersectionPane[strictness]).appendChild(intersectedTileImage);
  }
  
  document.getElementById(Ids.sidebar.intersectionPane[strictness]).parentElement.style.backgroundColor = fillTileHashes && fillTileHashes.length <= 0 ? BackgroundColor.invalid : BackgroundColor.valid;
}

export function updateInformationDisplayTile(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let tileHash = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX];
  
  document.getElementById(Ids.toolbar.cursorBlock.tileType).textContent = tileLookup[tileHash].group;
  document.getElementById(Ids.toolbar.cursorBlock.cursorPositionX).textContent = cursor.tileX + 1;
  document.getElementById(Ids.toolbar.cursorBlock.cursorPositionY).textContent = cursor.tileY + 1;
  document.getElementById(Ids.toolbar.cursorBlock.tileDescription).textContent = tileLookup[tileHash].description;
}

export function redrawSearchPane(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  
  let searchTileResultsUnorderedList = document.getElementById(Ids.sidebar.searchBlock.searchTileResults);
  searchTileResultsUnorderedList.innerHTML = '';
  
  for (let tileHash in tileLookup)
  {
    let listItem = document.createElement('li');
    listItem.title = 'HashID: ' + tileHash + '\nType: ' + tileLookup[tileHash].group;
    
    let tileImage = new Image(TILE_WIDTH * 2, TILE_HEIGHT * 2);
    tileImage.src = tileLookup[tileHash].image.src;
    tileImage.addEventListener('click',
      function()
      {
        setTile(mapTileEditorData, null, null, tileHash);
        
        redrawAll(mapTileEditorData);
      }, false);
      tileImage.addEventListener('mouseenter',
      function()
      {
        setHoverTile(mapTileEditorData, null, null, tileHash);
        
        redrawMap(mapTileEditorData);
      }, false);
      tileImage.addEventListener('mouseout',
      function()
      {
        clearHoverTile(layeredTileHashesDisplay);
        
        redrawMap(mapTileEditorData);
      }, false);
    listItem.appendChild(tileImage);
    
    searchTileResultsUnorderedList.appendChild(listItem);
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
  
  console.info('mapWidth:');
  console.log(mapTileEditorData.mapWidth);
  console.log('\n');
  
  console.info('mapHeight:');
  console.log(mapTileEditorData.mapHeight);
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
