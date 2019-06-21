using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Models
{
    public class ResponseModel
    {
        public string EmailSuccess { get; set; }
        public string LastBuild { get; set; }
        public string Success { get; set; }
        public string Response { get; set; }
    }
    public class EmailMessageModel
    {
        public string Subject { get; set; }
        public string Body { get; set; }
    }
    public class HitCounterModel
    {
        public string IpAddress { get; set; }
        public string AppName { get; set; }
        public string PageName { get; set; }
        public string Details { get; set; }
    }
}