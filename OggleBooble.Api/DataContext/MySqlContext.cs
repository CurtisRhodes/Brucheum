using System;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
//using Oracle.ManagedDataAccess.EntityFramework;
// using MySql.Data.Entity;
using MySql.Data.EntityFramework;

namespace OggleBooble.Api.MySqlDataContext
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public partial class OggleBoobleMySqlContext : DbContext
    {
        public OggleBoobleMySqlContext() : base("name=GoDaddyMySql") { }

        public virtual DbSet<CategoryFolder> CategoryFolders { get; set; }
        //public virtual DbSet<ImageLink> ImageLinks { get; set; }       
        public virtual DbSet<ImageFile> ImageFiles { get; set; }
        public virtual DbSet<CategoryImageLink> CategoryImageLinks { get; set; }
        public virtual DbSet<DirTree> DirTrees { get; set; }
        public virtual DbSet<ImageHit> ImageHits { get; set; }
        public virtual DbSet<PageHit> PageHits { get; set; }
        public virtual DbSet<Visitor> Visitors { get; set; }
        public virtual DbSet<Visit> Visits { get; set; }
        public virtual DbSet<MetricsMatrix> VwMetricsMatrices { get; set; }
        public virtual DbSet<StepChild> StepChildren { get; set; }
        public virtual DbSet<CategoryFolderDetail> CategoryFolderDetails { get; set; }
        public virtual DbSet<RankerVote> RankerVotes { get; set; }
        public virtual DbSet<EventLog> EventLogs { get; set; }
        public virtual DbSet<Ref> Refs { get; set; }
        public virtual DbSet<RegisteredUser> RegisteredUsers { get; set; }
        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<UserRole> UserRoles { get; set; }
        public virtual DbSet<DailyActivityReport> DailyActivity { get; set; }
        public virtual DbSet<FeedBack> FeedBacks { get; set; }
        public virtual DbSet<PageHitTotals> PageHitTotal { get; set; }
        public virtual DbSet<ErrorLog> ErrorLogs { get; set; }
        public virtual DbSet<IpInfoCall> IpInfoCalls { get; set; }
        public virtual DbSet<TrackbackLink> TrackbackLinks { get; set; }

        public virtual DbSet<VwDirTree> VwDirTrees { get; set; }
        public virtual DbSet<VwLink> VwLinks { get; set; }
        public virtual DbSet<VwPageHit> VwPageHits { get; set; }

        public virtual DbSet<VwMostActiveUsersForToday> MostActiveUsersForToday { get; set; }
        public virtual DbSet<VwSlideshowItem> VwSlideshowItems { get; set; }
        public virtual DbSet<VwCarouselItem> VwCarouselImages { get; set; }
        public virtual DbSet<VwLatestTouchedGalleries> VwLatestTouched { get; set; }
        public virtual DbSet<VwImageHit> VwImageHits { get; set; }
        public virtual DbSet<VwErrorReport> VwErrorReportRows { get; set; }

    }


    [Table("OggleBooble.CategoryFolder")]
    public partial class CategoryFolder
    {
        [Key]
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string FolderPath { get; set; }
        public string FolderImage { get; set; }
        public int SortOrder { get; set; }
    }
    [Table("OggleBooble.ImageFile")]
    public class ImageFile
    {
        [Key]
        public string Id { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public int FolderId { get; set; }
        public string ExternalLink { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public long Size { get; set; }
        public DateTime Acquired { get; set; }
    }

    [Table("OggleBooble.DirTree")]
    public partial class DirTree
    {
        [Key]
        [Column(Order = 0)]
        public int Id { get; set; }
        [Key]
        [Column(Order = 1)]
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string FolderImage { get; set; }
        public int FileCount { get; set; }
        public int SubDirCount { get; set; }
        public int ChildFiles { get; set; }
        public int LinkCount { get; set; }
        public int IsStepChild { get; set; }
        public int SortOrder { get; set; }
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

    [Table("OggleBooble.FeedBack")]
    public class FeedBack
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        public string FeedBackComment { get; set; }
        public string FeedBackType { get; set; }
        public string FeedBackEmail { get; set; }
        public int PageId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime Occured { get; set; }
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
        public string UserSettings { get; set; }
        public string Pswrd { get; set; }
    }

    [Table("OggleBooble.TrackbackLink")]
    public class TrackbackLink
    {
        [Key]
        [Column(Order = 0)]
        public int PageId { get; set; }
        [Key]
        [Column(Order = 1)]
        public string SiteCode { get; set; }
        public string Href { get; set; }
        public string LinkStatus { get; set; }
    }

    [Table("OggleBooble.IpInfoCalls")]
    public class IpInfoCall
    {
        [Key]
        public int PkId { get; set; }
        public string IpAddress { get; set; }
        public DateTime Occured { get; set; }
    }

    [Table("OggleBooble.ErrorLog")]
    public class ErrorLog
    {
        [Key]
        public string PkId { get; set; }
        public string VisitorId { get; set; }
        public string ActivityCode { get; set; }
        public string CalledFrom { get; set; }
        public int Severity { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime Occured { get; set; }
    }

    [Table("OggleBooble.PageHitTotals")]
    public class PageHitTotals
    {
        [Key]
        public int PageId { get; set; }
        public int Hits { get; set; }
    }

    [Table("webStats.Role")]
    public partial class Role
    {
        [Key]
        public string RoleName { get; set; }
    }

    [Table("OggleBooble.UserRole")]
    public class UserRole
    {
        [Key]
        [Column(Order = 0)]
        public string UserName { get; set; }
        [Key]
        [Column(Order = 1)]
        public string RoleName { get; set; }
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
        [Key]
        [Column(Order = 2)]
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

    [Table("OggleBooble.CategoryFolderDetail")]
    public partial class CategoryFolderDetail
    {
        [Key]
        public int FolderId { get; set; }
        public string Nationality { get; set; }
        public string Measurements { get; set; }
        public DateTime? Born { get; set; }
        public string ExternalLinks { get; set; }
        public string CommentText { get; set; }
        public string Boobs { get; set; }
        public string LinkStatus { get; set; }
    }

    // VIEWS
    [Table("OggleBooble.vwSlideshowItems")]
    public class VwSlideshowItem
    {
        [Key]
        public long Index { get; set; }
        public string LinkId { get; set; }
        public string Link { get; set; }
        public int FolderId { get; set; }
        public int ImageFolderId { get; set; }
        public int ImageParentId { get; set; }
        public string ImageFolderName { get; set; }
        public int SortOrder { get; set; }
    }

    [Table("OggleBooble.vwPageHits")]
    public class VwPageHit
    {
        [Key]
        [Column(Order = 0)]
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public int PageId { get; set; }
        public string FolderName { get; set; }
        [Key]
        [Column(Order = 1)]
        public string HitDate { get; set; }
        [Key]
        [Column(Order = 2)]
        public string HitTime { get; set; }
        public int PageHits { get; set; }
        public int ImageHits { get; set; }
    }

    [Table("OggleBooble.VwDirTree")]
    public partial class VwDirTree
    {
        [Key]
        [Column(Order = 0)]
        public int Id { get; set; }
        [Key]
        [Column(Order = 1)]
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public int FileCount { get; set; }
        public int SubDirCount { get; set; }
        public int ChildFiles { get; set; }
        public int Links { get; set; }
        public string FolderImage { get; set; }
        public int IsStepChild { get; set; }
        public int SortOrder { get; set; }
    }

    [Table("OggleBooble.VwLinks")]
    public partial class VwLink
    {
        [Key]
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public string FileName { get; set; }
        public string Orientation { get; set; }
        public bool Islink { get; set; }
        public int SortOrder { get; set; }
    }

    // REPORT VIEWS
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

    [Table("OggleBooble.vwMostActiveUsersForToday")]
    public partial class VwMostActiveUsersForToday
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

    [Table("OggleBooble.vwErrorReport")]
    public class VwErrorReport
    {
        [Key]
        public string PkId { get; set; }
        public string VisitorId { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string CalledFrom { get; set; }
        public string ActivityCode { get; set; }
        public int Severity { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime Occured { get; set; }
        public string On { get; set; }
        public string At { get; set; }
    }

    [Table("OggleBooble.vwImageHits")]
    public partial class VwImageHit
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

    [Table("OggleBooble.vwDailyActivity")]
    public class DailyActivityReport
    {
        [Key]
        public string PkId { get; set; }
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string Event { get; set; }
        public string CalledFrom { get; set; }
        public string Detail { get; set; }
        public string HitDate { get; set; }
        public string HitTime { get; set; }
    }
    [Table("OggleBooble.vwLatestTouchedGalleries")]
    public class VwLatestTouchedGalleries
    {
        [Key]
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string FolderPath { get; set; }
        public string FileName { get; set; }
        public DateTime LastModified { get; set; }
    }

    // select * from OggleBooble.ImageFile;

    [Table("OggleBooble.VwCarouselImages")]
    public class VwCarouselItem
    {
        [Key]
        public int FolderId { get; set; }
        public string RootFolder { get; set; }
        public string FolderName { get; set; }
        public string FolderParentName { get; set; }
        public int FolderParentId { get; set; }
        public string FolderGPName { get; set; }
        public int FolderGPId { get; set; }
        public int ImageFolderId { get; set; }
        public string ImageFolderName { get; set; }
        public string ImageFolderParentName { get; set; }
        public int ImageFolderParentId { get; set; }
        public string ImageFolderGPName { get; set; }
        public int ImageFolderGPId { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string FileName { get; set; }
        public string LinkId { get; set; }
        public string Id { get; set; }
    }
}


