namespace WebApi.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("website.Visitor")]
    public partial class Visitor
    {
        [Key]
        [Column(Order = 0)]
        [StringLength(50)]
        public string IPAddress { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(50)]
        public string App { get; set; }

        public DateTime? VisitDate { get; set; }
    }
}
