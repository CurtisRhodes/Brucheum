using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OggleBooble.Api.Core
{
    [Route("api/[controller]")]
    [ApiController]
    public class CaroselController : ControllerBase
    {
        private readonly MySqlDataContext myDbContext;
        //private readonly IHostEnvironment _env;

        public CaroselController(MySqlDataContext context, IHostEnvironment env)
        {
            myDbContext = context;
            //_env = env;
        }

        [HttpGet]
        //[Route("api/IndexPage/GetCarouselImages")]
        public CarouselSuccessModel GetCarouselImages(string root, int skip, int take, bool includeLandscape, bool includePortrait)
        {
            var carouselInfo = new CarouselSuccessModel();
            try
            {
                {
                    if (includeLandscape)
                    {
                        carouselInfo.Links.AddRange(myDbContext.VwCarouselItems.Where(v => v.RootFolder == root).Where(v => v.Height < v.Width)
                            .Where(v => v.Width > v.Height)
                            .OrderBy(v => v.LinkId).Skip(skip).Take(take).ToList());
                    }
                    if (includePortrait)
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
