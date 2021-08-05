using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Brucheum.Api
{
    [EnableCors("*", "*", "*")]
    public class IntelDesignController : ApiController
    {
        [HttpGet]
        public JobSkillsModel GetSkills()
        {
            var skillsModel = new JobSkillsModel();
            try
            {
                using (var db = new IntelDesignContext())
                {
                    skillsModel.Skills=
                        (from skils in db.JobSkills
                         join crefs in db.JobRefs on skils.SkillType equals crefs.RefCode into sr
                         from xrefs in sr.DefaultIfEmpty()
                         select new JobSkillModel
                         {
                             Id = skils.Id,
                             Name = skils.SkillName,
                             Category = skils.SkillType,
                             Proficiency = skils.Proficiency,
                             FontSize = skils.SortOrder,
                             CategoryDescription = xrefs.RefDescription == null ? "" : xrefs.RefDescription,
                             Narrative = skils.Narrative
                         }).ToList();
                }
            }
            catch (Exception ex) { skillsModel.Success= Helpers.ErrorDetails(ex) ; }
            //return skillModels.OrderBy(s => s.Name).ToList();

            return skillsModel;
        }
    }
}