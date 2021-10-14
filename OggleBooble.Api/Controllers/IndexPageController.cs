using OggleBooble.Api.MSSqlDataContext;
using OggleBooble.Api.MySqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Runtime.InteropServices;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class CarouselController : ApiController
    {
        [HttpGet]
        //[Route("api/IndexPage/GetCarouselImages")]
        public CarouselInfoModel GetCarouselImages(string root, int skip, int take, bool includeLandscape, bool includePortrait)
        {
            CarouselInfoModel carouselInfo = new CarouselInfoModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    if (includeLandscape)
                    {
                        carouselInfo.Links.AddRange(db.VwCarouselImages.Where(v => v.RootFolder == root).Where(v => v.Height < v.Width)
                            .Where(v => v.Width > v.Height)
                            .OrderBy(v => v.LinkId).Skip(skip).Take(take).ToList());
                    }
                    if (includePortrait)
                        carouselInfo.Links.AddRange(db.VwCarouselImages.Where(v => v.RootFolder == root).Where(v => v.Height < v.Width)
                            .Where(v => v.Height >= v.Width)
                            .OrderBy(v => v.LinkId).Skip(skip).Take(take).ToList());
                }
                carouselInfo.Success = "ok";
            }
            catch (Exception ex)
            {
                carouselInfo.Success = Helpers.ErrorDetails(ex);
            }
            return carouselInfo;
        }

        [HttpGet]
        public CarouselInfoModel RefreshCache(string root, int cacheCount)
        {
            CarouselInfoModel carouselInfo = new CarouselInfoModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    List<VwCarouselItem> allCarouselItems;
                    allCarouselItems = db.VwCarouselImages.Where(v => v.RootFolder == root)
                        .Where(v => v.Width > v.Height)
                        .OrderBy(v => v.LinkId).ToList();
                    int itemCount = allCarouselItems.Count();
                    if (itemCount > cacheCount)
                    {
                        Random random = new Random();
                        int rnd = random.Next(0, itemCount);
                        for (int i = 0; i < cacheCount; i++)
                        {
                            carouselInfo.Links.Add(allCarouselItems[rnd]);
                            rnd = random.Next(0, itemCount);
                        }
                    }
                    else
                        carouselInfo.Links = allCarouselItems;
                }
                carouselInfo.Success = "ok";
            }
            catch (Exception ex)
            {
                carouselInfo.Success = Helpers.ErrorDetails(ex);
            }
            return carouselInfo;
        }

        [HttpPut]
        public CarouselInfoModel LoadCache(string cacheName)
        {
            CarouselInfoModel carouselInfo = new CarouselInfoModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                }
                carouselInfo.Success = "ok";
            }
            catch (Exception ex)
            {
                carouselInfo.Success = Helpers.ErrorDetails(ex);
            }
            return carouselInfo;
        }
    }

    [EnableCors("*", "*", "*")]
    public class IndexPageController : ApiController
    {
        [HttpGet]
        //[Route("api/IndexPage/GetLatestUpdatedFolders")]
        public LatestUpdatesModel GetLatestUpdatedFolders(int take, string root)
        {
            LatestUpdatesModel updatesModel = new LatestUpdatesModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    updatesModel.LatestTouchedGalleries = db.LatestTouchedGalleries.Where(v => v.RootFolder == root).Take(take).ToList();
                }
                updatesModel.Success = "ok";
            }
            catch (Exception ex) { updatesModel.Success = Helpers.ErrorDetails(ex); }
            return updatesModel;
        }

        [HttpGet]
        //[Route("api/IndexPage/GetRandomGalleries")]
        public RandomGalleriesModel GetRandomGalleries(int take, string root) {
            RandomGalleriesModel randomGalleries = new RandomGalleriesModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var temp1 = (from f in db.CategoryFolders
                                 join i in db.ImageFiles on f.FolderImage equals i.Id
                                 join f2 in db.CategoryFolders on i.FolderId equals f2.Id
                                 where f.RootFolder == root && f.SubFolders == 0
                                 select new RandomGalleyModel()
                                 {
                                     FolderId = f.Id,
                                     FolderPath = f2.FolderPath,
                                     FileName = i.FileName,
                                     FolderName = f.FolderName
                                 }).ToList();
                    foreach (RandomGalleyModel m in temp1) {
                        m.RandomGuid = Guid.NewGuid().ToString();                    
                    }
                    randomGalleries.RandomGalleries = temp1.OrderBy(x => x.RandomGuid).Skip(0).Take(take).ToList();
                }
                randomGalleries.Success = "ok";
            }
            catch (Exception ex) { randomGalleries.Success = Helpers.ErrorDetails(ex); }
            return randomGalleries;
        }
    }
}
