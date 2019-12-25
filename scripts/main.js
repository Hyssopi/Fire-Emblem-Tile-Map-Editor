
import * as mapTileEditorEventHandler from '../scripts/mapTileEditorEventHandler.js';
import * as mapTileEditorUtilities from '../util/mapTileEditorUtilities.js';


const SHOW_PRINT_LOG_BUTTON = false;

export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;
export const SCALE_FACTOR = 1.1;

const BASE_OUTPUT_DIRECTORY_PATH = 'tiles';
const IMAGES_OUTPUT_FOLDER_NAME = 'images';
const TILE_REFERENCES_JSON_FILE_NAME = 'tileReferences.json';
export const HELP_FILE_PATH = 'help/index.html';

export const CURSOR_TILE_HASH = 'a8ebd11f8e75365d496d85d28cde54b7';
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
      tileType: 'tileTypeId',
      cursorPositionX: 'cursorPositionXId',
      cursorPositionY: 'cursorPositionYId',
      tileDescription: 'tileDescriptionId'
    }
  },
  sidebar:
  {
    searchBlock:
    {
      searchTileInput: 'searchTileInputId',
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









/* TODO:

2) Clean up code
* Do not pass mapTileEditorData, pass individual parameters
* Reorder functions
* Fix utilities

3) Fix Print Debug

4) Add documentation

5) Fix Help

6) Fix map extractor last ',' in Unity

7) Move tile images to folders as TYPE
Webpage:
  Get list of tile hashes in undefined, simple list delimited by new line
  Webpage loads that simple list
  Left side: list
  Right side: list of inputted tile hash
  Clicking tile on right moves it to left
  Text field for left side shows its list's tile hashes
  https://stackoverflow.com/questions/43216971/moving-file-using-cmd/43219429
  Copy that and move it to spreadsheet: move "" ""
  
  images: 13,148 files


**Add shortcuts for up/down calibrate


known issue: with generate animation enabled, calibrate functions calls first but the processing is still going on (timer), so the ending cursor position is when the processing is done much later after
known issue: sometimes with generate animation enabled, calibrate skips filling as it goes

rename exportAsTileHashesButton


91) Higher chance for getFileTile if same TYPE
92) Add zoom boundaries
93) Multi-select

*/






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
  
  // Setup the mapTileEditorData, containing the information passed around in the editor
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
  
  mapTileEditorUtilities.resetMap(mapTileEditorData);
  
  // Setup the event listeners
  mapTileEditorEventHandler.setupMouseEventListeners(mapTileEditorData);
  
  mapTileEditorEventHandler.setupKeyboardEventListeners(mapTileEditorData);
  
  mapTileEditorEventHandler.setupUIEventListeners(mapTileEditorData);
  
  // Draw the search pane
  mapTileEditorUtilities.redrawSearchPane(mapTileEditorData);
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
