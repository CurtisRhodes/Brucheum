using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OggleBooble.Api.Core
{
    //[EnableCors("*")]
    public class CaroselController : Controller
    {
        //private readonly MySqlDataContext myDbContext;
        //public CaroselController(MySqlDataContext context)
        //{
        //    myDbContext = context;
        //}

        [HttpGet]
        [Route("Carosel/GetImages")]
        //[EnableCors("*")]
        public CarouselSuccessModel GetImages(string root, int skip, int take, bool includeLandscape, bool includePortrait)
        {
            var carouselInfo = new CarouselSuccessModel();
            try
            {
                using (var db = new OggleMySqlDbContext())
                {
                    if (includeLandscape)
                    {
                        carouselInfo.Links.AddRange(db.VwCarouselItems.Where(v => v.RootFolder == root).Where(v => v.Height < v.Width)
                            .Where(v => v.Width > v.Height)
                            .OrderBy(v => v.LinkId).Skip(skip).Take(take).ToList());
                    }
                    if (includePortrait)
                    {
                        carouselInfo.Links.AddRange(db.VwCarouselItems.Where(v => v.RootFolder == root).Where(v => v.Height < v.Width)
                            .Where(v => v.Height >= v.Width)
                            .OrderBy(v => v.LinkId).Skip(skip).Take(take).ToList());
                    }
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
}
