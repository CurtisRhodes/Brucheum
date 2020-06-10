﻿using OggleBooble.Api.MsSqlDataContext;
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
        [HttpGet]
        [Route("api/IndexPage/GetCarouselImages")]
        public CarouselInfoModel GetCarouselImages(string root, int skip, int take, bool includeLandscape, bool includePortrait)
        {
            CarouselInfoModel carouselInfo = new CarouselInfoModel();
            try
            {
                var timer = new System.Diagnostics.Stopwatch();
                timer.Start();
                using (OggleBoobleContext db = new OggleBoobleContext())
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
        public LatestUpdatesModel GetLatestUpdatedFolders(int itemLimit, string rootFolder)
        {
            LatestUpdatesModel updatesModel = new LatestUpdatesModel();
            try
            {
                string sqlStr = "select top " + itemLimit + " max(f.Id) FolderId, f.FolderName, max(i.LastModified) LastModified, max(i2.Link) FolderImage " +
                        "from OggleBooble.ImageLink i " +
                        "join OggleBooble.CategoryFolder f on i.FolderLocation = f.Id " +
                        "join OggleBooble.ImageLink i2 on f.FolderImage = i2.Id ";
                if (rootFolder.Contains("pornsluts"))
                    sqlStr += "where f.RootFolder in ('porn','sluts') ";
                else
                    sqlStr += "where f.RootFolder not in ('porn','sluts') ";
                sqlStr += "group by f.FolderName order by LastModified desc";

                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    updatesModel.LatestUpdates = db.Database.SqlQuery<LatestUpdate>(sqlStr).ToList();
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
