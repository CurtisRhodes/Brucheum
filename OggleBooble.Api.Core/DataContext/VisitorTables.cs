using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OggleBooble.Api.Core
{
    [Table("OggleBooble.RegisteredUser")]
    public class RegisteredUser
    {
        [Key]
        public string VisitorId { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public DateTime Created { get; set; }
        public string Status { get; set; }
        public string UserRole { get; set; }
        public string UserSettings { get; set; }
        public int UserCredits { get; set; }
        public string Pswrd { get; set; }
        public bool IsLoggedIn { get; set; }
    }

    [Table("OggleBooble.Visitor")]
    public partial class Visitor
    {
        [Key]
        public string VisitorId { get; set; }
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string GeoCode { get; set; }
        public int InitialPage { get; set; }
        public DateTime InitialVisit { get; set; }
    }
}
