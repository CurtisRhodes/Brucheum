namespace Service1.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("job.JobSkill")]
    public partial class JobSkill
    {
        public int JobSkillId { get; set; }

        public int? SkillId { get; set; }

        public int? JobId { get; set; }

        public string Narrative { get; set; }

        public virtual Job Job { get; set; }

        public virtual Skill Skill { get; set; }
    }
}
