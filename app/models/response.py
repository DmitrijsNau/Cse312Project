from pydantic import BaseModel
from typing import Any, Optional


# This class is used to standardize the response format of the API
class Response(BaseModel):
    message: Optional[str] = None  # any msg sent to user
    data: Optional[Any] = None  # data can be of any type
    err: bool  # if there is an error
    status_code: int  # HTTP status code
