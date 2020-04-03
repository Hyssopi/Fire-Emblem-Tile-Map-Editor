using System;
using System.Collections.Generic;
using System.IO;

namespace MapExtractor.source
{
  /// <summary>
  ///   Map Extractor runner.
  /// </summary>
  public class MapExtractorRunner
  {
    /// <summary>
    ///   Main function.
    /// </summary>
    /// <param name="args">Args</param>
    public static void Main(string[] args)
    {
      Console.WriteLine("MapExtractorRunner START");

      string environmentDirectory = Environment.CurrentDirectory;
      string projectDirectory = Directory.GetParent(environmentDirectory).Parent.FullName;
      string baseDirectory = projectDirectory.Replace(@"\Fire-Emblem-Tile-Map-Editor\MapExtractor\MapExtractor", string.Empty);

      SortedDictionary<string, TileData> allUniqueTileData = new SortedDictionary<string, TileData>(StringComparer.OrdinalIgnoreCase);

      string map24BitDirectoryPath = Path.Combine(baseDirectory, @"Fire-Emblem-Tile-Map-Editor\References\Images (24-Bit Color Depth)");
      string map15BitDirectoryPath = Path.Combine(baseDirectory, @"Fire-Emblem-Tile-Map-Editor\References\Images (15-Bit Color Depth)");
      if (!Util.DeleteDirectory(map15BitDirectoryPath, true))
      {
        Console.WriteLine("Cannot delete directory: " + map15BitDirectoryPath + ". Retry again.");
        return;
      }

      Util.Convert24BitTo15BitPngImages(map24BitDirectoryPath, map15BitDirectoryPath);

      string mapImagesDirectoryPath = Path.Combine(baseDirectory, @"Fire-Emblem-Tile-Map-Editor\References\Images (15-Bit Color Depth)");
      string tileImagesDirectoryPath = Path.Combine(baseDirectory, @"Fire-Emblem-Tile-Map-Editor\tiles\images");
      MapExtractor.FillAllUniqueTileData(allUniqueTileData, mapImagesDirectoryPath, tileImagesDirectoryPath);

      MapExtractor.OutputTileImages(allUniqueTileData, tileImagesDirectoryPath);

      string tileReferencesJsonDirectoryPath = Path.Combine(baseDirectory, @"Fire-Emblem-Tile-Map-Editor\tiles");
      MapExtractor.OutputTileReferencesJson(allUniqueTileData, tileReferencesJsonDirectoryPath);
      
      string mapJsonFilesDirectoryPath = Path.Combine(baseDirectory, @"Fire-Emblem-Tile-Map-Editor\References\Fire Emblem Map JSON Files");
      if (!Util.DeleteDirectory(mapJsonFilesDirectoryPath, true))
      {
        Console.WriteLine("Cannot delete directory: " + mapJsonFilesDirectoryPath + ". Retry again.");
        return;
      }
      MapExtractor.GenerateSourceMapJsonFiles(mapImagesDirectoryPath, mapJsonFilesDirectoryPath);

      string tileSortHelperDirectoryPath = baseDirectory;
      MapExtractor.OutputTileSortHelper(allUniqueTileData, tileSortHelperDirectoryPath);

      string batchMoveScriptHelperDirectoryPath = baseDirectory;
      MapExtractor.OutputBatchMoveScriptHelper(
        mapImagesDirectoryPath,
        tileImagesDirectoryPath,
        batchMoveScriptHelperDirectoryPath);

      IEnumerable<string> debugInformation = MapExtractor.GetDebugInformation(tileImagesDirectoryPath);
      Util.PrintList(debugInformation);

      Console.WriteLine("CheckTileHashesMatchImages: " + MapExtractor.CheckTileHashesMatchImages(tileImagesDirectoryPath));

      Console.WriteLine("CheckPngImagesAre15Bit: " + Util.CheckPngImagesAre15Bit(mapImagesDirectoryPath));

      Console.WriteLine("CheckPngImagesAre15Bit: " + Util.CheckPngImagesAre15Bit(tileImagesDirectoryPath));

      Console.WriteLine("MapExtractorRunner END");
    }
  }
}
