
import * as tileMapEditorEventHandler from '../scripts/tileMapEditorEventHandler.js';
import * as tileMapEditorUtilities from '../util/tileMapEditorUtilities.js';


const SHOW_PRINT_LOG_BUTTON = false;

export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;
export const SCALE_FACTOR = 1.1;

const BASE_OUTPUT_DIRECTORY_PATH = 'tiles';
const IMAGES_OUTPUT_FOLDER_NAME = 'images';
const TILE_REFERENCES_JSON_FILE_NAME = 'tileReferences.json';
export const HELP_FILE_PATH = 'help/index.html';

export const CURSOR_TILE_HASH = 'ef44bdef0982775ba6f0e0e9f7dfa04f';
export const EMPTY_TILE_HASH = 'b96808283004c0f124a18b2b9670d1c0';

export const Direction =
{
  'NORTH': 'north',
  'EAST': 'east',
  'SOUTH': 'south',
  'WEST': 'west'
};

export const Ids =
{
  loadingScreen: 'loadingScreenId',
  canvas: 'CanvasId1',
  toolbar:
  {
    mapControlBlock:
    {
      mapWidthTextbox: 'mapWidthTextboxId',
      mapHeightTextbox: 'mapHeightTextboxId',
      newButton: 'newButtonId',
      importButton: 'importButtonId',
      importFileInput: 'importFileInputId',
      exportAsTileHashesButton: 'exportAsTileHashesButtonId',
      exportAsImageButton: 'exportAsImageButtonId'
    },
    editBlock:
    {
      undoButton: 'undoButtonId',
      redoButton: 'redoButtonId',
      clearTileButton: 'clearTileButtonId'
    },
    functionBlock:
    {
      randomTileButton: 'randomTileButtonId',
      strictnessComboBox: 'strictnessComboBoxId',
      fillTileButton: 'fillTileButtonId',
      calibrateRangeTextbox: 'calibrateRangeTextboxId',
      calibrateTileButton: 'calibrateTileButtonId',
      generateMapButton: 'generateMapButtonId',
      isAnimateGeneration: 'isAnimateGenerationId'
    },
    helpBlock:
    {
      printLogButton: 'printLogButtonId',
      helpButton: 'helpButtonId'
    },
    cursorBlock:
    {
      cursorBlockContainer: 'cursorBlockContainerId',
      tileGroup: 'tileGroupId',
      cursorPositionX: 'cursorPositionXId',
      cursorPositionY: 'cursorPositionYId',
      tileDescription: 'tileDescriptionId'
    }
  },
  sidebar:
  {
    searchBlock:
    {
      searchTitle: 'searchTitleId',
      searchTileInput: 'searchTileInputId',
      searchTileResultsWrapper: 'searchTileResultsWrapperId',
      searchTileResults: 'searchTileResultsId'
    },
    neighborPane: {},
    intersectionPane: {}
  }
};

Ids.sidebar.neighborPane[Direction.NORTH] = 'northNeighborPaneId';
Ids.sidebar.neighborPane[Direction.EAST] = 'eastNeighborPaneId';
Ids.sidebar.neighborPane[Direction.SOUTH] = 'southNeighborPaneId';
Ids.sidebar.neighborPane[Direction.WEST] = 'westNeighborPaneId';

Ids.sidebar.intersectionPane[4] = 'intersectionPaneStrictId4';
Ids.sidebar.intersectionPane[3] = 'intersectionPaneStrictId3';
Ids.sidebar.intersectionPane[2] = 'intersectionPaneStrictId2';
Ids.sidebar.intersectionPane[1] = 'intersectionPaneStrictId1';

export const BackgroundColor =
{
  valid: 'whitesmoke',
  invalid: 'lightgray'
};


// Reading tile reference JSON file
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
    
    // Setting up the tileLookup from reading the data from the tile reference JSON file
    let tileLookup = {};
    for (let i = 0; i < tileReferencesJson.length; i++)
    {
      if (!tileLookup[tileReferencesJson[i].tileHash])
      {
        tileLookup[tileReferencesJson[i].tileHash] = {};
      }
      tileLookup[tileReferencesJson[i].tileHash].group = tileReferencesJson[i].group;
      tileLookup[tileReferencesJson[i].tileHash].description = tileReferencesJson[i].tileHash;
      
      tileLookup[tileReferencesJson[i].tileHash][Direction.NORTH] = tileReferencesJson[i][Direction.NORTH];
      tileLookup[tileReferencesJson[i].tileHash][Direction.EAST] = tileReferencesJson[i][Direction.EAST];
      tileLookup[tileReferencesJson[i].tileHash][Direction.SOUTH] = tileReferencesJson[i][Direction.SOUTH];
      tileLookup[tileReferencesJson[i].tileHash][Direction.WEST] = tileReferencesJson[i][Direction.WEST];
      
      let tileImage = new Image();
      tileImage.src = BASE_OUTPUT_DIRECTORY_PATH + '/' + IMAGES_OUTPUT_FOLDER_NAME + '/' + tileReferencesJson[i].group + '/' + tileReferencesJson[i].tileHash + '.png';
      tileLookup[tileReferencesJson[i].tileHash].image = tileImage;

      tileLookup[tileReferencesJson[i].tileHash].originFilePaths = tileReferencesJson[i].originFilePaths;
    }
    
    setup(tileLookup);
    
    // Hide loading screen when finished loading
    document.getElementById(Ids.loadingScreen).style.display = 'none';
    console.log('Finished loading.');
  })
  .catch (function(error)
  {
    console.error('Error in fetching: ' + error);
  })

/**
 * Setup editor.
 * 
 * @param tileLookup tileLookup
 */
function setup(tileLookup)
{
  let canvas = document.getElementById(Ids.canvas);
  let context = canvas.getContext('2d');
  
  context.msImageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
  
  setupTrackTransforms(context);
  
  // Set to show/hide the debug button
  if (!SHOW_PRINT_LOG_BUTTON)
  {
    document.getElementById(Ids.toolbar.helpBlock.printLogButton).style.display = 'none';
  }
  
  // Setup the tileMapEditorData, containing the information passed around in the editor
  let tileMapEditorData =
  {
    tileLookup: tileLookup,
    canvas: canvas,
    mapWidth: 1,
    mapHeight: 1,
    layeredTileHashesDisplay: null,
    cursor: null,
    userActionHistory: null
  };
  
  tileMapEditorUtilities.resetMap(tileMapEditorData);
  
  // Setup the event listeners
  tileMapEditorEventHandler.setupMouseEventListeners(tileMapEditorData);
  
  tileMapEditorEventHandler.setupKeyboardEventListeners(tileMapEditorData);
  
  tileMapEditorEventHandler.setupUIEventListeners(tileMapEditorData);
  
  // Draw the search pane
  tileMapEditorUtilities.redrawSearchPane(tileMapEditorData);
}

/**
 * Adds context.getTransform() - returns an SVGMatrix
 * Adds context.transformedPoint(x, y) - returns an SVGPoint
 * 
 * @param context Canvas context
 */
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
