using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace Bruch.Api.DataContext
{
    public partial class ArticleContext : DbContext
    {
        public ArticleContext()
            : base("GoDaddy") { }

        //public virtual DbSet<Comment> Comments { get; set; }
        public virtual DbSet<Article> Articles { get; set; }
        public virtual DbSet<ArticleTag> ArticleTags { get; set; }
        //public virtual DbSet<Blog> Blogs { get; set; }
        //public virtual DbSet<BlogEntry> BlogEntries { get; set; }
        //public virtual DbSet<ToDoList> Lists { get; set; }
        //public virtual DbSet<ListItem> ListItems { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }
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

}