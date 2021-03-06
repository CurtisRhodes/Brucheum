﻿using OggleBooble.Api.MySqlDataContext;
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

    public class DailyVisitorsReportModel
    {
        public DailyVisitorsReportModel()
        {
            Visitors = new List<VwVisitor>();
        }
        public List<VwVisitor> Visitors { get; set; }
        public string Success { get; set; }
    }

    public class DailyReferralsReportModel
    {
        public DailyReferralsReportModel()
        {
            VwStaticPageReferrals = new List<VwStaticPageReferral>();
        }
        public List<VwStaticPageReferral> VwStaticPageReferrals { get; set; }
        public string Success { get; set; }
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
            mRows = new List<MatrixModel>();
        }
        public List<MatrixModel> mRows { get; set; }
        public string Success { get; set; }
    }
    public class MatrixModel
    {
        public DateTime ReportDay { get; set; }
        public string DayofWeek { get; set; }
        public string DateString { get; set; }
        public int? NewVisitors { get; set; }
        public int? Visits { get; set; }
        public int? PageHits { get; set; }
        public int? ImageHits { get; set; }
    }

    public class ImpactReportModel
    {
        public ImpactReportModel() { ImpactRows = new List<VwImpact>(); }
        public List<VwImpact> ImpactRows { get; set; }
        public string Success { get; set; }
    }

    public class UserErrorReportSuccess
    {
        public UserErrorReportSuccess() 
        {
            ErrorRows = new List<VwErrorReport>();
        }
        public List<VwErrorReport> ErrorRows { get; set; }
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

    public class DupeCheckModel
    {
        public int GroupsProcessed { get; set; }
        public int SameSizeDupeRemoved { get; set; }
        public int ServerFilesMoved { get; set; }
        public int ServerFilesDeleted { get; set; }
        public int LocalFilesMoved { get; set; }
        public int LocalFilesDeleted { get; set; }
        public int ImageFilesMoved { get; set; }
        public int ImageFilesRemoved { get; set; }
        public int LinksRemoved { get; set; }
        public int LinksAdded { get; set; }
        public int LinksPreserved { get; set; }
        public int Errors { get; set; }
        public int LocalIssue { get; set; }
        public int Copy0remove1 { get; set; }
        public int Move0remove1 { get; set; }
        public int Move1remove0 { get; set; }
        public int Copy1remove0 { get; set; }
        public int BigGroup { get; set; }
        public int Unhandled { get; set; }
        public int SingleMemberGroup { get; set; }
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
        public string VisitorId { get; set; }
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

    public class EventSummaryModel
    {
        public EventSummaryModel()
        {
            Items = new List<VwEventSummary>();
        }
        public List<VwEventSummary> Items { get; set; }
        public int Total { get; set; }
        public string Success { get; set; }
    }

    public class EventDetailsModel
    {
        public EventDetailsModel()
        {
            Items = new List<VwEventDetail>();
        }
        public List<VwEventDetail> Items { get; set; }
        public string Success { get; set; }
    }

    public class ActivityReportModel
    {
        public ActivityReportModel()
        {
            Items = new List<VwActivityLog>();
        }
        public List<VwActivityLog> Items { get; set; }
        public int HitCount { get; set; }
        public string Success { get; set; }
    }
}