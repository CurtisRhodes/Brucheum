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
        public virtual DbSet<MetricsMatrix> VwMetricsMatrices { get; set; }
        public virtual DbSet<vwImageHit> vwImageHits { get; set; }
        public virtual DbSet<StepChild> StepChildren { get; set; }
        public virtual DbSet<VwDirTree> VwDirTrees { get; set; }
        public virtual DbSet<VwLink> VwLinks { get; set; }
        public virtual DbSet<CategoryFolderDetail> CategoryFolderDetails { get; set; }
        public virtual DbSet<RankerVote> RankerVotes { get; set; }
        public virtual DbSet<EventLog> EventLogs { get; set; }
        public virtual DbSet<Ref> Refs { get; set; }
        public virtual DbSet<vwMostActiveUsersForToday> MostActiveUsersForToday { get; set; }
        public virtual DbSet<RegisteredUser> RegisteredUsers { get; set; }
        public virtual DbSet<UserRole> UserRoles { get; set; }
        public virtual DbSet<DailyActivityReport> DailyActivity { get; set; }
        public virtual DbSet<vwPageHit> vwPageHits { get; set; }
        public virtual DbSet<FeedBack> FeedBacks { get; set; }
    }

    [Table("OggleBooble.FeedBack")]
    public class FeedBack
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        public string FeedBackComment { get; set; }
        public string FeedBackType { get; set; }
        public int PageId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime Occured { get; set; }
    }

    [Table("OggleBooble.vwPageHits")]
    public class vwPageHit
    {
        [Key]
        [Column(Order = 0)]
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        [Key]
        [Column(Order = 1)]
        public int PageId { get; set; }
        public string FolderName { get; set; }
        [Key]
        [Column(Order = 2)]
        public string HitDate { get; set; }
        [Key]
        [Column(Order = 3)]
        public string HitTime { get; set; }
        public int PageHits { get; set; }
        public int ImageHits { get; set; }
    }

    [Table("OggleBooble.vwDailyActivity")]
    public class DailyActivityReport
    {
        [Key]
        [Column(Order = 0)]
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        [Key]
        [Column(Order = 1)]
        public string Event { get; set; }
        public string CalledFrom { get; set; }
        public string Detail { get; set; }
        [Key]
        [Column(Order = 2)]
        public string HitDate { get; set; }
        [Key]
        [Column(Order = 3)]
        public string HitTime { get; set; }
    }

    [Table("OggleBooble.RegisteredUser")]
    public class RegisteredUser
    {
        [Key]
        public string VisitorId { get; set; }
        //public string IpAddress { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public DateTime Created { get; set; }
        public string Status { get; set; }
        public string PornPreference { get; set; }
        public string Pswrd { get; set; }
    }
    [Table("OggleBooble.UserRole")]
    public class UserRole
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public string RoleId { get; set; }
    }

    [Table("OggleBooble.Ref")]
    public class Ref
    {
        [Key]
        [Column(Order = 0)]
        public string RefType { get; set; }
        [Key]
        [Column(Order = 1)]
        public string RefCode { get; set; }
        public string RefDescription { get; set; }
    }

    [Table("OggleBooble.EventLog")]
    public class EventLog
    {
        public string EventCode { get; set; }
        public string EventDetail { get; set; }
        public int PageId { get; set; }
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime Occured { get; set; }
    }

    [Table("OggleBooble.CategoryFolder")]
    public partial class CategoryFolder
    {
        [Key]
        [Column(Order = 0)]
        public int Id { get; set; }
        [Key]
        [Column(Order = 1)]
        public int Parent { get; set; }
        [Key]
        [Column(Order = 2)]
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

    [Table("OggleBooble.RankerVote")]
    public partial class RankerVote
    {
        [Key]
        public string PkId { get; set; }
        public string Winner { get; set; }
        public string Looser { get; set; }
        public string UserId { get; set; }
        public DateTime VoteDate { get; set; }
    }

    [Table("OggleBooble.vwMetricsMatrix")]
    public partial class MetricsMatrix
    {
        [Key]
        public string Column { get; set; }
        public int Today { get; set; }
        public int Yesterday { get; set; }
        public int Two_Days_ago { get; set; }
        public int Three_Days_ago { get; set; }
        public int Four_Days_ago { get; set; }
        public int Five_Days_ago { get; set; }
        public int Six_Days_ago { get; set; }
    }

    [Table("OggleBooble.vwImageHits")]
    public partial class vwImageHit
    {
        [Key]
        [Column(Order = 0)]
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string FolderName { get; set; }
        public int PageId { get; set; }
        [Key]
        [Column(Order = 1)]
        public string HitTime { get; set; }
        public string Link { get; set; }
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
        public DateTime Occured { get; set; }
        public int PageId { get; set; }
    }

    [Table("OggleBooble.StepChild")]
    public partial class StepChild
    {
        [Key]
        [Column(Order = 0)]
        public int Parent { get; set; }
        [Key]
        [Column(Order = 1)]
        public int Child { get; set; }
        public string Link { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public int SortOrder { get; set; }
    }

    [Table("OggleBooble.vwDirtree")]
    public partial class VwDirTree
    {
        [Key]
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string LinkId { get; set; }
        public string Link { get; set; }
        public int FileCount { get; set; }
        public int SubDirCount { get; set; }
        public int ChildFiles { get; set; }
        public int Links { get; set; }
        public int IsStepChild { get; set; }
        public int SortOrder { get; set; }
    }

    [Table("OggleBooble.vwLinks")]
    public partial class VwLink
    {
        public int FolderId { get; set; }
        [Key]
        public string LinkId { get; set; }
        public string FolderName { get; set; }
        public string ParentName { get; set; }
        public string Link { get; set; }
        public string RootFolder { get; set; }
        public string Orientation { get; set; }
        public int LinkCount { get; set; }
        public int SortOrder { get; set; }
    }
    [Table("OggleBooble.CategoryFolderDetail")]
    public partial class CategoryFolderDetail
    {
        [Key]
        public int FolderId { get; set; }
        public string Nationality { get; set; }
        public string Measurements { get; set; }
        public string Born { get; set; }
        public string ExternalLinks { get; set; }
        public string CommentText { get; set; }
        public string Boobs { get; set; }
        public string FolderImage { get; set; }
        public string LinkStatus { get; set; }
        public int SortOrder { get; set; }
    }

    [Table("OggleBooble.vwMostActiveUsersForToday")]
    public partial class vwMostActiveUsersForToday
    {
        [Key]
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public int ImageHitsToday { get; set; }
        public int TotalImageHits { get; set; }
        public int PageHitsToday { get; set; }
        public int TotalPageHits { get; set; }
        public string LastHit { get; set; }
        public string InitialVisit { get; set; }
        public string UserName { get; set; }
    }
}


