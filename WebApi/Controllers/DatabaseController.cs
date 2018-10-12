using Service1.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;

namespace Service1.Controllers
{
    [EnableCors("*", "*", "*")]
    public class RefController : ApiController
    {
        [HttpGet]
        public IList<RefModel> Get(string refType)
        {
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    List<RefModel> list = (from refss in db.Refs
                                      where refss.RefType == refType
                                      select new RefModel() { RefType = refType, RefCode = refss.RefCode, RefDescription = refss.RefDescription }).ToList();
                    return list;
                }

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex.InnerException);
            }
        }

        [HttpPost]
        public JsonResult<RefModel> Post(RefModel refModel)
        {
            try
            {
                if (refModel.RefDescription.Length > 3)
                {
                    using (GoDaddyContext db = new GoDaddyContext())
                    {
                        Ref @ref = new Ref();
                        @ref.RefType = "CAT";
                        @ref.RefCode = GetRefCode(refModel.RefDescription);
                        @ref.RefDescription = refModel.RefDescription;
                        db.Refs.Add(@ref);
                        db.SaveChanges();
                        refModel.RefCode = @ref.RefCode;
                        refModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                refModel.Success = ex.Message;
            }
            return Json(refModel);
        }

        [HttpPut]
        public JsonResult<RefModel> Put(RefModel refModel)
        {
            //HTTP405: BAD METHOD -The HTTP verb used is not supported.
            //(XHR)OPTIONS - http://localhost:40395//api/Ref/Put

            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    Ref @ref = db.Refs.Where(r => r.RefCode == refModel.RefCode).First();
                    @ref.RefDescription = refModel.RefDescription;
                    db.SaveChanges();
                    refModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                refModel.Success = ex.Message;
            }
            return Json(refModel);
        }

        /// helper apps
        private string GetRefCode(string refDescription)
        {
            var refCode = refDescription.Substring(0, 3).ToUpper();
            ///todo: test for existing. go into newkey loop
            return refCode;
        }

        public class RefModel
        {
            public string RefType { get; set; }
            public string RefCode { get; set; }
            public string RefDescription { get; set; }
            public string Success { get; set; }
        }
    }

    [EnableCors("*", "*", "*")]
    public class HitCounterController : ApiController
    {
        [HttpGet]
        public bool Verifiy(string ipAddress)
        {
            bool exists = false;
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    VisitorModel visitor = (from visitors in db.Visitors
                                            where visitors.IPAddress == ipAddress
                                            select new VisitorModel() { IPAddress = visitors.IPAddress }).FirstOrDefault();
                    if (visitor != null)
                        exists = true;
                }

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex.InnerException);
            }
            return exists;
        }

        [HttpPost]
        public int AddVisitorAndHit([FromBody]string ipAddress)
        {
            int hitId = 0;
            try
            {
                //var ipAddress = System.Text.Encoding.UTF32.GetString(bytes);
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    Visitor visitor = new Visitor();
                    visitor.IPAddress = ipAddress;
                    db.Visitors.Add(visitor);
                    db.SaveChanges();

                    Hit hit = new Hit();
                    hit.IPAddress = ipAddress;
                    hit.BeginVisit = DateTime.Now;
                    db.Hits.Add(hit);
                    db.SaveChanges();
                    hitId = hit.Id;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
                //hitId = -1;
            }
            return hitId;
        }

        [HttpPut]
        public int AddHit([FromBody]string ipAddress)
        {
            int hitId = 0;
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    Hit hit = new Hit();
                    hit.IPAddress = ipAddress;
                    hit.BeginVisit = DateTime.Now;
                    db.Hits.Add(hit);
                    db.SaveChanges();
                    hitId = hit.Id;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
                //hitId = -1;
            }
            return hitId;
        }

        [HttpGet]
        public string EndVisit(int hitId)
        {
            var success = "on no";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {

                    Hit hit = db.Hits.Where(h => h.Id == hitId).First();
                    hit.EndVisit = DateTime.Now;
                    db.Hits.Add(hit);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class CategoryController : ApiController
    {
        [HttpPost]
        public string Post(string newCategory)
        {
            string success = "oh no";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    Category category = new Category();
                    category.CategoryName = newCategory;
                    db.Categories.Add(category);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = "ERROR: " + ex.Message;
            }
            return success;
        }

        [HttpPut]
        public string Put(string oldCategoryName, string newCategoryName)
        {
            string success = "oh no";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    Category category = db.Categories.Where(c=>c.CategoryName==oldCategoryName).First();
                    category.CategoryName = newCategoryName;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = "ERROR: " + ex.Message;
            }
            return success;
        }

        [HttpGet]
        public string[] Get()
        {
            var catlist = new List<string>();
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                     catlist = db.Categories.Select(c=>c.CategoryName).ToList();
                }


            }
            catch (Exception ex)
            {
                catlist.Add(ex.Message);
            }
            return catlist.ToArray();
        }
    }
}
