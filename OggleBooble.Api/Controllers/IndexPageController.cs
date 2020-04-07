using OggleBooble.Api.DataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace OggleBooble.Api.Controllers
{
    public class IndexPageController : ApiController
    {
        [HttpGet]
        public LatestUpdatesModel GetLatestUpdates(int items)
        {
            LatestUpdatesModel updatesModel = new LatestUpdatesModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    updatesModel.LatestUpdates = db.Database.SqlQuery<LatestUpdate>(
                        "select top " + items + " max(f.Id) FolderId, f.FolderName, max(i.LastModified) LastModified, max(i2.Link) FolderImage " +
                        "from OggleBooble.ImageLink i " +
                        "join OggleBooble.CategoryFolder f on i.FolderLocation = f.Id " +
                        //"join OggleBooble.CategoryFolderDetail d on i.FolderLocation = d.FolderId " +
                        "join OggleBooble.ImageLink i2 on f.FolderImage = i2.Id " +
                        "group by f.FolderName " +
                        "order by LastModified desc").ToList();
                }
                updatesModel.Success = "ok";
            }
            catch (Exception ex)
            {
                updatesModel.Success = Helpers.ErrorDetails(ex);
            }
            return updatesModel;
        }
    }
}
