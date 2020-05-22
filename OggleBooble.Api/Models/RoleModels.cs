using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class RegisteredUsersSuccessModel
    {
        public RegisteredUsersSuccessModel(){
            RegisteredUsers = new List<UsersModel>();
        }
        public List<UsersModel> RegisteredUsers { get; set; }
        public string Success { get; set; }
    }

    public class UsersModel
    {
        public string UserName { get; set; }
        public string VisitorId { get; set; }
    }

    public class UserRolesSuccessModel
    {
        public UserRolesSuccessModel()
        {
            RoleNames = new List<string>();
        }
        public List<string> RoleNames { get; set; }
        public string Success { get; set; }
    }

}