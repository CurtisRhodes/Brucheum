namespace WebApi.DataContext
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.ComponentModel.DataAnnotations;
    using System.Collections.Generic;

    public partial class WebStatsContext : DbContext
    {
        public WebStatsContext() : base("GoDaddy") { }
        public virtual DbSet<RegisteredUser> RegisteredUsers { get; set; }
        public virtual DbSet<UserRole> UserRoles { get; set; }
        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<Visitor> Visitors { get; set; }
        public virtual DbSet<Visit> Visits { get; set; }
        public virtual DbSet<PageHit> PageHits { get; set; }
        public virtual DbSet<ChangeLog> ChangeLogs { get; set; }
    }

    [Table("webStats.ChangeLog")]
    public class ChangeLog
    {
        [Key]
        public int PkId { get; set; }
        public int PageId { get; set; }
        public string PageName { get; set; }
        public string Activity { get; set; }
        public DateTime Occured { get; set; }
        public bool StaticRebuild { get; set; }
    }

    [Table("webStats.RegisteredUser")]
    public partial class RegisteredUser
    {
        [Key]
        public string UserName { get; set; }
        public string Pswrd { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string IpAddress { get; set; }
        public string AppName { get; set; }
        public DateTime CreateDate { get; set; }
    }

    [Table("webStats.UserRole")]
    public partial class UserRole
    {
        [Key]
        [Column(Order = 0)]
        public string UserName { get; set; }
        [Key]
        [Column(Order = 1)]
        public string RoleName { get; set; }
    }

    [Table("webStats.Role")]
    public partial class Role
    {
        [Key]
        public string RoleName { get; set; }
    }

    [Table("webStats.Visitor")]
    public partial class Visitor
    {
        [Key]
        public string VisitorId { get; set; }
        public string UserName { get; set; }
        public string AppName { get; set; }
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string GeoCode { get; set; }
    }
    [Table("webStats.Visit")]
    public partial class Visit
    {
        [Key]
        [Column(Order = 0)]
        public string VisitorId { get; set; }
        [Key]
        [Column(Order = 1)]
        public DateTime VisitDate { get; set; }
    }

    [Table("webStats.PageHit")]
    public partial class PageHit
    {
        [Key]
        [Column(Order = 0)]
        public DateTime HitDateTime { get; set; }
        [Key]
        [Column(Order = 1)]
        public string VisitorId { get; set; }
        //public int PageId { get; set; }
        public string AppName { get; set; }
        public string PageName { get; set; }
    }
}

