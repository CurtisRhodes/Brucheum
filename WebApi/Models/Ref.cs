namespace WebApi.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("website.Ref")]
    public partial class Ref
    {
        [Key]
        [Column(Order = 0)]
        [StringLength(3)]
        public string RefType { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(3)]
        public string RefCode { get; set; }

        [Required]
        [StringLength(250)]
        public string RefDescription { get; set; }
    }
}
