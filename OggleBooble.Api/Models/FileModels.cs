using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class MoveCopyImageModel
    {
        public int SourceFolderId { get; set; }
        public int DestinationFolderId { get; set; }
        public string Link { get; set; }
        public string Mode { get; set; }
        public int SortOrder { get; set; }
    }
}