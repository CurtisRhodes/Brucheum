using OggleBooble.Api.DataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace OggleBooble.Api.Controllers
{
    public class CarouselController : ApiController
    {
        [HttpGet]
        public CarouselInfoModel GetLinks(string root, int skip, int take)
        {
            CarouselInfoModel carouselInfo = new CarouselInfoModel();
            try
            {
                var timer = new System.Diagnostics.Stopwatch();
                timer.Start();
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    carouselInfo.Links = db.Database.SqlQuery<CarouselItemModel>(
                        "select f.RootFolder, f.Id FolderId, p.Id ParentId, g.Id LinkId, f.FolderName, p.FolderName FolderPath, g.Link " +
                        "from OggleBooble.CategoryImageLink c " +
                        "join OggleBooble.CategoryFolder f on c.ImageCategoryId = f.Id " +
                        "join OggleBooble.CategoryFolder p on f.Parent = p.Id " +
                        "join OggleBooble.ImageLink g on c.ImageLinkId = g.Id " +
                        "where f.RootFolder = @param1 and g.Width > g.Height"
                        , new SqlParameter("param1", root)).OrderBy(m => m.LinkId).Skip(skip).Take(take).ToList();

                    //var x = db.CategoryFolders.Where(f => f.Id == 1).FirstOrDefault();
                    //carouselInfo.Links =
                    //    (from c in db.CategoryImageLinks
                    //     join f in db.CategoryFolders on c.ImageCategoryId equals f.Id
                    //     join p in db.CategoryFolders on f.Parent equals p.Id
                    //     join g in db.ImageLinks on c.ImageLinkId equals g.Id
                    //     where f.RootFolder == root
                    //     select new CarouselItemModel()
                    //     {
                    //         RootFolder = f.RootFolder,
                    //         FolderId = f.Id,
                    //         ParentId = p.Id,
                    //         LinkId = g.Id,
                    //         FolderName = f.FolderName,
                    //         FolderPath = p.FolderName,
                    //         Link = g.Link.StartsWith("http") ? g.Link : g.ExternalLink
                    //     }).OrderBy(m => m.LinkId).Skip(skip).Take(take).ToList();
                }
                carouselInfo.FolderCount = carouselInfo.Links.GroupBy(l => l.FolderName).Count();
                timer.Stop();
                System.Diagnostics.Debug.WriteLine("Select " + take + " from vLinks took: " + timer.Elapsed);
                carouselInfo.Success = "ok";
            }
            catch (Exception ex)
            {
                carouselInfo.Success = Helpers.ErrorDetails(ex);
            }
            return carouselInfo;
        }

    }
}
