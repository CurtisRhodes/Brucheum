using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using MySql.Data.EntityFramework;

namespace WebApi.MySqDataContext
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public partial class OggleBoobleMySqContext : DbContext
    {
        public OggleBoobleMySqContext()
            : base("GoDaddyMySql") { }

        public virtual DbSet<CategoryFolder> CategoryFolders { get; set; }
        public virtual DbSet<ImageLink> ImageLinks { get; set; }
        public virtual DbSet<CategoryImageLink> CategoryImageLinks { get; set; }
        public virtual DbSet<ImageHit> ImageHits { get; set; }
        public virtual DbSet<PageHit> PageHits { get; set; }
        public virtual DbSet<Visitor> Visitors { get; set; }
        public virtual DbSet<Visit> Visits { get; set; }
        public virtual DbSet<VwPageHit> VwPageHits { get; set; }
        public virtual DbSet<VwImageHit> VwImageHits { get; set; }
    }


    [Table("OggleBooble.CategoryFolder")]
    public partial class CategoryFolder
    {
        [Key]
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
    }
    [Table("OggleBooble.ImageLink")]
    public partial class ImageLink
    {
        [Key]
        public string Id { get; set; }
        public string ExternalLink { get; set; }
        public string Link { get; set; }
        public int FolderLocation { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
        public long? Size { get; set; }
    }

    [Table("OggleBooble.CategoryImageLink")]
    public partial class CategoryImageLink
    {
        [Key]
        [Column(Order = 0)]
        public int ImageCategoryId { get; set; }
        [Key]
        [Column(Order = 1)]
        public string ImageLinkId { get; set; }
        public int SortOrder { get; set; }
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

    [Table("OggleBooble.Visit")]
    public partial class Visit
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime VisitDate { get; set; }
    }

    [Table("OggleBooble.ImageHit")]
    public partial class ImageHit
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
    public partial class PageHit
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