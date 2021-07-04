// using EFCoreMySQL.Models;  
using Microsoft.EntityFrameworkCore;  
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OggleBooble.Api.Core
{
    public class MySqlDataContext : DbContext
    {
        public MySqlDataContext(DbContextOptions<MySqlDataContext> options) : base(options) { }

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
    }
}
