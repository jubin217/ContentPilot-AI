import os
import re
from huggingface_hub import AsyncInferenceClient

HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL = os.getenv("HF_MODEL", "nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4")

client = AsyncInferenceClient(
    token=HF_TOKEN
)

async def call_llm(system_prompt: str, user_prompt: str, max_tokens: int = 1000) -> str:
    try:
        response = await client.chat_completion(
            model=HF_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=max_tokens,
            temperature=0.7
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        print(f"Error calling Hugging Face: {e}")
        raise RuntimeError(f"Hugging Face Inference Error: {str(e)}")

async def generate_content(text: str, format_type: str, style: str, personal_profile: str = None) -> str:
    system_prompt = (
        "You are ContentPilot AI, a premium writing assistant. You transform raw notes, achievements, "
        "or thoughts into highly polished, professional copy. Focus on impact, clarity, and readability."
    )
    if personal_profile:
        system_prompt += f"\n\nAdhere strictly to the user's personal writing style profile:\n{personal_profile}"

    user_prompt = (
        f"Format: {format_type}\n"
        f"Style: {style}\n"
        f"Raw input/thought:\n\"\"\"\n{text}\n\"\"\"\n\n"
        f"Convert the raw input into a complete, professional {format_type} matching the requested style. "
        f"Provide only the final text, do not include introduction or conversation before/after the content."
    )

    return await call_llm(system_prompt, user_prompt, max_tokens=800)

async def rewrite_content(text: str, action: str) -> str:
    system_prompt = (
        "You are an expert editor. Rewrite the text according to the requested editing action. "
        "Preserve the core meaning but adjust the length, structure, tone, or grammar as specified. "
        "Output ONLY the revised text. Do not include quotes around the output or explanatory notes."
    )

    action_instructions = {
        "Shorten": "Make the text concise and to the point, removing filler words and keeping only core information.",
        "Expand": "Add professional detail, flesh out ideas, and enhance the vocabulary.",
        "Professionalize": "Make the tone highly formal, business-appropriate, and refined. Remove slang or casual phrases.",
        "Simplify": "Explain ideas using simple, clear language that is easy to understand, avoiding technical jargon.",
        "Improve Grammar": "Correct all grammar, punctuation, and phrasing issues while keeping the original length and style.",
        "Add Storytelling": "Introduce narrative hooks, build a story-like progression (situation, action, outcome) and make the text engaging."
    }

    instruction = action_instructions.get(action, f"Modify the text by applying the {action} style.")

    user_prompt = (
        f"Action: {action}\n"
        f"Instruction: {instruction}\n"
        f"Original text:\n\"\"\"\n{text}\n\"\"\"\n\n"
        f"Provide the rewritten text now."
    )

    return await call_llm(system_prompt, user_prompt, max_tokens=800)

async def detect_tone_and_reply(text: str) -> tuple[str, str]:
    system_prompt = (
        "You are an AI communication assistant. Analyze the emotional tone of the input text (e.g. Frustrated, "
        "Happy, Anxious, Serious, Angry, Pleased, Confused). Then, draft a professional and constructive response "
        "that addresses the situation described in the input. Format your response exactly as:\n"
        "TONE: [Detected Tone]\n"
        "REPLY: [Professional Reply]"
    )

    user_prompt = f"Analyze and reply to this text:\n\"\"\"\n{text}\n\"\"\""
    output = await call_llm(system_prompt, user_prompt, max_tokens=600)

    # Parse output
    tone = "Neutral"
    reply = output

    tone_match = re.search(r"TONE:\s*(.*?)(?=\nREPLY:|$)", output, re.IGNORECASE | re.DOTALL)
    reply_match = re.search(r"REPLY:\s*(.*)", output, re.IGNORECASE | re.DOTALL)

    if tone_match:
        tone = tone_match.group(1).strip()
    if reply_match:
        reply = reply_match.group(1).strip()
    
    # Clean up formatting brackets if any
    tone = tone.strip("[]")
    reply = reply.strip("[]")

    return tone, reply

async def predict_engagement(text: str) -> dict:
    system_prompt = (
        "You are an expert social media manager. Grade the provided text on three criteria: Hook, Storytelling, "
        "and Engagement. For each category, assign an integer score from 0 to 10. Also provide a short feedback "
        "paragraph with suggestions for improvement. Format your output exactly as:\n"
        "HOOK: [0-10]\n"
        "STORYTELLING: [0-10]\n"
        "ENGAGEMENT: [0-10]\n"
        "FEEDBACK: [Suggestions for improvement]"
    )

    user_prompt = f"Analyze the following draft:\n\"\"\"\n{text}\n\"\"\""
    output = await call_llm(system_prompt, user_prompt, max_tokens=600)

    scores = {"hook": 5, "storytelling": 5, "engagement": 5, "feedback": output}

    hook_match = re.search(r"HOOK:\s*(\d+)", output, re.IGNORECASE)
    story_match = re.search(r"STORYTELLING:\s*(\d+)", output, re.IGNORECASE)
    eng_match = re.search(r"ENGAGEMENT:\s*(\d+)", output, re.IGNORECASE)
    feedback_match = re.search(r"FEEDBACK:\s*(.*)", output, re.IGNORECASE | re.DOTALL)

    if hook_match:
        scores["hook"] = int(hook_match.group(1))
    if story_match:
        scores["storytelling"] = int(story_match.group(1))
    if eng_match:
        scores["engagement"] = int(eng_match.group(1))
    if feedback_match:
        scores["feedback"] = feedback_match.group(1).strip().strip("[]")

    return scores

async def career_copilot(achievement: str) -> dict:
    system_prompt = (
        "You are an AI Career Coach. Take the user's raw achievement, course completion, or project milestone, "
        "and suggest career enhancement materials. Format your response exactly as:\n"
        "LINKEDIN: [Engaging LinkedIn post draft with emojis]\n"
        "RESUME: [A strong resume bullet point using action verbs and impact metrics]\n"
        "GITHUB: [A project idea title and description to showcase this achievement on GitHub]\n"
        "INTERVIEW_1: [Common interview question related to this]\n"
        "INTERVIEW_2: [Another relevant interview question]\n"
        "INTERVIEW_3: [A behavioral interview question related to this]"
    )

    user_prompt = f"Raw achievement:\n\"\"\"\n{achievement}\n\"\"\""
    output = await call_llm(system_prompt, user_prompt, max_tokens=1200)

    result = {
        "linkedin_post": "",
        "resume_update": "",
        "github_project_idea": "",
        "interview_questions": []
    }

    linkedin_match = re.search(r"LINKEDIN:\s*(.*?)(?=\nRESUME:|$)", output, re.IGNORECASE | re.DOTALL)
    resume_match = re.search(r"RESUME:\s*(.*?)(?=\nGITHUB:|$)", output, re.IGNORECASE | re.DOTALL)
    github_match = re.search(r"GITHUB:\s*(.*?)(?=\nINTERVIEW_1:|$)", output, re.IGNORECASE | re.DOTALL)
    
    q1_match = re.search(r"INTERVIEW_1:\s*(.*?)(?=\nINTERVIEW_2:|$)", output, re.IGNORECASE | re.DOTALL)
    q2_match = re.search(r"INTERVIEW_2:\s*(.*?)(?=\nINTERVIEW_3:|$)", output, re.IGNORECASE | re.DOTALL)
    q3_match = re.search(r"INTERVIEW_3:\s*(.*)", output, re.IGNORECASE | re.DOTALL)

    if linkedin_match:
        result["linkedin_post"] = linkedin_match.group(1).strip().strip("[]")
    if resume_match:
        result["resume_update"] = resume_match.group(1).strip().strip("[]")
    if github_match:
        result["github_project_idea"] = github_match.group(1).strip().strip("[]")
    
    if q1_match:
        result["interview_questions"].append(q1_match.group(1).strip().strip("[]"))
    if q2_match:
        result["interview_questions"].append(q2_match.group(1).strip().strip("[]"))
    if q3_match:
        result["interview_questions"].append(q3_match.group(1).strip().strip("[]"))

    # Fallback in case parsing fails completely
    if not result["linkedin_post"]:
        result["linkedin_post"] = f"Just completed {achievement}! Excited to apply these new skills."
    if not result["resume_update"]:
        result["resume_update"] = f"Successfully completed {achievement}."
    if not result["github_project_idea"]:
        result["github_project_idea"] = "Build a project to showcase this skill."
    if not result["interview_questions"]:
        result["interview_questions"] = ["Can you walk us through the project or course you completed?"]

    return result

async def analyze_writing_style(sample_texts: str) -> str:
    system_prompt = (
        "You are an expert linguist and writing coach. Analyze the user's provided writing sample(s). "
        "Describe their writing style, focusing on their typical tone, vocabulary level, average sentence length, "
        "structure (e.g., bullet points, paragraphs), formatting preferences (use of emojis, headers, links), "
        "and general voice. Provide a concise, actionable 1-2 paragraph description that can guide a language model "
        "to emulate their voice perfectly. Do not mention that they are a user; write the description as a set of rules "
        "defining 'The Style'."
    )

    user_prompt = f"Writing samples:\n\"\"\"\n{sample_texts}\n\"\"\""
    return await call_llm(system_prompt, user_prompt, max_tokens=500)
