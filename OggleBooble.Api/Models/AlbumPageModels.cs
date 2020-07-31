using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class SubFolderCountModel
    {
        public SubFolderCountModel()
        {
            SubFolders = new List<SubFolderCountModel>();
        }
        public int FolderId { get; set; }
        //public string RootFolder { get; set; }
        //public string FolderType { get; set; }
        public int FileCount { get; set; }
        public int TtlFileCount { get; set; }
        public int TtlFolderCount { get; set; }

        public List<SubFolderCountModel> SubFolders { get; set; }
        public string Success { get; set; }
    }

    public class GalleryImagesAndFoldersModel
    {
        public GalleryImagesAndFoldersModel()
        {
            ImageLinks = new List<VwLink>();
            Folders = new List<GalleryFolderModel>();
        }
        public int FolderId { get; set; }
        public string RootFolder { get; set; }
        public string FolderType { get; set; }
        public List<VwLink> ImageLinks { get; set; }
        public List<GalleryFolderModel> Folders { get; set; }
        public string Success { get; set; }
    }

    //LinkId = Guid.NewGuid().ToString(),
    //FolderId = row.Id,
    //DirectoryName = row.FolderName,
    //ParentId = row.Parent,
    //FileCount = row.FileCount,
    //IsStepChild = row.IsStepChild,
    //FolderImage = row.FolderImage

    public class GalleryFolderModel
    {
        //public GalleryFolderModel()
        //{
        //    SubDirs = new List<CategoryTreeModel>();
        //}
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public int ParentId { get; set; }
        public string DirectoryName { get; set; }
        public string FolderImage { get; set; }
        public int FileCount { get; set; }
        public int IsStepChild { get; set; }
        public string RootFolder { get; set; }
        //public int SubDirCount { get; set; }
        //public int ChildFiles { get; set; }

        //public int Links { get; set; }
        //public string DanniPath { get; set; }
        //public List<CategoryTreeModel> SubDirs { get; set; }
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
        public int SubFolderCount { get; set; }
        public int PageHits { get; set; }
        public int UserImageHits { get; set; }
        public int UserPageHits { get; set; }
        public string LastModified { get; set; }
        public string FolderType { get; set; }
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
        public string VisitorId { get; set; }
        public DateTime Posted { get; set; }
        public string ImageName { get; set; }
        public string Success { get; set; }
    }
}


