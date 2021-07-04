using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OggleBooble.Api.Core
{
    public class VisitorInfoSuccessModel
    {
        public VisitorInfoSuccessModel()
        {
            RegisteredUser = new RegisteredUser();
        }
        public bool IsRegisteredUser { get; set; }
        public RegisteredUser RegisteredUser { get; set; }
        public string IpAddress { get; set; }
        public string VisitorId { get; set; }
        public string City { get; set; }
        public string Success { get; set; }
    }
    public class CarouselSuccessModel
    {
        public CarouselSuccessModel()
        {
            Links = new List<VwCarouselItem>();
        }
        public List<VwCarouselItem> Links { get; set; }
        public string Success { get; set; }
    }

}
