using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Security.Cryptography;
using System.Text;

/// <summary>
///   Utility functions.
/// </summary>
public class Util
{
  /// <summary>
  ///   Read text file.
  /// </summary>
  /// <param name="filePath">Path of the text file to read</param>
  /// <returns>Array of text read from the text file</returns>
  public static string[] ReadTextFile(string filePath)
  {
    string[] lines = File.ReadAllText(filePath).Split('\n');
    for (int i = 0; i < lines.Length; i++)
    {
      lines[i] = lines[i].TrimEnd();
    }
    return lines;
  }

  /// <summary>
  ///   Write text to file.
  /// </summary>
  /// <param name="filePath">Path to file to write text to</param>
  /// <param name="line">Text to write</param>
  /// <param name="append">True to append text, false to overwrite text</param>
  public static void WriteTextFile(string filePath, string line, bool append = false)
  {
    StreamWriter writer = new StreamWriter(filePath, append);
    writer.Write(line);
    writer.Close();
  }

  /// <summary>
  ///   Recursively get list of files.
  /// </summary>
  /// <param name="path">Path to directory</param>
  /// <param name="fileExtensionFilter">File extension filter, for example: "png"</param>
  /// <returns>List of files in given directory (recursively)</returns>
  public static List<FileInfo> GetFileList(string path, string fileExtensionFilter = "*")
  {
    DirectoryInfo directoryInfo = new DirectoryInfo(path);
    List<FileInfo> fileInfoList = new List<FileInfo>();
    fileInfoList.AddRange(directoryInfo.GetFiles("*." + fileExtensionFilter));
    foreach (DirectoryInfo subDirectoryInfo in directoryInfo.GetDirectories())
    {
      fileInfoList.AddRange(GetFileList(path + Path.DirectorySeparatorChar + subDirectoryInfo.Name, fileExtensionFilter));
    }
    return fileInfoList;
  }

  /// <summary>
  ///   Read Bitmap.
  /// </summary>
  /// <param name="filePath">Path to bitmap to read</param>
  /// <returns>Bitmap</returns>
  public static Bitmap ReadBitmap(string filePath)
  {
    return new Bitmap(filePath);
  }

  /// <summary>
  ///   Read Bitmap.
  /// </summary>
  /// <param name="fileInfo">FileInfo of file to read</param>
  /// <returns>Bitmap</returns>
  public static Bitmap ReadBitmap(FileInfo fileInfo)
  {
    return ReadBitmap(fileInfo.FullName);
  }

  /// <summary>
  ///   Get a portion of the bitmap.
  /// </summary>
  /// <param name="originalBitmap">Original bitmap</param>
  /// <param name="x">Starting horizontal position to crop</param>
  /// <param name="y">Starting vertical position to crop</param>
  /// <param name="width">Width of the crop</param>
  /// <param name="height">Height of the crop</param>
  /// <returns>Portion of the bitmap</returns>
  public static Bitmap GetSubBitmap(Bitmap originalBitmap, int x, int y, int width, int height)
  {
    Rectangle cloneRectangle = new Rectangle(x, y, width, height);
    PixelFormat pixelFormat = originalBitmap.PixelFormat;
    return new Bitmap(originalBitmap.Clone(cloneRectangle, pixelFormat));
  }

  /// <summary>
  ///   Convert to bitmap with 15-bit color space.
  ///   RGB, each component uses 5-bits to represent its value. The three least significant bits are filled with 0.
  ///   The conversion drops the three least significant bits for each R, G, and B components.
  ///   For example, before: 1101 1110, after: 1101 1000
  /// </summary>
  /// <param name="originalBitmap">Original bitmap</param>
  /// <returns>Bitmap converted to 15-bit color space</returns>
  public static Bitmap Get15BitColorSpaceBitmap(Bitmap originalBitmap)
  {
    Bitmap modifiedBitmap = new Bitmap(originalBitmap);

    for (int y = 0; y < originalBitmap.Height; y++)
    {
      for (int x = 0; x < originalBitmap.Width; x++)
      {
        Color originalColor = originalBitmap.GetPixel(x, y);

        int newAlpha = originalColor.A;
        int newRed = originalColor.R & 0b1111_1000;
        int newGreen = originalColor.G & 0b1111_1000;
        int newBlue = originalColor.B & 0b1111_1000;

        Color modifiedColor = Color.FromArgb(newAlpha, newRed, newGreen, newBlue);

        modifiedBitmap.SetPixel(x, y, modifiedColor);
      }
    }

    return modifiedBitmap;
  }

  /// <summary>
  ///   Convert to bitmap with 24-bit color space.
  ///   RGB, each component uses 8-bits to represent its value.
  ///   The conversion fills the three least significant bits for each R, G, and B components with the three most significant bit values.
  ///   For example, before: 1101 1000, after: 1101 1110
  /// </summary>
  /// <param name="originalBitmap">Original bitmap</param>
  /// <returns>Bitmap converted to 24-bit color space</returns>
  public static Bitmap Get24BitColorSpaceBitmap(Bitmap originalBitmap)
  {
    Bitmap modifiedBitmap = new Bitmap(originalBitmap);

    for (int y = 0; y < originalBitmap.Height; y++)
    {
      for (int x = 0; x < originalBitmap.Width; x++)
      {
        Color originalColor = originalBitmap.GetPixel(x, y);

        int redMostSignificantBits = (originalColor.R >> 5) & 0b0111;
        int greenMostSignificantBits = (originalColor.G >> 5) & 0b0111;
        int blueMostSignificantBits = (originalColor.B >> 5) & 0b0111;

        int newAlpha = originalColor.A;
        int newRed = originalColor.R | redMostSignificantBits;
        int newGreen = originalColor.G | greenMostSignificantBits;
        int newBlue = originalColor.B | blueMostSignificantBits;

        Color modifiedColor = Color.FromArgb(newAlpha, newRed, newGreen, newBlue);

        modifiedBitmap.SetPixel(x, y, modifiedColor);
      }
    }

    return modifiedBitmap;
  }

  /// <summary>
  ///   Convert 15-bit color space PNG images to 24-bit color space PNG images.
  /// </summary>
  /// <param name="inputDirectoryPath">Input directory path</param>
  /// <param name="outputDirectoryPath">Output directory path</param>
  /// <param name="checkInputIs15Bit">Check if the input images are in 15-bit color space while converting</param>
  public static void Convert15BitTo24BitPngImages(string inputDirectoryPath, string outputDirectoryPath, bool checkInputIs15Bit)
  {
    List<FileInfo> imageFileList = GetFileList(inputDirectoryPath, "png");
    foreach (FileInfo imageFile in imageFileList)
    {
      Bitmap image = ReadBitmap(imageFile);

      // Confirm images are 15-Bit Color Depth
      if (checkInputIs15Bit)
      {
        for (int y = 0; y < image.Height; y++)
        {
          for (int x = 0; x < image.Width; x++)
          {
            Color originalColor = image.GetPixel(x, y);

            int redMostSignificantBits = originalColor.R & 0b0111;
            int greenMostSignificantBits = originalColor.G & 0b0111;
            int blueMostSignificantBits = originalColor.B & 0b0111;

            if (redMostSignificantBits != 0
              || greenMostSignificantBits != 0
              || blueMostSignificantBits != 0)
            {
              throw new InvalidDataException(imageFile.FullName);
            }
          }
        }
      }

      string subPath = imageFile.FullName.Replace(inputDirectoryPath, string.Empty).Replace("\\", "/").TrimStart('/');

      string outputFullPath = Path.Combine(outputDirectoryPath, subPath);
      Directory.CreateDirectory(Path.GetDirectoryName(outputFullPath));

      Get24BitColorSpaceBitmap(image).Save(outputFullPath);
    }
  }

  /// <summary>
  ///   Convert 24-bit color space PNG images to 15-bit color space PNG images.
  /// </summary>
  /// <param name="inputDirectoryPath">Input directory path</param>
  /// <param name="outputDirectoryPath">Output directory path</param>
  public static void Convert24BitTo15BitPngImages(string inputDirectoryPath, string outputDirectoryPath)
  {
    List<FileInfo> imageFileList = GetFileList(inputDirectoryPath, "png");
    foreach (FileInfo imageFile in imageFileList)
    {
      Bitmap bitmap = ReadBitmap(imageFile);

      string subPath = imageFile.FullName.Replace(inputDirectoryPath, string.Empty).Replace("\\", "/").TrimStart('/');

      string outputFullPath = Path.Combine(outputDirectoryPath, subPath);
      Directory.CreateDirectory(Path.GetDirectoryName(outputFullPath));

      Get15BitColorSpaceBitmap(bitmap).Save(outputFullPath);
    }
  }

  /// <summary>
  ///   Check if the input PNG images are in 15-bit color space.
  ///   The three least significant bits should be 0.
  ///   For example, 1101 1000.
  /// </summary>
  /// <param name="directoryPath">Path to directory of PNG images to check</param>
  /// <returns>True if all PNG images in given directory are in 15-bit color space, false otherwise</returns>
  public static bool CheckPngImagesAre15Bit(string directoryPath)
  {
    List<FileInfo> imageFileList = GetFileList(directoryPath, "png");
    foreach (FileInfo imageFile in imageFileList)
    {
      Bitmap bitmap = ReadBitmap(imageFile);

      for (int y = 0; y < bitmap.Height; y++)
      {
        for (int x = 0; x < bitmap.Width; x++)
        {
          Color color = bitmap.GetPixel(x, y);

          int redLeastSignificantBits = color.R & 0b0111;
          int greenLeastSignificantBits = color.G & 0b0111;
          int blueLeastSignificantBits = color.B & 0b0111;

          if (redLeastSignificantBits != 0
            || greenLeastSignificantBits != 0
            || blueLeastSignificantBits != 0)
          {
            return false;
          }
        }
      }
    }
    return true;
  }

  /// <summary>
  ///   Check if two colors have equal RGBA values.
  /// </summary>
  /// <param name="color1">Color 1</param>
  /// <param name="color2">Color 2</param>
  /// <returns>True if two colors are equal, false otherwise</returns>
  public static bool IsEqualColor(Color color1, Color color2)
  {
    return color1.R == color2.R && color1.G == color2.G && color1.B == color2.B && color1.A == color2.A;
  }

  /// <summary>
  ///   Check if two bitmaps are equal.
  /// </summary>
  /// <param name="bitmap1">Bitmap 1</param>
  /// <param name="bitmap2">Bitmap 2</param>
  /// <returns>True if two bitmaps are equal, false otherwise</returns>
  public static bool IsEqualBitmap(Bitmap bitmap1, Bitmap bitmap2)
  {
    if (bitmap1.Height != bitmap2.Height || bitmap1.Width != bitmap2.Width)
    {
      return false;
    }

    for (int y = 0; y < bitmap1.Height; y++)
    {
      for (int x = 0; x < bitmap1.Width; x++)
      {
        if (!IsEqualColor(bitmap1.GetPixel(x, y), bitmap2.GetPixel(x, y)))
        {
          return false;
        }
      }
    }
    return true;
  }

  /// <summary>
  ///   Sort two colors. First sorts by red, then green, then blue.
  /// </summary>
  /// <param name="color1">Color 1</param>
  /// <param name="color2">Color 2</param>
  /// <returns>1 if color2 is greater, -1 if color1 is greater, 0 if equal</returns>
  public static int SortColors(Color color1, Color color2)
  {
    if (color1.R < color2.R)
    {
      return 1;
    }
    else if (color1.R > color2.R)
    {
      return -1;
    }
    else
    {
      if (color1.G < color2.G)
      {
        return 1;
      }
      else if (color1.G > color2.G)
      {
        return -1;
      }
      else
      {
        if (color1.B < color2.B)
        {
          return 1;
        }
        else if (color1.B > color2.B)
        {
          return -1;
        }
      }
    }
    return 0;
  }

  /// <summary>
  ///   Convert bitmap to byte array.
  /// </summary>
  /// <param name="bitmap">Bitmap</param>
  /// <returns>Byte array of bitmap</returns>
  public static byte[] BitmapToByteArray(Bitmap bitmap)
  {
    List<byte> bytes = new List<byte>();

    for (int y = 0; y < bitmap.Height; y++)
    {
      for (int x = 0; x < bitmap.Width; x++)
      {
        Color color = bitmap.GetPixel(x, y);
        bytes.Add(color.R);
        bytes.Add(color.G);
        bytes.Add(color.B);
        bytes.Add(color.A);
      }
    }

    return bytes.ToArray();
  }

  /// <summary>
  ///   Hash of bitmap.
  /// </summary>
  /// <param name="bitmap">Bitmap</param>
  /// <returns>Hash of bitmap</returns>
  public static string GetBitmapHash(Bitmap bitmap)
  {
    byte[] data = BitmapToByteArray(bitmap);

    byte[] result = new MD5CryptoServiceProvider().ComputeHash(data);
    //byte[] result = new SHA512Managed().ComputeHash(data);
    //byte[] result = new SHA256Managed().ComputeHash(data);

    StringBuilder hexadecimalHashResult = new StringBuilder();
    // Loop through each byte of the computed hashed data and format each one as a hexadecimal string
    for (int i = 0; i < result.Length; i++)
    {
      hexadecimalHashResult.Append(result[i].ToString("x2"));
    }
    return hexadecimalHashResult.ToString();
  }

  /// <summary>
  ///   Converts jagged list to JSON.
  /// </summary>
  /// <param name="jaggedList">Jagged list</param>
  /// <returns>Jagged list to JSON</returns>
  public static string JaggedListToJson(List<List<string>> jaggedList)
  {
    StringBuilder jsonOutput = new StringBuilder();

    jsonOutput.AppendLine("[");

    for (int i = 0; i < jaggedList.Count; i++)
    {
      jsonOutput.Append("  [");

      jsonOutput.Append("\"" + string.Join("\", \"", jaggedList[i]) + "\"");

      if (i == jaggedList.Count - 1)
      {
        jsonOutput.AppendLine("]");
      }
      else
      {
        jsonOutput.AppendLine("],");
      }
    }

    jsonOutput.AppendLine("]");

    return jsonOutput.ToString();
  }

  /// <summary>
  ///   Prints list to console.
  /// </summary>
  /// <typeparam name="T">Type</typeparam>
  /// <param name="list">List</param>
  public static void PrintList<T>(IEnumerable<T> list)
  {
    StringBuilder output = new StringBuilder();
    foreach (var item in list)
    {
      output.AppendLine(item.ToString());
    }
    Console.WriteLine(output);
  }

  /// <summary>
  ///   Delete directory.
  /// </summary>
  /// <param name="directoryPath">Path of directory to delete</param>
  /// <param name="recursive">True to recursively delete all directories and files, false otherwise</param>
  /// <param name="attempts">Number of attempts to retry deleting if failed</param>
  /// <param name="attemptMillisecondsTimeout">Delay between attempts in milliseconds</param>
  /// <returns>True if successfully deleted directories, false otherwise</returns>
  public static bool DeleteDirectory(string directoryPath, bool recursive, int attempts = 10, int attemptMillisecondsTimeout = 1000)
  {
    bool successfullyDeletedDirectory = false;
    for (int i = 0; i < attempts; i++)
    {
      try
      {
        if (Directory.Exists(directoryPath))
        {
          Directory.Delete(directoryPath, recursive);
        }
        successfullyDeletedDirectory = true;
        break;
      }
      catch (Exception exception)
      {
        System.Threading.Thread.Sleep(attemptMillisecondsTimeout);
        Console.WriteLine("Error attempting to delete directory: " + directoryPath + ", retry attempt: " + (i + 1));
      }
    }
    return successfullyDeletedDirectory;
  }



















  /*
  public static string[] ReadCsvFileSkipHeaderEndOfFile(string filename)
  {
    // TODO: New line in CSV file will break reading, will put as empty array element
    // TODO: Possibly use File.ReadAllText instead of Resources.Load
    TextAsset textAsset = Resources.Load(filename) as TextAsset;
    string[] lines = textAsset.text.Split('\n');
    List<string> output = new List<string>();
    for (int i = 1; i < lines.Length; i++)
    {
      if (!String.IsNullOrEmpty(lines[i].TrimEnd()))
      {
        output.Add(lines[i].TrimEnd());
      }
    }
    return output.ToArray();
  }

  // https://support.unity3d.com/hc/en-us/articles/206486626-How-can-I-get-pixels-from-unreadable-textures-
  public static Texture2D DuplicateTexture(Texture2D source)
  {
    RenderTexture renderTexure = RenderTexture.GetTemporary(
      source.width,
      source.height,
      0,
      RenderTextureFormat.Default,
      RenderTextureReadWrite.Linear
    );
    Graphics.Blit(source, renderTexure);
    RenderTexture previous = RenderTexture.active;
    RenderTexture.active = renderTexure;
    Texture2D readableText = new Texture2D(source.width, source.height);
    readableText.ReadPixels(new Rect(0, 0, renderTexure.width, renderTexure.height), 0, 0);
    readableText.Apply();
    RenderTexture.active = previous;
    RenderTexture.ReleaseTemporary(renderTexure);
    return readableText;
  }

  public static Texture2D GetSubTexture(Texture2D source, int x, int y, int width, int height)
  {
    RenderTexture renderTex = RenderTexture.GetTemporary(
      source.width,
      source.height,
      0,
      RenderTextureFormat.Default,
      RenderTextureReadWrite.Linear
    );
    Graphics.Blit(source, renderTex);
    RenderTexture previous = RenderTexture.active;
    RenderTexture.active = renderTex;
    Texture2D readableText = new Texture2D(width, height);
    readableText.ReadPixels(new Rect(x, y, width, height), 0, 0);
    readableText.Apply();
    RenderTexture.active = previous;
    RenderTexture.ReleaseTemporary(renderTex);
    return readableText;
  }
  
  public static void SaveTextureAsPNG(Texture2D texture, string filePath)
  {
    byte[] bytes = texture.EncodeToPNG();
    System.IO.File.WriteAllBytes(filePath, bytes);
    //Debug.Log(bytes.Length/1024  + "Kb was saved as: " + filePath);
  }

  public static Texture2D ReadImage(FileInfo fileInfo)
  {
    byte[] fileData = File.ReadAllBytes(fileInfo.FullName);

    Texture2D mapImageTexture = new Texture2D(100, 100);
    mapImageTexture.LoadImage(fileData);

    return mapImageTexture;
  }

  public static void ConfigureTextureImporterFile(string relativeTextureFilePath)
  {
    TextureImporter importer = (TextureImporter)TextureImporter.GetAtPath(relativeTextureFilePath);
    importer.mipmapEnabled = true;
    importer.maxTextureSize = 2048;
    //importer.npotScale = TextureImporterNPOTScale.ToNearest;
    importer.npotScale = TextureImporterNPOTScale.None;
    importer.SaveAndReimport();
  }

  public static void ConfigureTextureImporterDirectory(string relativeTextureDirectoryPath)
  {
    // TODO: Change "png" to more generic
    foreach (FileInfo fileInfo in Util.GetFileList(relativeTextureDirectoryPath, "png"))
    {
      string subRelativeTextureFilePath = fileInfo.FullName.Split(new[] { relativeTextureDirectoryPath.Replace('/', '\\') }, StringSplitOptions.None)[1];
      string relativeTextureFilePath = relativeTextureDirectoryPath + subRelativeTextureFilePath.Replace('\\', '/');
      Util.ConfigureTextureImporterFile(relativeTextureFilePath);
      //Debug.Log("FileInfo relativeTextureFilePath: " + relativeTextureFilePath);
    }
  }
  */
}
