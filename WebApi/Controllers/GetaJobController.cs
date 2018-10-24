using Service1.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Results;

namespace Service1.Controllers
{
    [System.Web.Http.Cors.EnableCors("*", "*", "*")]
    public class GetaJobController : ApiController
    {
        [HttpGet]
        public Resume Get(int resumeId)
        {
            using (var db = new GetaJobContext())
            {
                return db.Resumes.Where(r => r.ResumeId == resumeId).FirstOrDefault();
            }
        }

        [HttpPost]
        public string InsertResume(Resume resume)
        {
            string success = "ono";
            try
            {
                using (var db = new GetaJobContext())
                {
                    db.Resumes.Add(resume);
                    db.SaveChanges();
                    success = resume.ResumeId.ToString();
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }

        [HttpPut]
        public string UpdateResume(Resume resume)
        {
            string success = "ono";
            try
            {
                using (var db = new GetaJobContext())
                {
                    var _resume = db.Resumes.Where(r => r.ResumeId == resume.ResumeId).FirstOrDefault();
                    if (_resume != null)
                    {
                        _resume = resume;
                        db.SaveChanges();
                        success = "ok";
                    }
                    else
                        success = "resume id not found";
                }

            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }
    }

    [System.Web.Http.Cors.EnableCors("*", "*", "*")]
    public class SkillsController : ApiController
    {
        [HttpGet]
        public Skill Get(int skillId)
        {
            using (var db = new GetaJobContext())
            {
                return db.Skills.Where(s => s.SkillId == skillId).FirstOrDefault();
            }
        }

        [HttpPost]
        public string InsertSkill(Skill skill)
        {
            string success = "ono";
            try
            {
                using (var db = new GetaJobContext())
                {
                    db.Skills.Add(skill);
                    db.SaveChanges();
                    success = skill.SkillId.ToString();
                }
            }
            catch (Exception ex)
            {
                success = "ERROR: " + ex.Message;
            }
            return success;
        }

        [HttpPut]
        public string UpdateSkill(Skill skill)
        {
            string success = "ono";
            try
            {
                using (var db = new GetaJobContext())
                {
                    var _skill = db.Skills.Where(s => s.SkillId == skill.SkillId).FirstOrDefault();
                    if (_skill != null)
                    {
                        _skill = skill;
                        db.SaveChanges();
                        success = "ok";
                    }
                    else
                        success = "skil id not found";
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }
    }


}
