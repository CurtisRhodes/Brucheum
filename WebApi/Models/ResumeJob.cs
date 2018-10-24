namespace Service1.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("job.ResumeJob")]
    public partial class ResumeJob
    {
        [Key]
        [Column("ResumeJob")]
        public int ResumeJob1 { get; set; }

        public int? ResumeId { get; set; }

        public int? JobId { get; set; }

        public virtual Job Job { get; set; }

        public virtual Resume Resume { get; set; }
    }
}
