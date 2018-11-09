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
        public virtual DbSet<Visit> Visits { get; set; }
        public virtual DbSet<Visitor> Visitors { get; set; }


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
        public int VisitId { get; set; }

        [StringLength(50)]
        public string IPAddress { get; set; }

        [Required]
        [StringLength(50)]
        public string App { get; set; }

        public DateTime VisitDate { get; set; }
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

        public string CommentText { get; set; }

        public DateTime CreateDate { get; set; }

        public string UserName { get; set; }

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

}
