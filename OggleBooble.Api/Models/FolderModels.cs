using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class FolderDetailModel
    {
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string Link { get; set; }
        public string Nationality { get; set; }
        public string Measurements { get; set; }
        public string ExternalLinks { get; set; }
        public string CommentText { get; set; }
        public string Born { get; set; }
        public string Boobs { get; set; }
        public string Boobepedia { get; set; }
        public string FolderImage { get; set; }
        public string LinkStatus { get; set; }
        public bool HasImages { get; set; }
        public bool ContainsRomanNumerals { get; set; }
        public string Success { get; set; }
    }
    public class SearchResultsModel
    {
        public SearchResultsModel()
        {
            SearchResults = new List<SearchResult>();
        }
        public List<SearchResult> SearchResults { get; set; }
        public string Success { get; set; }
    }

    public class SearchResult
    {
        public string FolderName { get; set; }
        public string Parent { get; set; }
        public int FolderId { get; set; }
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
}