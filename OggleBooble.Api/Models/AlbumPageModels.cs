using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class GetAlbumInfoSuccessModel
    {
        public GetAlbumInfoSuccessModel()
        {
            Files = new List<VwLinkModel>();
            SubDirs = new List<CategoryTreeModel>();
            TrackBackItems = new List<TrackBackItem>();
            BreadCrumbs = new List<BreadCrumbItemModel>();
        }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public List<TrackBackItem> TrackBackItems { get; set; }
        public List<VwLinkModel> Files { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
        public List<BreadCrumbItemModel> BreadCrumbs { get; set; }
        public string ExternalLinks { get; set; }
        public int PageHits { get; set; }
        public int UserImageHits { get; set; }
        public int UserPageHits { get; set; }
        public string LastModified { get; set; }
        public string Success { get; set; }
    }

    public class TrackBackItem
    {
        public int PageId { get; set; }
        public string Site { get; set; }
        public string TrackBackLink { get; set; }
        public string LinkStatus { get; set; }
    }

    public class VwLinkModel
    {
        public int FolderId { get; set; }
        public string LinkId { get; set; }
        public string FolderName { get; set; }
        public string ParentName { get; set; }
        public string Link { get; set; }
        public string RootFolder { get; set; }
        public string Orientation { get; set; }
        public int LinkCount { get; set; }
        public int SortOrder { get; set; }
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
        public string Link { get; set; }
        public string LinkId { get; set; }
        public int FileCount { get; set; }
        public int SubDirCount { get; set; }
        public int ChildFiles { get; set; }
        public int Links { get; set; }
        public int IsStepChild { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
    }

    public class BreadCrumbItemModel
    {
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public int ParentId { get; set; }
        public bool IsInitialFolder { get; set; }
    }
}