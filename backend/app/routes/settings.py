from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/settings", tags=["settings"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class NotificationUpdate(BaseModel):
    email: bool = None
    slack: bool = None
    push: bool = None

@router.get("/notifications")
async def get_notifications(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"settings": user.notification_settings, "rules": user.alert_rules}

@router.patch("/notifications")
async def update_notifications(user_id: int, update: NotificationUpdate, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current = dict(user.notification_settings or {"email": True, "slack": True, "push": False})
    if update.email is not None: current["email"] = update.email
    if update.slack is not None: current["slack"] = update.slack
    if update.push is not None: current["push"] = update.push
    
    user.notification_settings = current
    db.commit()
    return user.notification_settings

@router.post("/rules")
async def add_rule(user_id: int, rule: Dict[str, Any], db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    rules = list(user.alert_rules or [])
    rules.append(rule)
    user.alert_rules = rules
    db.commit()
    return rules

@router.delete("/rules/{rule_idx}")
async def delete_rule(user_id: int, rule_idx: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    rules = list(user.alert_rules or [])
    if 0 <= rule_idx < len(rules):
        rules.pop(rule_idx)
        user.alert_rules = rules
        db.commit()
    return rules
