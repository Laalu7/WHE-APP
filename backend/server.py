from fastapi import FastAPI, APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ========== Models ==========
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None

class Option(BaseModel):
    label: str
    text: str

class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_number: int
    question_text: str
    options: List[Option]
    subject: str = "JVN"
    section: Optional[str] = None

class Section(BaseModel):
    id: str
    name_gu: str
    name_en: str

class Subject(BaseModel):
    id: str
    code: str
    name_gu: str
    name_en: str
    total_questions: int
    sections: List[Section]
    has_questions: bool = False

class PDFRequest(BaseModel):
    subject_code: str
    title: Optional[str] = "Question Paper"
    selected_question_ids: Optional[List[str]] = None

# ========== Data ==========
SUBJECTS_DATA = [
    {
        "id": "jvn",
        "code": "JVN",
        "name_gu": "જવાહર નવોદય વિદ્યાલય પ્રવેશ પરીક્ષા",
        "name_en": "Jawahar Navodaya Vidyalaya Entrance Examination",
        "total_questions": 40,
        "has_questions": True,
        "sections": [
            {"id": "mental", "name_gu": "માનસિક ક્ષમતા પરીક્ષા", "name_en": "Mental Ability Test"},
            {"id": "math", "name_gu": "ગણિત પરીક્ષા", "name_en": "Mathematical Test"},
            {"id": "gujarati", "name_gu": "ગુજરાતી પરીક્ષા", "name_en": "Gujarati Test"}
        ]
    },
    {
        "id": "cet",
        "code": "CET",
        "name_gu": "કોમન એન્ટ્રન્સ ટેસ્ટ",
        "name_en": "Common Entrance Test",
        "total_questions": 40,
        "has_questions": False,
        "sections": [
            {"id": "mental", "name_gu": "માનસિક ક્ષમતા પરીક્ષા", "name_en": "Mental Ability Test"},
            {"id": "math", "name_gu": "ગણિત પરીક્ષા", "name_en": "Mathematical Test"},
            {"id": "gujarati", "name_gu": "ગુજરાતી પરીક્ષા", "name_en": "Gujarati Test"}
        ]
    },
    {
        "id": "pse",
        "code": "PSE",
        "name_gu": "પ્રાથમિક શાળા પરીક્ષા",
        "name_en": "Primary School Examination",
        "total_questions": 40,
        "has_questions": False,
        "sections": [
            {"id": "mental", "name_gu": "માનસિક ક્ષમતા પરીક્ષા", "name_en": "Mental Ability Test"},
            {"id": "math", "name_gu": "ગણિત પરીક્ષા", "name_en": "Mathematical Test"},
            {"id": "gujarati", "name_gu": "ગુજરાતી પરીક્ષા", "name_en": "Gujarati Test"}
        ]
    },
    {
        "id": "nmms",
        "code": "NMMS",
        "name_gu": "રાષ્ટ્રીય મીન્સ-કમ-મેરિટ સ્કોલરશિપ",
        "name_en": "National Means-cum-Merit Scholarship",
        "total_questions": 40,
        "has_questions": False,
        "sections": [
            {"id": "mental", "name_gu": "માનસિક ક્ષમતા પરીક્ષા", "name_en": "Mental Ability Test"},
            {"id": "math", "name_gu": "ગણિત પરીક્ષા", "name_en": "Mathematical Test"},
            {"id": "gujarati", "name_gu": "ગુજરાતી પરીક્ષા", "name_en": "Gujarati Test"}
        ]
    },
    {
        "id": "gsse",
        "code": "GSSE",
        "name_gu": "ગુજરાત માધ્યમિક શાળા પરીક્ષા",
        "name_en": "Gujarat Secondary School Examination",
        "total_questions": 40,
        "has_questions": False,
        "sections": [
            {"id": "mental", "name_gu": "માનસિક ક્ષમતા પરીક્ષા", "name_en": "Mental Ability Test"},
            {"id": "math", "name_gu": "ગણિત પરીક્ષા", "name_en": "Mathematical Test"},
            {"id": "gujarati", "name_gu": "ગુજરાતી પરીક્ષા", "name_en": "Gujarati Test"}
        ]
    },
    {
        "id": "tst",
        "code": "TST",
        "name_gu": "શિક્ષક પસંદગી પરીક્ષા",
        "name_en": "Teacher Selection Test",
        "total_questions": 40,
        "has_questions": False,
        "sections": [
            {"id": "mental", "name_gu": "માનસિક ક્ષમતા પરીક્ષા", "name_en": "Mental Ability Test"},
            {"id": "math", "name_gu": "ગણિત પરીક્ષા", "name_en": "Mathematical Test"},
            {"id": "gujarati", "name_gu": "ગુજરાતી પરીક્ષા", "name_en": "Gujarati Test"}
        ]
    }
]

# ========== Parse Excel Questions ==========
def parse_excel_questions():
    """Parse the win excel.xlsx file to extract JVN questions"""
    try:
        import openpyxl
        excel_path = ROOT_DIR / 'win_excel.xlsx'
        if not excel_path.exists():
            logger.warning("Excel file not found, using empty questions")
            return []

        wb = openpyxl.load_workbook(str(excel_path))
        ws = wb['Sheet1']

        questions = []
        current_q = None
        current_options = []

        for row in ws.iter_rows(values_only=True):
            cells = list(row)
            first_cell = cells[0]

            # Check if this is a question row (starts with a number)
            if first_cell is not None and str(first_cell).strip() not in ['', ' ']:
                try:
                    q_num = int(first_cell)
                    # Save previous question
                    if current_q is not None and current_options:
                        questions.append({
                            "id": str(uuid.uuid4()),
                            "question_number": current_q["number"],
                            "question_text": current_q["text"],
                            "options": current_options,
                            "subject": "JVN"
                        })

                    # Start new question
                    q_text = str(cells[1]) if cells[1] else ""
                    current_q = {"number": q_num, "text": q_text}
                    current_options = []
                    continue
                except (ValueError, TypeError):
                    pass

            # Check if this is an options row
            if cells[1] is not None:
                label_str = str(cells[1]).strip()
                if label_str in ['(A)', '(B)', '(C)', '(D)']:
                    opt_text = str(cells[2]) if len(cells) > 2 and cells[2] else ""
                    current_options.append({"label": label_str.strip('()'), "text": opt_text})

                    # Check if there's a second option on the same row
                    if len(cells) > 4 and cells[3] is not None:
                        label2 = str(cells[3]).strip()
                        if label2 in ['(A)', '(B)', '(C)', '(D)']:
                            opt_text2 = str(cells[4]) if len(cells) > 4 and cells[4] else ""
                            current_options.append({"label": label2.strip('()'), "text": opt_text2})

            # Handle sub-text rows (like formula continuation)
            if cells[1] is not None and str(cells[1]).strip().startswith('(') and str(cells[1]).strip() not in ['(A)', '(B)', '(C)', '(D)']:
                # This might be a sub-text of the question
                if current_q:
                    current_q["text"] += " " + str(cells[1])

        # Don't forget the last question
        if current_q is not None and current_options:
            questions.append({
                "id": str(uuid.uuid4()),
                "question_number": current_q["number"],
                "question_text": current_q["text"],
                "options": current_options,
                "subject": "JVN"
            })

        logger.info(f"Parsed {len(questions)} questions from Excel")
        return questions
    except Exception as e:
        logger.error(f"Error parsing Excel: {e}")
        return []


# ========== Routes ==========

@api_router.get("/")
async def root():
    return {"message": "WHE - Win Help Education API"}

@api_router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    if req.username == "admin" and req.password == "Admin@123":
        return LoginResponse(success=True, message="Login successful", token="whe-admin-token-2024")
    raise HTTPException(status_code=401, detail="Invalid username or password")

@api_router.get("/subjects")
async def get_subjects():
    return SUBJECTS_DATA

@api_router.get("/subjects/{subject_id}")
async def get_subject(subject_id: str):
    for s in SUBJECTS_DATA:
        if s["id"] == subject_id:
            return s
    raise HTTPException(status_code=404, detail="Subject not found")

@api_router.get("/questions/{subject_code}")
async def get_questions(subject_code: str):
    questions = await db.questions.find(
        {"subject": subject_code.upper()},
        {"_id": 0}
    ).to_list(1000)
    return questions

@api_router.post("/generate-pdf")
async def generate_pdf(req: PDFRequest):
    """Generate PDF from questions"""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import mm
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont

        # Register custom fonts
        font_dir = ROOT_DIR / 'fonts'
        try:
            pdfmetrics.registerFont(TTFont('BGOT', str(font_dir / 'BGOT___.TTF')))
            pdfmetrics.registerFont(TTFont('BGOTB', str(font_dir / 'BGOTB__.TTF')))
            pdfmetrics.registerFont(TTFont('GOENG', str(font_dir / 'GOENG__.TTF')))
            pdfmetrics.registerFont(TTFont('GOENGB', str(font_dir / 'GOENGB_.TTF')))
            gujarati_font = 'BGOT'
            gujarati_font_bold = 'BGOTB'
        except Exception as e:
            logger.warning(f"Custom font registration failed: {e}, using Helvetica")
            gujarati_font = 'Helvetica'
            gujarati_font_bold = 'Helvetica-Bold'

        questions = await db.questions.find(
            {"subject": req.subject_code.upper()},
            {"_id": 0}
        ).to_list(1000)

        # Filter by selected question IDs if provided
        if req.selected_question_ids and len(req.selected_question_ids) > 0:
            selected_set = set(req.selected_question_ids)
            questions = [q for q in questions if q.get("id") in selected_set]

        if not questions:
            raise HTTPException(status_code=404, detail="No questions found for this subject")

        # Find subject info
        subject_info = None
        for s in SUBJECTS_DATA:
            if s["code"] == req.subject_code.upper():
                subject_info = s
                break

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Title page
        c.setFont(gujarati_font_bold, 20)
        title = req.title or (subject_info["name_en"] if subject_info else "Question Paper")
        c.drawCentredString(width / 2, height - 60, title)

        if subject_info:
            c.setFont(gujarati_font, 14)
            c.drawCentredString(width / 2, height - 85, subject_info["name_gu"])

        c.setFont('Helvetica', 12)
        c.drawCentredString(width / 2, height - 110, f"Total Questions: {len(questions)}")

        c.line(40, height - 125, width - 40, height - 125)

        # Questions
        y = height - 155
        page_margin = 40
        line_height = 18

        for q in questions:
            # Check if we need a new page
            needed_space = line_height * (2 + len(q.get("options", [])))
            if y < 80:
                c.showPage()
                y = height - 60

            # Question text
            c.setFont(gujarati_font_bold, 12)
            q_text = f"{q['question_number']}. {q['question_text']}"
            # Wrap long text
            max_chars = 80
            if len(q_text) > max_chars:
                lines = [q_text[i:i+max_chars] for i in range(0, len(q_text), max_chars)]
                for line in lines:
                    c.drawString(page_margin, y, line)
                    y -= line_height
            else:
                c.drawString(page_margin, y, q_text)
                y -= line_height

            # Options
            c.setFont(gujarati_font, 11)
            for opt in q.get("options", []):
                opt_text = f"   ({opt['label']}) {opt['text']}"
                c.drawString(page_margin + 20, y, opt_text)
                y -= line_height

            y -= 8  # Extra spacing between questions

        c.save()
        buffer.seek(0)

        filename = f"{req.subject_code}_question_paper.pdf"
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


# ========== Seed Data ==========
@app.on_event("startup")
async def startup_event():
    """Seed questions from Excel on startup"""
    count = await db.questions.count_documents({"subject": "JVN"})
    if count == 0:
        questions = parse_excel_questions()
        if questions:
            await db.questions.insert_many(questions)
            logger.info(f"Seeded {len(questions)} JVN questions")
    else:
        logger.info(f"Found {count} existing JVN questions")


# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
