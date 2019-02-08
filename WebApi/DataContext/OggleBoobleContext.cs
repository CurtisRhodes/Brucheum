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

        public virtual DbSet<FolderLink> FolderLinks { get; set; }
        public virtual DbSet<ImageFolder> ImageFolders { get; set; }
        public virtual DbSet<CustomLink> CustomLinks { get; set; }        
        public virtual DbSet<VideoLink> VideoLinks { get; set; }
        public virtual DbSet<ImageLink> ImageLinks { get; set; }
        public virtual DbSet<Category_ImageLink> Category_ImageLinks { get; set; }
        
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }
    }

    [Table("OggleBooble.ImageLink")]
    public partial class ImageLink
    {
        [Key]
        public string Id { get; set; }
        public string Link { get; set; }
    }

    [Table("OggleBooble.CustomLink")]
    public partial class CustomLink
    {
        [Key]
        [Column(Order = 0)]
        public string Link { get; set; }
        [Key]
        [Column(Order = 1)]
        public string FolderPath { get; set; }
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
        public string FolderPath { get; set; }
        public int FileCount { get; set; }
    }

    [Table("OggleBooble.FolderLink")]
    public partial class FolderLink
    {
        public string RootFolder { get; set; }
        public string Parent { get; set; }
        [Key]
        [Column(Order = 1)]
        public string FolderName { get; set; }
        public string FolderPath { get; set; }
        public string Link { get; set; }
        [Key]
        [Column(Order = 0)]
        public string LinkId { get; set; }
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

}
