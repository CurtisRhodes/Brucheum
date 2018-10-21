namespace Service1
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.ComponentModel.DataAnnotations;
    using System.Collections.Generic;

    public partial class GoDaddyContext : DbContext
    {
        public GoDaddyContext()
            : base("name=GoDaddy")
        { }

        public virtual DbSet<Ref> Refs { get; set; }
        public virtual DbSet<Category> Categories { get; set; }
        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<UserRole> UserRoles { get; set; }
        public virtual DbSet<UserLogin> UserLogins { get; set; }
        public virtual DbSet<Hit> Hits { get; set; }
        public virtual DbSet<Visitor> Visitors { get; set; }
        public virtual DbSet<Comment> Comments { get; set; }
        public virtual DbSet<ImageFile> ImageFiles { get; set; }
        public virtual DbSet<ImageFolder> ImageFolders { get; set; }


        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Ref>()
                .Property(e => e.RefType)
                .IsFixedLength();

            modelBuilder.Entity<Ref>()
                .Property(e => e.RefCode)
                .IsFixedLength();
        }
    }
    [Table("website.Category")]
    public partial class Category
    {
        [Key]
        [StringLength(300)]
        public string CategoryName { get; set; }
    }

    [Table("website.UserLogin")]
    public partial class UserLogin
    {
        [Key]
        public Guid UserId { get; set; }

        [StringLength(300)]
        public string Email { get; set; }

        [StringLength(300)]
        public string UserName { get; set; }

        [StringLength(200)]
        public string PasswordHash { get; set; }

        [StringLength(300)]
        public string FirstName { get; set; }

        [StringLength(300)]
        public string LastName { get; set; }

        [StringLength(200)]
        public string PhoneNumber { get; set; }

        public short? Pin { get; set; }

        [StringLength(200)]
        public string FaceBookId { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? LastModified { get; set; }
    }

    [Table("website.Role")]
    public partial class Role
    {
        public int RoleId { get; set; }

        [StringLength(300)]
        public string RoleName { get; set; }
    }

    [Table("website.UserRole")]
    public partial class UserRole
    {
        [Key]
        [Column(Order = 0)]
        public int RoleId { get; set; }
        [Key]
        [Column(Order = 1)]
        public int UserId { get; set; }
    }

    [Table("website.Ref")]
    public partial class Ref
    {
        [Key]
        [Column(Order = 0)]
        [StringLength(3)]
        public string RefType { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(3)]
        public string RefCode { get; set; }

        [Required]
        [StringLength(250)]
        public string RefDescription { get; set; }
    }

    [Table("website.Visitor")]
    public partial class Visitor
    {
        [Key]
        [Column(Order = 0)]
        [StringLength(50)]
        public string IPAddress { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(50)]
        public string App { get; set; }

        public DateTime? VisitDate { get; set; }
    }

    [Table("website.Hit")]
    public partial class Hit
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string App { get; set; }

        [StringLength(50)]
        public string IPAddress { get; set; }

        [StringLength(300)]
        public string PageName { get; set; }

        [StringLength(300)]
        public string Details { get; set; }

        public DateTime? BeginView { get; set; }

        [StringLength(200)]
        public string ViewDuration { get; set; }

        public virtual Visitor Visitor { get; set; }
    }

    [Table("website.Comment")]
    public partial class Comment
    {
        public Guid CommentId { get; set; }

        public Guid UserId { get; set; }

        public Guid ArticleId { get; set; }

        public DateTime CreateDate { get; set; }

        [StringLength(500)]
        public string CommentTitle { get; set; }

        [Column(TypeName = "ntext")]
        [Required]
        public string CommentText { get; set; }
    }

    [Table("website.ImageFile")]
    public partial class ImageFile
    {
        [Key]
        public Guid ImageId { get; set; }

        [Required]
        [StringLength(200)]
        public string ImageName { get; set; }

        public int? FolderId { get; set; }

        public string FolderName { get; set; }

        public long? Size { get; set; }

        public int VotesUp { get; set; }

        public int VotesDown { get; set; }

        public virtual ImageFolder ImageFolder { get; set; }
    }

    [Table("website.ImageFolder")]
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

        public string RelativePath { get; set; }

        [Required]
        [StringLength(200)]
        public string FolderName { get; set; }

        public int? Files { get; set; }

        public long? Size { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ImageFile> ImageFiles { get; set; }
    }
}
