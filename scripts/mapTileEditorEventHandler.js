
import * as mapTileEditorUtilities from '../util/mapTileEditorUtilities.js';

import {SCALE_FACTOR, HELP_FILE_PATH, EMPTY_TILE_HASH, Ids} from './main.js';


export function setupMouseEventListeners(mapTileEditorData)
{
  let canvas = mapTileEditorData.canvas;
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
    
    mapTileEditorUtilities.redrawMap(mapTileEditorData);
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
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
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
      
      mapTileEditorUtilities.redrawMap(mapTileEditorData);
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

function cursorMoveUpResponse(mapTileEditorData, isCtrlKeyDown)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
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

function cursorMoveDownResponse(mapTileEditorData, isCtrlKeyDown)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  if (isCtrlKeyDown)
  {
    let isStartEmpty = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX] === EMPTY_TILE_HASH;
    let isNextEmpty = null;
    if (cursor.tileY + 1 < mapTileEditorData.mapHeight)
    {
      isNextEmpty = layeredTileHashesDisplay.map[cursor.tileY + 1][cursor.tileX] === EMPTY_TILE_HASH;
    }
    
    while (cursor.tileY + 1 < mapTileEditorData.mapHeight)
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
    cursor.tileY = (cursor.tileY + 1 < mapTileEditorData.mapHeight) ? (cursor.tileY + 1) : (mapTileEditorData.mapHeight - 1);
  }
}

function cursorMoveLeftResponse(mapTileEditorData, isCtrlKeyDown)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
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

function cursorMoveRightResponse(mapTileEditorData, isCtrlKeyDown)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  if (isCtrlKeyDown)
  {
    let isStartEmpty = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX] === EMPTY_TILE_HASH;
    let isNextEmpty = null;
    if (cursor.tileX + 1 < mapTileEditorData.mapWidth)
    {
      isNextEmpty = layeredTileHashesDisplay.map[cursor.tileY][cursor.tileX + 1] === EMPTY_TILE_HASH;
    }
    
    while (cursor.tileX + 1 < mapTileEditorData.mapWidth)
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
    cursor.tileX = (cursor.tileX + 1 < mapTileEditorData.mapWidth) ? (cursor.tileX + 1) : (mapTileEditorData.mapWidth - 1);
  }
}

function undoResponse(mapTileEditorData)
{
  mapTileEditorUtilities.undo(mapTileEditorData);
  
  mapTileEditorUtilities.redrawAll(mapTileEditorData);
}

function redoResponse(mapTileEditorData)
{
  mapTileEditorUtilities.redo(mapTileEditorData);
  
  mapTileEditorUtilities.redrawAll(mapTileEditorData);
}

function deleteTileResponse(mapTileEditorData)
{
  let cursor = mapTileEditorData.cursor;
  
  mapTileEditorUtilities.setTile(mapTileEditorData, cursor.tileX, cursor.tileY, EMPTY_TILE_HASH);
  
  mapTileEditorUtilities.redrawAll(mapTileEditorData);
}

function randomTileResponse(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let cursor = mapTileEditorData.cursor;
  
  let randomTileHash = mapTileEditorUtilities.getRandomTileHash(tileLookup);
  mapTileEditorUtilities.setTile(mapTileEditorData, cursor.tileX, cursor.tileY, randomTileHash);
  
  mapTileEditorUtilities.redrawAll(mapTileEditorData);
}

function fillTileResponse(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  let strictness = document.getElementById(Ids.tileControlBlock.strictnessComboBox).value;
  
  let fillTileHash = mapTileEditorUtilities.getFillTileHash(tileLookup, mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, layeredTileHashesDisplay.map, cursor.tileX, cursor.tileY, strictness);
  mapTileEditorUtilities.setTile(mapTileEditorData, cursor.tileX, cursor.tileY, fillTileHash);
  
  mapTileEditorUtilities.redrawAll(mapTileEditorData);
}

function generateMapResponse(mapTileEditorData)
{
  let cursor = mapTileEditorData.cursor;
  
  mapTileEditorUtilities.fillMap(mapTileEditorData, cursor.tileX, cursor.tileY, document.getElementById(Ids.tileControlBlock.isAnimateGeneration).checked);
}

function printDebugResponse(mapTileEditorData)
{
  mapTileEditorUtilities.printDebug(mapTileEditorData);
}

function helpResponse()
{
  window.open(HELP_FILE_PATH, '_blank', 'menubar = 0, toolbar = 0');
}

function preventNonNumericalResponse(event)
{
  // Between 0 and 9
  if (event.which < 48 || event.which > 57)
  {
    event.preventDefault();
  }
}

export function setupKeyboardEventListeners(mapTileEditorData)
{
  /*
  TODO: Temporarily comment out while developing
  // Prevent Ctrl + W from closing the window/tab
  window.onbeforeunload = function(event)
  {
    event.preventDefault();
  };
  */
  
  let eventKeyMap = {};
  let isPreviouslyMoved =
  {
    up: false,
    down: false,
    left: false,
    right: false
  };
  
  onkeydown = onkeyup = function(event)
  {
    let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
    
    eventKeyMap[event.key] = event.type == 'keydown';
    console.log(eventKeyMap);
    
    if (event.ctrlKey)
    {
      event.preventDefault();
    }
    
    if (!isPreviouslyMoved.up && (eventKeyMap['w'] || eventKeyMap['ArrowUp']))
    {
      // 'w' or arrow up button pressed
      cursorMoveUpResponse(mapTileEditorData, event.ctrlKey);
      console.log("MOVED UP");
      isPreviouslyMoved.up = true;
    }
    else
    {
      isPreviouslyMoved.up = false;
    }
    if (!isPreviouslyMoved.down && (eventKeyMap['s'] || eventKeyMap['ArrowDown']))
    {
      // 's' or arrow down button pressed
      cursorMoveDownResponse(mapTileEditorData, event.ctrlKey);
      console.log("MOVED DOWN");
      isPreviouslyMoved.down = true;
    }
    else
    {
      isPreviouslyMoved.down = false;
    }
    if (!isPreviouslyMoved.left && (eventKeyMap['a'] || eventKeyMap['ArrowLeft']))
    {
      // 'a' or arrow left button pressed
      cursorMoveLeftResponse(mapTileEditorData, event.ctrlKey);
      console.log("MOVED LEFT");
      isPreviouslyMoved.left = true;
    }
    else
    {
      isPreviouslyMoved.left = false;
    }
    if (!isPreviouslyMoved.right && (eventKeyMap['d'] || eventKeyMap['ArrowRight']))
    {
      // 'd' or arrow right button pressed
      cursorMoveRightResponse(mapTileEditorData, event.ctrlKey);
      console.log("MOVED RIGHT");
      isPreviouslyMoved.right = true;
    }
    else
    {
      isPreviouslyMoved.right = false;
    }
    mapTileEditorUtilities.clearHoverTile(layeredTileHashesDisplay);
    mapTileEditorUtilities.redrawAll(mapTileEditorData);
  }
  
  function keydownResponse(event)
  {
    console.log('event.key: ' + event.key + ', event.code: ' + event.code + ', event.which: ' + event.which + ', event.shiftKey: ' + event.shiftKey + ', event.ctrlKey: ' + event.ctrlKey);
    
    if (event.key === 'u')
    {
      // 'u' button pressed
      mapTileEditorUtilities.redrawAll(mapTileEditorData);
    }
    
    if (event.key === 'z')
    {
      // 'z' button pressed
      undoResponse(mapTileEditorData);
    }
    else if (event.key === 'y')
    {
      // 'y' button pressed
      redoResponse(mapTileEditorData);
    }
    
    if (event.key === 'Delete')
    {
      // 'Delete' button pressed
      deleteTileResponse(mapTileEditorData);
    }
    
    if (event.key === 'r')
    {
      // 'r' button pressed
      randomTileResponse(mapTileEditorData);
    }
    if (event.key === 'f')
    {
      // 'f' button pressed
      fillTileResponse(mapTileEditorData);
    }
    if (event.key === 'g')
    {
      // 'g' button pressed
      generateMapResponse(mapTileEditorData);
    }
    
    if (event.key === 'p')
    {
      // 'p' button pressed
      printDebugResponse(mapTileEditorData);
    }
  }
  document.addEventListener('keydown', keydownResponse, false);
  
  document.getElementById(Ids.informationDisplayMapBlock.mapWidthTextbox).addEventListener('keypress', preventNonNumericalResponse, false);
  
  document.getElementById(Ids.informationDisplayMapBlock.mapHeightTextbox).addEventListener('keypress', preventNonNumericalResponse, false);
}

export function setupUIEventListeners(mapTileEditorData)
{
  document.getElementById(Ids.informationDisplayMapBlock.mapWidthTextbox).addEventListener('change',
    function()
    {
      mapTileEditorUtilities.resizeMap(mapTileEditorData);
    });
  
    document.getElementById(Ids.informationDisplayMapBlock.mapHeightTextbox).addEventListener('change',
    function()
    {
      mapTileEditorUtilities.resizeMap(mapTileEditorData);
    });
  
  document.getElementById(Ids.informationDisplayMapBlock.newButton).addEventListener('click',
    function()
    {
      mapTileEditorUtilities.resetMap(mapTileEditorData);
    });
  
  document.getElementById(Ids.genericControlBlock.exportButton).addEventListener('click',
    function()
    {
      let tileLookup = mapTileEditorData.tileLookup;
      let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
      
      mapTileEditorUtilities.exportMap(tileLookup, mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, layeredTileHashesDisplay);
    });
  
  document.getElementById(Ids.genericControlBlock.importButton).addEventListener('click',
    function()
    {
      let input = document.getElementById(Ids.genericControlBlock.importFileInput);
      input.click();
    });
  
  document.getElementById(Ids.genericControlBlock.importFileInput).onchange = event =>
  {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    
    reader.onload = readerEvent =>
    {
      let fileContent = readerEvent.target.result;
      let mapJson = JSON.parse(fileContent);
      console.log(mapJson);
      mapTileEditorUtilities.loadMapJson(mapTileEditorData, mapJson);
    }
  }
  
  document.getElementById(Ids.genericControlBlock.undoButton).addEventListener('click',
    function()
    {
      undoResponse(mapTileEditorData);
    });
  
  document.getElementById(Ids.genericControlBlock.redoButton).addEventListener('click',
    function()
    {
      redoResponse(mapTileEditorData);
    });
  
  document.getElementById(Ids.tileControlBlock.randomTileButton).addEventListener('click',
    function()
    {
      randomTileResponse(mapTileEditorData);
    });
  
  document.getElementById(Ids.tileControlBlock.clearTileButton).addEventListener('click',
    function()
    {
      deleteTileResponse(mapTileEditorData);
    });
  
  document.getElementById(Ids.tileControlBlock.fillTileButton).addEventListener('click',
    function()
    {
      fillTileResponse(mapTileEditorData);
    });
  
  document.getElementById(Ids.tileControlBlock.generateMapButton).addEventListener('click',
    function()
    {
      generateMapResponse(mapTileEditorData);
    });
  
  document.getElementById(Ids.otherControlBlock.printLogButton).addEventListener('click',
    function()
    {
      printDebugResponse(mapTileEditorData);
    });
  
  document.getElementById(Ids.otherControlBlock.helpButton).addEventListener('click',
    function()
    {
      helpResponse();
    });
}
