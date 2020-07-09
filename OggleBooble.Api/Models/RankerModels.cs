using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class RankerVoteModel
    {
        public string PkId { get; set; }
        public string Winner { get; set; }
        public string Looser { get; set; }
        public string VisitorId { get; set; }
        public DateTime VoteDate { get; set; }
    }

    public class ImageRankerModelContainer
    {
        public ImageRankerModelContainer()
        {
            RankerLinks = new List<ImageRankerModel>();
        }
        public List<ImageRankerModel> RankerLinks { get; set; }
        public string Success { get; set; }
    }

    public class ImageRankerModel
    {
        public int FolderId { get; set; }
        public string LinkId { get; set; }
        public string Link { get; set; }
        public string FolderName { get; set; }
        public string Orientation { get; set; }
    }
}