namespace WebApi.OggleBooble.DataContext
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.ComponentModel.DataAnnotations;
    using System.Collections.Generic;

    public partial class OggleBoobleContext : DbContext
    {
        public OggleBoobleContext()
            : base("GoDaddy") { }

        public virtual DbSet<ImageFolder> ImageFolders { get; set; }
        public virtual DbSet<ImageLink> ImageLinks { get; set; }
        public virtual DbSet<Category_ImageLink> Category_ImageLinks { get; set; }
        public virtual DbSet<BoobsLink> BoobsLinks { get; set; }
        public virtual DbSet<PornLink> PornLinks { get; set; }
        public virtual DbSet<VDirTree> VDirTrees { get; set; }        
        public virtual DbSet<VideoLink> VideoLinks { get; set; }
        public virtual DbSet<VLink> VLinks { get; set; }
        public virtual DbSet<BlogComment> BlogComments { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }
    }

    [Table("OggleBooble.BlogComment")]
    public partial class BlogComment
    {
        [Key]
        public string CommentTitle { get; set; }
        public string CommentType { get; set; }
        public string Link { get; set; }
        public string UserId { get; set; }
        public string CommentText { get; set; }
        public DateTime Posted { get; set; }
    }

    [Table("OggleBooble.ImageLink")]
    public partial class ImageLink
    {
        [Key]
        public string Id { get; set; }
        public string Link { get; set; }
    }

    [Table("OggleBooble.VideoLink")]
    public partial class VideoLink
    {
        [Key]
        public string Link { get; set; }
        public string Image { get; set; }
        public string Title { get; set; }
    }

    [Table("OggleBooble.Category_ImageLink")]
    public partial class Category_ImageLink
    {
        [Key]
        [Column(Order = 0)]
        public int ImageCategoryId { get; set; }
        [Key]
        [Column(Order = 1)]
        public string ImageLinkId { get; set; }
    }

    [Table("OggleBooble.ImageFolder")]
    public partial class ImageFolder
    {
        [Key]
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        //public string FolderPath { get; set; }
        public int FileCount { get; set; }
        public string CatergoryDescription { get; set; }
        public string RootFolder { get; set; }
    }

    [Table("OggleBooble.BoobsLink")]
    public partial class BoobsLink
    {
        [Key]
        [Column(Order = 0)]
        public string LinkId { get; set; }
        [Key]
        [Column(Order = 1)]
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string FolderPath { get; set; }
        public string Link { get; set; }
    }

    [Table("OggleBooble.PornLink")]
    public partial class PornLink
    {
        //public string RootFolder { get; set; }
        [Key]
        [Column(Order = 0)]
        public string LinkId { get; set; }
        [Key]
        [Column(Order = 1)]
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string FolderPath { get; set; }
        public string Link { get; set; }
    }

    [Table("OggleBooble.ImageVote")]
    public partial class ImageVote
    {
        //[Key]
        //public string Id { get; set; }

        public string SelectedImageId { get; set; }
        public string RegectedImageId { get; set; }
        public DateTime Created { get; set; }
        public string Voter { get; set; }

        //public virtual ImageFolder ImageFolder { get; set; }
    }
    [Table("OggleBooble.vwLinks")]
    public partial class VLink
    {
        public int Id { get; set; }
        public string RootFolder { get; set; }
        public string FolderName { get; set; }
        public string FolderPath { get; set; }
        public string LinkId { get; set; }
        public string Link { get; set; }
    }
    [Table("OggleBooble.vwDirtree")]
    public partial class VDirTree
    {
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        //public string FolderPath { get; set; }
        public int SubDirCount { get; set; }
        public int FileCount { get; set; }
    }

}
