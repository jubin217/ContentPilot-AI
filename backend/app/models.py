import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from app.database import Base

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    category = Column(String, default="General")  # e.g., Project, Internship, Course, Exam, General
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WritingStyle(Base):
    __tablename__ = "writing_styles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Default Style")
    sample_texts = Column(Text, nullable=True)  # Comma/newline separated text examples the user wrote
    analyzed_profile = Column(Text, nullable=True)  # AI-generated description of style rules
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class GenerationHistory(Base):
    __tablename__ = "generation_history"

    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(Text, nullable=False)
    format = Column(String, nullable=False)  # LinkedIn Post, Resume Bullet, etc.
    style_or_action = Column(String, nullable=False)  # Corporate, Technical, Rewrite: Shorten, etc.
    output_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
