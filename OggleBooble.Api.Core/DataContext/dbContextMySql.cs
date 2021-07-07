
using Microsoft.EntityFrameworkCore;
//using MySql.EntityFrameworkCore.Extensions;

namespace OggleBooble.Api.Core
{
    public class OggleMySqlDbContext : DbContext
    {
        //public MySqlDataContext(DbContextOptions<MySqlDataContext> options) : base(options) { }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySQL("data source=50.62.209.107; port=3306; initial catalog=OggleBooble; user id=OggleUser;password=R@quel77;");
        }        

        // main tables
        public virtual DbSet<CategoryFolder> CategoryFolders { get; set; }
        public virtual DbSet<ImageFile> ImageFiles { get; set; }
        public virtual DbSet<CategoryImageLink> CategoryImageLinks { get; set; }

        // views
        public virtual DbSet<VwDirTree> VwDirTrees { get; set; }
        public virtual DbSet<VwSlideshowItem> VwSlideshowItems { get; set; }
        public virtual DbSet<VwCarouselItem> VwCarouselItems { get; set; }

        // Visitor tables
        public virtual DbSet<RegisteredUser> RegisteredUsers { get; set; }
        public virtual DbSet<Visitor> Visitors { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CategoryImageLink>()
            .HasIndex(p => new { p.ImageLinkId, p.ImageCategoryId }).IsUnique();

            modelBuilder.Entity<VwDirTree>()
            .HasIndex(p => new { p.Id, p.Parent }).IsUnique();
        }
    }
}
