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
            SubFolderCountItems = new List<SubFolderCountItem>();
        }
        public List<SubFolderCountItem> SubFolderCountItems { get; set; }       
        public string FolderType { get; set; }
        public string Success { get; set; }
    }
    public class SubFolderCountItem
    {
        public int SubFolderId { get; set; }
        public int ChildFiles { get; set; }
        public int SubFolderCount { get; set; }
        public int TotalChildFiles { get; set; }
        public int FileCount { get; set; }
    }

    public class FolderTypeModel
    {
        public string RootFolder { get; set; }
        public bool HasImages { get; set; }
        public bool HasSubFolders { get; set; }
        public bool ContainsRomanNumeral { get; set; }
        public bool ContainsNonRomanNumeralChildren { get; set; }
    }
    public class AlbumImagesModel
    {
        public AlbumImagesModel()
        {
            ImageLinks = new List<VwLink>();
            SubDirs = new List<CategoryTreeModel>();
        }
        public string RootFolder { get; set; }
        public List<VwLink> ImageLinks { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
        public string Success { get; set; }
    }

    public class AlbumInfoModel
    {
        public AlbumInfoModel()
        {
            TrackBackItems = new List<TrackBackItem>();
            BreadCrumbs = new List<BreadCrumbItemModel>();
        }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public List<TrackBackItem> TrackBackItems { get; set; }
        public List<BreadCrumbItemModel> BreadCrumbs { get; set; }
        public string ExternalLinks { get; set; }
        public int FileCount { get; set; }
        public int PageHits { get; set; }
        public int UserImageHits { get; set; }
        public int UserPageHits { get; set; }
        public string LastModified { get; set; }
        public string FolderType { get; set; }
        public string Success { get; set; }
    }

    public class CategoryTreeModel
    {
        public CategoryTreeModel()
        {
            SubDirs = new List<CategoryTreeModel>();
        }
        public int FolderId { get; set; }
        public int ParentId { get; set; }
        public string DirectoryName { get; set; }
        public string DanniPath { get; set; }
        public string RootFolder { get; set; }
        public string FolderImage { get; set; }
        //public string Link { get; set; }
        public string LinkId { get; set; }
        public int FileCount { get; set; }
        public int SubDirCount { get; set; }
        public int ChildFiles { get; set; }
        public int Links { get; set; }
        public int IsStepChild { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
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
        public bool IsOutsideFolderLink { get; set; }
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


