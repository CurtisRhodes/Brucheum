using OggleBooble.Api.MySqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{

    [EnableCors("*", "*", "*")]
    public class IndexPageController : ApiController
    {
        int skip = 0;
        [HttpGet]
        [Route("api/IndexPage/GetCarouselImages")]
        public CarouselInfoModel GetCarouselImages(string root, int take, bool includeLandscape, bool includePortrait)
        {
            CarouselInfoModel carouselInfo = new CarouselInfoModel();
            try
            {
                var timer = new System.Diagnostics.Stopwatch();
                timer.Start();
                using (var db = new OggleBoobleMySqlContext())
                {
                    if (includeLandscape)
                        carouselInfo.Links.AddRange(db.vwCarouselImages.Where(v => v.RootFolder == root).Where(v => v.Height < v.Width)
                            .Where(v => v.Width > v.Height)
                            .OrderBy(v => v.LinkId).Skip(skip).Take(take).ToList());
                    if (includePortrait)
                        carouselInfo.Links.AddRange(db.vwCarouselImages.Where(v => v.RootFolder == root).Where(v => v.Height < v.Width)
                            .Where(v => v.Height >= v.Width)
                            .OrderBy(v => v.LinkId).Skip(skip).Take(take).ToList());
                }
                //carouselInfo.FolderCount = carouselInfo.Links.GroupBy(l => l.FolderName).Count();
                timer.Stop();
                System.Diagnostics.Debug.WriteLine("Select " + take + " from vLinks took: " + timer.Elapsed);
                carouselInfo.Success = "ok";
            }
            catch (Exception ex) { carouselInfo.Success = Helpers.ErrorDetails(ex); }
            return carouselInfo;
        }

        [HttpGet]
        [Route("api/IndexPage/GetLatestUpdatedFolders")]
        public LatestUpdatesModel GetLatestUpdatedFolders(int take, string rootFolder)
        {
            LatestUpdatesModel updatesModel = new LatestUpdatesModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    if (rootFolder.Contains("pornsluts"))
                        updatesModel.LatestTouchedGalleries = db.vwLatestTouched.
                            Where(l => l.RootFolder == "porn" || l.RootFolder == "sluts").Take(take).ToList();
                    else
                        updatesModel.LatestTouchedGalleries = db.vwLatestTouched.
                            Where(l => l.RootFolder != "porn").Where(l => l.RootFolder != "sluts").Take(take).ToList();
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
