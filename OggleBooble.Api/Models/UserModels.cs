using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    //public class RegisteredUsersSuccessModel
    //{
    //    public RegisteredUsersSuccessModel(){
    //        RegisteredUsers = new List<UsersModel>();
    //    }
    //    public List<UsersModel> RegisteredUsers { get; set; }
    //    public string Success { get; set; }
    //}

    public class RegisteredUserModel
    {
        public string VisitorId { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Status { get; set; }
        public string UserRole { get; set; }
        public string UserSettings { get; set; }
        public int UserCredits { get; set; }
        public DateTime Created { get; set; }
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