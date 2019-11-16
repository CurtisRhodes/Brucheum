using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebApi.OggleBoobleSqlContext;

namespace WebApi.Models
{
    public class LinksModel
    {
        public LinksModel()
        {
            Links = new List<LinkModel>();
        }
        public List<LinkModel> Links { get; set; }
        public string Success { get; set; }
    }

    public class SortOrderItem {
        public int PageId { get; set; }
        public string ItemId { get; set; }
        public int InputValue { get; set; }
    }

    public class LinkModel
    {
        public int FolderId { get; set; }
        public string PathName { get; set; }
    }

    public class GetModelNameModel
    {
        public string Link { get; set; }
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

    public class BlogCommentModelContainer
    {
        public BlogCommentModelContainer()
        {
            blogComments = new List<BlogCommentModel>();
        }
        public List<BlogCommentModel> blogComments { get; set; }
        public string LinkC { get; set; }
        public string Success { get; set; }
    }

    public class BlogCommentModel
    {
        public int Id { get; set; }
        public string CommentTitle { get; set; }
        public string CommentType { get; set; }
        public string Link { get; set; }
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public string UserId { get; set; }
        public string CommentText { get; set; }
        public string Posted { get; set; }
        public string Success { get; set; }
    }

    public class VideoLinkModel
    {
        public string Link { get; set; }
        public string Image { get; set; }
        public string Title { get; set; }
    }
        
    public class RankerVoteModel
    {
        public string PkId { get; set; }
        public string Winner { get; set; }
        public string Looser { get; set; }
        public string UserName { get; set; }
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

    public class FolderDetailModel
    {
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string Nationality { get; set; }
        public string Measurements { get; set; }
        public string ExternalLinks { get; set; }
        public string CommentText { get; set; }
        public string Born { get; set; }
        public string Boobs { get; set; }
        public string ImageLinkId { get; set; }
        public string FolderImageLink { get; set; }
        public string FolderImage { get; set; }
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
        public string MetaDescription { get; set; }
        public string Success { get; set; }
    }

    public class MetaTagModel
    {
        public int TagId { get; set; }
        public int FolderId { get; set; }
        public string LinkId { get; set; }
        public string Tag { get; set; }
    }

    public class FilePropertiesResultsModel
    {
        public FilePropertiesResultsModel()
        {
            FileProperties = new List<FilePropertiesModel>();
        }
        public List<FilePropertiesModel> FileProperties { get; set; }
        public string Success { get; set; }
    }

    public class FilePropertiesModel
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }

    public class StaticPageModel
    {
        public string Html { get; set; }
        public string Filename { get; set; }
        public string FolderId { get; set; }
        public string ImageArray { get; set; }
    }

    public class SearchResultsModel
    {
        public SearchResultsModel() {
            SearchResults = new List<SearchResultModel>();
        }
        public List<SearchResultModel> SearchResults{ get; set; }
        public string Success { get; set; }
    }

    public class SearchResultModel
    {
        public string FolderName { get; set; }
        public int FolderId { get; set; }
    }
}