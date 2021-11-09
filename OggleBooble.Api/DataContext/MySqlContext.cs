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
        public virtual DbSet<StaticPageHit> StaticPageHits { get; set; }       
        public virtual DbSet<ImageFile> ImageFiles { get; set; }
        public virtual DbSet<CategoryImageLink> CategoryImageLinks { get; set; }
        public virtual DbSet<IpInfoHit> IpInfoHits { get; set; }
        public virtual DbSet<ImageHit> ImageHits { get; set; }
        public virtual DbSet<PageHit> PageHits { get; set; }
        public virtual DbSet<Visitor> Visitors { get; set; }
        public virtual DbSet<RetiredVisitor> RetiredVisitors { get; set; }
        public virtual DbSet<Visit> Visits { get; set; }
        public virtual DbSet<MetricsMatrix> VwMetricsMatrices { get; set; }
        public virtual DbSet<StepChild> StepChildren { get; set; }
        public virtual DbSet<FolderDetail> FolderDetails { get; set; }
        public virtual DbSet<RankerVote> RankerVotes { get; set; }
        public virtual DbSet<EventLog> EventLogs { get; set; }
        public virtual DbSet<Ref> Refs { get; set; }
        public virtual DbSet<RegisteredUser> RegisteredUsers { get; set; }
        public virtual DbSet<UserRole> UserRoles { get; set; }
        //public virtual DbSet<VwErrorReport> ErrorRepors { get; set; }
        public virtual DbSet<VwErrorSummaryReport> VwErrorReportRows { get; set; }
        public virtual DbSet<VwErrorDetailReport> VwErrorDetailRows { get; set; }

        public virtual DbSet<VwActivityLog> VwActivityLogs { get; set; }
        public virtual DbSet<ActivityLog> ActivityLogs { get; set; }
        //public virtual DbSet<DailyActivityReport> DailyActivity { get; set; }
        public virtual DbSet<FeedBack> FeedBacks { get; set; }
        public virtual DbSet<PageHitTotals> PageHitTotal { get; set; }
        public virtual DbSet<ErrorLog> ErrorLogs { get; set; }
        public virtual DbSet<TrackbackLink> TrackbackLinks { get; set; }
        public virtual DbSet<VwEventSummary> VwEventSummary { get; set; }
        public virtual DbSet<VwEventDetail> VwEventDetails { get; set; }
        public virtual DbSet<VwVisitor> VwVisitors { get; set; }
        public virtual DbSet<VwOverdueZZVisitors> VwOverdueZZVisitors { get; set; }
        public virtual DbSet<VwDirTree> VwDirTrees { get; set; }
        public virtual DbSet<VwLink> VwLinks { get; set; }
        public virtual DbSet<VwPageHit> VwPageHits { get; set; }

        public virtual DbSet<VwMostActiveUsersForToday> MostActiveUsersForToday { get; set; }
        public virtual DbSet<VwSlideshowItem> VwSlideshowItems { get; set; }
        public virtual DbSet<VwCarouselItem> VwCarouselImages { get; set; }
        public virtual DbSet<VwLatestTouchedGalleries> LatestTouchedGalleries { get; set; }
        public virtual DbSet<VwImageHit> VwImageHits { get; set; }

        public virtual DbSet<ImageComment> ImageComments { get; set; }
        public virtual DbSet<UserCredit> UserCredits { get; set; }
        public virtual DbSet<Centerfold> Centerfolds { get; set; }
        public virtual DbSet<Performance> Performances { get; set; }
        public virtual DbSet<FolderComment> FolderComments { get; set; }
        public virtual DbSet<VwImpact> VwImpacts { get; set; }
        public virtual DbSet<VwFeedbackReport> FeedbackReport { get; set; }
        public virtual DbSet<BlogComment> BlogComments { get; set; }
        public virtual DbSet<ChangeLog> ChangeLogs { get; set; }
        public virtual DbSet<VwBlogComment> VwBlogComments { get; set; }
        public virtual DbSet<PlayboyPlusDupe> PlayboyPlusDupes { get; set; }
        public virtual DbSet<VwStaticPageReferral> VwStaticPageReferrals { get; set; }
        public virtual DbSet<DailyPerformance> DailyPerformances { get; set; }
        public virtual DbSet<Ipfy> Ipfys { get; set; }


    }

    [Table("OggleBooble.Ipfy")]
    public partial class Ipfy
    {
        [Key]
        public string VisitorId { get; set; }
        public string IpAddress { get; set; }
        public DateTime Occured { get; set; }
    }

    [Table("OggleBooble.DailyPerformance")]
    public partial class DailyPerformance
    {
        [Key]
        public DateTime ReportDay { get; set; }
        public int NewVisitors { get; set; }
        public int ReturnVisits { get; set; }
        public int PageHits { get; set; }
        public int ImageHits { get; set; }
    }

    [Table("OggleBooble.VwStaticPageReferral")]
    public partial class VwStaticPageReferral
    {
        public string On { get; set; }
        [Key]
        [Column(Order = 2)]
        public string At { get; set; }
        [Key]
        [Column(Order = 1)]
        public int Id { get; set; }
        public string FolderName { get; set; }
        public string CalledFrom { get; set; }
        public string RootFolder { get; set; }        
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        [Key]
        [Column(Order = 0)]
        public string Visitor { get; set; }
    }

    //[Table("OggleBooble.VwStaticPageReferral")]
    //public partial class VwStaticPageReferral
    //{
    //    public string Occured { get; set; }
    //    [Key]
    //    public int FolderId { get; set; }
    //    public string RootFolder { get; set; }
    //    public string FolderName { get; set; }
    //    public int Hits { get; set; }
    //    public string Location { get; set; }
    //    public string IpAddress { get; set; }
    //    public string VisitorId { get; set; }
    //    public string UserName { get; set; }
    //}

    [Table("OggleBooble.PlayboyPlusDupes")]
    public partial class PlayboyPlusDupe
    {
        [Key]
        public int Pk { get; set; }
        public int FolderId { get; set; }
        public int PGroup { get; set; }
        public int FSize { get; set; }
        public string FileId  { get; set; }
        public string FolderName { get; set; }
    }

    [Table("OggleBooble.VwBlogComment")]
    public partial class VwBlogComment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public string PkId { get; set; }
        public string CommentType { get; set; }
        public int FolderId { get; set; }
        public string ImageLink { get; set; }
        public string Pdate { get; set; }
        public string CommentTitle { get; set; }
        public string CommentText { get; set; }
        public string ImgSrc { get; set; }
        public DateTime Posted { get; set; }
    }


    [Table("OggleBooble.ChangeLog")]
    public partial class ChangeLog
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int FolderId { get; set; }
        [Key]
        [Column(Order = 1)]
        public string ActivityCode { get; set; }
        public string VisitorId { get; set; }
        public string Details { get; set; }
        [Key]
        [Column(Order = 2)]
        public DateTime Occured { get; set; }
    }

    [Table("OggleBooble.BlogComment")]
    public partial class BlogComment
    {
        [Key]
        public string Id { get; set; }
        public string CommentTitle { get; set; }
        public string CommentType { get; set; }
        public string ImageLink { get; set; }
        public int FolderId { get; set; }
        public string VisitorId { get; set; }
        public string CommentText { get; set; }
        public DateTime Posted { get; set; }
    }

    [Table("OggleBooble.VwFeedbackReport")]
    public class VwFeedbackReport
    {
        [Key]
        public int FolderId { get; set; }
        public string FeedbackType { get; set; }
        public string FolderName { get; set; }
        public string Location { get; set; }
        public string IpAddress { get; set; }
        public string FeedBackComment { get; set; }
        public DateTime Occured { get; set; }
    }

    [Table("OggleBooble.VwVisitor")]
    public class VwVisitor
    {
        [Key]
        public string IpAddress { get; set; }
        public string Location { get; set; }
        public DateTime InitialVisit { get; set; }
        public int InitialPage { get; set; }
        public string FolderName { get; set; }
    }

    [Table("OggleBooble.VwOverdueZZVisitors")]
    public class VwOverdueZZVisitors
    {
        [Key]
        public string VisitorId { get; set; }
        public DateTime InitialVisit { get; set; }
        public int Hits { get; set; }
    }


    [Table("OggleBooble.VwImpact")]
    public class VwImpact
    {
        [Key]
        public int FolderId { get; set; }
        public string Parent { get; set; }
        public string FolderName { get; set; }
        public string DateUpdated { get; set; }
        public int Hits { get; set; }
        public int ImpactHits { get; set; }
    }

    [Table("OggleBooble.FolderComment")]
    public class FolderComment
    {
        [Key]
        public string PkId { get; set; }
        public string VisitorId { get; set; }
        public int FolderId { get; set; }
        public string CommentText { get; set; }
        public DateTime Posted { get; set; }
    }

    [Table("OggleBooble.Performance")]
    public class Performance
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public DateTime ReportDay { get; set; }
        public string DayString { get; set; }
        public int? NewVisitors { get; set; }
        public int? Visits { get; set; }
        public int? PageHits { get; set; }
        public int? ImageHits { get; set; }
    }

    [Table("OggleBooble.CenterfoldList")]
    public class Centerfold
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string FolderDecade { get; set; }
        public string FolderYear { get; set; }
        public int FolderMonth { get; set; }
        public string ImageSrc { get; set; }
        public string StaticFile { get; set; }
    }

    [Table("OggleBooble.StaticPageHit")]
    public class StaticPageHit
    {
        [Key]
        public string VisitorId { get; set; }
        public string CalledFrom { get; set; }
        public int FolderId { get; set; }
        public DateTime Occured { get; set; }
        public DateTime OccuredDay { get; set; }
    }

    [Table("OggleBooble.IpInfoHit")]
    public class IpInfoHit
    {
        [Key]
        public string VisitorId { get; set; }
        public string IpAddress { get; set; }
        public int FolderId { get; set; }
        public DateTime Occured { get; set; }
    }

    [Table("OggleBooble.ActivityLog")]
    public class ActivityLog
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime Occured { get; set; }
        public string ActivityCode { get; set; }
        public int FolderId { get; set; }
        public string CalledFrom { get; set; }
    }

    [Table("OggleBooble.ImageComment")]
    public partial class ImageComment
    {
        [Key]
        public string Id { get; set; }
        public string CommentTitle { get; set; }
        public string CommentText { get; set; }
        public string ImageLinkId { get; set; }
        public string CalledFrom { get; set; }
        public string VisitorId { get; set; }
        public DateTime Posted { get; set; }
    }

    [Table("OggleBooble.CategoryFolder")]
    public partial class CategoryFolder
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string FolderPath { get; set; }
        public string FolderType { get; set; }
        public string FolderImage { get; set; }
        public int Files { get; set; }
        public int SubFolders { get; set; }
        public int TotalChildFiles { get; set; }
        public int TotalSubFolders { get; set; }
        public int SortOrder { get; set; }
    }
    [Table("OggleBooble.ImageFile")]
    public class ImageFile
    {
        [Key]
        public string Id { get; set; }
        public string FileName { get; set; }
        //public string FileType { get; set; }
        public int FolderId { get; set; }
        public string ExternalLink { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public long Size { get; set; }
        public DateTime Acquired { get; set; }
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

    [Table("OggleBooble.UserCredit")]
    public class UserCredit
    {
        [Key]
        public string VisitorId { get; set; }
        public string ActivityCode { get; set; }
        public int Credits { get; set; }
        public int PageId { get; set; }
        public DateTime Occured { get; set; }

    }

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

    [Table("OggleBooble.ErrorLog")]
    public class ErrorLog
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime Occured { get; set; }
        [Key]
        [Column(Order = 2)]
        public string ErrorCode { get; set; }
        public string CalledFrom { get; set; }
        public int FolderId { get; set; }
        public string ErrorMessage { get; set; }
    }

    [Table("OggleBooble.PageHitTotals")]
    public class PageHitTotals
    {
        [Key]
        public int PageId { get; set; }
        public int Hits { get; set; }
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
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime Occured { get; set; }
        [Key]
        [Column(Order = 2)]
        public string EventCode { get; set; }
        [Key]
        [Column(Order = 3)]
        public int FolderId { get; set; }
        public string CalledFrom { get; set; }
        public string EventDetail { get; set; }
    }

    [Table("OggleBooble.RankerVote")]
    public partial class RankerVote
    {
        [Key]
        public string PkId { get; set; }
        public string Winner { get; set; }
        public string Looser { get; set; }
        public string VisitorId { get; set; }
        public DateTime Occured { get; set; }
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

    [Table("OggleBooble.RetiredVisitor")]
    public partial class RetiredVisitor {
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
//    create table PageHitD(
//      VisitorId char(36),
//  FolderId int,
//  Occured datetime,
//  OccuredDate date,
//  primary key(VisitorId, FolderId, OccuredDate)
//);  -- 1,102,477


    [Table("OggleBooble.PageHit")]
    public partial class PageHit
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public int PageId { get; set; }
        //[Key]
        //[Column(Order = 2)]
        //public string OccuredDate { get; set; }
        public DateTime Occured { get; set; }
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
        public int SortOrder { get; set; }
    }

    [Table("OggleBooble.FolderDetail")]
    public partial class FolderDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int FolderId { get; set; }
        public string HomeCountry { get; set; }
        public string HomeTown { get; set; }
        public string Measurements { get; set; }
        public DateTime? Birthday { get; set; }
        public string FolderComments { get; set; }
        public bool? FakeBoobs { get; set; }
        public int? TotalChildFiles { get; set; }
        public int? SubFolderCount { get; set; }
        public string StaticFile { get; set; }
        public DateTime? StaticFileUpdate { get; set; }
    }

    // VIEWS
    [Table("OggleBooble.VwSlideshowItems")]
    public class VwSlideshowItem
    {
        [Key]
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public int Parent { get; set; }
        public int ImageFolderId { get; set; }
        public string ImageFolderName { get; set; }
        public string ChildFolderName { get; set; }
        public string FolderName { get; set; }
        public string FileName { get; set; }
        public int SortOrder { get; set; }
    }

    [Table("OggleBooble.VwPageHits")]
    public class VwPageHit
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
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
        public string FolderType { get; set; }
        public string RootFolder { get; set; }
      //  public int ImageHits { get; set; }
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
        public string FolderType { get; set; }
        public string FolderImage { get; set; }
        public int FileCount { get; set; }
        public int TotalChildFiles { get; set; }
        public int SubFolderCount { get; set; }
        public int SortOrder { get; set; }
        public int IsStepChild { get; set; }
    }

    [Table("OggleBooble.VwLinks")]
    public partial class VwLink
    {
        [Key]
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public int Parent { get; set; }
        public int SrcId { get; set; }
        public string FileName { get; set; }
        public string SrcFolder { get; set; }
        public string RootFolder { get; set; }
        public string Orientation { get; set; }
        public bool Islink { get; set; }
        public int SortOrder { get; set; }
        public string Poster { get; set; }
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

    [Table("OggleBooble.VwErrorSummaryReport")]
    public class VwErrorSummaryReport
    {
        [Key]
        public string ErrorCode { get; set; }
        public string RefDescription { get; set; }
        public int ErrorCount { get; set; }
    }

    [Table("OggleBooble.VwErrorDetailReport")]
    public class VwErrorDetailReport
    {
        [Key]
        [Column(Order = 0)]
        public string ErrorCode { get; set; }
        [Key]
        [Column(Order = 1)]
        public string Occured { get; set; }
        public int RepeatCalls { get; set; }
        public string UserName { get; set; }
        public string CalledFrom { get; set; }
        public string ErrorMessage { get; set; }
        public string FolderId { get; set; }
        public string FolderName { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        [Key]
        [Column(Order = 2)]
        public string VisitorId { get; set; }
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

    [Table("OggleBooble.VwEventSummary")]
    public class VwEventSummary
    {
        [Key]
        public string EventCode { get; set; }
        public string EventName { get; set; }
        public int Count { get; set; }
    }

    [Table("OggleBooble.VwEventDetail")]
    public class VwEventDetail
    {
        public string EventCode { get; set; }
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string CalledFrom { get; set; }
        [Key]
        [Column(Order = 0)]
        public string Occured { get; set; }
        public string IpAddress { get; set; }
        public string Location { get; set; }
        [Key]
        [Column(Order = 1)]
        public string VisitorId { get; set; }
    }


    [Table("OggleBooble.VwActivityLog")]
    public partial class VwActivityLog
    {
        [Key]
        public string ActivityCode { get; set; }
        public string Activity { get; set; }
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string Occured { get; set; }
    }

    [Table("OggleBooble.VwLatestTouchedGalleries")]
    public class VwLatestTouchedGalleries
    {
        [Key]
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string ImageFile { get; set; }
        public DateTime Acquired { get; set; }
    }

    [Table("OggleBooble.VwCarouselImages")]
    public class VwCarouselItem
    {
        [Key]
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public string RootFolder { get; set; }
        public string RealRoot { get; set; }
        public string FolderType { get; set; }
        public string FolderName { get; set; }
        public string FolderParentName { get; set; }
        public int FolderParentId { get; set; }
        public string FolderGPName { get; set; }
        public string PlayboyYear { get; set; }
        public int FolderGPId { get; set; }        
        public int ImageFolderId { get; set; }
        public string ImageFolderName { get; set; }
        public string ImageFolderParentName { get; set; }
        public int ImageFolderParentId { get; set; }
        public string ImageFolderGPName { get; set; }
        public int ImageFolderGPId { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string ImageFileName { get; set; }
    }
}


