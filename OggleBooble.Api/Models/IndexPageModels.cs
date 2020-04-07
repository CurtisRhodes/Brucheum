using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class LatestUpdatesModel
    {
        public LatestUpdatesModel()
        {
            LatestUpdates = new List<LatestUpdate>();
        }
        public List<LatestUpdate> LatestUpdates { get; set; }
        public string Success { get; set; }
    }

    public class LatestUpdate
    {
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public DateTime LastModified { get; set; }
        public string FolderImage { get; set; }
    }

    public class CarouselInfoModel
    {
        public CarouselInfoModel()
        {
            Links = new List<CarouselItemModel>();
        }
        public List<CarouselItemModel> Links { get; set; }
        public int FolderCount { get; set; }
        public string Success { get; set; }
    }

    public class CarouselItemModel
    {
        public int FolderId { get; set; }
        public int ParentId { get; set; }
        public string FolderName { get; set; }
        public string ModelName { get; set; }
        public string FolderPath { get; set; }
        public string RootFolder { get; set; }
        public string Link { get; set; }
        public string LinkId { get; set; }
    }
}