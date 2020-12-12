using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class LatestImageHitsReportModel
    {
        public LatestImageHitsReportModel()
        {
            Items = new List<LatestImageHitsItem>();
        }
        public List<LatestImageHitsItem> Items { get; set; }
        public int HitCount { get; set; }
        public string Success { get; set; }
    }

    public class LatestImageHitsItem
    {
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string FolderName { get; set; }
        public string Link { get; set; }
        public int PageId { get; set; }
        public string HitTime { get; set; }
    }

    public class MostPopularPagesReportModel
    {
        public MostPopularPagesReportModel()
        {
            Items = new List<MostPopularPagesReportItem>();
        }
        public List<MostPopularPagesReportItem> Items { get; set; }
        public string Success { get; set; }
    }
    public class MostPopularPagesReportItem
    {
        public string PageName { get; set; }
        public int FolderId { get; set; }
        public int PageHits { get; set; }
    }

    public class MatrixResultsModel
    {
        public MatrixResultsModel()
        {
            matrixModelRows = new List<MatrixModel>();
        }
        public List<MatrixModel> matrixModelRows { get; set; }
        public string Success { get; set; }
    }
    public class MatrixModel
    {
        public string DayofWeek { get; set; }
        public string DateString { get; set; }
        public int? NewVisitors { get; set; }
        public int? Visits { get; set; }
        public int? PageHits { get; set; }
        public int? ImageHits { get; set; }
    }

    public class ImpactReportModel
    {
        public ImpactReportModel() { ImpactRows = new List<MySqlDataContext.VwImpact>(); }
        public List<MySqlDataContext.VwImpact> ImpactRows { get; set; }
        public string Success { get; set; }
    }

    public class UserReportSuccessModel
    {
        public UserReportModel UserReport { get; set; }
        public string Success { get; set; }
    }

    public class UserReportModel{
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string InitialVisit { get; set; }
        public int Visits { get; set; }
        public int PageHits { get; set; }
        public int ImageHits { get; set; }
        public string UserName { get; set; }
    }

    public class ErrorLogReportModel
    {
        public ErrorLogReportModel()
        {
            ErrorRows = new List<VwErrorReport>();
        }
        public List<VwErrorReport> ErrorRows { get; set; }
        public string Success { get; set; }
    }

    public class PlayboyReportModel
    {
        public PlayboyReportModel()
        {
            PlayboyReportItems = new List<PlayboyReportItemModel>();
        }
        public List<PlayboyReportItemModel> PlayboyReportItems { get; set; }
        public string Success { get; set; }
    }
    public class PlayboyReportItemModel
    {
        public string FolderDecade { get; set; }
        public string FolderYear { get; set; }
        public int FolderMonth { get; set; }
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string ImageSrc { get; set; }
        public string StaticFile { get; set; }
    }



    public class FeedbackReportModel
    {
        public FeedbackReportModel()
        {
            FeedbackRows = new List<VwFeedbackReport>();
        }
        public List<VwFeedbackReport> FeedbackRows{ get; set; }
        public string Success { get; set; }
        public int Total { get; set; }
    }

    public class PageHitReportModel
    {
        public PageHitReportModel()
        {
            Items = new List<PageHitReportModelItem>();
        }
        public List<PageHitReportModelItem> Items { get; set; }
        public int HitCount { get; set; }
        public string Success { get; set; }
    }
    public class PageHitReportModelItem
    {
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public int PageId { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string FolderType { get; set; }
        public int ImageHits { get; set; }
        public string HitDate { get; set; }
        public string HitTime { get; set; }
    }

    public class MostActiveUsersModel
    {
        public MostActiveUsersModel()
        {
            Items = new List<MostActiveUsersItem>();
        }
        public List<MostActiveUsersItem> Items { get; set; }
        public int HitCount { get; set; }
        public string Success { get; set; }
    }
    public class MostActiveUsersItem
    {
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public int ImageHitsToday { get; set; }
        public int TotalImageHits { get; set; }
        public int PageHitsToday { get; set; }
        public int TotalPageHits { get; set; }
        public string LastHit { get; set; }
        public string InitialVisit { get; set; }
        public string UserName { get; set; }
    }

    public class ActivityReportModel
    {
        public ActivityReportModel()
        {
            Items = new List<ActiviyItem>();
        }
        public List<ActiviyItem> Items { get; set; }
        public int HitCount { get; set; }
        public string Success { get; set; }
    }
    public class ActiviyItem
    {
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string Event { get; set; }
        public string CalledFrom { get; set; }
        public string Detail { get; set; }
        public string HitDate { get; set; }
        public string HitTime { get; set; }
    }
}