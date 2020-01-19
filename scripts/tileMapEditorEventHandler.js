
import * as utilities from '../util/utilities.js';
import * as tileMapEditorUtilities from '../util/tileMapEditorUtilities.js';

import {SCALE_FACTOR, HELP_FILE_PATH, EMPTY_TILE_HASH, Ids} from './main.js';


/**
 * Setup mouse event listeners.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
export function setupMouseEventListeners(tileMapEditorData)
{
  let canvas = tileMapEditorData.canvas;
  let context = canvas.getContext('2d');
  
  let lastX = canvas.width / 2;
  let lastY = canvas.height / 2;
  let dragStart;
  let dragged;
  
  let zoom = function(delta)
  {
    let point = context.transformedPoint(lastX, lastY);
    context.translate(point.x, point.y);
    let factor = Math.pow(SCALE_FACTOR, delta);
    context.scale(factor, factor);
    context.translate(-point.x, -point.y);
    
    tileMapEditorUtilities.redrawMap(tileMapEditorData);
  };
  
  let handleScroll = function(event)
  {
    let delta = event.wheelDelta ? event.wheelDelta / 40 : event.detail ? -event.detail : 0;
    if (delta)
    {
      zoom(delta);
    }
    return event.preventDefault() && false;
  };
  
  canvas.addEventListener('DOMMouseScroll', handleScroll, false);
  canvas.addEventListener('mousewheel', handleScroll, false);
  
  canvas.addEventListener('mousedown', function(event)
  {
    document.body.style.mozUserSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.userSelect = 'none';
    lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
    lastY = event.offsetY || (event.pageY - canvas.offsetTop);
    dragStart = context.transformedPoint(lastX, lastY);
    dragged = false;
  }, false);
  
  canvas.addEventListener('mousemove', function(event)
  {
    lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
    lastY = event.offsetY || (event.pageY - canvas.offsetTop);
    dragged = true;
    if (dragStart)
    {
      let point = context.transformedPoint(lastX, lastY);
      context.translate(point.x - dragStart.x, point.y - dragStart.y);
      
      tileMapEditorUtilities.redrawMap(tileMapEditorData);
    }
  }, false);
  
  canvas.addEventListener('mouseup', function(event)
  {
    dragStart = null;
    /*
    if (!dragged)
    {
      zoom(event.shiftKey ? -1 : 1);
    }
    */
  }, false);
  
  canvas.addEventListener('mouseout', function(event)
  {
    dragStart = null;
  }, false);
}

/**
 * Move up cursor response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 * @param isCtrlKeyDown Is the Ctrl Key down
 */
function cursorMoveUpResponse(tileMapEditorData, isCtrlKeyDown)
{
  let layeredTileHashesDisplay = tileMapEditorData.layeredTileHashesDisplay;
  let cursor = tileMapEditorData.cursor;
  
  if (isCtrlKeyDown)
  {
    let isStartEmpty = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX] === EMPTY_TILE_HASH;
    let isNextEmpty = null;
    if (cursor.tileY - 1 >= 0)
    {
      isNextEmpty = layeredTileHashesDisplay.map[cursor.tileY - 1][cursor.tileX] === EMPTY_TILE_HASH;
    }
    
    while (cursor.tileY - 1 >= 0)
    {
      let nextTile = layeredTileHashesDisplay.map[cursor.tileY - 1][cursor.tileX];
      if (isStartEmpty && nextTile === EMPTY_TILE_HASH)
      {
        --cursor.tileY;
      }
      else if (isStartEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        --cursor.tileY;
        break;
      }
      else if (!isStartEmpty && !isNextEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        --cursor.tileY;
      }
      else if (!isStartEmpty && !isNextEmpty && nextTile === EMPTY_TILE_HASH)
      {
        break;
      }
      else if (!isStartEmpty && isNextEmpty && nextTile === EMPTY_TILE_HASH)
      {
        --cursor.tileY;
      }
      else if (!isStartEmpty && isNextEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        --cursor.tileY;
        break;
      }
    }
  }
  else
  {
    cursor.tileY = (cursor.tileY - 1 >= 0) ? (cursor.tileY - 1) : 0;
  }
}

/**
 * Move down cursor response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 * @param isCtrlKeyDown Is the Ctrl Key down
 */
function cursorMoveDownResponse(tileMapEditorData, isCtrlKeyDown)
{
  let layeredTileHashesDisplay = tileMapEditorData.layeredTileHashesDisplay;
  let cursor = tileMapEditorData.cursor;
  
  if (isCtrlKeyDown)
  {
    let isStartEmpty = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX] === EMPTY_TILE_HASH;
    let isNextEmpty = null;
    if (cursor.tileY + 1 < tileMapEditorData.mapHeight)
    {
      isNextEmpty = layeredTileHashesDisplay.map[cursor.tileY + 1][cursor.tileX] === EMPTY_TILE_HASH;
    }
    
    while (cursor.tileY + 1 < tileMapEditorData.mapHeight)
    {
      let nextTile = layeredTileHashesDisplay.map[cursor.tileY + 1][cursor.tileX];
      if (isStartEmpty && nextTile === EMPTY_TILE_HASH)
      {
        ++cursor.tileY;
      }
      else if (isStartEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        ++cursor.tileY;
        break;
      }
      else if (!isStartEmpty && !isNextEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        ++cursor.tileY;
      }
      else if (!isStartEmpty && !isNextEmpty && nextTile === EMPTY_TILE_HASH)
      {
        break;
      }
      else if (!isStartEmpty && isNextEmpty && nextTile === EMPTY_TILE_HASH)
      {
        ++cursor.tileY;
      }
      else if (!isStartEmpty && isNextEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        ++cursor.tileY;
        break;
      }
    }
  }
  else
  {
    cursor.tileY = (cursor.tileY + 1 < tileMapEditorData.mapHeight) ? (cursor.tileY + 1) : (tileMapEditorData.mapHeight - 1);
  }
}

/**
 * Move left cursor response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 * @param isCtrlKeyDown Is the Ctrl Key down
 */
function cursorMoveLeftResponse(tileMapEditorData, isCtrlKeyDown)
{
  let layeredTileHashesDisplay = tileMapEditorData.layeredTileHashesDisplay;
  let cursor = tileMapEditorData.cursor;
  
  if (isCtrlKeyDown)
  {
    let isStartEmpty = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX] === EMPTY_TILE_HASH;
    let isNextEmpty = null;
    if (cursor.tileX - 1 >= 0)
    {
      isNextEmpty = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX - 1] === EMPTY_TILE_HASH;
    }
    
    while (cursor.tileX - 1 >= 0)
    {
      let nextTile = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX - 1];
      if (isStartEmpty && nextTile === EMPTY_TILE_HASH)
      {
        --cursor.tileX;
      }
      else if (isStartEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        --cursor.tileX;
        break;
      }
      else if (!isStartEmpty && !isNextEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        --cursor.tileX;
      }
      else if (!isStartEmpty && !isNextEmpty && nextTile === EMPTY_TILE_HASH)
      {
        break;
      }
      else if (!isStartEmpty && isNextEmpty && nextTile === EMPTY_TILE_HASH)
      {
        --cursor.tileX;
      }
      else if (!isStartEmpty && isNextEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        --cursor.tileX;
        break;
      }
    }
  }
  else
  {
    cursor.tileX = (cursor.tileX - 1 >= 0) ? (cursor.tileX - 1) : 0;
  }
}

/**
 * Move right cursor response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 * @param isCtrlKeyDown Is the Ctrl Key down
 */
function cursorMoveRightResponse(tileMapEditorData, isCtrlKeyDown)
{
  let layeredTileHashesDisplay = tileMapEditorData.layeredTileHashesDisplay;
  let cursor = tileMapEditorData.cursor;
  
  if (isCtrlKeyDown)
  {
    let isStartEmpty = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX] === EMPTY_TILE_HASH;
    let isNextEmpty = null;
    if (cursor.tileX + 1 < tileMapEditorData.mapWidth)
    {
      isNextEmpty = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX + 1] === EMPTY_TILE_HASH;
    }
    
    while (cursor.tileX + 1 < tileMapEditorData.mapWidth)
    {
      let nextTile = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX + 1];
      if (isStartEmpty && nextTile === EMPTY_TILE_HASH)
      {
        ++cursor.tileX;
      }
      else if (isStartEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        ++cursor.tileX;
        break;
      }
      else if (!isStartEmpty && !isNextEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        ++cursor.tileX;
      }
      else if (!isStartEmpty && !isNextEmpty && nextTile === EMPTY_TILE_HASH)
      {
        break;
      }
      else if (!isStartEmpty && isNextEmpty && nextTile === EMPTY_TILE_HASH)
      {
        ++cursor.tileX;
      }
      else if (!isStartEmpty && isNextEmpty && nextTile !== EMPTY_TILE_HASH)
      {
        ++cursor.tileX;
        break;
      }
    }
  }
  else
  {
    cursor.tileX = (cursor.tileX + 1 < tileMapEditorData.mapWidth) ? (cursor.tileX + 1) : (tileMapEditorData.mapWidth - 1);
  }
}

/**
 * Undo response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
function undoResponse(tileMapEditorData)
{
  tileMapEditorUtilities.undo(tileMapEditorData);
  
  tileMapEditorUtilities.redrawAll(tileMapEditorData);
}

/**
 * Redo response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
function redoResponse(tileMapEditorData)
{
  tileMapEditorUtilities.redo(tileMapEditorData);
  
  tileMapEditorUtilities.redrawAll(tileMapEditorData);
}

/**
 * Delete tile response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
function deleteTileResponse(tileMapEditorData)
{
  let cursor = tileMapEditorData.cursor;
  
  tileMapEditorUtilities.setTile(tileMapEditorData, cursor.tileX, cursor.tileY, EMPTY_TILE_HASH);
  
  tileMapEditorUtilities.redrawAll(tileMapEditorData);
}

/**
 * Random tile response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
function randomTileResponse(tileMapEditorData)
{
  let tileLookup = tileMapEditorData.tileLookup;
  let cursor = tileMapEditorData.cursor;
  
  let randomTileHash = tileMapEditorUtilities.getRandomTileHash(tileLookup);
  tileMapEditorUtilities.setTile(tileMapEditorData, cursor.tileX, cursor.tileY, randomTileHash);
  
  tileMapEditorUtilities.redrawAll(tileMapEditorData);
}

/**
 * Fill tile response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
function fillTileResponse(tileMapEditorData)
{
  let tileLookup = tileMapEditorData.tileLookup;
  let layeredTileHashesDisplay = tileMapEditorData.layeredTileHashesDisplay;
  let cursor = tileMapEditorData.cursor;
  
  let strictness = document.getElementById(Ids.toolbar.functionBlock.strictnessComboBox).value;
  
  let fillTileHash = tileMapEditorUtilities.getFillTileHash(tileLookup, tileMapEditorData.mapWidth, tileMapEditorData.mapHeight, layeredTileHashesDisplay.map, cursor.tileX, cursor.tileY, strictness);
  tileMapEditorUtilities.setTile(tileMapEditorData, cursor.tileX, cursor.tileY, fillTileHash);
  
  tileMapEditorUtilities.redrawAll(tileMapEditorData);
}

/**
 * Calibrate tile response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
function calibrateTileResponse(tileMapEditorData)
{
  let cursor = tileMapEditorData.cursor;
  
  let minimumStrictness = document.getElementById(Ids.toolbar.functionBlock.strictnessComboBox).value;
  let calibrateRange = document.getElementById(Ids.toolbar.functionBlock.calibrateRangeTextbox).valueAsNumber;
  let isAnimate = document.getElementById(Ids.toolbar.functionBlock.isAnimateGeneration).classList.contains('fa-toggle-on');
  
  tileMapEditorUtilities.calibrateTileHashes(tileMapEditorData, cursor.tileX, cursor.tileY, minimumStrictness, calibrateRange, isAnimate);
  tileMapEditorUtilities.redrawAll(tileMapEditorData);
}

/**
 * Generate map response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
function generateMapResponse(tileMapEditorData)
{
  let cursor = tileMapEditorData.cursor;
  
  let minimumStrictness = document.getElementById(Ids.toolbar.functionBlock.strictnessComboBox).value;
  let isAnimate = document.getElementById(Ids.toolbar.functionBlock.isAnimateGeneration).classList.contains('fa-toggle-on');
  
  tileMapEditorUtilities.fillMap(tileMapEditorData, cursor.tileX, cursor.tileY, minimumStrictness, isAnimate);
}

/**
 * Auto generate map response.
 * Auto generate map based on recommended generation steps.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
function autoGenerateMapResponse(tileMapEditorData)
{
  let layeredTileHashesDisplay = tileMapEditorData.layeredTileHashesDisplay;
  let cursor = tileMapEditorData.cursor;
  
  let isAnimate = false;
  
  let minimumStrictness = 4;
  let calibrateRange = 1;
  tileMapEditorUtilities.fillMap(tileMapEditorData, cursor.tileX, cursor.tileY, minimumStrictness, isAnimate);
  for (let y = 0; y < tileMapEditorData.mapHeight; y++)
  {
    for (let x = 0; x < tileMapEditorData.mapWidth; x++)
    {
      if (layeredTileHashesDisplay.map[y][x] === EMPTY_TILE_HASH)
      {
        tileMapEditorUtilities.calibrateTileHashes(tileMapEditorData, cursor.tileX, cursor.tileY, minimumStrictness, calibrateRange, isAnimate);
      }
    }
  }
  
  minimumStrictness = 3;
  calibrateRange = 2;
  tileMapEditorUtilities.fillMap(tileMapEditorData, cursor.tileX, cursor.tileY, minimumStrictness, isAnimate);
  for (let y = 0; y < tileMapEditorData.mapHeight; y++)
  {
    for (let x = 0; x < tileMapEditorData.mapWidth; x++)
    {
      if (layeredTileHashesDisplay.map[y][x] === EMPTY_TILE_HASH)
      {
        tileMapEditorUtilities.calibrateTileHashes(tileMapEditorData, cursor.tileX, cursor.tileY, minimumStrictness, calibrateRange, isAnimate);
      }
    }
  }
  
  minimumStrictness = 2;
  calibrateRange = 1;
  tileMapEditorUtilities.fillMap(tileMapEditorData, cursor.tileX, cursor.tileY, minimumStrictness, isAnimate);
  for (let y = 0; y < tileMapEditorData.mapHeight; y++)
  {
    for (let x = 0; x < tileMapEditorData.mapWidth; x++)
    {
      if (layeredTileHashesDisplay.map[y][x] === EMPTY_TILE_HASH)
      {
        tileMapEditorUtilities.calibrateTileHashes(tileMapEditorData, cursor.tileX, cursor.tileY, minimumStrictness, calibrateRange, isAnimate);
      }
    }
  }
  
  minimumStrictness = 1;
  calibrateRange = 1;
  tileMapEditorUtilities.fillMapSupplement(tileMapEditorData, 1, isAnimate);
}

/**
 * Print debug response.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
function printDebugResponse(tileMapEditorData)
{
  tileMapEditorUtilities.printDebug(tileMapEditorData);
}

/**
 * Help response.
 */
function helpResponse()
{
  window.open(HELP_FILE_PATH, '_blank', 'menubar = 0, toolbar = 0');
}

/**
 * Prevent non-numerical event response.
 * 
 * @param event Event
 */
function preventNonNumericalResponse(event)
{
  // Between 0 and 9
  if (event.which < 48 || event.which > 57)
  {
    event.preventDefault();
  }
}

/**
 * Setup keyboard event listeners.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
export function setupKeyboardEventListeners(tileMapEditorData)
{
  // Prevent Ctrl + W from closing the window/tab
  window.onbeforeunload = function(event)
  {
    event.preventDefault();
  };
  
  // Keep track of the keys pressed
  let eventKeyMap = {};
  
  // Keep track of the previously moved directions
  let isPreviouslyMoved =
  {
    up: false,
    down: false,
    left: false,
    right: false
  };
  
  onkeydown = onkeyup = function(event)
  {
    let layeredTileHashesDisplay = tileMapEditorData.layeredTileHashesDisplay;
    
    // Focus should be not INPUT, for example BODY or BUTTON
    if (document.activeElement.tagName === 'INPUT')
    {
      return;
    }
    
    eventKeyMap[event.key] = event.type === 'keydown';
    console.log(eventKeyMap);
    
    if (event.ctrlKey)
    {
      event.preventDefault();
    }
    
    // Prevent cursor from skipping while updated
    // For example: pressing down (move down), then pressing right (move down and right since down is still considered pressed), then releasing down (move right since right is still considered pressed)
    if (!isPreviouslyMoved.up && (eventKeyMap['w'] || eventKeyMap['ArrowUp']))
    {
      // 'w' or arrow up button pressed
      cursorMoveUpResponse(tileMapEditorData, event.ctrlKey);
      isPreviouslyMoved.up = true;
    }
    else
    {
      isPreviouslyMoved.up = false;
    }
    if (!isPreviouslyMoved.down && (eventKeyMap['s'] || eventKeyMap['ArrowDown']))
    {
      // 's' or arrow down button pressed
      cursorMoveDownResponse(tileMapEditorData, event.ctrlKey);
      isPreviouslyMoved.down = true;
    }
    else
    {
      isPreviouslyMoved.down = false;
    }
    if (!isPreviouslyMoved.left && (eventKeyMap['a'] || eventKeyMap['ArrowLeft']))
    {
      // 'a' or arrow left button pressed
      cursorMoveLeftResponse(tileMapEditorData, event.ctrlKey);
      isPreviouslyMoved.left = true;
    }
    else
    {
      isPreviouslyMoved.left = false;
    }
    if (!isPreviouslyMoved.right && (eventKeyMap['d'] || eventKeyMap['ArrowRight']))
    {
      // 'd' or arrow right button pressed
      cursorMoveRightResponse(tileMapEditorData, event.ctrlKey);
      isPreviouslyMoved.right = true;
    }
    else
    {
      isPreviouslyMoved.right = false;
    }
    
    tileMapEditorUtilities.clearHoverTiles(layeredTileHashesDisplay);
    tileMapEditorUtilities.redrawAll(tileMapEditorData);
  }
  
  // Key down response
  function keydownResponse(event)
  {
    console.log('event.key: ' + event.key + ', event.code: ' + event.code + ', event.which: ' + event.which + ', event.shiftKey: ' + event.shiftKey + ', event.ctrlKey: ' + event.ctrlKey + ', document.activeElement.tagName: ' + document.activeElement.tagName);
    
    // Focus should be not INPUT, for example BODY or BUTTON
    if (document.activeElement.tagName === 'INPUT')
    {
      return;
    }
    
    if (event.key === 'z')
    {
      undoResponse(tileMapEditorData);
    }
    else if (event.key === 'y')
    {
      redoResponse(tileMapEditorData);
    }
    if (event.key === 'Delete')
    {
      deleteTileResponse(tileMapEditorData);
    }
    if (event.key === 'r')
    {
      randomTileResponse(tileMapEditorData);
    }
    if (event.key === 'PageDown')
    {
      // 1 is the minimum value for strictness combo box
      if (document.getElementById(Ids.toolbar.functionBlock.strictnessComboBox).value > 1)
      {
        document.getElementById(Ids.toolbar.functionBlock.strictnessComboBox).value--;
      }
    }
    if (event.key === 'PageUp')
    {
      // 4 is the maximum value for strictness combo box
      if (document.getElementById(Ids.toolbar.functionBlock.strictnessComboBox).value < 4)
      {
        document.getElementById(Ids.toolbar.functionBlock.strictnessComboBox).value++;
      }
    }
    if (event.key === 'f' && !event.ctrlKey)
    {
      fillTileResponse(tileMapEditorData);
    }
    if (event.key === '[')
    {
      // 0 is the minimum value for calibrate range text box
      if (document.getElementById(Ids.toolbar.functionBlock.calibrateRangeTextbox).value > 0)
      {
        document.getElementById(Ids.toolbar.functionBlock.calibrateRangeTextbox).value--;
      }
    }
    if (event.key === ']')
    {
      // 999 is the maximum value for calibrate range text box
      if (document.getElementById(Ids.toolbar.functionBlock.calibrateRangeTextbox).value < 999)
      {
        document.getElementById(Ids.toolbar.functionBlock.calibrateRangeTextbox).value++;
      }
    }
    if (event.key === 'c')
    {
      calibrateTileResponse(tileMapEditorData);
    }
    if (event.key === 'g')
    {
      generateMapResponse(tileMapEditorData);
    }
    if (event.key === 'o')
    {
      autoGenerateMapResponse(tileMapEditorData);
    }
    if (event.key === 'p')
    {
      printDebugResponse(tileMapEditorData);
    }
    if (event.key === 'f' && event.ctrlKey)
    {
      // Move focus to search input
      event.preventDefault();
      document.getElementById(Ids.sidebar.searchBlock.searchTileInput).focus();
    }
  }
  document.addEventListener('keydown', keydownResponse, false);
  
  // Prevent non-numerical inputs for inputs
  document.getElementById(Ids.toolbar.mapControlBlock.mapWidthTextbox).addEventListener('keypress', preventNonNumericalResponse, false);
  document.getElementById(Ids.toolbar.mapControlBlock.mapHeightTextbox).addEventListener('keypress', preventNonNumericalResponse, false);
  document.getElementById(Ids.toolbar.functionBlock.calibrateRangeTextbox).addEventListener('keypress', preventNonNumericalResponse, false);
}

/**
 * Setup UI event listeners.
 * 
 * @param tileMapEditorData Contains the data used by the editor
 */
export function setupUIEventListeners(tileMapEditorData)
{
  document.getElementById(Ids.toolbar.mapControlBlock.mapWidthTextbox).addEventListener('change',
    function()
    {
      tileMapEditorUtilities.resizeMap(tileMapEditorData, true);
    });
  
  document.getElementById(Ids.toolbar.mapControlBlock.mapHeightTextbox).addEventListener('change',
    function()
    {
      tileMapEditorUtilities.resizeMap(tileMapEditorData, true);
    });
  
  document.getElementById(Ids.toolbar.mapControlBlock.newButton).addEventListener('click',
    function()
    {
      tileMapEditorUtilities.resetMap(tileMapEditorData);
    });
  
  document.getElementById(Ids.toolbar.mapControlBlock.importButton).addEventListener('click',
    function()
    {
      let input = document.getElementById(Ids.toolbar.mapControlBlock.importFileInput);
      input.click();
    });
  
  document.getElementById(Ids.toolbar.mapControlBlock.importFileInput).onchange = event =>
    {
      let file = event.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      
      reader.onload = readerEvent =>
      {
        let fileContent = readerEvent.target.result;
        let mapJson = JSON.parse(fileContent);
        //console.log(mapJson);
        tileMapEditorUtilities.loadMapJson(tileMapEditorData, mapJson);
        
        console.log('\"' + utilities.getFilenameWithoutExtension(file.name) + '\" map has been loaded.');
      }
    }
  
  document.getElementById(Ids.toolbar.mapControlBlock.exportAsTileHashesButton).addEventListener('click',
    function()
    {
      let layeredTileHashesDisplay = tileMapEditorData.layeredTileHashesDisplay;
      
      tileMapEditorUtilities.exportMapAsTileHashes(tileMapEditorData.mapWidth, tileMapEditorData.mapHeight, layeredTileHashesDisplay.map);
    });
  
  document.getElementById(Ids.toolbar.mapControlBlock.exportAsImageButton).addEventListener('click',
    function()
    {
      let tileLookup = tileMapEditorData.tileLookup;
      let layeredTileHashesDisplay = tileMapEditorData.layeredTileHashesDisplay;
      
      tileMapEditorUtilities.exportMapAsImage(tileLookup, tileMapEditorData.mapWidth, tileMapEditorData.mapHeight, layeredTileHashesDisplay.map);
    });
  
  document.getElementById(Ids.toolbar.editBlock.undoButton).addEventListener('click',
    function()
    {
      undoResponse(tileMapEditorData);
    });
  
  document.getElementById(Ids.toolbar.editBlock.redoButton).addEventListener('click',
    function()
    {
      redoResponse(tileMapEditorData);
    });
  
  document.getElementById(Ids.toolbar.editBlock.clearTileButton).addEventListener('click',
    function()
    {
      deleteTileResponse(tileMapEditorData);
    });
  
  document.getElementById(Ids.toolbar.functionBlock.randomTileButton).addEventListener('click',
    function()
    {
      randomTileResponse(tileMapEditorData);
    });
  
  document.getElementById(Ids.toolbar.functionBlock.fillTileButton).addEventListener('click',
    function()
    {
      fillTileResponse(tileMapEditorData);
    });
  
  document.getElementById(Ids.toolbar.functionBlock.calibrateTileButton).addEventListener('click',
    function()
    {
      calibrateTileResponse(tileMapEditorData);
    });
  
  document.getElementById(Ids.toolbar.functionBlock.generateMapButton).addEventListener('click',
    function()
    {
      generateMapResponse(tileMapEditorData);
    });
  
  document.getElementById(Ids.toolbar.functionBlock.isAnimateGeneration).addEventListener('click',
    function()
    {
      // Change the icon image
      let isAnimateGeneration = document.getElementById(Ids.toolbar.functionBlock.isAnimateGeneration);
      if (isAnimateGeneration.classList.contains('fa-toggle-off'))
      {
        isAnimateGeneration.classList.remove('fa-toggle-off');
        isAnimateGeneration.classList.add('fa-toggle-on');
      }
      else
      {
        isAnimateGeneration.classList.remove('fa-toggle-on');
        isAnimateGeneration.classList.add('fa-toggle-off');
      }
    });
  
  document.getElementById(Ids.toolbar.helpBlock.printLogButton).addEventListener('click',
    function()
    {
      printDebugResponse(tileMapEditorData);
    });
  
  document.getElementById(Ids.toolbar.helpBlock.helpButton).addEventListener('click',
    function()
    {
      helpResponse();
    });
  
  document.getElementById(Ids.sidebar.searchBlock.searchTileInput).addEventListener('keyup',
    function()
    {
      // Focus should be in INPUT to continue
      if (document.activeElement.tagName !== 'INPUT')
      {
        return;
      }
      
      let input = document.getElementById(Ids.sidebar.searchBlock.searchTileInput);
      let searchTileResultsUnorderedList = document.getElementById(Ids.sidebar.searchBlock.searchTileResults);
      let listItems = searchTileResultsUnorderedList.getElementsByTagName('li');
      // Filters delimited by '&' for AND
      let filters = input.value.toUpperCase().split('&');
      
      // Loop through all list items, and hide those that don't match the search query
      for (let listItem of listItems)
      {
        let textValue = listItem.title.toUpperCase();

        // Check that it matches for all filter values
        let isDisplayTile = true;
        for (let filter of filters)
        {
          if (textValue.indexOf(filter) <= -1)
          {
            isDisplayTile = false;
            break;
          }
        }
        
        if (isDisplayTile)
        {
          listItem.style.display = '';
        }
        else
        {
          listItem.style.display = 'none';
        }
      }
    });
}
