using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class GetModelNameModel
    {
        public string Link { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public int FolderId { get; set; }
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
}