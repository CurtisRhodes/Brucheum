using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class RankerController : ApiController
    {
        [HttpGet]
        public ImageRankerModelContainer LoadRankerImages(string rootFolder, int skip, int take)
        {
            ImageRankerModelContainer imageRankerModelContainer = new ImageRankerModelContainer();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    imageRankerModelContainer.RankerLinks =
                        (from i in db.VwLinks
                         where i.RootFolder == rootFolder
                         where i.Orientation == "P"
                         select new ImageRankerModel()
                         {
                             FolderId = i.FolderId,
                             LinkId = i.LinkId,
                             Link = i.FileName,
                             FolderName = i.SrcFolder
                         }).OrderBy(i => i.LinkId).Skip(skip).Take(take).ToList();
                    imageRankerModelContainer.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                imageRankerModelContainer.Success = Helpers.ErrorDetails(ex);
            }
            return imageRankerModelContainer;
        }

        [HttpPost]
        public string InsertVote(RankerVoteModel vote)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.RankerVotes.Add(new RankerVote()
                    {
                        PkId = Guid.NewGuid().ToString(),
                        Winner = vote.Winner,
                        Looser = vote.Looser,
                        VisitorId = vote.VisitorId,
                        Occured = DateTime.Now
                    });
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }
}

