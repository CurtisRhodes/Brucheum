namespace WebApi.Resume.DataContext
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class ResumeContext : DbContext
    {
        public ResumeContext() : base("name=GoDaddy") { }

        public virtual DbSet<GetaJob.DataContext.JobSkill> JobSkills { get; set; }
        public virtual DbSet<LostJob> LostJobs { get; set; }
        public virtual DbSet<Resume> Resumes { get; set; }
        public virtual DbSet<ResumeElement> ResumeElements { get; set; }
        public virtual DbSet<ResumeSection> ResumeSections { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LostJob>()
                .HasMany(e => e.JobSkills);
                //.WithRequired(e => e.PersonId)
                //.HasForeignKey(e => e.Id)
                //.WillCascadeOnDelete(false);

            modelBuilder.Entity<Resume>()
                .HasMany(e => e.ResumeElements)
                .WithRequired(e => e.Resume)
                .WillCascadeOnDelete(false);
        }
    }
    [Table("resume.Resume")]
    public partial class Resume
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Resume()
        {
            ResumeElements = new HashSet<ResumeElement>();
        }

        public string Id { get; set; }

        [Required]
        [StringLength(128)]
        public string PersonId { get; set; }

        [Required]
        [StringLength(300)]
        public string ResumeName { get; set; }

        public DateTime Created { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ResumeElement> ResumeElements { get; set; }
    }
    [Table("resume.LostJob")]
    public partial class LostJob
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public LostJob()
        {
            JobSkills = new HashSet<GetaJob.DataContext.JobSkill>();
        }

        public string Id { get; set; }

        [Required]
        [StringLength(128)]
        public string PersonId { get; set; }

        [Required]
        [StringLength(300)]
        public string JobTitle { get; set; }

        [Required]
        [StringLength(300)]
        public string Employer { get; set; }

        [Required]
        [StringLength(300)]
        public string JobLocation { get; set; }

        [Required]
        [StringLength(2)]
        public string StartMonth { get; set; }

        [Required]
        [StringLength(4)]
        public string StartYear { get; set; }

        [StringLength(2)]
        public string FiredMonth { get; set; }

        [StringLength(4)]
        public string FiredYear { get; set; }

        public string Summary { get; set; }

        public string ReasonForLeaving { get; set; }

        public string SecretNarative { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<GetaJob.DataContext.JobSkill> JobSkills { get; set; }
    }
    [Table("resume.ResumeElement")]
    public partial class ResumeElement
    {
        [Key]
        [Column(Order = 0)]
        public string ElementId { get; set; }

        [Key]
        [Column(Order = 1)]
        public string ResumeId { get; set; }

        [StringLength(3)]
        public string ElementType { get; set; }

        public int SortOrder { get; set; }

        public virtual Resume Resume { get; set; }
    }
    [Table("resume.ResumeSection")]
    public partial class ResumeSection
    {
        public string Id { get; set; }

        [Required]
        [StringLength(128)]
        public string PersonId { get; set; }

        [Required]
        [StringLength(500)]
        public string SectionTitle { get; set; }

        public string SectionContents { get; set; }
    }
}
