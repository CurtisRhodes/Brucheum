using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Bruch.Api.Models
{
    public class RefModel
    {
        public RefModel()
        {
            refItems = new List<RefItem>();
        }
        public List<RefItem> refItems { get; set; }
        public string Success { get; set; }
    }
    public class RefItem
    {
        public string RefType { get; set; }
        public string RefCode { get; set; }
        public string RefDescription { get; set; }
        public string Success { get; set; }
    }
}