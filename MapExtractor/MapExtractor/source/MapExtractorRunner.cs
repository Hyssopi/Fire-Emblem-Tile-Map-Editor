using System;
using System.Collections.Generic;
using System.IO;

namespace MapExtractor.source
{
  public class MapExtractorRunner
  {
    /*
    // Used in Tile Map Editor
    private const string BASE_OUTPUT_DIRECTORY_PATH = "C:/Users/t/Desktop/temp9/tiles";
    private const string IMAGES_OUTPUT_FOLDER_NAME = "images";
    private const string UNDEFINED_GROUP_OUTPUT_FOLDER_NAME = "UNDEFINED";
    private const string TILE_REFERENCES_JSON_FILE_NAME = "tileReferences.json";

    // Used in Tile Sort Helper
    private const string TILE_SORT_HELPER_OUTPUT_FILE_PATH = "C:/Users/t/Desktop/tileHashesSortedByColor.txt";
    private const string TILE_HASHES_BY_MAP_SCRIPT_FILE_PATH = "C:/Users/t/Desktop/tileHashesByMapScript.txt";
    */

    public static void Main(string[] args)
    {
      SortedDictionary<string, TileData> allUniqueTileData = new SortedDictionary<string, TileData>(StringComparer.OrdinalIgnoreCase);

      string map24BitDirectoryPath = @"C:\Users\t\Desktop\temp9\References\Images (24-Bit Color Depth)";
      string map15BitDirectoryPath = @"C:\Users\t\Desktop\temp9\References\Images (15-Bit Color Depth)";
      if (Directory.Exists(map15BitDirectoryPath))
      {
        Directory.Delete(map15BitDirectoryPath, true);
      }
      Util.Convert24BitTo15BitPngImages(map24BitDirectoryPath, map15BitDirectoryPath);

      string mapImagesDirectoryPath = @"C:\Users\t\Desktop\temp9\References\Images (15-Bit Color Depth)";
      string tileImagesDirectoryPath = @"C:\Users\t\Desktop\temp9\tiles\images";
      MapExtractor.FillAllUniqueTileData(allUniqueTileData, mapImagesDirectoryPath, tileImagesDirectoryPath);

      MapExtractor.OutputTileImages(allUniqueTileData, tileImagesDirectoryPath);

      string tileReferencesJsonDirectoryPath = @"C:\Users\t\Desktop\temp9\tiles";
      MapExtractor.OutputTileReferencesJson(allUniqueTileData, tileReferencesJsonDirectoryPath);
      
      string mapJsonFilesDirectoryPath = @"C:\Users\t\Desktop\temp9\References\Fire Emblem Map JSON Files";
      if (Directory.Exists(mapJsonFilesDirectoryPath))
      {
        Directory.Delete(mapJsonFilesDirectoryPath, true);
      }
      MapExtractor.GenerateSourceMapJsonFiles(mapImagesDirectoryPath, mapJsonFilesDirectoryPath);

      string tileSortHelperDirectoryPath = @"C:\Users\t\Desktop";
      MapExtractor.OutputTileSortHelper(allUniqueTileData, tileSortHelperDirectoryPath);

      string batchMoveScriptHelperDirectoryPath = @"C:\Users\t\Desktop";
      MapExtractor.OutputBatchMoveScriptHelper(
        mapImagesDirectoryPath,
        tileImagesDirectoryPath,
        batchMoveScriptHelperDirectoryPath);

      IEnumerable<string> debugInformation = MapExtractor.GetDebugInformation(tileImagesDirectoryPath);
      Util.PrintList(debugInformation);

      Console.WriteLine("CheckTileHashesMatchImages: " + MapExtractor.CheckTileHashesMatchImages(tileImagesDirectoryPath));

      Console.WriteLine("CheckPngImagesAre15Bit: " + Util.CheckPngImagesAre15Bit(mapImagesDirectoryPath));

      Console.WriteLine("CheckPngImagesAre15Bit: " + Util.CheckPngImagesAre15Bit(tileImagesDirectoryPath));

      Console.WriteLine("END");

      /*
      Console.WriteLine("TEST1");
      
      for (int i = 0; i < 10; i++)
      {
        try
        {

        }
        catch (FileLoadException)
        {
          Console.WriteLine("TEST3, waiting 1 second try again, attempt:");
          System.Threading.Thread.Sleep(1000);
        }
      }
      Console.WriteLine("TEST3");
      */
    }
  }
}
