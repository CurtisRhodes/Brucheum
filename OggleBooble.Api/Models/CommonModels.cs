using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class VerifyConnectionSuccessModel
    {
        public bool ConnectionVerified { get; set; }
        public string Success { get; set; }
    }
    public class SuccessModel
    {
        public string ReturnValue { get; set; }
        public string Success { get; set; }
    }
    public class PageHitRequestModel
    {
        public string VisitorId { get; set; }
        public int PageId { get; set; }
    }
    public class PageHitSuccessModel
    {
        public int PageHits { get; set; }
        public int UserImageHits { get; set; }
        public int UserPageHits { get; set; }
        public string PageName { get; set; }
        public string ParentName { get; set; }
        public string RootFolder { get; set; }
        public string Success { get; set; }
    }
    public class LogImageHitDataModel
    {
        public string VisitorId { get; set; }
        public int PageId { get; set; }
        public string LinkId { get; set; }
        public bool IsInitialHit { get; set; }
    };
    public class ImageHitSuccessModel
    {
        public int ImageHits { get; set; }
        public int UserImageHits { get; set; }
        public int UserPageHits { get; set; }
        public string PageName { get; set; }
        public string IpAddress { get; set; }
        public DateTime HitDateTime { get; set; }
        public string Success { get; set; }
    }
    public class LogErrorModel
    {
        public string VisitorId { get; set; }
        public string ActivityCode { get; set; }
        public int Severity { get; set; }
        public string ErrorMessage { get; set; }
        public string CalledFrom { get; set; }
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
    public class LogActivityModel
    {
        public string VisitorId { get; set; }
        public string EventCode { get; set; }
        public string EventDetail { get; set; }
        public int PageId { get; set; }
        public int CalledFrom { get; set; }
    }
    public class LogVisitSuccessModel
    {
        public string VisitorId { get; set; }
        public bool IsNewVisitor { get; set; }
        public bool VisitAdded { get; set; }
        public string UserName { get; set; }
        public string Success { get; set; }
    }
    public class AddVisitorModel
    {
        public int PageId { get; set; }
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string GeoCode { get; set; }
    }
    public class AddVisitorSuccessModel
    {
        public string VisitorId { get; set; }
        public string EventDetail { get; set; }
        public string Success { get; set; }
        public string PageName { get; set; }
        public string UserName { get; set; }
    }
}