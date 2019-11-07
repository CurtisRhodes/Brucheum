using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Models
{

    public class PageHitModel
    {   
        public int Today { get; set; }
        public int Yesterday { get; set; }
        public int Two_Days_ago { get; set; }
        public int Three_Days_ago { get; set; }
        public int Four_Days_ago { get; set; }
        public int Five_Days_ago { get; set; }
        public int Six_Days_ago { get; set; }
        public string Success { get; set; }
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
        public string EvenCode { get; set; }
        public int PageId { get; set; }
    }

    public class LogEventActivitySuccessModel
    {
        public string PageName { get; set; }
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