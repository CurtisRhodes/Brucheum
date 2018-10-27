namespace WebApi.Models
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class GoDaddyContext : DbContext
    {
        public GoDaddyContext()
            : base("name=GoDaddy")
        {
        }

        public virtual DbSet<AspNetRole> AspNetRoles { get; set; }
        public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }
        public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }
        public virtual DbSet<AspNetUser> AspNetUsers { get; set; }
        public virtual DbSet<Category> Categories { get; set; }
        public virtual DbSet<Comment> Comments { get; set; }
        public virtual DbSet<Hit> Hits { get; set; }
        public virtual DbSet<ImageFile> ImageFiles { get; set; }
        public virtual DbSet<ImageFolder> ImageFolders { get; set; }
        public virtual DbSet<Ref> Refs { get; set; }
        public virtual DbSet<Visitor> Visitors { get; set; }
        public virtual DbSet<SiteUser> SiteUsers { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AspNetRole>()
                .HasMany(e => e.AspNetUsers)
                .WithMany(e => e.AspNetRoles)
                .Map(m => m.ToTable("AspNetUserRoles").MapLeftKey("RoleId").MapRightKey("UserId"));

            modelBuilder.Entity<AspNetUser>()
                .HasMany(e => e.AspNetUserClaims)
                .WithRequired(e => e.AspNetUser)
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<AspNetUser>()
                .HasMany(e => e.AspNetUserLogins)
                .WithRequired(e => e.AspNetUser)
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<Ref>()
                .Property(e => e.RefType)
                .IsFixedLength();

            modelBuilder.Entity<Ref>()
                .Property(e => e.RefCode)
                .IsFixedLength();
        }
    }
}
