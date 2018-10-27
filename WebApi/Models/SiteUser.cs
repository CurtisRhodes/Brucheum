namespace WebApi.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("website.SiteUser")]
    public partial class SiteUser
    {
        [Key]
        [Column(Order = 0)]
        [StringLength(300)]
        public string DisplayName { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(300)]
        public string Website { get; set; }

        [StringLength(300)]
        public string FirstName { get; set; }

        [StringLength(300)]
        public string LastName { get; set; }

        [StringLength(300)]
        public string Email { get; set; }

        [StringLength(200)]
        public string PhoneNumber { get; set; }

        [StringLength(300)]
        public string Avatar { get; set; }

        public short? Pin { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? LastModified { get; set; }

        [StringLength(200)]
        public string FaceBookId { get; set; }

        [StringLength(200)]
        public string PasswordHash { get; set; }
    }
}
