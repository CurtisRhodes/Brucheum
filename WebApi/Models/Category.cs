namespace WebApi.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("website.Category")]
    public partial class Category
    {
        [Key]
        [StringLength(300)]
        public string CategoryName { get; set; }
    }
}
