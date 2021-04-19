using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using static System.Net.WebRequestMethods;

namespace OggleBooble.Api.Controllers
{
    public class FtpUtilies
    {
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        public static string[] GetDirectories(string ftpPath)
        {
            IList<string> dirs = new List<string>();
            try
            {
                FtpWebRequest ftpRequest = (FtpWebRequest)WebRequest.Create(new Uri(ftpPath));
                ftpRequest.Credentials = networkCredentials;
                ftpRequest.Method = WebRequestMethods.Ftp.ListDirectory;
                FtpWebResponse response = (FtpWebResponse)ftpRequest.GetResponse();
                StreamReader streamReader = new StreamReader(response.GetResponseStream());

                string line = streamReader.ReadLine();
                while (!string.IsNullOrEmpty(line))
                {
                    dirs.Add(line);
                    line = streamReader.ReadLine();
                }
                streamReader.Close();
            }
            catch (Exception ex)
            {
                dirs.Add(Helpers.ErrorDetails(ex));
            }
            return dirs.ToArray();
        }

        private void GetDirectoryDetails(string ftpPath)
        {
            FtpWebRequest ftpRequest = (FtpWebRequest)WebRequest.Create(ftpPath);
            ftpRequest.Credentials = networkCredentials;
            ftpRequest.Method = WebRequestMethods.Ftp.ListDirectoryDetails;
            StreamReader reader = new StreamReader(ftpRequest.GetResponse().GetResponseStream());

            string pattern = @"^(\d+-\d+-\d+\s+\d+:\d+(?:AM|PM))\s+(<DIR>|\d+)\s+(.+)$";
            Regex regex = new Regex(pattern);
            IFormatProvider culture = System.Globalization.CultureInfo.GetCultureInfo("en-us");
            while (!reader.EndOfStream)
            {
                string line = reader.ReadLine();
                Match match = regex.Match(line);
                DateTime modified =
                   DateTime.ParseExact(
                       match.Groups[1].Value, "MM-dd-yy  hh:mmtt", culture, System.Globalization.DateTimeStyles.None);
                long size = (match.Groups[2].Value != "<DIR>") ? long.Parse(match.Groups[2].Value) : 0;
                string name = match.Groups[3].Value;



                Console.WriteLine(
                    "{0,-16} size = {1,9}  modified = {2}",
                    name, size, modified.ToString("yyyy-MM-dd HH:mm"));
            }
        }

        public static DateTime GetLastModified(string ftpPath)
        {
            DateTime fileDate = DateTime.MinValue;
            IList<string> fileProperties = new List<string>();
            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpPath);
                request.Method = WebRequestMethods.Ftp.GetDateTimestamp;
                request.Credentials = networkCredentials;
                FtpWebResponse response = (FtpWebResponse)request.GetResponse();

                //fileProperties.Add(response.LastModified.ToShortDateString());

                fileDate = response.LastModified;

                response.Close();
            }
            catch (Exception ex)
            {
                fileProperties.Add(Helpers.ErrorDetails(ex));
            }
            return fileDate;
        }


        public static string[] GetFiles(string ftpPath)
        {
            IList<string> ftpFiles = new List<string>();
            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpPath);
                request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;
                request.Credentials = networkCredentials;
                FtpWebResponse response = (FtpWebResponse)request.GetResponse();

                Stream responseStream = response.GetResponseStream();
                string line = "";
                StreamReader reader = new StreamReader(responseStream);
                {
                    while (!reader.EndOfStream)
                    {
                        line = reader.ReadLine();
                        if (!line.Contains("<DIR>"))
                            ftpFiles.Add(line.Substring(39, line.Length - 39));
                    }
                }
                reader.Close();
                response.Close();
            }
            catch (Exception ex)
            {
                ftpFiles.Add(Helpers.ErrorDetails(ex));
            }
            return ftpFiles.ToArray();
        }

        public static string MoveFolder(string source, string destination)
        {
            string success = "";
            try
            {
                if (!FtpUtilies.DirectoryExists(destination))
                    FtpUtilies.CreateDirectory(destination);

                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(source);
                requestDir.Credentials = networkCredentials;
                requestDir.UseBinary = true;
                requestDir.UsePassive = false;
                requestDir.KeepAlive = false;
                requestDir.Proxy = null;
                requestDir.Method = WebRequestMethods.Ftp.Rename;
                requestDir.RenameTo = destination;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                response.Close();
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        public static bool DirectoryExists(string ftpPath)
        {
            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpPath);
                request.Credentials = networkCredentials;
                request.Method = WebRequestMethods.Ftp.ListDirectory;
                FtpWebResponse response = (FtpWebResponse)request.GetResponse();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public static string CreateDirectory(string ftpPath)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(new Uri(ftpPath));
                requestDir.Credentials = networkCredentials;
                requestDir.Method = WebRequestMethods.Ftp.MakeDirectory;
                requestDir.UsePassive = true;
                requestDir.UseBinary = true;
                requestDir.KeepAlive = false;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                ftpStream.Close();
                response.Close();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string MoveFile(string source, string destination)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(source);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = WebRequestMethods.Ftp.DownloadFile;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                if (response.StatusCode != FtpStatusCode.CommandOK)
                    success = response.StatusCode.ToString();
                Stream ftpStream = response.GetResponseStream();
                success = Upload(destination, ToByteArray(ftpStream));
                if (success == "ok")
                {
                    success = DeleteFile(source);
                }
                ftpStream.Close();
                response.Close();
                requestDir = null;
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string Upload(string FileName, byte[] Image)
        {
            string success = "";
            try
            {
                FtpWebRequest clsRequest = (FtpWebRequest)WebRequest.Create(FileName);
                clsRequest.Credentials = networkCredentials;
                clsRequest.Method = WebRequestMethods.Ftp.UploadFile;
                Stream clsStream = clsRequest.GetRequestStream();
                clsStream.Write(Image, 0, Image.Length);
                clsStream.Close();
                clsStream.Dispose();
                clsRequest = null;
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        public static string DeleteFile(string fileToDelete)
        {
            string success;
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(fileToDelete);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = WebRequestMethods.Ftp.DeleteFile;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                ftpStream.Close();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string RemoveDirectory(string ftpPath)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(ftpPath);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = WebRequestMethods.Ftp.RemoveDirectory;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                ftpStream.Close();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string RenameFile(string ftpPath, string newFileName)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(new Uri(ftpPath));
                requestDir.Credentials = networkCredentials;
                requestDir.Method = WebRequestMethods.Ftp.Rename;
                requestDir.RenameTo = newFileName;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                ftpStream.Close();
                response.Close();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string RenameFolder(string ftpPath, string newName)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(ftpPath);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = WebRequestMethods.Ftp.Rename;
                requestDir.RenameTo = newName;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                ftpStream.Close();
                response.Close();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        static Byte[] ToByteArray(Stream stream)
        {
            MemoryStream ms = new MemoryStream();
            byte[] chunk = new byte[4096];
            int bytesRead;
            while ((bytesRead = stream.Read(chunk, 0, chunk.Length)) > 0)
            {
                ms.Write(chunk, 0, bytesRead);
            }

            return ms.ToArray();
        }
    }

    [EnableCors("*", "*", "*")]
    public class CacheController : ApiController
    {
        public string Get()
        {
            string success;
            try
            {
                //AppContext
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

    }

}