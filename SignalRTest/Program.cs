using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.AspNet.SignalR.Client;
using Microsoft.Owin.Hosting;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(SignalRHost.Startup))]



namespace SignalRHost
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }

//    System.Reflection.TargetInvocationException
//  HResult = 0x80131604
//  Message=Exception has been thrown by the target of an invocation.
//  Source=mscorlib
//  StackTrace:
//   at System.RuntimeMethodHandle.InvokeMethod(Object target, Object[] arguments, Signature sig, Boolean constructor)
//   at System.Reflection.RuntimeMethodInfo.UnsafeInvokeInternal(Object obj, Object[] parameters, Object[] arguments)
//   at System.Reflection.RuntimeMethodInfo.Invoke(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
//   at Microsoft.Owin.Hosting.ServerFactory.ServerFactoryAdapter.Create(IAppBuilder builder)
//   at Microsoft.Owin.Hosting.Engine.HostingEngine.StartServer(StartContext context)
//   at Microsoft.Owin.Hosting.Engine.HostingEngine.Start(StartContext context)
//   at Microsoft.Owin.Hosting.Starter.DirectHostingStarter.Start(StartOptions options)
//   at Microsoft.Owin.Hosting.Starter.HostingStarter.Start(StartOptions options)
//   at Microsoft.Owin.Hosting.WebApp.StartImplementation(IServiceProvider services, StartOptions options)
//   at Microsoft.Owin.Hosting.WebApp.Start(StartOptions options)
//   at Microsoft.Owin.Hosting.WebApp.Start(String url)
//   at SignalRHost.Program.Main(String[] args) in F:\Devl\SignalRTest\Program.cs:line 37

//Inner Exception 1:
//HttpListenerException: Failed to listen on prefix 'http://localhost:40395/' because it conflicts with an existing registration on the machine.

    class Program
    {
        static void Main(string[] args)
        {

            Console.Write("wait");
            Console.ReadLine();

            string url = "http://localhost:8077";
            using (WebApp.Start(url))
            {
                Console.WriteLine("Server running on {0}", url);
                Console.ReadLine();
            }

            System.Console.Read();
        }
    }
}