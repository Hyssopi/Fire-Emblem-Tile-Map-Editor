
import * as mapTileEditorUtilities from '../util/mapTileEditorUtilities.js';

import {SCALE_FACTOR, EMPTY_TILE_HASH, Ids} from './main.js';


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

function cursorMoveUpResponse(mapTileEditorData)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  cursor.tileY = (cursor.tileY - 1 >= 0) ? (cursor.tileY - 1) : 0;
  
  mapTileEditorUtilities.clearHoverTile(layeredTileHashesDisplay);
  mapTileEditorUtilities.redrawAll(mapTileEditorData);
}

function cursorMoveDownResponse(mapTileEditorData)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;

  cursor.tileY = (cursor.tileY + 1 < mapTileEditorData.mapHeight) ? (cursor.tileY + 1) : (mapTileEditorData.mapHeight - 1);
  
  mapTileEditorUtilities.clearHoverTile(layeredTileHashesDisplay);
  mapTileEditorUtilities.redrawAll(mapTileEditorData);
}

function cursorMoveLeftResponse(mapTileEditorData)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  cursor.tileX = (cursor.tileX - 1 >= 0) ? (cursor.tileX - 1) : 0;
  
  mapTileEditorUtilities.clearHoverTile(layeredTileHashesDisplay);
  mapTileEditorUtilities.redrawAll(mapTileEditorData);
}

function cursorMoveRightResponse(mapTileEditorData)
{
  let layeredTileHashesDisplay = mapTileEditorData.layeredTileHashesDisplay;
  let cursor = mapTileEditorData.cursor;
  
  cursor.tileX = (cursor.tileX + 1 < mapTileEditorData.mapWidth) ? (cursor.tileX + 1) : (mapTileEditorData.mapWidth - 1);
  
  mapTileEditorUtilities.clearHoverTile(layeredTileHashesDisplay);
  mapTileEditorUtilities.redrawAll(mapTileEditorData);
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
  
  mapTileEditorUtilities.fillMap(mapTileEditorData, cursor.tileX, cursor.tileY, false);
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
  function keydownResponse(event)
  {
    console.log('event.key: ' + event.key + ', event.code: ' + event.code + ', event.which: ' + event.which);
    
    if (event.key === 'w' || event.key === 'ArrowUp')
    {
      // 'w' or arrow up button pressed
      cursorMoveUpResponse(mapTileEditorData);
    }
    if (event.key === 's' || event.key === 'ArrowDown')
    {
      // 's' or arrow down button pressed
      cursorMoveDownResponse(mapTileEditorData);
    }
    if (event.key === 'a' || event.key === 'ArrowLeft')
    {
      // 'a' or arrow left button pressed
      cursorMoveLeftResponse(mapTileEditorData);
    }
    if (event.key === 'd' || event.key === 'ArrowRight')
    {
      // 'd' or arrow right button pressed
      cursorMoveRightResponse(mapTileEditorData);
    }
    
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
    });
  
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
