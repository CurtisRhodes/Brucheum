using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Models
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

    public class MetricsMatrixReport
    {
        public MetricsMatrixReport()
        {
            MatrixRows = new List<MatrixRowModel>();
        }
        public List<MatrixRowModel> MatrixRows { get; set; }
        public string Success { get; set; }
    }

    public class MatrixRowModel
    {
        public string Column { get; set; }
        public int Today { get; set; }
        public int Yesterday { get; set; }
        public int Two_Days_ago { get; set; }
        public int Three_Days_ago { get; set; }
        public int Four_Days_ago { get; set; }
        public int Five_Days_ago { get; set; }
        public int Six_Days_ago { get; set; }
    }

    public class ErrorLogReportModel
    {
        public ErrorLogReportModel()
        {
            ErrorRows = new List<ErrorLogItem>();
        }
        public List<ErrorLogItem> ErrorRows { get; set; }
        public string Success { get; set; }
    }
    public class ErrorLogItem
    {
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string CalledFrom { get; set; }
        public string ActivityCode { get; set; }
        public int Severity { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime Occured { get; set; }
        public string InDay { get; set; }
        public string OnTime { get; set; }
    }

    public class FeedbackReportModel
    {
        public FeedbackReportModel()
        {
            FeedbackRows = new List<FeedbackModel>();
        }
        public List<FeedbackModel> FeedbackRows{ get; set; }
        public string Success { get; set; }
    }
    
    public class FeedbackModel
    {
        public string IpAddress { get; set; }
        public string Parent { get; set; }
        public string Folder { get; set; }
        public string FeedBackType { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FeedBackComment { get; set; }
        public DateTime Occured { get; set; }
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
        public int PageHits { get; set; }
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