using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebApi.DataContext;

namespace WebApi.Models
{
    public class ImageLinksModel
    {
        public ImageLinksModel()
        {
            Files = new List<VwLink>();
            SubDirs = new List<CategoryTreeModel>();
        }
        public int FoldrerId { get; set; }
        public string Origin { get; set; }
        public List<VwLink> Files { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
        public string Success { get; set; }
    }

    public class GetModelNameModel
    {
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public int FolderId { get; set; }
        public string Success { get; set; }
    }

    public class CategoryImageModel
    {
        public CategoryImageModel()
        {
            Files = new List<VwLink>();
            SubDirs = new List<CategoryTreeModel>();
        }
        public string LinkId { get; set; }
        public long Length { get; set; }
        public string RootFolder { get; set; }
        public List<VwLink> Files { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
        public string Success { get; set; }
    }

    public class CategoryFolderModel
    {
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public int FileCount { get; set; }
        public string Link { get; set; }
        public string CategoryText { get; set; }
        public string Success { get; set; }
    }

    public class CategoryFolderDetailModel
    {
        public int FolderId { get; set; }
        public string Src { get; set; }
        public string FolderName { get; set; }
        public string Nationality { get; set; }
        public string Measurements { get; set; }
        public string ExternalLinks { get; set; }
        public string CommentText { get; set; }
        public string Born { get; set; }
        public string ImageLinkId { get; set; }
        public string FolderImageLink { get; set; }
        public string Success { get; set; }
    }

    public class MetaTagResultsModel
    {
        public MetaTagResultsModel()
        {
            MetaTags = new List<MetaTagModel>();
        }
        public List<MetaTagModel> MetaTags { get; set; }
        public string Source { get; set; }
        public string Success { get; set; }
    }

    public class MetaTagModel
    {
        public int TagId { get; set; }
        public string TagType { get; set; }
        public string Tag { get; set; }
    }
}