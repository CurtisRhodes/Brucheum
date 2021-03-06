﻿using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.DataContext;
using WebApi.Models;

namespace WebApi
{

    [EnableCors("*", "*", "*")]
    public class JobRefController : ApiController
    {
        [HttpGet]
        public List<JobRefModel> Get(string refType)
        {
            var refs = new List<JobRefModel>();
            try
            {
                using (var db = new GetaJobContext())
                {
                    IList<JobRef> dbrefs = db.JobRefs.Where(r => r.RefType == refType).OrderBy(r => r.RefDescription).ToList();
                    foreach (JobRef r in dbrefs)
                    {
                        refs.Add(new JobRefModel() { RefCode = r.RefCode, RefDescription = r.RefDescription });
                    }
                }
            }
            catch (Exception ex)
            {
                refs.Add(new JobRefModel() { RefCode = "ERR", RefType = "ERR", RefDescription = Helpers.ErrorDetails(ex) });
            }
            return refs;
        }

        [HttpPost]
        public JobRefModel Post(JobRefModel refModel)
        {
            try
            {
                using (var db = new GetaJobContext())
                {
                    var @ref = new JobRef();
                    @ref.RefType = refModel.RefType;
                    @ref.RefCode = GetUniqueRefCode(refModel.RefDescription, db);
                    @ref.RefDescription = refModel.RefDescription;

                    db.JobRefs.Add(@ref);
                    db.SaveChanges();
                    refModel.RefCode = @ref.RefCode;
                    refModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                refModel.Success = ex.Message;
            }
            return refModel;
        }

        [HttpPut]
        public string Put(JobRefModel refModel)
        {
            string success = "";
            try
            {
                using (var db = new GetaJobContext())
                {
                    JobRef @ref = db.JobRefs.Where(r => r.RefCode == refModel.RefCode).First();
                    @ref.RefDescription = refModel.RefDescription;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = ex.Message; }
            return success;
        }

        /// helper apps
        private string GetUniqueRefCode(string refDescription, DataContext.GetaJobContext db)
        {
            if (refDescription.Length < 3)
                refDescription = refDescription.PadRight(3, 'A');

            var refCode = refDescription.Substring(0, 3).ToUpper();
            JobRef exists = new JobRef();
            while (exists != null)
            {
                exists = db.JobRefs.Where(r => r.RefCode == refCode).FirstOrDefault();
                if (exists != null)
                {
                    char nextLastChar = refCode.Last();
                    if (nextLastChar == ' ') { nextLastChar = 'A'; }
                    if (nextLastChar == 'Z')
                        nextLastChar = 'A';
                    else
                        nextLastChar = (char)(((int)nextLastChar) + 1);
                    refCode = refCode.Substring(0, 2) + nextLastChar;
                }
            }
            return refCode;
        }
    }

    [EnableCors("*", "*", "*")]
    public class JobSearchController : ApiController
    {
        [HttpGet]
        public JobSearchModel GetOne(string jobSearchId)
        {
            var jobSearch = new JobSearchModel();
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var dbJobSearch = db.JobSearches.Where(s => s.Id == jobSearchId).FirstOrDefault();
                    if (dbJobSearch != null)
                    {
                        jobSearch.Id = jobSearchId;
                        jobSearch.SearchName = dbJobSearch.SearchName;
                        jobSearch.PersonId = dbJobSearch.PersonId;
                        jobSearch.Initiated = dbJobSearch.Initiated.ToShortDateString();
                        if (dbJobSearch.Abandoned != null)
                            jobSearch.Abandoned = dbJobSearch.Abandoned.Value.ToShortDateString();
                    }
                }
            }
            catch (Exception ex) { jobSearch.SearchName = Helpers.ErrorDetails(ex); }
            return jobSearch;
        }
        [HttpGet]
        public List<JobSearchModel> GetMany(string personId)
        {
            var jobSearchModels = new List<JobSearchModel>();
            try
            {
                using (var db = new GetaJobContext())
                {
                    var dbJobSearches = db.JobSearches.Where(s => s.PersonId == personId).ToList();
                    foreach (JobSearch jobSearch in dbJobSearches)
                    {
                        //jobSearchModels.Add(new JobSearchModel()
                        JobSearchModel jobSearchModel = new JobSearchModel();
                        jobSearchModel.Id = jobSearch.Id;
                        jobSearchModel.SearchName = jobSearch.SearchName;
                        jobSearchModel.PersonId = jobSearch.PersonId;
                        jobSearchModel.Initiated = jobSearch.Initiated.ToShortDateString();
                        if (jobSearch.Abandoned != null)
                            jobSearchModel.Abandoned = jobSearch.Abandoned.Value.ToShortDateString();
                        jobSearchModels.Add(jobSearchModel);
                    }
                }
            }
            catch (Exception ex) { jobSearchModels.Add(new JobSearchModel() { SearchName = Helpers.ErrorDetails(ex) }); }
            return jobSearchModels;
        }
        [HttpGet]
        public JobSearchModel GetActive(string personId, string placeholder)
        {
            var activeSobSearchModel = new JobSearchModel();
            try
            {
                using (var db = new GetaJobContext())
                {
                    var dbJobSearch = db.JobSearches.Where(s => s.PersonId == personId && s.Abandoned == null).FirstOrDefault();
                    if (dbJobSearch == null)
                        activeSobSearchModel.SearchName = "No Active Search Found";
                    else
                    {
                        activeSobSearchModel.Id = dbJobSearch.Id;
                        activeSobSearchModel.SearchName = dbJobSearch.SearchName;
                        activeSobSearchModel.PersonId = dbJobSearch.PersonId;
                        activeSobSearchModel.Initiated = dbJobSearch.Initiated.ToShortDateString();
                    }
                }
            }
            catch (Exception ex) { activeSobSearchModel.SearchName = Helpers.ErrorDetails(ex); }
            return activeSobSearchModel;
        }
        [HttpPost]
        public string Post(JobSearchModel searchModel)
        {
            string success = "ERROR: ";
            try
            {
                var jobSearch = new JobSearch();
                jobSearch.Id = Guid.NewGuid().ToString();
                jobSearch.PersonId = searchModel.PersonId;
                jobSearch.SearchName = searchModel.SearchName;
                jobSearch.Initiated = DateTime.Parse(searchModel.Initiated);

                using (GetaJobContext db = new GetaJobContext())
                {
                    db.JobSearches.Add(jobSearch);
                    db.SaveChanges();
                    success = jobSearch.Id.ToString();
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }
        [HttpPut]
        public string Put(JobSearchModel searchModel)
        {
            string success = "";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    JobSearch dbJobSearch = db.JobSearches.Where(j => j.Id == searchModel.Id).FirstOrDefault();
                    if (dbJobSearch != null)
                    {
                        dbJobSearch.Initiated = DateTime.Parse(searchModel.Initiated);
                        if (searchModel.Abandoned != null)
                            dbJobSearch.Abandoned = DateTime.Parse(searchModel.Abandoned);
                        dbJobSearch.SearchName = searchModel.SearchName;
                        db.SaveChanges();
                        success = "ok";
                    }
                    else
                        success = "Id: " + searchModel.Id + "  not found";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class JobListingController : ApiController
    {
        [HttpGet]
        public JobListingModel GetOne(string jobListingId)
        {
            var jobListing = new JobListingModel();
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var dbJobListing = db.JobListings.Where(s => s.Id == jobListingId).FirstOrDefault();
                    if (dbJobListing != null)
                    {
                        jobListing.Id = dbJobListing.Id;
                        jobListing.PostedDate = dbJobListing.PostedDate.ToShortDateString();
                        jobListing.JobTitle = dbJobListing.JobTitle;
                        jobListing.AgentId = dbJobListing.AgentId;
                        if (dbJobListing.AgentId != null) {
                            jobListing.AgentId = dbJobListing.AgentId;
                            jobListing.AgencyId = dbJobListing.Agent.AgencyId;
                        }

                        jobListing.TargetCompanyId = dbJobListing.TargetCompanyId;


                        jobListing.Comments = dbJobListing.Comments;
                        jobListing.Status = dbJobListing.ListingStatusRef;
                        jobListing.Rate = dbJobListing.Rate;
                        jobListing.EmploymentType = dbJobListing.EmploymentTypeRef;
                        jobListing.Distance = dbJobListing.Distance;
                        jobListing.ListingSource = dbJobListing.ListingSourceRef;
                        jobListing.Desirability = dbJobListing.DesirabilityRef;
                        jobListing.Fit = dbJobListing.FitnessRef;
                        jobListing.Location = dbJobListing.JobLocation;
                    }
                }
            }
            catch (Exception ex) { jobListing.Id = Helpers.ErrorDetails(ex); }
            return jobListing;
        }
        [HttpGet]
        public List<JobListingModel> GetMany(string jobSearchId, string kludge)
        {
            var jobListingModels = new List<JobListingModel>();
            try
            {
                using (var db = new GetaJobContext())
                {
                    var dbJobListings = db.JobListings.Where(l => l.JobSearchId == jobSearchId).ToList();
                    foreach (JobListing dbListing in dbJobListings)
                    {
                        // just need items for list
                        JobListingModel jobListingModel = new JobListingModel();
                        jobListingModel.Id = dbListing.Id;
                        jobListingModel.PostedDate = dbListing.PostedDate.ToShortDateString();
                        jobListingModel.Location = dbListing.JobLocation;

                        var dbstatusRef = db.JobRefs.Where(r => r.RefCode == dbListing.ListingStatusRef).FirstOrDefault();
                        if (dbstatusRef != null)
                            jobListingModel.StatusText = dbstatusRef.RefDescription;

                        //dbJobListing.JobSearchId = newJobListing.JobSearchId;
                        //jobListingModel.JobTitle = listing.JobTitle;
                        //jobListingModel.AgentId = listing.AgentId;
                        //jobListingModel.TargetCompanyId = listing.TargetCompanyId;
                        //jobListingModel.Comments = listing.Comments;
                        //jobListingModel.Rate = listing.Rate;
                        //jobListingModel.Status = listing.ListingStatusRef;
                        //jobListingModel.EmploymentType = listing.EmploymentTypeRef;
                        //jobListingModel.Distance = listing.Distance;
                        //jobListingModel.ListingSource = listing.ListingSourceRef;
                        //jobListingModel.Desirability = listing.DesirabilityRef;
                        //jobListingModel.Fit = listing.FitnessRef;

                        jobListingModels.Add(jobListingModel);
                    }
                }
            }
            catch (Exception ex) { jobListingModels.Add(new JobListingModel() { Id = Helpers.ErrorDetails(ex) }); }
            return jobListingModels;
        }
        [HttpPost]
        public string Post(JobListingModel newJobListing)
        {
            string success = "ERROR: ";
            try
            {
                JobListing dbJobListing = new JobListing();
                dbJobListing.Id = Guid.NewGuid().ToString();
                dbJobListing.JobSearchId = newJobListing.JobSearchId;
                dbJobListing.PostedDate = DateTime.Parse(newJobListing.PostedDate);
                dbJobListing.JobTitle = newJobListing.JobTitle;
                dbJobListing.AgentId = newJobListing.AgentId;
                dbJobListing.TargetCompanyId = newJobListing.TargetCompanyId;
                dbJobListing.Comments = newJobListing.Comments;
                dbJobListing.Rate = newJobListing.Rate;
                dbJobListing.Distance = newJobListing.Distance;
                dbJobListing.JobLocation = newJobListing.Location;
                dbJobListing.ListingStatusRef = newJobListing.Status;
                dbJobListing.EmploymentTypeRef = newJobListing.EmploymentType;
                dbJobListing.ListingSourceRef = newJobListing.ListingSource;
                dbJobListing.DesirabilityRef = newJobListing.Desirability;
                dbJobListing.FitnessRef = newJobListing.Fit;

                using (GetaJobContext db = new GetaJobContext())
                {
                    db.JobListings.Add(dbJobListing);
                    db.SaveChanges();
                    success = dbJobListing.Id.ToString();
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }
        [HttpPut]
        public string Put(JobListingModel editJobListing)
        {
            string success = "";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    JobListing dbJobListing = db.JobListings.Where(j => j.Id == editJobListing.Id).FirstOrDefault();
                    if (dbJobListing != null)
                    {
                        dbJobListing.PostedDate = DateTime.Parse(editJobListing.PostedDate);
                        dbJobListing.JobLocation = editJobListing.Location;
                        dbJobListing.JobTitle = editJobListing.JobTitle;
                        dbJobListing.AgentId = editJobListing.AgentId;
                        dbJobListing.TargetCompanyId = editJobListing.TargetCompanyId;
                        dbJobListing.Comments = editJobListing.Comments;
                        dbJobListing.ListingStatusRef = editJobListing.Status;
                        dbJobListing.Rate = editJobListing.Rate;
                        dbJobListing.EmploymentTypeRef = editJobListing.EmploymentType;
                        dbJobListing.Distance = editJobListing.Distance;
                        dbJobListing.ListingSourceRef = editJobListing.ListingSource;
                        dbJobListing.DesirabilityRef = editJobListing.Desirability;
                        dbJobListing.FitnessRef = editJobListing.Fit;

                        db.SaveChanges();
                        success = "ok";
                    }
                    else
                        success = "Id: " + editJobListing.Id + "  not found";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class JobActivityController : ApiController
    {

    }

    [EnableCors("*", "*", "*")]
    public class JobSkillController : ApiController
    {
        [HttpGet]
        public JobSkillModel Get(string skillId)
        {
            var skill = new JobSkillModel();
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var dbSkill = db.JobSkills.Where(s => s.Id == skillId).FirstOrDefault();
                    if (dbSkill != null)
                    {
                        skill.Name = dbSkill.SkillName;
                        skill.Category = dbSkill.SkillType;
                        skill.Proficiency = dbSkill.Proficiency;
                        if (dbSkill.Proficiency != null)
                        {
                            skill.ProficiencyDescription = db.JobRefs.Where(r => r.RefCode == dbSkill.Proficiency).FirstOrDefault().RefDescription;
                        }
                        skill.FontSize = dbSkill.SortOrder;
                        skill.Narrative = dbSkill.Narrative;
                    }
                }
            }
            catch (Exception ex) { skill.Name = Helpers.ErrorDetails(ex); }
            return skill;
        }

        [HttpGet]
        public List<JobSkillModel> Get()
        {
            var skillModels = new List<JobSkillModel>();
            try
            {
                using (var db = new GetaJobContext())
                {
                    skillModels =
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
            catch (Exception ex) { skillModels.Add(new JobSkillModel() { Name = Helpers.ErrorDetails(ex) }); }
            return skillModels.OrderBy(s => s.Name).ToList();
        }

        [HttpPost]
        public string Post(JobSkillModel newSkill)
        {
            string success = "";
            try
            {
                var dbSkill = new JobSkill();
                dbSkill.Id = Guid.NewGuid().ToString();
                dbSkill.Narrative = newSkill.Narrative;
                dbSkill.SkillName = newSkill.Name;
                dbSkill.Proficiency = newSkill.Proficiency;
                dbSkill.SortOrder = newSkill.FontSize;
                dbSkill.SkillType = newSkill.Category;

                using (GetaJobContext db = new GetaJobContext())
                {
                    db.JobSkills.Add(dbSkill);
                    db.SaveChanges();
                    success = dbSkill.Id;
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(JobSkillModel editedSkill)
        {
            string success = "";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var dbSkill = db.JobSkills.Where(j => j.Id == editedSkill.Id).FirstOrDefault();
                    dbSkill.SkillName = editedSkill.Name;
                    dbSkill.SkillType = editedSkill.Category;
                    dbSkill.Narrative = editedSkill.Narrative;
                    dbSkill.Proficiency = editedSkill.Proficiency;
                    dbSkill.SortOrder = editedSkill.FontSize;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class HeadHunterController : ApiController
    {
        [HttpGet]
        public AgentModel GetOne(string Id)
        {
            var agent = new AgentModel();
            using (GetaJobContext db = new GetaJobContext())
            {
                var dbAgent = db.Agents.Where(a => a.Id == Id).FirstOrDefault();
                if (dbAgent == null)
                    agent.FName = "not found";
                else
                {
                    agent.FName = dbAgent.Person.FName;
                    agent.LName = dbAgent.Person.LName;
                    agent.Cell = dbAgent.Person.CellPhone;
                    agent.Email = dbAgent.Person.Email;
                    agent.Phone = dbAgent.Person.OfficePhone;
                    agent.AgencyId = dbAgent.AgencyId;
                }
            }
            return agent;
        }
        [HttpGet]
        public List<AgentModel> GetMany(string agencyId, string patch)
        {
            var agents = new List<AgentModel>();
            using (var db = new GetaJobContext())
            {
                var dbAgents = db.Agents.Where(a => a.AgencyId == agencyId).ToList();
                foreach (Agent dbAgent in dbAgents)
                {
                    agents.Add(new AgentModel()
                    {
                        Id = dbAgent.Id,
                        FName = dbAgent.Person.FName,
                        LName = dbAgent.Person.LName,
                        Cell = dbAgent.Person.CellPhone,
                        Email = dbAgent.Person.Email,
                        Phone = dbAgent.Person.OfficePhone,
                        AgencyId = dbAgent.AgencyId
                    });
                }
            }
            return agents;
        }

        [HttpPost]
        public string Post(AgentModel agentModel)
        {
            string success = "ERROR: ";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    Person person = new Person()
                    {
                        Id = Guid.NewGuid().ToString(),
                        FName = agentModel.FName,
                        LName = agentModel.LName,
                        CellPhone = agentModel.Cell,
                        OfficePhone = agentModel.Phone,
                        Email = agentModel.Email
                    };
                    db.People.Add(person);

                    Agent agent = new Agent()
                    {
                        Id = Guid.NewGuid().ToString(),
                        PersonId = person.Id,
                        AgencyId = agentModel.AgencyId
                    };

                    db.Agents.Add(agent);
                    db.SaveChanges();
                    success = agent.Id;
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }
        
        [HttpPut]
        public string Put(AgentModel agentModel)
        {
            string success = "";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    Agent agent = db.Agents.Where(a => a.Id == agentModel.Id).FirstOrDefault();
                    //agent.AgencyId

                    Person person = db.People.Where(p => p.Id == agent.PersonId).FirstOrDefault();
                    person.FName = agentModel.FName;
                    person.LName = agentModel.LName;
                    person.CellPhone = agentModel.Cell;
                    person.OfficePhone = agentModel.Phone;
                    person.Email = agentModel.Email;

                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class AgencyController : ApiController
    {
        [HttpGet]
        public AgencyModel GetOne(string Id)
        {
            var agency = new AgencyModel();
            using (GetaJobContext db = new GetaJobContext())
            {
                var dbAgency = db.Agencies.Where(a => a.Id == Id).FirstOrDefault();
                if (dbAgency == null)
                    agency.CompanyName = "not found";
                else
                {
                    agency.CompanyName = dbAgency.JobCompany.CompanyName;
                    agency.CompanyAddress = dbAgency.JobCompany.CompanyAddress;
                    agency.CompanyZip = dbAgency.JobCompany.CompanyZip;
                    agency.Email = dbAgency.JobCompany.Email;
                    agency.Phone = dbAgency.JobCompany.OfficePhone;
                    agency.Website = dbAgency.JobCompany.Website;
                }
            }
            return agency;
        }

        [HttpGet]
        public List<AgencyModel> GetMany()
        {
            var agencys = new List<AgencyModel>();
            try
            {
                using (var db = new GetaJobContext())
                {
                    var dbAgencies = db.Agencies.ToList();
                    foreach (Agency dbAgency in dbAgencies)
                    {
                        var agency = new AgencyModel();
                        agency.Id = dbAgency.Id;
                        agency.CompanyName = dbAgency.JobCompany.CompanyName;
                        agency.CompanyAddress = dbAgency.JobCompany.CompanyAddress;
                        //CompanyZip = dbAgency.JobCompany.CompanyZip,
                        //Email = dbAgency.JobCompany.Email,
                        //Phone = dbAgency.JobCompany.OfficePhone,
                        //Website = dbAgency.JobCompany.Website
                        foreach (Agent dbAgent in dbAgency.Agents)
                        {
                            var agent = new AgentModel();
                            agent.FName = dbAgent.Person.FName;
                            agent.LName = dbAgent.Person.LName;
                            agency.Agents.Add(agent);
                        }
                        agencys.Add(agency);
                    }
                }
            }
            catch (Exception ex) { agencys.Add(new AgencyModel() { CompanyName = Helpers.ErrorDetails(ex) }); }
            return agencys;
        }
        [HttpPost]
        public string Post(AgencyModel agencyModel)
        {
            string success = "ERROR: ";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    JobCompany jobCompany = new JobCompany()
                    {
                        Id = Guid.NewGuid().ToString(),
                        CompanyTypeRef = "AGE",
                        CompanyName = agencyModel.CompanyName,
                        CompanyAddress = agencyModel.CompanyAddress,
                        CompanyZip = agencyModel.CompanyZip,
                        Email = agencyModel.Email,
                        OfficePhone = agencyModel.Phone,
                        Website = agencyModel.Website
                    };
                    db.JobCompanies.Add(jobCompany);
                    db.SaveChanges();

                    Agency agency = new Agency();
                    agency.Id = Guid.NewGuid().ToString();
                    agency.CompanyId = jobCompany.Id;

                    db.Agencies.Add(agency);
                    db.SaveChanges();
                    success = agency.Id;
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }
        [HttpPut]
        public string Put(AgencyModel agencyModel)
        {
            string success = "";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    Agency agency = db.Agencies.Where(a => a.Id == agencyModel.Id).FirstOrDefault();

                    JobCompany jobCompany = db.JobCompanies.Where(j => j.Id == agency.CompanyId).FirstOrDefault();
                    jobCompany.CompanyName = agencyModel.CompanyName;
                    jobCompany.CompanyAddress = agencyModel.CompanyAddress;
                    jobCompany.Email = agencyModel.Email;
                    jobCompany.OfficePhone = agencyModel.Phone;
                    jobCompany.CompanyZip = agencyModel.CompanyZip;
                    jobCompany.Website = agencyModel.Website; ;

                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }
}

