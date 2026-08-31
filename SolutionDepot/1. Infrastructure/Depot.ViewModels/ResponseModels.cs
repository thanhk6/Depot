using System.Collections.Generic;

namespace Depot.ViewModels
{
    public interface IResponseData { }

    public class ResponseSingleContentModel<T>
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
    }

    public class ResponsePagedContentModel<T>
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<T> Data { get; set; } = new();
        public int TotalRecords { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }

    public class ApiResult<T>
    {
        public bool IsSuccessed { get; set; }
        public string? Message { get; set; }
        public T? ResultObj { get; set; }

        public static ApiResult<T> Success(T obj, string msg = "Thành công")
        {
            return new ApiResult<T> { IsSuccessed = true, ResultObj = obj, Message = msg };
        }

        public static ApiResult<T> Failure(string msg)
        {
            return new ApiResult<T> { IsSuccessed = false, Message = msg };
        }
    }
}
