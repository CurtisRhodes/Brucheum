namespace WebApi.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("website.Hit")]
    public partial class Hit
    {
        public int Id { get; set; }

        [StringLength(50)]
        public string IPAddress { get; set; }

        [Required]
        [StringLength(50)]
        public string App { get; set; }

        [StringLength(300)]
        public string PageName { get; set; }

        [StringLength(300)]
        public string Details { get; set; }

        public DateTime? BeginView { get; set; }

        [StringLength(200)]
        public string ViewDuration { get; set; }
    }
}
