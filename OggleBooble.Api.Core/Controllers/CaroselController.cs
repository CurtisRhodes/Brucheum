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
    [EnableCors("*")]
    [ApiController]
    public class CaroselController : ControllerBase
    {
        private readonly MySqlDataContext myDbContext;
        public CaroselController(MySqlDataContext context)
        {
            myDbContext = context;
        }

        [HttpGet]
        [Route("Carosel/GetImages")]
        public CarouselSuccessModel GetImages(string root, int skip, int take, bool includeLandscape, bool includePortrait)
        {
            var carouselInfo = new CarouselSuccessModel();
            try
            {
                if (includeLandscape)
                {
                    carouselInfo.Links.AddRange(myDbContext.VwCarouselItems.Where(v => v.RootFolder == root).Where(v => v.Height < v.Width)
                        .Where(v => v.Width > v.Height)
                        .OrderBy(v => v.LinkId).Skip(skip).Take(take).ToList());
                }
                if (includePortrait)
                {
                    carouselInfo.Links.AddRange(myDbContext.VwCarouselItems.Where(v => v.RootFolder == root).Where(v => v.Height < v.Width)
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
    }
}
