import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.database import engine, get_db, Base
from app import models, schemas, ai_service

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ContentPilot AI API Server",
    description="Backend API for ContentPilot AI Chrome Extension, powered by nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4",
    version="1.0.0"
)

# Configure CORS
# Allow requests from Chrome Extension (origin chrome-extension://*) and localhost dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For browser extensions, wildcard is standard during local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Core Endpoints

@app.post("/api/generate", response_model=schemas.GenerateResponse)
async def generate(request: schemas.GenerateRequest, db: Session = Depends(get_db)):
    # Check if there is a custom writing style requested
    personal_profile = None
    if request.custom_style_id:
        style_db = db.query(models.WritingStyle).filter(models.WritingStyle.id == request.custom_style_id).first()
        if style_db:
            personal_profile = style_db.analyzed_profile

    # Call AI generation
    try:
        output_text = await ai_service.generate_content(
            text=request.text,
            format_type=request.format,
            style=request.style,
            personal_profile=personal_profile
        )
        
        # Save to history
        history_entry = models.GenerationHistory(
            original_text=request.text,
            format=request.format,
            style_or_action=request.style,
            output_text=output_text
        )
        db.add(history_entry)
        db.commit()
        
        return schemas.GenerateResponse(output_text=output_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rewrite", response_model=schemas.RewriteResponse)
async def rewrite(request: schemas.RewriteRequest, db: Session = Depends(get_db)):
    try:
        output_text = await ai_service.rewrite_content(
            text=request.text,
            action=request.action
        )
        
        # Save to history
        history_entry = models.GenerationHistory(
            original_text=request.text,
            format="Rewrite",
            style_or_action=f"Rewrite: {request.action}",
            output_text=output_text
        )
        db.add(history_entry)
        db.commit()
        
        return schemas.RewriteResponse(output_text=output_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tone", response_model=schemas.ToneResponse)
async def detect_tone(request: schemas.ToneRequest):
    try:
        tone, reply = await ai_service.detect_tone_and_reply(text=request.text)
        return schemas.ToneResponse(detected_tone=tone, professional_reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict-engagement", response_model=schemas.PredictEngagementResponse)
async def predict_engagement_scores(request: schemas.PredictEngagementRequest):
    try:
        scores_data = await ai_service.predict_engagement(text=request.text)
        scores = schemas.EngagementScores(**scores_data)
        return schemas.PredictEngagementResponse(scores=scores)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/career-copilot", response_model=schemas.CareerCopilotResponse)
async def get_career_suggestions(request: schemas.CareerCopilotRequest):
    try:
        data = await ai_service.career_copilot(achievement=request.achievement)
        return schemas.CareerCopilotResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Achievement Journal Endpoints

@app.get("/api/journal", response_model=List[schemas.JournalEntry])
def get_journal(db: Session = Depends(get_db)):
    return db.query(models.JournalEntry).order_by(models.JournalEntry.created_at.desc()).all()

@app.post("/api/journal", response_model=schemas.JournalEntry)
def create_journal_entry(entry: schemas.JournalEntryCreate, db: Session = Depends(get_db)):
    db_entry = models.JournalEntry(text=entry.text, category=entry.category)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.delete("/api/journal/{entry_id}")
def delete_journal_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    db.delete(db_entry)
    db.commit()
    return {"detail": "Journal entry deleted successfully"}

@app.post("/api/journal/generate-digest")
async def generate_journal_digest(request: schemas.DigestRequest, db: Session = Depends(get_db)):
    # Fetch specified journal entries
    entries = db.query(models.JournalEntry).filter(models.JournalEntry.id.in_(request.entry_ids)).all()
    if not entries:
        raise HTTPException(status_code=404, detail="No valid journal entries found for digest generation")
    
    combined_achievements = "\n".join([f"- [{e.category}] {e.text}" for e in entries])
    
    system_prompt = (
        "You are ContentPilot AI. You take a collection of raw professional achievements, courses, or events "
        "and combine them into a single coherent document. Follow the requested output type instructions closely."
    )
    
    type_instructions = {
        "LinkedIn Post": "Draft an engaging, formatted LinkedIn update summarizing these accomplishments. Use a storytelling format with emojis.",
        "Portfolio Summary": "Write a cohesive paragraph summarizing these achievements for a personal website portfolio section.",
        "Resume Summary": "Synthesize these achievements into 2-3 polished, action-oriented resume bullet points."
    }
    
    instruction = type_instructions.get(request.digest_type, "Summarize these achievements professionally.")
    
    user_prompt = (
        f"Output Type: {request.digest_type}\n"
        f"Instruction: {instruction}\n"
        f"List of achievements:\n{combined_achievements}\n\n"
        f"Provide the final synthesized summary. Output only the content without notes or framing."
    )
    
    try:
        output_text = await ai_service.call_llm(system_prompt, user_prompt, max_tokens=1000)
        return {"output_text": output_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Writing Style Endpoints

@app.get("/api/style", response_model=List[schemas.WritingStyle])
def get_styles(db: Session = Depends(get_db)):
    return db.query(models.WritingStyle).all()

@app.post("/api/style", response_model=schemas.WritingStyle)
async def create_or_update_style(style: schemas.WritingStyleCreate, db: Session = Depends(get_db)):
    # Check if a style with this name already exists
    db_style = db.query(models.WritingStyle).filter(models.WritingStyle.name == style.name).first()
    
    # Analyze writing style using AI
    try:
        analyzed_profile = await ai_service.analyze_writing_style(sample_texts=style.sample_texts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Writing style analysis failed: {str(e)}")
        
    if db_style:
        db_style.sample_texts = style.sample_texts
        db_style.analyzed_profile = analyzed_profile
    else:
        db_style = models.WritingStyle(
            name=style.name,
            sample_texts=style.sample_texts,
            analyzed_profile=analyzed_profile
        )
        db.add(db_style)
        
    db.commit()
    db.refresh(db_style)
    return db_style

# History Endpoint

@app.get("/api/history", response_model=List[schemas.HistoryResponse])
def get_history(db: Session = Depends(get_db)):
    return db.query(models.GenerationHistory).order_by(models.GenerationHistory.created_at.desc()).limit(50).all()

# Root check
@app.get("/")
def read_root():
    return {"status": "online", "model": ai_service.HF_MODEL}

