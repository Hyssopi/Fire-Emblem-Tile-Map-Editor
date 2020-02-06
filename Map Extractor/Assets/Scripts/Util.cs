using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

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

  public static void WriteTextFile(string filePath, string line, bool append = false)
  {
    StreamWriter writer = new StreamWriter(filePath, append);
    writer.Write(line);
    writer.Close();
  }

  // Recursively get list of files from main project relative path, ie. "Assets/Resources/Images"
  // TODO: but also for absolute paths
  public static List<FileInfo> GetFileList(string relativePath, string fileExtensionFilter = "*")
  {
    DirectoryInfo directoryInfo = new DirectoryInfo(relativePath);
    List<FileInfo> fileInfoList = new List<FileInfo>();
    fileInfoList.AddRange(directoryInfo.GetFiles("*." + fileExtensionFilter));
    foreach (DirectoryInfo subDirectoryInfo in directoryInfo.GetDirectories())
    {
      fileInfoList.AddRange(Util.GetFileList(relativePath + "/" + subDirectoryInfo.Name, fileExtensionFilter));
    }
    return fileInfoList;
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


  public static Texture2D Get15BitTexture(Texture2D texture)
  {
    Texture2D texture15Bit = DuplicateTexture(texture);

    Color32[] colors = texture15Bit.GetPixels32();

    for (int i = 0; i < colors.Length; i++)
    {
      colors[i].r &= 0xF8;
      colors[i].g &= 0xF8;
      colors[i].b &= 0xF8;
    }

    texture15Bit.SetPixels32(colors);
    texture15Bit.Apply();

    return texture15Bit;
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

  public static bool IsEqualColor(Color color1, Color color2)
  {
    return color1.r == color2.r && color1.g == color2.g && color1.b == color2.b && color1.a == color2.a;
  }

  public static bool IsEqualTexture(Texture2D texture1, Texture2D texture2)
  {
    if (texture1.height != texture2.height || texture1.width != texture2.width)
    {
      return false;
    }
    Color[] textureColors1 = texture1.GetPixels();
    Color[] textureColors2 = texture2.GetPixels();
    for (int i = 0; i < textureColors1.Length; i++)
    {
      if (!Util.IsEqualColor(textureColors1[i], textureColors2[i]))
      {
        return false;
      }
    }
    return true;
  }

  public static string GetTextureHash(Texture2D texture)
  {
    byte[] data = texture.GetRawTextureData();
    byte[] result = new MD5CryptoServiceProvider().ComputeHash(data);
    //byte[] result = new SHA512Managed().ComputeHash(data);
    //byte[] result = new SHA256Managed().ComputeHash(data);
    StringBuilder hexadecimalHashResult = new StringBuilder();

    // Loop through each byte of the hashed data and format each one as a hexadecimal string
    for (int i = 0; i < result.Length; i++)
    {
      hexadecimalHashResult.Append(result[i].ToString("x2"));
    }

    return hexadecimalHashResult.ToString();
  }

  /// <summary>
  ///   Sort two colors. First sorts by red, then green, then blue.
  /// </summary>
  /// <param name="color1">Color 1</param>
  /// <param name="color2">Color 2</param>
  /// <returns>1 if color2 is greater, -1 if color1 is greater, 0 if equal</returns>
  public static int SortColors(Color color1, Color color2)
  {
    if (color1.r < color2.r)
    {
      return 1;
    }
    else if (color1.r > color2.r)
    {
      return -1;
    }
    else
    {
      if (color1.g < color2.g)
      {
        return 1;
      }
      else if (color1.g > color2.g)
      {
        return -1;
      }
      else
      {
        if (color1.b < color2.b)
        {
          return 1;
        }
        else if (color1.b > color2.b)
        {
          return -1;
        }
      }
    }
    return 0;
  }

  /// <summary>
  ///   Prints list to Unity console.
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
    Debug.Log(output);
  }
}
