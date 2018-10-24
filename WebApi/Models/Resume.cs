namespace Service1.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("job.Resume")]
    public partial class Resume
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Resume()
        {
            ResumeJobs = new HashSet<ResumeJob>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int ResumeId { get; set; }

        public Guid? PersonId { get; set; }

        public string AddressHeader { get; set; }

        [Required]
        [StringLength(200)]
        public string JobTitle { get; set; }

        public string SkillsSummary { get; set; }

        public string Education { get; set; }

        public string Personal { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ResumeJob> ResumeJobs { get; set; }
    }
}
