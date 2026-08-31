using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DepotSolution.ViewModels.Common
{
    public interface IResponseData
    {
    }
    public class PaginationSet<T> where T : class, new()
    {
        public int page { set; get; }
        public int count
        {
            get
            {
                return (lists != null) ? lists.Count() : 0;
            }
        }
        public int totalpage { set; get; } = 1;
        public int totalcount { set; get; } = 0;
        public int maxpage { set; get; }
        public IEnumerable<T> lists { set; get; }
    }

    public class ResponseSingleContentModel<T>
    {

        public string Message { get; set; } = string.Empty;

        public int StatusCode { set; get; } = 200;

        public T? Data { set; get; }
    }

    public class ResponseMultiContentModels<T>
    {
        public string Message { get; set; } = string.Empty;

        public int StatusCode { set; get; } = 200;

        public List<T> Data { set; get; }
    }
    public class AppsetingUrl
    {
        public string PosUrl { set; get; }
    }
}
