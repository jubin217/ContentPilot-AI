from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Journal schemas
class JournalEntryBase(BaseModel):
    text: str
    category: Optional[str] = "General"

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntry(JournalEntryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Style schemas
class WritingStyleBase(BaseModel):
    name: str
    sample_texts: Optional[str] = ""

class WritingStyleCreate(WritingStyleBase):
    pass

class WritingStyle(WritingStyleBase):
    id: int
    analyzed_profile: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# AI Generation Request/Response schemas
class GenerateRequest(BaseModel):
    text: str
    format: str  # LinkedIn Post, Resume Bullet, Cover Letter Paragraph, GitHub README, Professional Email, Instagram Caption, Project Description, Interview Answer, Twitter/X Thread
    style: str   # Corporate, Inspirational, Technical, Humble, Thought Leadership, Viral, or Custom
    custom_style_id: Optional[int] = None

class GenerateResponse(BaseModel):
    output_text: str

class RewriteRequest(BaseModel):
    text: str
    action: str  # Shorten, Expand, Professionalize, Simplify, Improve Grammar, Add Storytelling

class RewriteResponse(BaseModel):
    output_text: str

class ToneRequest(BaseModel):
    text: str

class ToneResponse(BaseModel):
    detected_tone: str
    professional_reply: str

class PredictEngagementRequest(BaseModel):
    text: str

class EngagementScores(BaseModel):
    hook: int = Field(..., ge=0, le=10)
    storytelling: int = Field(..., ge=0, le=10)
    engagement: int = Field(..., ge=0, le=10)
    feedback: str

class PredictEngagementResponse(BaseModel):
    scores: EngagementScores

class CareerCopilotRequest(BaseModel):
    achievement: str

class CareerCopilotResponse(BaseModel):
    linkedin_post: str
    resume_update: str
    github_project_idea: str
    interview_questions: List[str]

# Generation History
class HistoryResponse(BaseModel):
    id: int
    original_text: str
    format: str
    style_or_action: str
    output_text: str
    created_at: datetime

    class Config:
        from_attributes = True

# Digest request schema
class DigestRequest(BaseModel):
    entry_ids: List[int]
    digest_type: str

