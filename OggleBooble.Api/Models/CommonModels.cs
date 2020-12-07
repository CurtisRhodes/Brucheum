using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class EmailMessageModel
    {
        public string To { get; set; }
        public string From { get; set; }
        public string Subject { get; set; }
        public string Message { get; set; }
    }

    public class VerifyConnectionSuccessModel
    {
        public bool ConnectionVerified { get; set; }
        public string Success { get; set; }
    }
    public class FolderInfoModel
    {
        public string FolderType { get; set; }
        public string FolderComments { get; set; }
        public string FolderName { get; set; }
        public int Parent { get; set; }
        public string Success { get; set; }
    }
    public class SuccessModel
    {
        public string ReturnValue { get; set; }
        public string Success { get; set; }
    }
    public class RefSuccessModel
    {
        public RefSuccessModel() {
            RefItems = new List<RefItemModel>();
        }
        public List<RefItemModel> RefItems { get; set; }
        public string Success { get; set; }
    }
    public class RefItemModel
    {
        public string RefType { get; set; }
        public string RefCode { get; set; }
        public string RefDescription { get; set; }

    }
    public class PageHitRequestModel
    {
        public string VisitorId { get; set; }
        public int FolderId { get; set; }
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
        public int FolderId { get; set; }
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
        public string ErrorCode { get; set; }
        public int FolderId { get; set; }
        public string ErrorMessage { get; set; }
        public string CalledFrom { get; set; }
    }
    public class DataActivityModel
    {
        public int FolderId { get; set; }
        public string ActivityCode { get; set; }
        public string Activity { get; set; }
        public string VisitorId { get; set; }
    }

    public class ActivityLogModel
    {
        public string ActivtyCode { get; set; }
        public int FolderId { get; set; }
        public string VisitorId { get; set; }
    }

    public class EventLogModel
    {
        public string VisitorId { get; set; }
        public string EventCode { get; set; }
        public string EventDetail { get; set; }
        public int FolderId { get; set; }
    }

    public class IpHitModel
    {
        public string VisitorId { get; set; }
        public string IpAddress { get; set; }
        public int FolderId { get; set; }
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
        public int FolderId { get; set; }
        public string VisitorId { get; set; }
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string GeoCode { get; set; }
    }
    public class AddVisitorSuccessModel
    {
        public string VisitorId { get; set; }
        public string Success { get; set; }
    }
    public class FeedBackModel
    {
        public string VisitorId { get; set; }
        public int FolderId { get; set; }
        public string FeedBackComment { get; set; }
        public string FeedBackType { get; set; }
        public string FeedBackEmail { get; set; }
        public DateTime Occured { get; set; }
    }
}