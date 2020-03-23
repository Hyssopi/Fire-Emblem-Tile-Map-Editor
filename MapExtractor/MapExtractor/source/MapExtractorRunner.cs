using System;
using System.Collections.Generic;
using System.IO;

namespace MapExtractor.source
{
  /// <summary>
  /// Map Extractor runner.
  /// </summary>
  public class MapExtractorRunner
  {
    private const string BASE_DIRECTORY = @"C:\Users\t\Desktop";

    /// <summary>
    /// Main function.
    /// </summary>
    /// <param name="args">Args</param>
    public static void Main(string[] args)
    {
      Console.WriteLine("START");

      SortedDictionary<string, TileData> allUniqueTileData = new SortedDictionary<string, TileData>(StringComparer.OrdinalIgnoreCase);

      string map24BitDirectoryPath = Path.Combine(BASE_DIRECTORY, @"temp9\References\Images (24-Bit Color Depth)");
      string map15BitDirectoryPath = Path.Combine(BASE_DIRECTORY, @"temp9\References\Images (15-Bit Color Depth)");
      if (!Util.DeleteDirectory(map15BitDirectoryPath, true))
      {
        Console.WriteLine("Cannot delete directory: " + map15BitDirectoryPath + ". Retry again.");
        return;
      }

      Util.Convert24BitTo15BitPngImages(map24BitDirectoryPath, map15BitDirectoryPath);

      string mapImagesDirectoryPath = Path.Combine(BASE_DIRECTORY, @"temp9\References\Images (15-Bit Color Depth)");
      string tileImagesDirectoryPath = Path.Combine(BASE_DIRECTORY, @"temp9\tiles\images");
      MapExtractor.FillAllUniqueTileData(allUniqueTileData, mapImagesDirectoryPath, tileImagesDirectoryPath);

      MapExtractor.OutputTileImages(allUniqueTileData, tileImagesDirectoryPath);

      string tileReferencesJsonDirectoryPath = Path.Combine(BASE_DIRECTORY, @"temp9\tiles");
      MapExtractor.OutputTileReferencesJson(allUniqueTileData, tileReferencesJsonDirectoryPath);
      
      string mapJsonFilesDirectoryPath = Path.Combine(BASE_DIRECTORY, @"temp9\References\Fire Emblem Map JSON Files");
      if (!Util.DeleteDirectory(mapJsonFilesDirectoryPath, true))
      {
        Console.WriteLine("Cannot delete directory: " + mapJsonFilesDirectoryPath + ". Retry again.");
        return;
      }
      MapExtractor.GenerateSourceMapJsonFiles(mapImagesDirectoryPath, mapJsonFilesDirectoryPath);

      string tileSortHelperDirectoryPath = BASE_DIRECTORY;
      MapExtractor.OutputTileSortHelper(allUniqueTileData, tileSortHelperDirectoryPath);

      string batchMoveScriptHelperDirectoryPath = BASE_DIRECTORY;
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
    }
  }
}
