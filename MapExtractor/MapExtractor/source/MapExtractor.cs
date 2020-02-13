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

    /*
    // Used in Unity
    private const string RESOURCE_DIRECTORY_PATH = "C:/Users/t/Desktop/temp9/Map Extractor/Assets/Resources";
    private const string MAP_INPUT_FOLDER_NAME = "Images";
    */

    // Used in Tile Map Editor
    //private const string BASE_OUTPUT_DIRECTORY_PATH = "C:/Users/t/Desktop/temp9/tiles";
    //private const string IMAGES_OUTPUT_FOLDER_NAME = "images";
    private const string UNDEFINED_GROUP_NAME = "UNDEFINED";
    private const string TILE_REFERENCES_JSON_FILE_NAME = "tileReferences.json";

    // Used in Tile Sort Helper
    //private const string TILE_SORT_HELPER_OUTPUT_FILE_PATH = "C:/Users/t/Desktop/tileHashesSortedByColor.txt";
    //private const string TILE_HASHES_BY_MAP_SCRIPT_FILE_PATH = "C:/Users/t/Desktop/tileHashesByMapScript.txt";
    private const string TILE_SORT_HELPER_FILE_NAME = "tileHashesSortedByColor.txt";
    private const string TILE_HASHES_BY_MAP_SCRIPT_FILE_NAME = "tileHashesByMapScript.txt";

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
      string inputMapDirectoryPath,
      string inputTileImagesDirectoryPath)
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
              Console.WriteLine("Cursor Tile Hash: " + tileImageHash);
            }
            if (mapImageFile.Name.Equals(EMPTY_TILE_FILE_NAME, StringComparison.OrdinalIgnoreCase))
            {
              Console.WriteLine("Empty Tile Hash: " + tileImageHash);
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
      List<FileInfo> existingTileImageFilePaths = Util.GetFileList(inputTileImagesDirectoryPath, "png");
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
          tileDataEntry.Value.Group = UNDEFINED_GROUP_NAME;
        }
      }

      return allUniqueTileData;
    }

    public static void OutputTileImages(
      SortedDictionary<string, TileData> allUniqueTileData,
      string outputTileImagesDirectoryPath)
    {
      // Create the UNDEFINED folder in the output images directory if it doesn't exist
      Directory.CreateDirectory(Path.Combine(outputTileImagesDirectoryPath, UNDEFINED_GROUP_NAME));

      // Save the tile images out
      foreach (KeyValuePair<string, TileData> tileDataEntry in allUniqueTileData)
      {
        string outputFilePath = Path.Combine(outputTileImagesDirectoryPath, tileDataEntry.Value.Group, tileDataEntry.Key + ".png");
        tileDataEntry.Value.TileImage.Save(outputFilePath);
      }
    }

    public static void OutputTileReferencesJson(
      SortedDictionary<string, TileData> allUniqueTileData,
      string outputTileReferencesJsonDirectoryPath)
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

      Util.WriteTextFile(Path.Combine(outputTileReferencesJsonDirectoryPath, TILE_REFERENCES_JSON_FILE_NAME), outputJsonLines.ToString());
    }

    public static void GenerateSourceMapJsonFiles(string inputMapImagesDirectoryPath, string outputMapJsonFilesDirectoryPath)
    {
      List<FileInfo> imageFileList = Util.GetFileList(inputMapImagesDirectoryPath, "png");
      foreach (FileInfo imageFile in imageFileList)
      {
        Bitmap mapImage = Util.ReadBitmap(imageFile);

        List<List<string>> tileHashesMap = new List<List<string>>();
        for (int y = 0; y < mapImage.Height / TILE_HEIGHT_PIXEL; y++)
        {
          tileHashesMap.Add(new List<string>());
          for (int x = 0; x < mapImage.Width / TILE_WIDTH_PIXEL; x++)
          {
            Bitmap tileImage = Util.GetSubBitmap(mapImage, x * TILE_WIDTH_PIXEL, y * TILE_HEIGHT_PIXEL, TILE_WIDTH_PIXEL, TILE_HEIGHT_PIXEL);
            string tileImageHash = Util.GetBitmapHash(tileImage);
            tileHashesMap[y].Add(tileImageHash);
          }
        }

        string subPath = imageFile.FullName.Replace(inputMapImagesDirectoryPath, string.Empty).Replace("\\", "/").TrimStart('/');

        string outputFullPath = Path.Combine(outputMapJsonFilesDirectoryPath, subPath + ".json");
        Directory.CreateDirectory(Path.GetDirectoryName(outputFullPath));

        Util.WriteTextFile(outputFullPath, Util.JaggedListToJson(tileHashesMap));
      }
    }

    public static void OutputTileSortHelper(
      SortedDictionary<string, TileData> allUniqueTileData,
      string outputTileSortHelperDirectoryPath)
    {
      // Sort tiles by image color and then output the sorted tileHashes
      // This is used in tileSortHelper
      Dictionary<string, Color> tileAveragedColors = new Dictionary<string, Color>();
      foreach (KeyValuePair<string, TileData> tileDataEntry in allUniqueTileData)
      {
        Bitmap tileImage = tileDataEntry.Value.TileImage;

        int tileRedSum = 0;
        int tileGreenSum = 0;
        int tileBlueSum = 0;
        for (int y = 0; y < tileImage.Height; y++)
        {
          for (int x = 0; x < tileImage.Width; x++)
          {
            Color tilePixel = tileImage.GetPixel(x, y);
            tileRedSum += tilePixel.R;
            tileGreenSum += tilePixel.G;
            tileBlueSum += tilePixel.B;
          }
        }

        // Average all the pixel colors of the tile
        // Round the color components to the first decimal place, this will give better results when sorting
        Color tileAveragedColor = Color.FromArgb(
          tileRedSum / (tileImage.Height * tileImage.Width),
          tileGreenSum / (tileImage.Height * tileImage.Width),
          tileBlueSum / (tileImage.Height * tileImage.Width));

        /*
        Color[] tilePixels = tileImage.GetPixels();
        tileAveragedColor.R = (byte)Math.Round(tilePixels.Average(component => component.r), 1);
        tileAveragedColor.G = (float)Math.Round(tilePixels.Average(component => component.g), 1);
        tileAveragedColor.B = (float)Math.Round(tilePixels.Average(component => component.b), 1);
        */

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

      Util.WriteTextFile(Path.Combine(outputTileSortHelperDirectoryPath, TILE_SORT_HELPER_FILE_NAME), tileHashesSortedByColorOutput.ToString());
    }

    public static void OutputBatchMoveScriptHelper(
      string inputMapDirectoryPath,
      string tileImagesDirectoryPath,
      string outputBatchMoveScriptHelperDirectoryPath)
    {
      // Get the unique tile hashes for input map images, then create a batch script (user has to run the script) to move it from UNDEFINED folder to TEMP folder to separate it and make it easier to determine where a tile is from and from which map image
      StringBuilder tileHashesByMapScriptOutput = new StringBuilder();
      List<FileInfo> mapImageFileList = Util.GetFileList(inputMapDirectoryPath, "png");
      foreach (FileInfo mapImageFile in mapImageFileList)
      {
        HashSet<string> tileHashesFromMapImage = GetTileHashesFromMapImage(mapImageFile);
        tileHashesByMapScriptOutput.AppendLine("\nrem " + mapImageFile.FullName);
        tileHashesByMapScriptOutput.AppendLine("cd " + tileImagesDirectoryPath);
        foreach (string tileHash in tileHashesFromMapImage)
        {
          string scriptLine =
              "move"
              + " " + UNDEFINED_GROUP_NAME + "\\" + tileHash + ".png"
              + " " + "TEMP";
          tileHashesByMapScriptOutput.AppendLine(scriptLine);
        }
      }

      Util.WriteTextFile(Path.Combine(outputBatchMoveScriptHelperDirectoryPath, TILE_HASHES_BY_MAP_SCRIPT_FILE_NAME), tileHashesByMapScriptOutput.ToString());
    }

    public static IEnumerable<string> GetDebugInformation(string tileImagesDirectoryPath)
    {
      // Get list of Directories
      return Directory.GetDirectories(tileImagesDirectoryPath).Select(path => "\"" + Path.GetFileName(path) + "\",");
    }

    public static bool CheckTileHashesMatchImages(string tileImagesDirectoryPath)
    {
      List<FileInfo> tileImageFileList = Util.GetFileList(tileImagesDirectoryPath, "png");
      foreach (FileInfo tileImageFile in tileImageFileList)
      {
        string actualTileHash = Path.GetFileNameWithoutExtension(tileImageFile.FullName);
        Bitmap tileBitmap = Util.ReadBitmap(tileImageFile.FullName);
        string expectedTileHash = Util.GetBitmapHash(tileBitmap);
        if (actualTileHash != expectedTileHash)
        {
          Console.WriteLine("Tile Hash mismatch on: " + tileImageFile.FullName);
          return false;
        }
      }
      return true;
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

    /// <summary>
    ///   Gets the list of unique tile hashes for the given input map image.
    /// </summary>
    /// <param name="mapImageFile">Map image file</param>
    /// <returns>List of unique tile hashes for the given input map image</returns>
    public static HashSet<string> GetTileHashesFromMapImage(FileInfo mapImageFile)
    {
      Bitmap mapImage = Util.ReadBitmap(mapImageFile);

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
  }
}
