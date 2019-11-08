using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using MySql.Data.EntityFramework;

namespace WebApi.DataContext
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public partial class OggleBoobleMySqContext : DbContext
    {
        public OggleBoobleMySqContext()
            : base("GoDaddyMySql") { }

        public virtual DbSet<MySqlImageHit> MySqlImageHits { get; set; }
        public virtual DbSet<MySqlPageHit> MySqlPageHits { get; set; }
        public virtual DbSet<MySqlVisitor> MySqlVisitors { get; set; }
        public virtual DbSet<MySqlVisit> MySqlVisits { get; set; }
        public virtual DbSet<VwPageHit> VwPageHits { get; set; }
        public virtual DbSet<VwImageHit> VwImageHits { get; set; }
    }

    [Table("OggleBooble.vwPageHits")]
    public partial class VwPageHit
    {
        [Key]
        public int Today { get; set; }
        public int Yesterday { get; set; }
        public int Two_Days_ago { get; set; }
        public int Three_Days_ago { get; set; }
        public int Four_Days_ago { get; set; }
        public int Five_Days_ago { get; set; }
        public int Six_Days_ago { get; set; }
    }
    [Table("OggleBooble.vwImageHits")]
    public partial class VwImageHit
    {
        [Key]
        public int Today { get; set; }
        public int Yesterday { get; set; }
        public int Two_Days_ago { get; set; }
        public int Three_Days_ago { get; set; }
        public int Four_Days_ago { get; set; }
        public int Five_Days_ago { get; set; }
        public int Six_Days_ago { get; set; }
    }

    [Table("OggleBooble.Visitor")]
    public partial class MySqlVisitor
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

    [Table("OggleBooble.Visit")]
    public partial class MySqlVisit
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime VisitDate { get; set; }
    }

    [Table("OggleBooble.ImageHit")]
    public partial class MySqlImageHit
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime HitDateTime { get; set; }
        public string ImageLinkId { get; set; }
        public int PageId { get; set; }
    }

    [Table("OggleBooble.PageHit")]
    public partial class MySqlPageHit
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime HitTimeStamp { get; set; }
        public int PageId { get; set; }
    }
}