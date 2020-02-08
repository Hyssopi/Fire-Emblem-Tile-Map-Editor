using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;

namespace MapExtractor.source
{
  public class MapExtractorRunner
  {
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

      MapExtractor.FillAllUniqueTileData(allUniqueTileData, @"C:\Users\t\Desktop\temp9\References\Images (24-Bit Color Depth)");

      Console.WriteLine("END");
    }
  }
}
