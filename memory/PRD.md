# WHE - Win Help Education - PRD

## Overview
Education exam preparation mobile app for Gujarati medium students preparing for competitive exams (JVN, CET, PSE, NMMS, GSSE, TST).

## Features
- **Login**: Simple admin login (admin/Admin@123)
- **Dashboard**: 6 exam subject cards with color-coded icons
- **Subject Detail**: Exam info with 3 sections (Mental Ability, Math, Gujarati)
- **Question Practice**: MCQ viewer with 12 JVN questions from Excel data, rendered in custom Gujarati BGOT font
- **PDF Export**: Generate and download question papers as PDF with embedded custom fonts
- **Gujarati Support**: Custom Gujarati fonts (BGOT, GOENG) for proper text rendering

## Tech Stack
- **Frontend**: React Native (Expo SDK 54), expo-router
- **Backend**: FastAPI, Motor (async MongoDB)
- **Database**: MongoDB
- **PDF**: ReportLab with custom TTF font embedding
- **Fonts**: BGOT (Bharati GopikaTwo), GOENG custom Gujarati fonts

## Subjects
| Code | Name (Gujarati) | Name (English) | Questions |
|------|-----------------|----------------|-----------|
| JVN | જવાહર નવોદય વિદ્યાલય પ્રવેશ પરીક્ષા | Jawahar Navodaya Vidyalaya Entrance Examination | 12 (Active) |
| CET | કોમન એન્ટ્રન્સ ટેસ્ટ | Common Entrance Test | Coming Soon |
| PSE | પ્રાથમિક શાળા પરીક્ષા | Primary School Examination | Coming Soon |
| NMMS | રાષ્ટ્રીય મીન્સ-કમ-મેરિટ સ્કોલરશિપ | National Means-cum-Merit Scholarship | Coming Soon |
| GSSE | ગુજરાત માધ્યમિક શાળા પરીક્ષા | Gujarat Secondary School Examination | Coming Soon |
| TST | શિક્ષક પસંદગી પરીક્ષા | Teacher Selection Test | Coming Soon |

## API Endpoints
- `POST /api/login` - Authentication
- `GET /api/subjects` - List all subjects
- `GET /api/subjects/{id}` - Get subject details
- `GET /api/questions/{code}` - Get questions by subject code
- `POST /api/generate-pdf` - Generate PDF question paper
