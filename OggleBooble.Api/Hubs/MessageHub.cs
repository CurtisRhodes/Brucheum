using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace OggleBooble.Api
{
    public class MessageHub : Hub
    {
        public  string SendMessage(string user, string message)
        {
            Clients.All.SendAsync("RecieveMessage", user, message);
            return "ok";
        }
    }
}