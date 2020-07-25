﻿using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class TrackbackSuccessModel
    {
        public TrackbackSuccessModel()
        {
            TrackBackItems = new List<TrackbackLink>();
        }
        public List<TrackbackLink> TrackBackItems { get; set; }
        public string SaveMode { get; set; }
        public string Success { get; set; }
    }

    public class FolderDetailModel
    {
        public FolderDetailModel()
        {
            TrackBackItems = new List<TrackbackLink>();
            InternalLinks = new Dictionary<int, string>();
        }
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string Link { get; set; }
        public string HomeCountry { get; set; }
        public string HomeTown { get; set; }
        public string Measurements { get; set; }
        public Dictionary<int, string> InternalLinks { get; set; }
        public List<TrackbackLink> TrackBackItems { get; set; }
        public string FolderComments { get; set; }
        public string FolderImage { get; set; }
        public DateTime? Birthday { get; set; }
        public bool? FakeBoobs { get; set; }
        public string FolderType { get; set; }
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

    //public class TrackBackModel
    //{
    //    public TrackBackModel()
    //    {
    //        TrackBackItems = new List<TrackBackItem>();
    //    }
    //    public List<TrackBackItem> TrackBackItems { get; set; }
    //    public string Success { get; set; }
    //}
    //public class TrackBackItem
    //{
    //    public int PageId { get; set; }
    //    public string Site { get; set; }
    //    public string TrackBackLink { get; set; }
    //    public string LinkStatus { get; set; }
    //}

    public class StepchildModel
    {
        public int SourceFileId { get; set; }
        public int DestinationId { get; set; }
        public string LinkId { get; set; }
        public string FolderName { get; set; }
        public string SortOrder { get; set; }
    }
}