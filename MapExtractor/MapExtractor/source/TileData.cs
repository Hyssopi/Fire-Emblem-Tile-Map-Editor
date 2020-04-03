using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;

namespace MapExtractor.source
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
    public Bitmap TileImage { get; private set; }
    public HashSet<string> OriginFilePaths { get; private set; }

    /// <summary>
    ///   Constructor.
    /// </summary>
    /// <param name="tileHash">Hash of a tile</param>
    /// <param name="tileImage">Bitmap of a tile</param>
    public TileData(string tileHash, Bitmap tileImage)
    {
      TileHash = tileHash;
      Group = null;
      NorthNeighbors = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      EastNeighbors = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      SouthNeighbors = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      WestNeighbors = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      TileImage = tileImage;
      OriginFilePaths = new HashSet<string>();
    }

    /// <summary>
    ///   Outputs JSON data of the tile.
    /// </summary>
    /// <returns>JSON output of the tile</returns>
    public string ToJson()
    {
      StringBuilder jsonOutput = new StringBuilder();
      jsonOutput.AppendLine("  {");

      jsonOutput.AppendLine("    \"tileHash\": \"" + TileHash + "\",");
      jsonOutput.AppendLine("    \"group\": \"" + Group + "\",");

      jsonOutput.AppendLine("    \"north\": [" + string.Join(",", (NorthNeighbors.Select(s => "\"" + s + "\"")).ToArray()) + "],");
      jsonOutput.AppendLine("    \"east\": [" + string.Join(",", (EastNeighbors.Select(s => "\"" + s + "\"")).ToArray()) + "],");
      jsonOutput.AppendLine("    \"south\": [" + string.Join(",", (SouthNeighbors.Select(s => "\"" + s + "\"")).ToArray()) + "],");
      jsonOutput.AppendLine("    \"west\": [" + string.Join(",", (WestNeighbors.Select(s => "\"" + s + "\"")).ToArray()) + "],");

      jsonOutput.AppendLine("    \"originFilePaths\": [" + string.Join(",", (OriginFilePaths.Select(s => "\"" + s + "\"")).ToArray()) + "]");

      jsonOutput.Append("  }");
      return jsonOutput.ToString();
    }
  }
}
