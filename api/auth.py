import hashlib
import hmac
import json
from urllib.parse import parse_qsl
from typing import Optional, Dict, Any
from config.settings import settings

def validate_init_data(init_data: str) -> Optional[Dict[str, Any]]:
    """
    Validates the initData string from Telegram WebApp.
    Returns the user data if valid, None otherwise.
    """
    if not settings.BOT_TOKEN:
        return None

    try:
        parsed_data = dict(parse_qsl(init_data))
    except ValueError:
        return None

    if "hash" not in parsed_data:
        return None

    received_hash = parsed_data.pop("hash")
    
    # Data-check-string is a chain of all received fields, sorted alphabetically
    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(parsed_data.items())
    )

    secret_key = hmac.new(
        key=b"WebAppData", 
        msg=settings.BOT_TOKEN.encode(), 
        digestmod=hashlib.sha256
    ).digest()

    calculated_hash = hmac.new(
        key=secret_key, 
        msg=data_check_string.encode(), 
        digestmod=hashlib.sha256
    ).hexdigest()

    if calculated_hash == received_hash:
        # Valid! Return user info
        if "user" in parsed_data:
            return json.loads(parsed_data["user"])
        return parsed_data
    
    return None
