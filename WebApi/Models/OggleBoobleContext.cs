namespace WebApi
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

        public virtual DbSet<ImageFile> ImageFiles { get; set; }
        public virtual DbSet<ImageFolder> ImageFolders { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }
    }

    [Table("OggleBooble.ImageFile")]
    public partial class ImageFile
    {
        [Key]
        public Guid ImageId { get; set; }

        [Required]
        [StringLength(200)]
        public string ImageName { get; set; }

        public int? FolderId { get; set; }

        [Required]
        [StringLength(100)]
        public string FolderName { get; set; }

        public long? Size { get; set; }

        public int VotesUp { get; set; }

        public int VotesDown { get; set; }

        public virtual ImageFolder ImageFolder { get; set; }
    }

    [Table("OggleBooble.ImageFolder")]
    public partial class ImageFolder
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public ImageFolder()
        {
            ImageFiles = new HashSet<ImageFile>();
        }

        [Key]
        public int FolderId { get; set; }

        public int? ParentFolderId { get; set; }

        [Required]
        [StringLength(100)]
        public string FolderName { get; set; }

        [Required]
        [StringLength(300)]
        public string RelativePath { get; set; }

        public int? Files { get; set; }

        public long? Size { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ImageFile> ImageFiles { get; set; }
    }
}
