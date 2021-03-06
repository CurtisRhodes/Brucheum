﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.MSSqlDataContext
{
    public partial class OggleBoobleMSSqlContext : DbContext
    {
        public OggleBoobleMSSqlContext()
            : base("GoDaddy") { }

        public virtual DbSet<TestFolder> TestFolders { get; set; }
        //public virtual DbSet<ImageLink> ImageLinks { get; set; }
        //public virtual DbSet<CategoryImageLink> CategoryImageLinks { get; set; }

        //public virtual DbSet<vwDirTree> vwDirTrees { get; set; }
        //public virtual DbSet<VideoLink> VideoLinks { get; set; }
        //public virtual DbSet<VwLink> VwLinks { get; set; }
        //public virtual DbSet<BlogComment> BlogComments { get; set; }
        //public virtual DbSet<CategoryFolderDetail> CategoryFolderDetails { get; set; }
        //public virtual DbSet<MetaTag> MetaTags { get; set; }
        //public virtual DbSet<RejectLink> RejectLinks { get; set; }
        //public virtual DbSet<RankerVote> RankerVotes { get; set; }
        //public virtual DbSet<StepChild> StepChildren { get; set; }
        //public virtual DbSet<TrackbackLink> TrackbackLinks { get; set; }
        //public virtual DbSet<ChangeLog> ChangeLogs { get; set; }
        //public virtual DbSet<vwCarouselItem> vwCarouselImages { get; set; }
        //public virtual DbSet<vwSlideshowItem> vwSlideshowItems { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }
    }
    [Table("Oggle.vwSlideshowItems")]
    public class vwSlideshowItem
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

    [Table("Oggle.vwCarouselImages")]
    public class vwCarouselItem
    {
        public string RootFolder { get; set; }
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string FolderParent { get; set; }
        public int FolderParentId { get; set; }
        public string FolderGP { get; set; }
        public int FolderGPId { get; set; }
        public int ImageFolderId { get; set; }
        public string ImageFolder { get; set; }
        public string ImageFolderParent { get; set; }
        public int ImageFolderParentId { get; set; }
        public string ImageFolderGP { get; set; }
        public int ImageFolderGPId { get; set; }
        [Key]
        public string LinkId { get; set; }
        public string Link { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }

    [Table("Oggle.ChangeLog")]
    public class ChangeLog
    {
        [Key]
        public int PkId { get; set; }
        public int PageId { get; set; }
        public string PageName { get; set; }
        public string Activity { get; set; }
        public DateTime Occured { get; set; }
    }

    //[Table("Oggle.TrackbackLink")]
    //public partial class TrackbackLink
    //{
    //    [Key]
    //    [Column(Order = 0)]
    //    public int PageId { get; set; }
    //    [Key]
    //    [Column(Order = 1)]
    //    public string Site { get; set; }
    //    public string TrackBackLink { get; set; }
    //    public string LinkStatus { get; set; }
    //}

    [Table("Oggle.StepChild")]
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

    [Table("Oggle.RejectLink")]
    public partial class RejectLink
    {
        [Key]
        public string Id { get; set; }
        public int PreviousLocation { get; set; }
        public string RejectionReason { get; set; }
        public string ExternalLink { get; set; }
    }

    [Table("Oggle.CategoryFolder")]
    public partial class TestFolder
    {
        [Key]
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public int SortOrder { get; set; }
        public string FolderImage { get; set; }
    }

    [Table("Oggle.ImageLink")]
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
        public DateTime? LastModified { get; set; }
    }

    [Table("Oggle.CategoryImageLink")]
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

    [Table("Oggle.CategoryFolderDetail")]
    public partial class CategoryFolderDetail
    {
        [Key]
        public int PkId { get; set; }
        public int FolderId { get; set; }
        public string Nationality { get; set; }
        public string Measurements { get; set; }
        public string ExternalLinks { get; set; }
        public string CommentText { get; set; }
        public DateTime? Born { get; set; }
        public string Boobs { get; set; }
        public string LinkStatus { get; set; }
    }

    [Table("Oggle.vwLinks")]
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

    [Table("Oggle.VideoLink")]
    public partial class VideoLink
    {
        [Key]
        public string Id { get; set; }
        public string Link { get; set; }
        public string ImageId { get; set; }
        public string Title { get; set; }
        public int FolderId { get; set; }
    }

    //[Table("Oggle.BlogComment")]
    //public partial class BlogComment
    //{
    //    [Key]
    //    public int Id { get; set; }
    //    public string CommentTitle { get; set; }
    //    public string CommentType { get; set; }
    //    public string Link { get; set; }
    //    public string LinkId { get; set; }
    //    public int FolderId { get; set; }
    //    public string UserId { get; set; }
    //    public string CommentText { get; set; }
    //    public DateTime Posted { get; set; }
    //}

    [Table("Oggle.MetaTag")]
    public partial class MetaTag
    {
        [Key]
        public int TagId { get; set; }
        public int FolderId { get; set; }
        public string LinkId { get; set; }
        public string Tag { get; set; }
    }

    [Table("Oggle.RankerVote")]
    public partial class RankerVote
    {
        [Key]
        public string PkId { get; set; }
        public string Winner { get; set; }
        public string Looser { get; set; }
        public string UserId { get; set; }
        public DateTime VoteDate { get; set; }
    }

    [Table("Oggle.vwDirtree")]
    public partial class vwDirTree
    {
        [Key]
        [Column(Order = 0)]
        public int Id { get; set; }
        [Key]
        [Column(Order = 1)]
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

}