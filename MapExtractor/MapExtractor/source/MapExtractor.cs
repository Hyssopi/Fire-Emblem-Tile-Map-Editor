using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;

namespace MapExtractor.source
{
  /// <summary>
  ///   Reads the input map images (for example, Fire Emblem maps), then extracts each individual tile from the map. Also keeps a reference of all the neighboring tiles for each tile.
  ///   Then outputs the tile images and a JSON data file representing the tile information.
  ///   The JSON file is used in the Tile Map Editor.
  /// </summary>
  public class MapExtractor
  {
    private const int TILE_WIDTH_PIXEL = 16;
    private const int TILE_HEIGHT_PIXEL = 16;

    private const string CURSOR_TILE_FILE_NAME = "Cursor.png";
    private const string EMPTY_TILE_FILE_NAME = "EmptyTile.png";

    // Used in Unity
    private const string RESOURCE_DIRECTORY_PATH = "C:/Users/t/Desktop/temp9/Map Extractor/Assets/Resources";
    private const string MAP_INPUT_FOLDER_NAME = "Images";

    // Used in Tile Map Editor
    private const string BASE_OUTPUT_DIRECTORY_PATH = "C:/Users/t/Desktop/temp9/tiles";
    private const string IMAGES_OUTPUT_FOLDER_NAME = "images";
    private const string UNDEFINED_GROUP_OUTPUT_FOLDER_NAME = "UNDEFINED";
    private const string TILE_REFERENCES_JSON_FILE_NAME = "tileReferences.json";

    // Used in Tile Sort Helper
    private const string TILE_SORT_HELPER_OUTPUT_FILE_PATH = "C:/Users/t/Desktop/tileHashesSortedByColor.txt";
    private const string TILE_HASHES_BY_MAP_SCRIPT_FILE_PATH = "C:/Users/t/Desktop/tileHashesByMapScript.txt";

    public enum Direction
    {
      NONE,
      NORTH,
      EAST,
      SOUTH,
      WEST
    };



    public static SortedDictionary<string, TileData> FillAllUniqueTileData(
      SortedDictionary<string, TileData> allUniqueTileData,
      string inputMapDirectoryPath)
    {
      // Read the input map images (for example, Fire Emblem maps) and extract the tile images and neighbor data
      List<FileInfo> mapImageFileList = Util.GetFileList(inputMapDirectoryPath, "png");
      foreach (FileInfo mapImageFile in mapImageFileList)
      {
        string subPath = mapImageFile.FullName.Replace(inputMapDirectoryPath, string.Empty).Replace("\\", "/").TrimStart('/');

        string originFilePath = Path.GetDirectoryName(subPath);

        // Read the chapter map image
        Bitmap mapImage = Util.ReadBitmap(mapImageFile);

        if (mapImage.Width % TILE_WIDTH_PIXEL != 0 ||
          mapImage.Height % TILE_HEIGHT_PIXEL != 0)
        {
          throw new InvalidDataException();
        }

        string[,] mapTileImageHashes = new string[mapImage.Height / TILE_HEIGHT_PIXEL, mapImage.Width / TILE_WIDTH_PIXEL];

        // Fill out the allUniqueTileData with initial TileData
        for (int y = 0; y < mapImage.Height / TILE_HEIGHT_PIXEL; y++)
        {
          for (int x = 0; x < mapImage.Width / TILE_WIDTH_PIXEL; x++)
          {
            Bitmap tileImage = Util.GetSubBitmap(mapImage, x * TILE_WIDTH_PIXEL, y * TILE_HEIGHT_PIXEL, TILE_WIDTH_PIXEL, TILE_HEIGHT_PIXEL);

            string tileImageHash = Util.GetBitmapHash(tileImage);

            mapTileImageHashes[y, x] = tileImageHash;

            if (!allUniqueTileData.ContainsKey(tileImageHash))
            {
              allUniqueTileData.Add(tileImageHash, new TileData(tileImageHash, tileImage));
            }

            // Keep a list of which map images the tile comes from
            allUniqueTileData[tileImageHash].OriginFilePaths.Add(originFilePath.Replace('\\', '/'));

            // Print out Cursor and Empty tileHashes for reference
            if (mapImageFile.Name.Equals(CURSOR_TILE_FILE_NAME, StringComparison.OrdinalIgnoreCase))
            {
              Console.WriteLine("Cursor TileHash: " + tileImageHash);
            }
            if (mapImageFile.Name.Equals(EMPTY_TILE_FILE_NAME, StringComparison.OrdinalIgnoreCase))
            {
              Console.WriteLine("Empty TileHash: " + tileImageHash);
            }
          }
        }

        // Add neighbor data to the TileData
        int mapHeight = mapTileImageHashes.GetLength(0);
        int mapWidth = mapTileImageHashes.GetLength(1);
        for (int y = 0; y < mapHeight; y++)
        {
          for (int x = 0; x < mapWidth; x++)
          {
            string tileHash = mapTileImageHashes[y, x];

            // South node
            if (IsValidTileCoordinate(mapWidth, mapHeight, x, y, Direction.SOUTH))
            {
              string southTileHash = mapTileImageHashes[y + 1, x];
              allUniqueTileData[tileHash].SouthNeighbors.Add(southTileHash);
            }
            // East node
            if (IsValidTileCoordinate(mapWidth, mapHeight, x, y, Direction.EAST))
            {
              string eastTileHash = mapTileImageHashes[y, x + 1];
              allUniqueTileData[tileHash].EastNeighbors.Add(eastTileHash);
            }
            // North node
            if (IsValidTileCoordinate(mapWidth, mapHeight, x, y, Direction.NORTH))
            {
              string northTileHash = mapTileImageHashes[y - 1, x];
              allUniqueTileData[tileHash].NorthNeighbors.Add(northTileHash);
            }
            // West node
            if (IsValidTileCoordinate(mapWidth, mapHeight, x, y, Direction.WEST))
            {
              string westTileHash = mapTileImageHashes[y, x - 1];
              allUniqueTileData[tileHash].WestNeighbors.Add(westTileHash);
            }
          }
        }
      }

      // Read the existing tile image folders to set the tile group
      List<FileInfo> existingTileImageFilePaths = Util.GetFileList(Path.Combine(BASE_OUTPUT_DIRECTORY_PATH, IMAGES_OUTPUT_FOLDER_NAME), "png");
      foreach (FileInfo tileImageFilePath in existingTileImageFilePaths)
      {
        string tileHash = Path.GetFileNameWithoutExtension(tileImageFilePath.Name);
        string groupName = Directory.GetParent(tileImageFilePath.FullName).Name.ToUpper();

        if (!allUniqueTileData.ContainsKey(tileHash))
        {
          //List<string> allUniqueTileDataKeys = allUniqueTileData.Keys.ToList();
          //List<TileData> allUniqueTileDataValues = allUniqueTileData.Values.ToList();
          Console.WriteLine(tileImageFilePath.FullName + " tile image exists in the tile image folder, but its tileHash does not exist in allUniqueTileData. The tileHash should have been read from the input maps but seems to have not.");
          return null;
        }

        allUniqueTileData[tileHash].Group = groupName;
      }

      // Set any tile that doesn't already have a tile group (new tile images read) to UNDEFINED
      foreach (KeyValuePair<string, TileData> tileDataEntry in allUniqueTileData)
      {
        if (tileDataEntry.Value.Group == null)
        {
          Console.WriteLine("Group was null, now setting to UNDEFINED: " + tileDataEntry.Key);
          tileDataEntry.Value.Group = UNDEFINED_GROUP_OUTPUT_FOLDER_NAME;
        }
      }

      return allUniqueTileData;
    }

    public static void OutputTiles(
      SortedDictionary<string, TileData> allUniqueTileData,
      string outputTileDirectoryPath)
    {
      // Create the UNDEFINED folder in the output images directory if it doesn't exist
      Directory.CreateDirectory(Path.Combine(outputTileDirectoryPath, UNDEFINED_GROUP_OUTPUT_FOLDER_NAME));

      // Save the tile images out
      foreach (KeyValuePair<string, TileData> tileDataEntry in allUniqueTileData)
      {
        string outputFilePath = Path.Combine(outputTileDirectoryPath, tileDataEntry.Value.Group, tileDataEntry.Key + ".png");
        tileDataEntry.Value.TileImage.Save(outputFilePath);
      }
    }

    public static void OutputTileReferencesJson(
      SortedDictionary<string, TileData> allUniqueTileData,
      string outputTileReferencesJsonFilePath)
    {
      // Output all tile data to JSON file
      StringBuilder outputJsonLines = new StringBuilder();

      outputJsonLines.AppendLine("[");

      int tempIndex = 0;
      foreach (KeyValuePair<string, TileData> tileDataEntry in allUniqueTileData)
      {
        outputJsonLines.AppendLine(tileDataEntry.Value.ToJson() + (tempIndex < (allUniqueTileData.Count - 1) ? "," : string.Empty));

        ++tempIndex;
      }

      outputJsonLines.AppendLine("]");

      // Path.Combine(BASE_OUTPUT_DIRECTORY_PATH, TILE_REFERENCES_JSON_FILE_NAME)
      Util.WriteTextFile(outputTileReferencesJsonFilePath, outputJsonLines.ToString());
    }

    public static void OutputTileSortHelper()
    {
      // Sort tiles by image color and then output the sorted tileHashes
      // This is used in tileSortHelper
      Dictionary<string, Color> tileAveragedColors = new Dictionary<string, Color>();
      foreach (KeyValuePair<string, TileData> tileDataEntry in AllUniqueTileData)
      {
        Texture2D tileImage = tileDataEntry.Value.TileImage;

        // Average all the pixel colors of the tile
        // Round the color components to the first decimal place, this will give better results when sorting
        Color tileAveragedColor = new Color();
        Color[] tilePixels = tileImage.GetPixels();
        tileAveragedColor.r = (float)Math.Round(tilePixels.Average(component => component.r), 1);
        tileAveragedColor.g = (float)Math.Round(tilePixels.Average(component => component.g), 1);
        tileAveragedColor.b = (float)Math.Round(tilePixels.Average(component => component.b), 1);
        tileAveragedColors.Add(tileDataEntry.Key, tileAveragedColor);
      }

      // Create the sorted list based on the tile's averaged color
      // Keep the key (tileHash) of the KeyValuePair in the same sort when sorting the value (Color)
      List<KeyValuePair<string, Color>> sortedTileAveragedColors = tileAveragedColors.ToList();
      sortedTileAveragedColors.Sort((pair1, pair2) => Util.SortColors(pair1.Value, pair2.Value));

      StringBuilder tileHashesSortedByColorOutput = new StringBuilder();
      int tempIndex = 0;
      foreach (KeyValuePair<string, Color> tileAveragedColorPair in sortedTileAveragedColors)
      {
        //tileHashesSortedByColorOutput.AppendLine(tileAveragedColorPair.Key + " " + tileAveragedColorPair.Value.r + " " + tileAveragedColorPair.Value.g + " " + tileAveragedColorPair.Value.b);
        tileHashesSortedByColorOutput.AppendLine("\"" + tileAveragedColorPair.Key + "\"" + (tempIndex < (sortedTileAveragedColors.Count - 1) ? "," : string.Empty));

        ++tempIndex;
      }

      Util.WriteTextFile(TILE_SORT_HELPER_OUTPUT_FILE_PATH, tileHashesSortedByColorOutput.ToString());


      // TODO: TEMP, used to get list of Directories
      Util.PrintList(Directory.GetDirectories("C:\\Users\\t\\Desktop\\temp9\\tiles\\images").Select(path => "\"" + Path.GetFileName(path) + "\","));
    }


    public static void OutputBatchMoveScriptHelper()
    {
      // Get the unique tile hashes for input map images, then create a batch script (user has to run the script) to move it from UNDEFINED folder to TEMP folder to separate it and make it easier to determine where a tile is from and from which map image
      StringBuilder tileHashesByMapScriptOutput = new StringBuilder();
      foreach (FileInfo mapImageFile in mapImageFileList)
      {
        List<string> tileHashesFromMapImage = GetTileHashesFromMapImage(mapImageFile);
        tileHashesByMapScriptOutput.AppendLine("\nrem " + mapImageFile.FullName);
        tileHashesByMapScriptOutput.AppendLine("cd " + Path.Combine(BASE_OUTPUT_DIRECTORY_PATH, IMAGES_OUTPUT_FOLDER_NAME));
        foreach (string tileHash in tileHashesFromMapImage)
        {
          string scriptLine =
              "move"
              + " " + UNDEFINED_GROUP_OUTPUT_FOLDER_NAME + "\\" + tileHash + ".png"
              + " " + "TEMP";
          tileHashesByMapScriptOutput.AppendLine(scriptLine);
        }
      }
      Util.WriteTextFile(TILE_HASHES_BY_MAP_SCRIPT_FILE_PATH, tileHashesByMapScriptOutput.ToString());
    }







    /// <summary>
    ///   Checks to see if input coordinate is valid for the map size.
    ///   From Tile Map Editor tileMapEditorUtilities.js
    /// </summary>
    /// <param name="mapWidth">Tile width of the map</param>
    /// <param name="mapHeight">Tile height of the map</param>
    /// <param name="x">Horizontal tile position, starting from the left (0)</param>
    /// <param name="y">Vertical tile position, starting from the top (0)</param>
    /// <param name="direction">Modified direction of the input coordinate</param>
    /// <returns>True if input coordinate is valid, false otherwise</returns>
    public static bool IsValidTileCoordinate(int mapWidth, int mapHeight, int x, int y, Direction direction = Direction.NONE)
    {
      int modifiedX = x;
      int modifiedY = y;

      if (direction == Direction.NORTH)
      {
        modifiedY = y - 1;
      }
      else if (direction == Direction.EAST)
      {
        modifiedX = x + 1;
      }
      else if (direction == Direction.SOUTH)
      {
        modifiedY = y + 1;
      }
      else if (direction == Direction.WEST)
      {
        modifiedX = x - 1;
      }

      return modifiedY >= 0 && modifiedY < mapHeight
        && modifiedX >= 0 && modifiedX < mapWidth;
    }

    /*
    /// <summary>
    ///   Gets the list of unique tile hashes for the given input map image.
    /// </summary>
    /// <param name="mapImageFile">Map image file</param>
    /// <returns>List of unique tile hashes for the given input map image</returns>
    public static HashSet<string> GetTileHashesFromMapImage(FileInfo mapImageFile)
    {
      string resourceImagesPath = Path.Combine(RESOURCE_DIRECTORY_PATH, MAP_INPUT_FOLDER_NAME).Replace('/', Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;

      // Get the directory path after the Resources/Images, without the filename
      string originSubDirectoryPath = string.Empty;
      if (mapImageFile.DirectoryName.Length > resourceImagesPath.Length)
      {
        originSubDirectoryPath = mapImageFile.DirectoryName.Substring(resourceImagesPath.Length);
      }

      string originFilePath = Path.Combine(originSubDirectoryPath, Path.GetFileNameWithoutExtension(mapImageFile.Name));

      // Load the chapter map image
      Bitmap mapImage = Util.ReadBitmap(Path.Combine(MAP_INPUT_FOLDER_NAME, originFilePath));

      if (mapImage.Width % TILE_WIDTH_PIXEL != 0 ||
        mapImage.Height % TILE_HEIGHT_PIXEL != 0)
      {
        throw new InvalidDataException();
      }

      HashSet<string> uniqueTileHashes = new HashSet<string>();

      // Go through each tile in the map and get a unique hashset of image tile hashes
      for (int y = 0; y < mapImage.Height / TILE_HEIGHT_PIXEL; y++)
      {
        for (int x = 0; x < mapImage.Width / TILE_WIDTH_PIXEL; x++)
        {
          Bitmap tileImage = Util.GetSubBitmap(mapImage, x * TILE_WIDTH_PIXEL, y * TILE_HEIGHT_PIXEL, TILE_WIDTH_PIXEL, TILE_HEIGHT_PIXEL);
          string tileImageHash = Util.GetBitmapHash(tileImage);
          uniqueTileHashes.Add(tileImageHash);
        }
      }

      return uniqueTileHashes;
    }
    */
  }
}
