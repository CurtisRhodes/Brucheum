using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace OggleBooble.Api.Controllers
{
    public class RolesController : ApiController
    {
        [HttpGet]
        [Route("api/Roles/LoadChooseBox")]
        public UsersRoleModel LoadChooseBox(string option)
        {
            var usersRoleModel = new UsersRoleModel();

            try
            {
                using (var mdb = new MySqlDataContext.OggleBoobleMySqContext())
                {
                    if (option == "allUsers")
                    {
                        var oggleBoobleUsers = mdb.RegisteredUsers.ToList();
                        foreach (MySqlDataContext.RegisteredUser user in oggleBoobleUsers)
                        {
                            usersRoleModel.RegisteredUsers.Add(new UsersModel()
                            {
                                UserNames = user.UserName,
                                VisitorId = user.VisitorId
                            });
                        }
                        usersRoleModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                usersRoleModel.Success = Helpers.ErrorDetails(ex);
            }
            return usersRoleModel;

        }

        [HttpGet]
        [Route("api/Roles/GetUserRoles")]
        public UsersRoleModel GetUserRoles(string roleType)
        {
            var usersRoleModel = new UsersRoleModel();

            try
            {
                using (var mdb = new MySqlDataContext.OggleBoobleMySqContext())
                {
                    if (roleType == "allUsers")
                    {
                        var oggleBoobleUsers = mdb.RegisteredUsers.ToList();

                        foreach (MySqlDataContext.RegisteredUser user in oggleBoobleUsers)
                        {
                            usersRoleModel.RegisteredUsers.Add(new UsersModel()
                            {
                                UserNames = user.UserName,
                                VisitorId = user.VisitorId
                            });
                        }
                        usersRoleModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                usersRoleModel.Success = Helpers.ErrorDetails(ex);
            }
            return usersRoleModel;

        }


    }
}
