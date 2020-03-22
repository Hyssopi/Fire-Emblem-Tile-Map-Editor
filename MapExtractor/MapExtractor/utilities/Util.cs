using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Security.Cryptography;
using System.Text;

public class Util
{
  public static string[] ReadTextFile(string filePath)
  {
    string[] lines = File.ReadAllText(filePath).Split('\n');
    for (int i = 0; i < lines.Length; i++)
    {
      lines[i] = lines[i].TrimEnd();
    }
    return lines;
  }

  public static void WriteTextFile(string filePath, string line, bool append = false)
  {
    StreamWriter writer = new StreamWriter(filePath, append);
    writer.Write(line);
    writer.Close();
  }

  // Recursively get list of files
  public static List<FileInfo> GetFileList(string path, string fileExtensionFilter = "*")
  {
    DirectoryInfo directoryInfo = new DirectoryInfo(path);
    List<FileInfo> fileInfoList = new List<FileInfo>();
    fileInfoList.AddRange(directoryInfo.GetFiles("*." + fileExtensionFilter));
    foreach (DirectoryInfo subDirectoryInfo in directoryInfo.GetDirectories())
    {
      fileInfoList.AddRange(Util.GetFileList(path + Path.DirectorySeparatorChar + subDirectoryInfo.Name, fileExtensionFilter));
    }
    return fileInfoList;
  }

  public static Bitmap ReadBitmap(string filePath)
  {
    return new Bitmap(filePath);
  }

  public static Bitmap ReadBitmap(FileInfo fileInfo)
  {
    return ReadBitmap(fileInfo.FullName);
  }

  public static Bitmap GetSubBitmap(Bitmap originalBitmap, int x, int y, int width, int height)
  {
    Rectangle cloneRectangle = new Rectangle(x, y, width, height);
    PixelFormat pixelFormat = originalBitmap.PixelFormat;
    return new Bitmap(originalBitmap.Clone(cloneRectangle, pixelFormat));
  }

  public static Bitmap Get15BitTexture(Bitmap originalBitmap)
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

  public static Bitmap Get24BitTexture(Bitmap originalBitmap)
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

      Get24BitTexture(image).Save(outputFullPath);
    }
  }

  public static void Convert24BitTo15BitPngImages(string inputDirectoryPath, string outputDirectoryPath)
  {
    List<FileInfo> imageFileList = GetFileList(inputDirectoryPath, "png");
    foreach (FileInfo imageFile in imageFileList)
    {
      Bitmap bitmap = ReadBitmap(imageFile);

      string subPath = imageFile.FullName.Replace(inputDirectoryPath, string.Empty).Replace("\\", "/").TrimStart('/');

      string outputFullPath = Path.Combine(outputDirectoryPath, subPath);
      Directory.CreateDirectory(Path.GetDirectoryName(outputFullPath));

      Get15BitTexture(bitmap).Save(outputFullPath);
    }
  }

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

  public static bool IsEqualColor(Color color1, Color color2)
  {
    return color1.R == color2.R && color1.G == color2.G && color1.B == color2.B && color1.A == color2.A;
  }

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
      //catch (Exception exception) when (exception is FileLoadException || exception is IOException)
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
