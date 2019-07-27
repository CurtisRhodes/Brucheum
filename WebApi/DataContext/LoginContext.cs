namespace WebApi.DataContext
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.ComponentModel.DataAnnotations;
    using System.Collections.Generic;

    public partial class LoginContext : DbContext
    {
        public LoginContext()
            : base("GoDaddy") { }
        public virtual DbSet<RegisteredUser> RegisteredUsers { get; set; }
        public virtual DbSet<UserRole> UserRoles { get; set; }
        public virtual DbSet<Role> Roles { get; set; }
    }

    [Table("login.RegisteredUser")]
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

    [Table("login.UserRole")]
    public partial class UserRole
    {
        [Key]
        [Column(Order = 0)]
        public string UserName { get; set; }
        [Key]
        [Column(Order = 1)]
        public string RoleId { get; set; }
    }

    [Table("login.Role")]
    public partial class Role
    {
        [Key]
        public string RoleId { get; set; }
        public string RoleName { get; set; }
    }
}

