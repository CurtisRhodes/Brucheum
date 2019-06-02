namespace WebApi.DataContext
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

        public virtual DbSet<CategoryFolder> CategoryFolders { get; set; }
        public virtual DbSet<ImageLink> ImageLinks { get; set; }
        public virtual DbSet<CategoryImageLink> CategoryImageLinks { get; set; }

        public virtual DbSet<VwDirTree> VwDirTrees { get; set; }        
        public virtual DbSet<VideoLink> VideoLinks { get; set; }
        public virtual DbSet<VwLink> VwLinks { get; set; }
        public virtual DbSet<BlogComment> BlogComments { get; set; }
        public virtual DbSet<CategoryFolderDetail> CategoryFolderDetails { get; set; }
        public virtual DbSet<MetaTag> MetaTags { get; set; }
        
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }
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
    }

    [Table("OggleBooble.CategoryFolderDetail")]
    public partial class CategoryFolderDetail
    {
        [Key]
        public int PkId { get; set; }
        public int FolderId { get; set; }
        public string Nationality { get; set; }
        public string Measurements { get; set; }
        public string ExternalLinks { get; set; }
        public string CommentText { get; set; }
        public string Born { get; set; }
        public string FolderImage { get; set; }
    }

    [Table("OggleBooble.vwLinks")]
    public partial class VwLink
    {
        public int FolderId { get; set; }
        [Key]
        public string LinkId { get; set; }
        public string Link { get; set; }
        public int LinkCount { get; set; }
    }
    [Table("OggleBooble.vwDirtree")]
    public partial class VwDirTree
    {
        [Key]
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string Link { get; set; }
        public int SubDirCount { get; set; }
        public int FileCount { get; set; }
    }

    [Table("OggleBooble.VideoLink")]
    public partial class VideoLink
    {
        [Key]
        public string Link { get; set; }
        public string Image { get; set; }
        public string Title { get; set; }
    }

    [Table("OggleBooble.BlogComment")]
    public partial class BlogComment
    {
        [Key]
        public int Id { get; set; }
        public string CommentTitle { get; set; }
        public string CommentType { get; set; }
        public string Link { get; set; }
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public string UserId { get; set; }
        public string CommentText { get; set; }
        public DateTime Posted { get; set; }
    }

    [Table("OggleBooble.MetaTag")]
    public partial class MetaTag
    {
        [Key]
        public int TagId { get; set; }
        public string TagType { get; set; }
        public string Tag { get; set; }
    }
}
