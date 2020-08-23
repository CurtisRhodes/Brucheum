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
        public string LinkId { get; set; }
        public string Link { get; set; }
        public string Mode { get; set; }
        public int SortOrder { get; set; }
        public string SourceFolderName { get; set; }
        public string DestinationFolderName { get; set; }        
    }

    public class AddLinkModel
    {
        public int FolderId { get; set; }
        public string Link { get; set; }
        public string Path { get; set; }
    }

    public class StaticPageResultsModel
    {
        public StaticPageResultsModel()
        {
            Errors = new List<string>();
        }
        public int FolderId { get; set; }
        public int PagesCreated { get; set; }
        public int FoldersProcessed { get; set; }
        public List<string> Errors { get; set; }
        public string Success { get; set; }
    }

}