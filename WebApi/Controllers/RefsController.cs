using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.MySqDataContext;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class RefController : ApiController
    {
        [HttpGet]
        public RefModel Get(string refType)
        {
            var refs = new RefModel();
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    IList<Ref> dbrefs = db.Refs.Where(r => r.RefType == refType).OrderBy(r => r.RefDescription).ToList();
                    foreach (Ref r in dbrefs)
                    {
                        refs.refItems.Add(new RefItem()
                        {
                            RefCode = r.RefCode,
                            RefType = r.RefType,
                            RefDescription = r.RefDescription
                        });
                    }
                    refs.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                refs.Success = Helpers.ErrorDetails(ex);
            }
            return refs;
        }

        [HttpGet]
        public RefItem Get(string refCode, string refType)
        {
            var refItem = new RefItem();
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    Ref dbref = db.Refs.Where(r => r.RefType == refType && r.RefCode == refCode).FirstOrDefault();
                    if (dbref == null)
                        refItem.Success = "ref not found";
                    else
                    {
                        refItem.RefCode = dbref.RefCode;
                        refItem.RefDescription = dbref.RefDescription;
                        refItem.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                refItem.Success = Helpers.ErrorDetails(ex);
            }
            return refItem;
        }

        [HttpPost]
        public string Post(RefItem refItem)
        {
            string success = "";
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    Ref @ref = new Ref();
                    @ref.RefType = refItem.RefType;
                    @ref.RefCode = GetUniqueRefCode(refItem.RefDescription, db);
                    @ref.RefDescription = refItem.RefDescription;

                    db.Refs.Add(@ref);
                    db.SaveChanges();
                    //refModel.RefCode = @ref.RefCode;
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }

        [HttpPut]
        public string Put(RefItem refItem)
        {
            string success = "";
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    Ref @ref = db.Refs.Where(r => r.RefCode == refItem.RefCode).First();
                    @ref.RefDescription = refItem.RefDescription;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = ex.Message; }
            return success;
        }

        /// helper apps
        private string GetUniqueRefCode(string refDescription, OggleBoobleMySqContext db)
        {
            if (refDescription.Length < 3)
                refDescription = refDescription.PadRight(3, 'A');

            var refCode = refDescription.Substring(0, 3).ToUpper();
            Ref exists = new Ref();
            while (exists != null)
            {
                exists = db.Refs.Where(r => r.RefCode == refCode).FirstOrDefault();
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
}