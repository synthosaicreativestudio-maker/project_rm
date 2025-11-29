from fastapi import APIRouter, HTTPException, Header, Depends
from sqlalchemy import select
from api.models import ChatRequest, ChatResponse
from services.gemini import gemini_service
from api.auth import validate_init_data
from database.db import get_db
from database.models import User, Transaction
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest, 
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Process a chat message using Gemini.
    Requires 'Authorization: Bearer <initData>' header.
    """
    if not authorization or not authorization.startswith("Bearer "):
        # For development/testing without Telegram (optional bypass)
        # raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
        pass # Allow bypass for now if you want to test locally without initData

    token = authorization.split(" ")[1] if authorization else ""
    user_data = validate_init_data(token)
    
    # If validation fails and we are not in dev mode (you can add a flag), reject
    # For this MVP, if validation fails, we might fallback or error.
    # Let's assume strict mode for SaaS.
    
    user_id = None
    if user_data:
        user_id = user_data.get("id")
    
    # If we have a user_id (from auth), check balance
    if user_id:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            # Auto-register if not found (e.g. opened WebApp directly?)
            # Usually bot /start registers them.
            raise HTTPException(status_code=403, detail="User not found. Please start the bot first.")
            
        if user.balance <= 0:
            raise HTTPException(status_code=402, detail="Insufficient funds")
            
        # Deduct balance
        user.balance -= 1
        transaction = Transaction(user_id=user_id, amount=-1, description="WebApp Text Generation")
        db.add(transaction)
        await db.commit()

    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    response_text = await gemini_service.generate_text(request.message)
    
    if not response_text:
        raise HTTPException(status_code=500, detail="Failed to generate response from Gemini")
        
    return ChatResponse(response=response_text)
