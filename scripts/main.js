
import * as mapTileEditorUtilities from '../util/mapTileEditorUtilities.js';

export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;
const SCALE_FACTOR = 1.1;

const BASE_OUTPUT_DIRECTORY_PATH = 'tiles';
const IMAGES_OUTPUT_FOLDER_NAME = 'images';
const UNDEFINED_OUTPUT_FOLDER_NAME = 'UNDEFINED';
const TILE_REFERENCES_JSON_FILE_NAME = 'tileReferences.json';
const HELP_FILE_PATH = 'help/index.html';

const CURSOR_TILE_HASH = 'a8ebd11f8e75365d496d85d28cde54b7';
export const EMPTY_TILE_HASH = '73ad52b71d47ee4d45315c6f0da022ac';

export const Direction =
{
  "NORTH": "north",
  "EAST": "east",
  "SOUTH": "south",
  "WEST": "west"
};

export const Ids =
{
  canvas: 'CanvasId1',
  informationDisplayMapBlock:
  {
    mapWidthTextbox: 'mapWidthTextboxId',
    mapHeightTextbox: 'mapHeightTextboxId',
    newButton: 'newButtonId'
  },
  informationDisplayTileBlock:
  {
    tileType: 'tileTypeId',
    cursorPositionX: 'cursorPositionXId',
    cursorPositionY: 'cursorPositionYId',
    tileDescription: 'tileDescriptionId'
  },
  genericControlBlock:
  {
    exportButton: 'exportButtonId',
    importButton: 'importButtonId',
    undoButton: 'undoButtonId',
    redoButton: 'redoButtonId'
  },
  tileControlBlock:
  {
    strictnessCombobox: 'strictnessComboboxId',
    randomTileButton: 'randomTileButtonId',
    clearTileButton: 'clearTileButtonId',
    fillTileButton: 'fillTileButtonId',
    generateMapButton: 'generateMapButtonId'
  },
  otherControlBlock:
  {
    printLogButton: 'printLogButtonId',
    helpButton: 'helpButtonId'
  },
  neighborPane: {},
  intersectionPane: {}
};

Ids.neighborPane[Direction.NORTH] = 'northNeighborPaneId';
Ids.neighborPane[Direction.EAST] = 'eastNeighborPaneId';
Ids.neighborPane[Direction.SOUTH] = 'southNeighborPaneId';
Ids.neighborPane[Direction.WEST] = 'westNeighborPaneId';

Ids.intersectionPane[4] = 'intersectionPaneStrictId4';
Ids.intersectionPane[3] = 'intersectionPaneStrictId3';
Ids.intersectionPane[2] = 'intersectionPaneStrictId2';
Ids.intersectionPane[1] = 'intersectionPaneStrictId1';

















/* MAIN ISSUES
?) Fix up finding intersectionPane
?) Fix strict
?) Fix when 'g' on empty tile, should fill then auto-generate

?) Fix up print debug
?) Add help
?) Add zoom boundaries
?) Import/Export
?) Multi-select
?) Ctrl + arrow

?) Option to disable animation for auto-generate map
?) Option to choose strictness
?) Option to choose map width/height

?) Add description pane on cursor
?) Hover on tile on neighbor/intersection panes
?) Fix neighbor/intersection panes styling

?) Code clean up, rename variables? Check valid tile coordinates?

?) Fix map extractor last ','

*/






let tileReferencesJsonFilePath = BASE_OUTPUT_DIRECTORY_PATH + '/' + TILE_REFERENCES_JSON_FILE_NAME;
console.info('Reading: \'' + tileReferencesJsonFilePath + '\'');
fetch(tileReferencesJsonFilePath)
  .then(response =>
  {
    if (response.ok)
    {
      return response.json();
    }
    else
    {
      console.error('Configuration was not ok.');
    }
  })
  .then(tileReferencesJson =>
  {
    console.info('Successfully read tile references:');
    //console.log(tileReferencesJson);
    
    let tileLookup = {};
    for (let i = 0; i < tileReferencesJson.length; i++)
    {
      if (!tileLookup[tileReferencesJson[i].tileHash])
      {
        tileLookup[tileReferencesJson[i].tileHash] = {};
      }
      
      tileLookup[tileReferencesJson[i].tileHash][Direction.NORTH] = tileReferencesJson[i][Direction.NORTH];
      tileLookup[tileReferencesJson[i].tileHash][Direction.EAST] = tileReferencesJson[i][Direction.EAST];
      tileLookup[tileReferencesJson[i].tileHash][Direction.SOUTH] = tileReferencesJson[i][Direction.SOUTH];
      tileLookup[tileReferencesJson[i].tileHash][Direction.WEST] = tileReferencesJson[i][Direction.WEST];
      
      let tileImage = new Image();
      tileImage.src = BASE_OUTPUT_DIRECTORY_PATH + '/' + IMAGES_OUTPUT_FOLDER_NAME + '/' + tileReferencesJson[i].group + '/' + tileReferencesJson[i].tileHash + '.png';
      tileLookup[tileReferencesJson[i].tileHash].image = tileImage;
    }
    
    setup(tileLookup);
  })
  .catch (function(error)
  {
    console.error('Error in fetching: ' + error);
  })


function setup(tileLookup)
{
  let canvas = document.getElementById(Ids.canvas);
  let context = canvas.getContext('2d');
  
  context.msImageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
  
  setupTrackTransforms(context);
  
  let mapTileEditorData =
  {
    tileLookup: tileLookup,
    canvas: canvas,
    mapWidth: 1,
    mapHeight: 1,
    layeredTileHashesDisplay: null,
    cursor: null,
    userActionHistory: null
  };
  
  resetMap(mapTileEditorData);
  
  
  
  
  
  
  setupMouseEventListeners(mapTileEditorData);
  
  setupKeyboardEventListeners(mapTileEditorData);
  
  setupUIEventListeners(mapTileEditorData);
}

function resetMap(mapTileEditorData)
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
  
  mapTileEditorUtilities.redrawAll(mapTileEditorData);
}

function resizeMap(mapTileEditorData)
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

  mapTileEditorData.mapWidth = mapWidth;
  mapTileEditorData.mapHeight = mapHeight;
  
  mapTileEditorUtilities.redrawAll(mapTileEditorData);
}

function exportMap(tileLookup, mapWidth, mapHeight, layeredTileHashesDisplay)
{
  let newCanvas = document.createElement('canvas');
  let newContext = newCanvas.getContext('2d');
  
  newCanvas.width = mapWidth * TILE_WIDTH;
  newCanvas.height = mapHeight * TILE_HEIGHT;
  
  for (let y = 0; y < mapHeight; y++)
  {
    for (let x = 0; x < mapWidth; x++)
    {
      newContext.drawImage(tileLookup[layeredTileHashesDisplay.map[y][x]].image, x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
    }
  }
  
  let url = document.createElement('a');
  url.href = newCanvas.toDataURL();
  
  window.open(url, '_blank', 'width = ' + newCanvas.width + ', height = ' + newCanvas.height + ', resizable = 1');
}

function setupMouseEventListeners(mapTileEditorData)
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
  
  let strictness = document.getElementById(Ids.tileControlBlock.strictnessCombobox).value;
  
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

function setupKeyboardEventListeners(mapTileEditorData)
{
  let canvas = mapTileEditorData.canvas;
  
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

function setupUIEventListeners(mapTileEditorData)
{
  let tileLookup = mapTileEditorData.tileLookup;
  
  document.getElementById(Ids.informationDisplayMapBlock.mapWidthTextbox).addEventListener('change',
    function()
    {
      resizeMap(mapTileEditorData);
    });
  
    document.getElementById(Ids.informationDisplayMapBlock.mapHeightTextbox).addEventListener('change',
    function()
    {
      resizeMap(mapTileEditorData);
    });
  
  document.getElementById(Ids.informationDisplayMapBlock.newButton).addEventListener('click',
    function()
    {
      resetMap(mapTileEditorData);
    });
  
  document.getElementById(Ids.genericControlBlock.exportButton).addEventListener('click',
    function()
    {
      exportMap(mapTileEditorData.tileLookup, mapTileEditorData.mapWidth, mapTileEditorData.mapHeight, mapTileEditorData.layeredTileHashesDisplay);
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







// Adds context.getTransform() - returns an SVGMatrix
// Adds context.transformedPoint(x, y) - returns an SVGPoint
function setupTrackTransforms(context)
{
  let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  let xform = svg.createSVGMatrix();
  context.getTransform = function()
  {
    return xform;
  };
  
  let savedTransforms = [];
  let save = context.save;
  context.save = function()
  {
    savedTransforms.push(xform.translate(0, 0));
    return save.call(context);
  };
  
  let restore = context.restore;
  context.restore = function()
  {
    xform = savedTransforms.pop();
    return restore.call(context);
  };
  
  let scale = context.scale;
  context.scale = function(sx, sy)
  {
    xform = xform.scaleNonUniform(sx, sy);
    return scale.call(context, sx, sy);
  };
  
  let rotate = context.rotate;
  context.rotate = function(radians)
  {
    xform = xform.rotate(radians * 180 / Math.PI);
    return rotate.call(context, radians);
  };
  
  let translate = context.translate;
  context.translate = function(dx, dy)
  {
    xform = xform.translate(dx, dy);
    return translate.call(context, dx, dy);
  };
  
  let transform = context.transform;
  context.transform = function(a, b, c, d, e, f)
  {
    let m2 = svg.createSVGMatrix();
    m2.a = a;
    m2.b = b;
    m2.c = c;
    m2.d = d;
    m2.e = e;
    m2.f = f;
    xform = xform.multiply(m2);
    return transform.call(context, a, b, c, d, e, f);
  };
  
  let setTransform = context.setTransform;
  context.setTransform = function(a, b, c, d, e, f)
  {
    xform.a = a;
    xform.b = b;
    xform.c = c;
    xform.d = d;
    xform.e = e;
    xform.f = f;
    return setTransform.call(context, a, b, c, d, e, f);
  };
  
  let pt = svg.createSVGPoint();
  context.transformedPoint = function(x, y)
  {
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(xform.inverse());
  };
}
