using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Models
{
    public class ChangeLogModel
    {
        public int PkId { get; set; }
        public int PageId { get; set; }
        public string PageName { get; set; }
        public string Activity { get; set; }
        public DateTime Occured { get; set; }
        public bool StaticRebuild { get; set; }
    }
    public class PageHitModel
    {
        public string VisitorId { get; set; }
        public string IpAddress { get; set; }
        public string AppName { get; set; }
        public string PageName { get; set; }
        public string VisitDate { get; set; }
        public bool Verbose { get; set; }
    }

    public class LogVisitModel
    {
        public string VisitorId { get; set; }
        public string WelcomeMessage { get; set; }
        public string Success { get; set; }
    }

    public class VisitorModel
    {
        public string AppName { get; set; }
        public string PageName { get; set; }
        public string IpAddress { get; set; }
        public string CookieName { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string GeoCode { get; set; }
    }

}