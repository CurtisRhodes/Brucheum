namespace Service1.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("job.Job")]
    public partial class Job
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Job()
        {
            JobSkills = new HashSet<JobSkill>();
            ResumeJobs = new HashSet<ResumeJob>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int JobId { get; set; }

        [Required]
        [StringLength(300)]
        public string JobTitle { get; set; }

        [Required]
        [StringLength(300)]
        public string Employer { get; set; }

        [Required]
        [StringLength(300)]
        public string Location { get; set; }

        [Column(TypeName = "date")]
        public DateTime DOE { get; set; }

        [Column(TypeName = "date")]
        public DateTime? Terminiated { get; set; }

        public string Narrative { get; set; }

        public string ReasonForLeaving { get; set; }

        public string SecretNarative { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<JobSkill> JobSkills { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ResumeJob> ResumeJobs { get; set; }
    }
}
