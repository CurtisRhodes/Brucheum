using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

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

    public class TrackBackModel
    {
        public TrackBackModel() 
        {
            TrackBackItems = new List<TrackBackItem>();
        }
        public int PageId { get; set; }
        public List<TrackBackItem> TrackBackItems { get; set; }
        public string Success { get; set; }
    }
    public class TrackBackItem
    {
        public int PageId { get; set; }
        public string Site { get; set; }
        public string TrackBackLink { get; set; }
        public string LinkStatus { get; set; }
    }

    public class SlideshowItemsModel
    {
        public SlideshowItemsModel()
        {
            SlideshowItems = new List<OggleBoobleSqlContext.vwSlideshowItem>();
        }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public List<OggleBoobleSqlContext.vwSlideshowItem> SlideshowItems { get; set; }
        public string Success { get; set; }
    }


    public class ImageLinksModel
    {
        public ImageLinksModel()
        {
            Files = new List<VwLinkModel>();
            SubDirs = new List<CategoryTreeModel>();
            TrackBackItems = new List<TrackBackItem>();
        }
        public int FoldrerId { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public List<TrackBackItem> TrackBackItems { get; set; }
        public List<VwLinkModel> Files { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
        public string ExternalLinks { get; set; }
        public string Success { get; set; }
    }

    public class CategoryImageModel
    {
        public CategoryImageModel()
        {
            Files = new List<VwLinkModel>();
            SubDirs = new List<CategoryTreeModel>();
        }
        public string LinkId { get; set; }
        public long Length { get; set; }
        public string RootFolder { get; set; }
        public List<VwLinkModel> Files { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
        public string Success { get; set; }
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
        public string Id { get; set; }
        public string Link { get; set; }
        public string ImageId { get; set; }
        public string Title { get; set; }
        public int FolderId { get; set; }
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
        public string Boobepedia { get; set; }
        public string FolderImage { get; set; }
        public string LinkStatus { get; set; }
        public bool IsLandscape { get; set; }
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
            SearchResults = new List<SearchResult>();
        }
        public List<SearchResult> SearchResults{ get; set; }
        public string Success { get; set; }
    }

    public class SearchResult
    {
        public string FolderName { get; set; }
        public string Parent { get; set; }
        public int FolderId { get; set; }
    }

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

}