using OggleBooble.Api.MySqlDataContext;
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
            LatestTouchedGalleries = new List<LatestTouchedGalleries>();
        }
        public List<LatestTouchedGalleries> LatestTouchedGalleries { get; set; }
        public string Success { get; set; }
    }

    //public class LatestUpdateItemModel
    //{
    //    public int FolderId { get; set; }
    //    public string FolderName { get; set; }
    //    public DateTime LastModified { get; set; }
    //    public string FolderImage { get; set; }
    //}

    public class CarouselInfoModel
    {
        public CarouselInfoModel()
        {
            Links = new List<VwCarouselItem>();
        }
        public List<VwCarouselItem> Links { get; set; }
        public string Success { get; set; }
    }

    //public class CarouselItemModel
    //{
    //    public string RootFolder { get; set; }
    //    public int ModelFolderId { get; set; }
    //    public string ModelPath { get; set; }
    //    public string ModelName { get; set; }
    //    public string LinkId { get; set; }
    //    public int Width { get; set; }
    //    public int Height { get; set; }
    //    public string Link { get; set; }
    //}
}