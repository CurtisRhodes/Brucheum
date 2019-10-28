using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using MySql.Data.EntityFramework;

namespace WebApi.DataContext
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public partial class OggleBoobleMySqContext : DbContext
    {
        public OggleBoobleMySqContext()
            : base("GoDaddyMySql") { }

        public virtual DbSet<MySqlImageHit> MySqlImageHits { get; set; }
        public virtual DbSet<MySqlPageHit> MySqlPageHits { get; set; }
    }

    [Table("OggleBooble.ImageHit")]
    public partial class MySqlImageHit
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime HitDateTime { get; set; }
        public string ImageLinkId { get; set; }
        public int PageId { get; set; }
    }

    [Table("OggleBooble.PageHit")]
    public partial class MySqlPageHit
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime HitDateTime { get; set; }
        public string PageName { get; set; }
        public int PageId { get; set; }
    }

}