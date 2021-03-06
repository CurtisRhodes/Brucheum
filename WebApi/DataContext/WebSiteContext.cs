namespace WebApi.DataContext
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
        public virtual DbSet<Ref> Refs { get; set; }
        public virtual DbSet<Article> Articles { get; set; }
        public virtual DbSet<ArticleTag> ArticleTags { get; set; }
        public virtual DbSet<Blog> Blogs { get; set; }
        public virtual DbSet<BlogEntry> BlogEntries { get; set; }
        public virtual DbSet<ToDoList> Lists { get; set; }
        public virtual DbSet<ListItem> ListItems { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            //modelBuilder.Entity<Ref>()
            //    .Property(e => e.RefType)
            //    .IsFixedLength();

            //modelBuilder.Entity<Ref>()
            //    .Property(e => e.RefCode)
            //    .IsFixedLength();

            //modelBuilder.Entity<Article>()
            //    .HasMany(e => e.ArticleTags)
            //    .WithRequired(e => e.Article)
            //    .WillCascadeOnDelete(false);

            //modelBuilder.Entity<Blog>()
            //    .HasMany(e => e.BlogEntries)
            //    .WithRequired(e => e.Blog)
            //    .WillCascadeOnDelete(false);
        }
    }
        
    [Table("website.Comment")]
    public partial class Comment
    {
        [Key]
        public int CommentId { get; set; }

        [Required]
        [StringLength(500)]
        public string CommentTitle { get; set; }

        public string CommentText { get; set; }

        public DateTime CreateDate { get; set; }

        public string UserName { get; set; }

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

    [Table("website.Article")]
    public partial class Article
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Article()
        {
            ArticleTags = new HashSet<ArticleTag>();
        }

        public string Id { get; set; }

        [StringLength(400)]
        public string Title { get; set; }

        [StringLength(400)]
        public string ImageName { get; set; }

        [StringLength(3)]
        public string CategoryRef { get; set; }

        [StringLength(3)]
        public string SubCategoryRef { get; set; }

        [StringLength(3)]
        public string ByLineRef { get; set; }

        public DateTime Created { get; set; }

        public DateTime LastUpdated { get; set; }

        public string Summary { get; set; }

        public string Content { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ArticleTag> ArticleTags { get; set; }
    }

    [Table("website.ArticleTag")]
    public partial class ArticleTag
    {
        public int Id { get; set; }

        public string articleId { get; set; }

        [StringLength(200)]
        public string TagName { get; set; }

        [StringLength(3)]
        public string TagCategoryRef { get; set; }

        public virtual Article Article { get; set; }
    }

    [Table("website.Blog")]
    public partial class Blog
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Blog()
        {
            BlogEntries = new HashSet<BlogEntry>();
        }

        public string Id { get; set; }
        public string BlogName { get; set; }
        public string Color { get; set; }
        public string BlogOwner { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BlogEntry> BlogEntries { get; set; }
    }

    [Table("website.BlogEntry")]
    public partial class BlogEntry
    {
        public string Id { get; set; }

        public string BlogId { get; set; }

        public string Title { get; set; }

        public string ImageName { get; set; }

        public DateTime Created { get; set; }

        public DateTime LastUpdated { get; set; }

        public string Summary { get; set; }

        public string Content { get; set; }

        public virtual Blog Blog { get; set; }
    }

    [Table("website.List")]
    public partial class ToDoList
    {
        [Required]
        [StringLength(128)]
        public string Id { get; set; }

        [StringLength(200)]
        public string ListName { get; set; }

        public DateTime Created { get; set; }

        [StringLength(128)]
        public string ListOwner { get; set; }
    }

    [Table("website.ListItem")]
    public partial class ListItem
    {
        [StringLength(128)]
        public string ListId { get; set; }

        public string Id { get; set; }

        [StringLength(128)]
        public string ParentId { get; set; }

        [Required]
        [StringLength(200)]
        public string ItemName { get; set; }

        [StringLength(3)]
        public string ItemPriorityRef { get; set; }

        [StringLength(128)]
        public string AssignedTo { get; set; }

        [StringLength(50)]
        public string PercentComplete { get; set; }

        [StringLength(3)]
        public string ItemStatusRef { get; set; }

        public string Narrative { get; set; }

        public DateTime Created { get; set; }

        public DateTime? DateCompleted { get; set; }
    }


}
