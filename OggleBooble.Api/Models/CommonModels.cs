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
}