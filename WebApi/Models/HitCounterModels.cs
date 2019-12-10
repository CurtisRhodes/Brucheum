using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Models
{
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
        public string LastHit { get; set; }
        public int ImageHits { get; set; }
    }

    public class ActivityReportModel
    {
        public ActivityReportModel()
        {
            Items = new List<ActivityReportItem>();
        }
        public List<ActivityReportItem> Items { get; set; }
        public int HitCount { get; set; }
        public string Success { get; set; }
    }
    public class ActivityReportItem
    {
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string EventDetail { get; set; }
        public string RefDescription { get; set; }
        public string CalledFrom { get; set; }
        public string hitDate { get; set; }
        public string hitTime { get; set; }
    }

    public class ImageHitActivityReportModel
    {
        public ImageHitActivityReportModel()
        {
            Items = new List<ImageHitActivityReportItem>();
        }
        public List<ImageHitActivityReportItem> Items { get; set; }
        public int HitCount { get; set; }
        public string Success { get; set; }
    }
    public class ImageHitActivityReportItem
    {
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string ImageLinkId { get; set; }
        public string hitDate { get; set; }
        public string hitTime { get; set; }
    }

    public class MostPopularPagesReportModel
    {
        public MostPopularPagesReportModel()
        {
            Items = new List<MostPopularPagesReportItem>();
        }
        public List<MostPopularPagesReportItem> Items { get; set; }
        public string Success{ get; set; }
    }
    public class MostPopularPagesReportItem {
        public string PageName { get; set; }
        public int PageHits { get; set; }
    }

    public class DailyHitReport
    {
        public DailyHitReport() {
            PageHits = new DailyHitModel();
            ImageHits = new DailyHitModel();
        }
        public DailyHitModel PageHits { get; set; }
        public DailyHitModel ImageHits { get; set; }
        public string Success { get; set; }
    }

    public class DailyHitModel
    {   
        public int Today { get; set; }
        public int Yesterday { get; set; }
        public int Two_Days_ago { get; set; }
        public int Three_Days_ago { get; set; }
        public int Four_Days_ago { get; set; }
        public int Five_Days_ago { get; set; }
        public int Six_Days_ago { get; set; }
    }

    public class ChangeLogModel
    {
        public int PkId { get; set; }
        public int PageId { get; set; }
        public string PageName { get; set; }
        public string Activity { get; set; }
        public DateTime Occured { get; set; }
        public bool StaticRebuild { get; set; }
    }

    public class HitCountModel
    {
        public int PageHits { get; set; }
        public int UserHits { get; set; }
        public string WelcomeMessage { get; set; }
        public string Success { get; set; }
    }

    public class PageHitRequestModel
    {
        public string VisitorId { get; set; }
        public int PageId { get; set; }
        //public string IpAddress { get; set; }
        //public string VisitDate { get; set; }
        //public int Verbose { get; set; }
        //public string AppName { get; set; }
        //public string UserName { get; set; }
    }
    public class PageHitSuccessModel
    {
        public int PageHits { get; set; }
        public int UserHits { get; set; }
        public string PageName { get; set; }
        public string ParentName { get; set; }
        public string RootFolder { get; set; }
        public string Success { get; set; }
    }

    public class LogEventModel {
        public string VisitorId { get; set; }
        public string EventCode { get; set; }
        public string EventDetail { get; set; }
        public int PageId { get; set; }
    }

    public class LogEventActivitySuccessModel
    {
        public string CalledFrom { get; set; }
        public string PageBeingCalled { get; set; }
        public string EventName { get; set; }
        public string IpAddress { get; set; }
        public string VisitorDetails { get; set; }
        public string Success { get; set; }
    }

    public class GetVisitorInfoFromIPAddressSuccessModel
    {
        public string VisitorId { get; set; }
        public string UserName { get; set; }
        public string Success { get; set; }
    }

    public class logImageHItDataModel
    {
        public string VisitorId { get; set; }
        public int PageId { get; set; }
        public string LinkId { get; set; }
        public bool IsInitialHit { get; set; }
    };

    public class ImageHitSuccessModel
    {
        public string PageName { get; set; }
        public string IpAddress { get; set; }
        public int ImageHits { get; set; }
        public int UserHits { get; set; }
        public DateTime HitDateTime { get; set; }
        public string Success { get; set; }
    }

    public class IPVisitLookup
    {
        public string VisitorId { get; set; }
        public string IpAddress { get; set; }
        public DateTime VisitDate { get; set; }
        public string Success { get; set; }
    }

    public class LogVisitorSuccessModel
    {
        public string VisitorId { get; set; }
        public string PageName { get; set; }
        public bool IsNewVisitor { get; set; }
        public string Success { get; set; }
    }    

    public class LogVisitorModel
    {
        public int PageId { get; set; }
        public string IpAddress { get; set; }
        public string UserName { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string GeoCode { get; set; }
    }

    public class LogVisitSuccessModel
    {
        public string WelcomeMessage { get; set; }
        public bool VisitAdded { get; set; }
        public string Success { get; set; }
    }


}