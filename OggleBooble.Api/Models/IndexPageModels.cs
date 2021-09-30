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

    public class RandomGalleriesModel {
        public RandomGalleriesModel() {
            RandomGalleries = new List<RandomGalleyModel>();
        }
        public List<RandomGalleyModel> RandomGalleries { get; set; }
        public string Success { get; set; }
    }
    public class RandomGalleyModel {
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string FolderPath { get; set; }
        public string FileName { get; set; }
        public string RandomGuid { get; set; }
    }

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