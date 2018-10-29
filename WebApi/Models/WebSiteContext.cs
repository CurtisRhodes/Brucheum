namespace WebApi
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.ComponentModel.DataAnnotations;
    using System.Collections.Generic;

    public partial class WebSiteContext : DbContext
    {
        public WebSiteContext()
            : base("GoDaddy") { }

        public virtual DbSet<Comment> Comments { get; set; }
        public virtual DbSet<Hit> Hits { get; set; }
        public virtual DbSet<Ref> Refs { get; set; }
        public virtual DbSet<SiteUser> SiteUsers { get; set; }
        public virtual DbSet<Visit> Visits { get; set; }
        public virtual DbSet<Visitor> Visitors { get; set; }

        public virtual DbSet<AspNetRole> AspNetRoles { get; set; }
        public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }
        public virtual DbSet<AspNetUser> AspNetUsers { get; set; }
        public virtual DbSet<AspNetUserRole> AspNetUserRoles { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Ref>()
                .Property(e => e.RefType)
                .IsFixedLength();

            modelBuilder.Entity<Ref>()
                .Property(e => e.RefCode)
                .IsFixedLength();

            modelBuilder.Entity<AspNetRole>()
                .HasMany(e => e.AspNetUsers)
                .WithMany(e => e.AspNetRoles)
                .Map(m => m.ToTable("AspNetUserRoles").MapLeftKey("RoleId").MapRightKey("UserId"));

            modelBuilder.Entity<AspNetUser>()
                .HasMany(e => e.AspNetUserLogins)
                .WithRequired(e => e.AspNetUser)
                .HasForeignKey(e => e.UserId);
        }
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

        public DateTime CreateDate { get; set; }
    }

    [Table("website.Visit")]
    public partial class Visit
    {
        [Key]
        [Column(Order = 0)]
        [StringLength(50)]
        public string IPAddress { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(50)]
        public string App { get; set; }

        public DateTime VisitDate { get; set; }
    }

    [Table("website.SiteUser")]
    public partial class SiteUser
    {
        [Required]
        [StringLength(300)]
        public string DisplayName { get; set; }

        [StringLength(300)]
        public string FirstName { get; set; }

        [StringLength(300)]
        public string LastName { get; set; }

        [StringLength(300)]
        public string Email { get; set; }

        [StringLength(200)]
        public string PhoneNumber { get; set; }

        [StringLength(300)]
        public string Avatar { get; set; }

        public short? Pin { get; set; }

        [StringLength(200)]
        public string FaceBookId { get; set; }

        [StringLength(128)]
        public string UserId { get; set; }

        [StringLength(50)]
        public string IPAddress { get; set; }

        [Key]
        public int PkId { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? LastModified { get; set; }
    }

    [Table("website.Hit")]
    public partial class Hit
    {
        public int HitId { get; set; }

        [Required]
        [StringLength(50)]
        public string IPAddress { get; set; }

        [Required]
        [StringLength(50)]
        public string App { get; set; }

        [Required]
        [StringLength(300)]
        public string PageName { get; set; }

        [StringLength(300)]
        public string Details { get; set; }

        public DateTime BeginView { get; set; }

        [StringLength(200)]
        public string ViewDuration { get; set; }
    }

    [Table("website.Comment")]
    public partial class Comment
    {
        [Required]
        [StringLength(500)]
        public string CommentTitle { get; set; }

        [Column(TypeName = "ntext")]
        public string CommentText { get; set; }

        public DateTime CreateDate { get; set; }

        public int CommentId { get; set; }

        [StringLength(128)]
        public string UserId { get; set; }

        [Required]
        [StringLength(128)]
        public string ArticleId { get; set; }
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

    public partial class AspNetRole
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public AspNetRole()
        {
            AspNetUsers = new HashSet<AspNetUser>();
        }

        public string Id { get; set; }

        [Required]
        [StringLength(256)]
        public string Name { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<AspNetUser> AspNetUsers { get; set; }
    }

    public partial class AspNetUser
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public AspNetUser()
        {
            AspNetUserLogins = new HashSet<AspNetUserLogin>();
            AspNetRoles = new HashSet<AspNetRole>();
        }

        public string Id { get; set; }

        public string Hometown { get; set; }

        [StringLength(256)]
        public string Email { get; set; }

        public bool EmailConfirmed { get; set; }

        public string PasswordHash { get; set; }

        public string SecurityStamp { get; set; }

        public string PhoneNumber { get; set; }

        public bool PhoneNumberConfirmed { get; set; }

        public bool TwoFactorEnabled { get; set; }

        public DateTime? LockoutEndDateUtc { get; set; }

        public bool LockoutEnabled { get; set; }

        public int AccessFailedCount { get; set; }

        [Required]
        [StringLength(256)]
        public string UserName { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<AspNetUserLogin> AspNetUserLogins { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<AspNetRole> AspNetRoles { get; set; }
    }

    public partial class AspNetUserLogin
    {
        [Key]
        [Column(Order = 0)]
        public string LoginProvider { get; set; }

        [Key]
        [Column(Order = 1)]
        public string ProviderKey { get; set; }

        [Key]
        [Column(Order = 2)]
        public string UserId { get; set; }

        public virtual AspNetUser AspNetUser { get; set; }
    }

    public partial class AspNetUserRole
    {
        [Key]
        [Column(Order = 0)]
        public string UserId { get; set; }

        [Key]
        [Column(Order = 1)]
        public string RoleId { get; set; }
    }
}
