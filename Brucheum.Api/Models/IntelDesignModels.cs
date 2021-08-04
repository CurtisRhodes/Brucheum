using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Bruchueum.Api
{
    public class JobSkillsModel
    {
        public JobSkillsModel() {
            Skills = new List<JobSkillModel>();
        }
        public List<JobSkillModel> Skills { get; set; }
        public string Success { get; set; }
    }

    public class JobSkillModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string CategoryDescription { get; set; }
        public string Proficiency { get; set; }
        public string ProficiencyDescription { get; set; }
        public string FontSize { get; set; }
        public string Narrative { get; set; }
    }
}