
import * as mapTileEditorEventHandler from '../scripts/mapTileEditorEventHandler.js';
import * as mapTileEditorUtilities from '../util/mapTileEditorUtilities.js';


export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;
export const SCALE_FACTOR = 1.1;

const BASE_OUTPUT_DIRECTORY_PATH = 'tiles';
const IMAGES_OUTPUT_FOLDER_NAME = 'images';
const UNDEFINED_OUTPUT_FOLDER_NAME = 'UNDEFINED';
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
    importFileInput: 'importFileInputId',
    undoButton: 'undoButtonId',
    redoButton: 'redoButtonId'
  },
  tileControlBlock:
  {
    strictnessComboBox: 'strictnessComboBoxId',
    randomTileButton: 'randomTileButtonId',
    clearTileButton: 'clearTileButtonId',
    fillTileButton: 'fillTileButtonId',
    generateMapButton: 'generateMapButtonId',
    isAnimateGeneration: 'isAnimateGenerationId'
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

















/* TODO:

7) Do not pass mapTileEditorData, pass individual parameters

12)
fix insectionpane, don't use getfilltiles, cause
for 3 possible, only 1 valid tile counts as 2
for 2 possible, only 1 vlaid tile counts as 3




10) Weighted neighbors calculations

13) Fix undo/redo for resize



11) Fix panes styling

3) Improve Export/Import

5) Fix isGenerationAnimation button

6) Reorder functions

2) Fix Print Debug

1) Fix Help









?) Multi-select
?) Add zoom boundaries

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
  
  mapTileEditorUtilities.resetMap(mapTileEditorData);
  
  mapTileEditorEventHandler.setupMouseEventListeners(mapTileEditorData);
  
  mapTileEditorEventHandler.setupKeyboardEventListeners(mapTileEditorData);
  
  mapTileEditorEventHandler.setupUIEventListeners(mapTileEditorData);
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
