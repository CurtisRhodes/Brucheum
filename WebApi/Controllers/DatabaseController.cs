using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using WebApi.Models;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class RefController : ApiController
    {
        [HttpGet]
        public IList<Ref> Get(string refType)
        {
            //var list = new List<RefModel>();
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    return db.Refs.Where(r => r.RefType == refType).OrderBy(r => r.RefDescription).ToList();
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
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    Ref @ref = new Ref();
                    @ref.RefType = refModel.RefType;
                    @ref.RefCode = GetUniqueRefCode(refModel.RefDescription);
                    @ref.RefDescription = refModel.RefDescription;

                    db.Refs.Add(@ref);
                    db.SaveChanges();
                    refModel.RefCode = @ref.RefCode;
                    refModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                refModel.Success = ex.Message;
            }
            return Json(refModel);
        }

        [HttpPut]
        public string Put(RefModel refModel)
        {
            string success = "ono";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    Ref @ref = db.Refs.Where(r => r.RefCode == refModel.RefCode).First();
                    @ref.RefDescription = refModel.RefDescription;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = ex.Message; }
            return success;
        }

        /// helper apps
        private string GetUniqueRefCode(string refDescription)
        {
            var refCode = refDescription.Substring(0, 3).ToUpper();
            ///todo: test for existing. go into newkey loop
            return refCode;
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
                    Category category = db.Categories.Where(c => c.CategoryName == oldCategoryName).First();
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
                    catlist = db.Categories.Select(c => c.CategoryName).ToList();
                }
            }
            catch (Exception ex)
            {
                catlist.Add(ex.Message);
            }
            return catlist.ToArray();
        }
    }

    [EnableCors("*", "*", "*")]
    public class RoleController : ApiController
    {
        [HttpPost]
        public string AddRole(RoleModel roleModel)
        {
            string success = "";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    var newRole = new AspNetRole();
                    newRole.Id = Guid.NewGuid().ToString();
                    newRole.Name = roleModel.Name;
                    db.AspNetRoles.Add(newRole);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }

        [HttpGet]
        public IList<RoleModel> Get()
        {   // finally a day later I figured out that because the generated model AspNetRole has foreign key notations which were causing this to fail
            var list = new List<RoleModel>();
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    var roles = db.AspNetRoles.ToList();
                    foreach (AspNetRole r in roles)
                    {
                        list.Add(new RoleModel() { Name = r.Name, Id = r.Id });
                    }
                }
            }
            catch (Exception ex)
            {
                list.Add(new RoleModel() { Name = ex.Message });
                //throw new Exception(ex.Message, ex.InnerException);
            }
            return list;
        }

        [HttpPut]
        public string Put(RoleModel roleModel)
        {
            string success = "ono";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    AspNetRole @role = db.AspNetRoles.Where(r => r.Id == roleModel.Id).First();
                    @role.Name = roleModel.Name;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = ex.Message; }
            return success;
        }

    }

}



