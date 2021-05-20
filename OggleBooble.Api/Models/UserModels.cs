using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class RegisteredUsersSuccessModel
    {
        public RegisteredUsersSuccessModel()
        {
            UserInfo = new RegisteredUser();
        }
        public RegisteredUser UserInfo { get; set; }
        public string Success { get; set; }
    }

    public class AddRegisterdUserSuccessModel{
        public string RegisterStatus { get; set; }
        public string NewVisitorId { get; set; }
        public string Success { get; set; }
    }

    public class VerifyLoginSuccessModel 
    {
        public string VisitorId { get; set; }
        public string UserName { get; set; }
        public string UserRole { get; set; }
        public string Success { get; set; }
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