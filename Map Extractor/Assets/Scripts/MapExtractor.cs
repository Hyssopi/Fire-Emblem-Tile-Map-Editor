
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using UnityEngine;

/// <summary>
///   Reads the input map images (for example, Fire Emblem maps), then extracts each individual tile from the map. Also keeps a reference of all the neighboring tiles for each tile.
///   Then outputs the tile images and a JSON data file representing the tile information.
///   The JSON file is used in the Tile Map Editor.
/// </summary>
public class MapExtractor : MonoBehaviour
{
  /// <summary>
  ///   Class to store the tile data.
  /// </summary>
  public class TileData
  {
    public string TileHash { get; private set; }
    public string Group { get; set; }
    public HashSet<string> NorthNeighbors { get; private set; }
    public HashSet<string> EastNeighbors { get; private set; }
    public HashSet<string> SouthNeighbors { get; private set; }
    public HashSet<string> WestNeighbors { get; private set; }
    public Texture2D TileImage { get; private set; }

    /// <summary>
    ///   TileData constructor.
    /// </summary>
    /// <param name="tileHash">Hash of a tile</param>
    /// <param name="tileImage">Image of a tile</param>
    public TileData(string tileHash, Texture2D tileImage)
    {
      TileHash = tileHash;
      Group = null;
      NorthNeighbors = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      EastNeighbors = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      SouthNeighbors = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      WestNeighbors = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      TileImage = tileImage;
    }

    /// <summary>
    /// Outputs JSON data of the tile.
    /// </summary>
    /// <returns>JSON data of the tile</returns>
    public string ToJson()
    {
      StringBuilder jsonOutput = new StringBuilder();
      jsonOutput.AppendLine("  {");

      jsonOutput.AppendLine("    \"tileHash\": \"" + TileHash + "\",");
      jsonOutput.AppendLine("    \"group\": \"" + Group + "\",");

      jsonOutput.AppendLine("    \"north\": [" + string.Join(",", (NorthNeighbors.Select(s => "\"" + s + "\"")).ToArray()) + "],");
      jsonOutput.AppendLine("    \"east\": [" + string.Join(",", (EastNeighbors.Select(s => "\"" + s + "\"")).ToArray()) + "],");
      jsonOutput.AppendLine("    \"south\": [" + string.Join(",", (SouthNeighbors.Select(s => "\"" + s + "\"")).ToArray()) + "],");
      jsonOutput.AppendLine("    \"west\": [" + string.Join(",", (WestNeighbors.Select(s => "\"" + s + "\"")).ToArray()) + "]");

      jsonOutput.Append("  }");
      return jsonOutput.ToString();
    }
  }

  private const int TILE_WIDTH_PIXEL = 16;
  private const int TILE_HEIGHT_PIXEL = 16;
  
  private const string CURSOR_TILE_FILE_NAME = "cursorTile.png";
  private const string EMPTY_TILE_FILE_NAME = "emptyTile.png";

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

  public enum Direction
  {
    NONE,
    NORTH,
    EAST,
    SOUTH,
    WEST
  };

  public SortedDictionary<string, TileData> AllUniqueTileData { get; private set; }

  private static MapExtractor instance;

  /// <summary>
  ///   Get MapExtractor instance.
  /// </summary>
  /// <returns>MapExtractor instance</returns>
  public static MapExtractor GetInstance()
  {
    return instance;
  }
  
  /// <summary>
  ///   Unity Awake().
  /// </summary>
  public void Awake()
  {
    instance = this;
    AllUniqueTileData = new SortedDictionary<string, TileData>(StringComparer.OrdinalIgnoreCase);
  }
  
  /// <summary>
  ///   Unity Start().
  /// </summary>
  public void Start()
  {
    Util.ConfigureTextureImporterDirectory("Assets/Resources/Images");

    // Read the input map images (for example, Fire Emblem maps) and extract the tile images and neighbor data
    List<FileInfo> mapImageFileList = Util.GetFileList(Path.Combine(RESOURCE_DIRECTORY_PATH, MAP_INPUT_FOLDER_NAME), "png");
    foreach (FileInfo mapImageFile in mapImageFileList)
    {
      // Load the chapter map image
      Texture2D mapImage = Util.DuplicateTexture(Resources.Load(Path.Combine(MAP_INPUT_FOLDER_NAME, Path.GetFileNameWithoutExtension(mapImageFile.Name))) as Texture2D);

      UnityEngine.Assertions.Assert.IsTrue(mapImage.width % TILE_WIDTH_PIXEL == 0);
      UnityEngine.Assertions.Assert.IsTrue(mapImage.height % TILE_HEIGHT_PIXEL == 0);

      string[,] mapTileImageHashes = new string[mapImage.height / TILE_HEIGHT_PIXEL, mapImage.width / TILE_WIDTH_PIXEL];

      // Fill out the AllUniqueTileData with initial TileData
      for (int y = 0; y < mapImage.height / TILE_HEIGHT_PIXEL; y++)
      {
        for (int x = 0; x < mapImage.width / TILE_WIDTH_PIXEL; x++)
        {
          Texture2D tileImage = Util.GetSubTexture(mapImage, x * TILE_WIDTH_PIXEL, y * TILE_HEIGHT_PIXEL, TILE_WIDTH_PIXEL, TILE_HEIGHT_PIXEL);

          string tileImageHash = Util.GetTextureHash(tileImage);

          mapTileImageHashes[y, x] = tileImageHash;

          if (!AllUniqueTileData.ContainsKey(tileImageHash))
          {
            AllUniqueTileData.Add(tileImageHash, new TileData(tileImageHash, tileImage));
          }

          // Print out Cursor and Empty tileHashes for reference
          if (mapImageFile.Name.Equals(CURSOR_TILE_FILE_NAME, StringComparison.OrdinalIgnoreCase))
          {
            Debug.Log("Cursor TileHash: " + tileImageHash);
          }
          if (mapImageFile.Name.Equals(EMPTY_TILE_FILE_NAME, StringComparison.OrdinalIgnoreCase))
          {
            Debug.Log("Empty TileHash: " + tileImageHash);
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
            AllUniqueTileData[tileHash].SouthNeighbors.Add(southTileHash);
          }
          // East node
          if (IsValidTileCoordinate(mapWidth, mapHeight, x, y, Direction.EAST))
          {
            string eastTileHash = mapTileImageHashes[y, x + 1];
            AllUniqueTileData[tileHash].EastNeighbors.Add(eastTileHash);
          }
          // North node
          if (IsValidTileCoordinate(mapWidth, mapHeight, x, y, Direction.NORTH))
          {
            string northTileHash = mapTileImageHashes[y - 1, x];
            AllUniqueTileData[tileHash].NorthNeighbors.Add(northTileHash);
          }
          // West node
          if (IsValidTileCoordinate(mapWidth, mapHeight, x, y, Direction.WEST))
          {
            string westTileHash = mapTileImageHashes[y, x - 1];
            AllUniqueTileData[tileHash].WestNeighbors.Add(westTileHash);
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

      if (!AllUniqueTileData.ContainsKey(tileHash))
      {
        //List<string> allUniqueTileDataKeys = AllUniqueTileData.Keys.ToList();
        //List<TileData> allUniqueTileDataValues = AllUniqueTileData.Values.ToList();
        Debug.LogError(tileImageFilePath.FullName + " exists but its tileHash does not exist in AllUniqueTileData. The tileHash should exist and be read from the input maps.");
        return;
      }

      AllUniqueTileData[tileHash].Group = groupName;
    }

    // Create the UNDEFINED folder in the output images directory if it doesn't exist
    Directory.CreateDirectory(Util.CombinePaths(BASE_OUTPUT_DIRECTORY_PATH, IMAGES_OUTPUT_FOLDER_NAME, UNDEFINED_GROUP_OUTPUT_FOLDER_NAME));

    // Set any tile that doesn't already have a tile group (new tile images read) to UNDEFINED
    // Then save the tile images out
    foreach (KeyValuePair<string, TileData> tileDataEntry in AllUniqueTileData)
    {
      if (tileDataEntry.Value.Group == null)
      {
        Debug.Log("Group was null, now setting to UNDEFINED: " + tileDataEntry.Key);
        tileDataEntry.Value.Group = UNDEFINED_GROUP_OUTPUT_FOLDER_NAME;
      }
      Util.SaveTextureAsPNG(tileDataEntry.Value.TileImage, Util.CombinePaths(BASE_OUTPUT_DIRECTORY_PATH, IMAGES_OUTPUT_FOLDER_NAME, tileDataEntry.Value.Group, tileDataEntry.Key + ".png"));
    }

    // Output all tile data to JSON file
    StringBuilder outputJsonLines = new StringBuilder();

    outputJsonLines.AppendLine("[");

    int tempIndex = 0;
    foreach (KeyValuePair<string, TileData> tileDataEntry in AllUniqueTileData)
    {
      outputJsonLines.AppendLine(tileDataEntry.Value.ToJson() + (tempIndex < (AllUniqueTileData.Count - 1) ? "," : string.Empty));

      ++tempIndex;
    }

    outputJsonLines.AppendLine("]");

    Util.WriteTextFile(Path.Combine(BASE_OUTPUT_DIRECTORY_PATH, TILE_REFERENCES_JSON_FILE_NAME), outputJsonLines.ToString());

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
    tempIndex = 0;
    foreach (KeyValuePair<string, Color> tileAveragedColorPair in sortedTileAveragedColors)
    {
      //tileHashesSortedByColorOutput.AppendLine(tileAveragedColorPair.Key + " " + tileAveragedColorPair.Value.r + " " + tileAveragedColorPair.Value.g + " " + tileAveragedColorPair.Value.b);
      tileHashesSortedByColorOutput.AppendLine("\"" + tileAveragedColorPair.Key + "\"" + (tempIndex < (sortedTileAveragedColors.Count - 1) ? "," : string.Empty));

      ++tempIndex;
    }

    Util.WriteTextFile(TILE_SORT_HELPER_OUTPUT_FILE_PATH, tileHashesSortedByColorOutput.ToString());

    // Get the unique tile hashes for a particular input map image, then create a batch script (user has to run the script) to move it from UNDEFINED folder to TEMP folder to separate it and make it easier to determine where a tile is from and from which map image
    string mapImageFilePath = "C:\\Users\\t\\Desktop\\temp9\\Map Extractor\\Assets\\Resources\\Images\\FireEmblem7_04_Chapter.png";
    List<string> tileHashesFromMapImage = GetTileHashesFromMapImage(mapImageFilePath);
    StringBuilder scriptOutput = new StringBuilder();
    scriptOutput.AppendLine("cd " + Path.Combine(BASE_OUTPUT_DIRECTORY_PATH, IMAGES_OUTPUT_FOLDER_NAME));
    foreach (string tileHash in tileHashesFromMapImage)
    {
      string scriptLine =
          "move"
          + " " + UNDEFINED_GROUP_OUTPUT_FOLDER_NAME + "\\" + tileHash + ".png"
          + " " + "TEMP";
      scriptOutput.AppendLine(scriptLine);
    }

    Debug.Log(scriptOutput);





    // TODO: TEMP remove. Used to get list of Directories
    Util.PrintList(Directory.GetDirectories("C:\\Users\\t\\Desktop\\temp9\\tiles\\images").Select(path => "\"" + Path.GetFileName(path) + "\","));





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
  /// <param name="mapImageFilePath">Map image file path</param>
  /// <returns>List of unique tile hashes for the given input map image</returns>
  public static List<string> GetTileHashesFromMapImage(string mapImageFilePath)
  {
    // Load the chapter map image
    Texture2D mapImage = Util.DuplicateTexture(Resources.Load(Path.Combine(MAP_INPUT_FOLDER_NAME, Path.GetFileNameWithoutExtension(mapImageFilePath))) as Texture2D);

    UnityEngine.Assertions.Assert.IsTrue(mapImage.width % TILE_WIDTH_PIXEL == 0);
    UnityEngine.Assertions.Assert.IsTrue(mapImage.height % TILE_HEIGHT_PIXEL == 0);

    HashSet<string> uniqueTileHashes = new HashSet<string>();

    // Go through each tile in the map and get a unique hashset of image tile hashes
    for (int y = 0; y < mapImage.height / TILE_HEIGHT_PIXEL; y++)
    {
      for (int x = 0; x < mapImage.width / TILE_WIDTH_PIXEL; x++)
      {
        Texture2D tileImage = Util.GetSubTexture(mapImage, x * TILE_WIDTH_PIXEL, y * TILE_HEIGHT_PIXEL, TILE_WIDTH_PIXEL, TILE_HEIGHT_PIXEL);
        string tileImageHash = Util.GetTextureHash(tileImage);
        uniqueTileHashes.Add(tileImageHash);
      }
    }

    return uniqueTileHashes.ToList();
  }
}
