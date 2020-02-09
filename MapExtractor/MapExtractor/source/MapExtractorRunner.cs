using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;

namespace MapExtractor.source
{
  public class MapExtractorRunner
  {
    // Used in Tile Map Editor
    private const string BASE_OUTPUT_DIRECTORY_PATH = "C:/Users/t/Desktop/temp9/tiles";
    private const string IMAGES_OUTPUT_FOLDER_NAME = "images";
    private const string UNDEFINED_GROUP_OUTPUT_FOLDER_NAME = "UNDEFINED";
    private const string TILE_REFERENCES_JSON_FILE_NAME = "tileReferences.json";

    // Used in Tile Sort Helper
    private const string TILE_SORT_HELPER_OUTPUT_FILE_PATH = "C:/Users/t/Desktop/tileHashesSortedByColor.txt";
    private const string TILE_HASHES_BY_MAP_SCRIPT_FILE_PATH = "C:/Users/t/Desktop/tileHashesByMapScript.txt";

    public static void Main(string[] args)
    {

      SortedDictionary<string, TileData> allUniqueTileData = new SortedDictionary<string, TileData>(StringComparer.OrdinalIgnoreCase);


      /*
      List<FileInfo> mapImageFileList = Util.GetFileList(@"C:\Users\t\Desktop\SF FE8 TEST", "png");
      foreach (FileInfo mapImageFile in mapImageFileList)
      {
        Bitmap mapImageTexture = Util.ReadImage(mapImageFile);

        string outputFullPath = mapImageFile.FullName.Replace("\\SF FE8 TEST\\", "\\SF FE8 TEST OUTPUT\\");
        Directory.CreateDirectory(Path.GetDirectoryName(outputFullPath));

        Util.Get24BitTexture(mapImageTexture).Save(outputFullPath);
      }
      */

      /*
      Bitmap testImage = Util.ReadBitmap(new FileInfo(@"C:\Users\t\Desktop\TEST\test.png"));
      string imageHash = Util.GetBitmapHash(testImage);
      */

      /*
      Util.Convert15BitTo24BitPngImages(
        @"C:\Users\t\Desktop\SF FE8 TEST",
        @"C:\Users\t\Desktop\SF FE8 TEST OUTPUT",
        true);
      */

      string map24BitDirectoryPath = @"C:\Users\t\Desktop\temp9\References\Images (24-Bit Color Depth)";
      string map15BitDirectoryPath = @"C:\Users\t\Desktop\temp9\References\Images (15-Bit Color Depth)";
      Util.Convert24BitTo15BitPngImages(map24BitDirectoryPath, map15BitDirectoryPath);


      string mapDirectoryPath = @"C:\Users\t\Desktop\temp9\References\Images (15-Bit Color Depth)";
      string tileImagesDirectoryPath = @"C:\Users\t\Desktop\temp9\tiles\images";
      MapExtractor.FillAllUniqueTileData(allUniqueTileData, mapDirectoryPath, tileImagesDirectoryPath);

      MapExtractor.OutputTileImages(allUniqueTileData, tileImagesDirectoryPath);

      string tileReferencesJsonDirectoryPath = @"C:\Users\t\Desktop\temp9\tiles";
      MapExtractor.OutputTileReferencesJson(allUniqueTileData, tileReferencesJsonDirectoryPath);

      string tileSortHelperDirectoryPath = @"C:\Users\t\Desktop";
      MapExtractor.OutputTileSortHelper(allUniqueTileData, tileSortHelperDirectoryPath);

      string batchMoveScriptHelperDirectoryPath = @"C:\Users\t\Desktop";
      MapExtractor.OutputBatchMoveScriptHelper(
        mapDirectoryPath,
        tileImagesDirectoryPath,
        batchMoveScriptHelperDirectoryPath);

      MapExtractor.PrintDebugInformation(tileImagesDirectoryPath);

      Console.WriteLine("CheckTileHashesMatchImages: " + MapExtractor.CheckTileHashesMatchImages(tileImagesDirectoryPath));


      Console.WriteLine("END");
    }
  }
}
