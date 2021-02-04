using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class SubFolderCountModel
    {
        public int ParentId { get; set; }
        public int FolderId { get; set; }
        public int FileCount { get; set; }
        public int FolderCount { get; set; }
        public int TtlFileCount { get; set; }
        public int TtlFolderCount { get; set; }
        public string Success { get; set; }
    }

    public class GalleryImagesAndFoldersModel
    {
        public GalleryImagesAndFoldersModel()
        {
            ImageLinks = new List<VwLink>();
            Folders = new List<GalleryFolderModel>();
        }
        public List<VwLink> ImageLinks { get; set; }
        public List<GalleryFolderModel> Folders { get; set; }
        public string Success { get; set; }
    }

    public class GalleryFolderModel
    {
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public int ParentId { get; set; }
        public string DirectoryName { get; set; }
        public string FolderType { get; set; }
        public string FolderImage { get; set; }
        public int FileCount { get; set; }
        public int TotalChildFiles { get; set; }
        public int SubDirCount { get; set; }
        public int IsStepChild { get; set; }
        public string RootFolder { get; set; }
    }

    public class AlbumInfoModel
    {
        public AlbumInfoModel()
        {
            TrackBackItems = new List<TrackbackLink>();
            BreadCrumbs = new List<BreadCrumbItemModel>();
        }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public List<TrackbackLink> TrackBackItems { get; set; }
        public List<BreadCrumbItemModel> BreadCrumbs { get; set; }
        public string FolderComments { get; set; }
        public int FileCount { get; set; }
        public int FolderCount { get; set; }
        public int TotalSubFolders { get; set; }
        public int TotalChildFiles { get; set; }
        public int PageHits { get; set; }
        //public int UserImageHits { get; set; }
        //public int UserPageHits { get; set; }
        public string LastModified { get; set; }
        public string FolderType { get; set; }
        public string StaticFile { get; set; }
        public string StaticFileUpdate { get; set; }
        public string Success { get; set; }
    }

    public class xxVwLinkModel
    {
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public string FileName { get; set; }
        public string Orientation { get; set; }
        public bool Islink { get; set; }
        public int SortOrder { get; set; }
    }

    public class BreadCrumbSuccessModel 
    {
        public BreadCrumbSuccessModel() 
        {
            BreadCrumbs = new List<BreadCrumbItemModel>();        
        }
        public List<BreadCrumbItemModel> BreadCrumbs { get; set; }
        public string Success { get; set; }
    }

    public class BreadCrumbItemModel
    {
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public int ParentId { get; set; }
        public bool IsInitialFolder { get; set; }
    }

    public class SlideshowItemsModel
    {
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public IList<VwSlideshowItem> SlideshowItems { get; set; }
        public string Success { get; set; }
    }

    public class ImageInfoModel
    {
        public ImageInfoModel()            {
            InternalLinks = new Dictionary<int, string>();
        }
        public Dictionary<int,string> InternalLinks { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string FolderPath { get; set; }
        public string Link { get; set; }
        public int ModelFolderId { get; set; }
        public string ModelFolderName { get; set; }
        public string ExternalLink { get; set; }
        public string FileName { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
        public long? Size { get; set; }
        public string LastModified { get; set; }
        public string FolderType { get; set; }
        public string Success { get; set; }
    }

    public class ImageCommentModel 
    {
        public string CommentId { get; set; }
        public string CommentTitle { get; set; }
        public string CommentText { get; set; }
        public string ImageLinkId { get; set; }
        public string CalledFrom { get; set; }
        public string VisitorId { get; set; }
        public DateTime Posted { get; set; }
        public string ImageName { get; set; }
        public string Success { get; set; }
    }
}


