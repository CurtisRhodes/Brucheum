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
    }

    [Table("webStats.Visitor")]
    public partial class Visitor
    {
        public string UserName { get; set; }
        public string IpAddress { get; set; }
        public string AppName { get; set; }
        public DateTime VisitDate { get; set; }
        [Key]
        public string VisitorId { get; set; }
    }
    [Table("webStats.Visit")]
    public partial class Visit
    {
        public string VisitorId { get; set; }
        [Key]
        public DateTime VisitDate { get; set; }
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

    [Table("webStats.PageHit")]
    public partial class PageHit
    {
        [Key]
        public string PkId { get; set; }
        public string PageName { get; set; }
        public string UserName { get; set; }
        public string IpAddress { get; set; }
        public string AppId { get; set; }
        public DateTime HitDateTime { get; set; }
    }
}

