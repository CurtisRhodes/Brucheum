﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Service1.Models
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class curtisGodaddyEntities : DbContext
    {
        public curtisGodaddyEntities()
            : base("name=curtisGodaddyEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Job> Jobs { get; set; }
        public virtual DbSet<JobSkill> JobSkills { get; set; }
        public virtual DbSet<Resume> Resumes { get; set; }
        public virtual DbSet<ResumeJob> ResumeJobs { get; set; }
        public virtual DbSet<Skill> Skills { get; set; }
    }
}
