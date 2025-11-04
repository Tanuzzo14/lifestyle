# AI-Generated Plans Feature Documentation

## Overview

This feature allows users registered under the BASE_USER trainer to generate personalized diet and workout plans using Google's Gemini AI.

## User Experience

### For BASE_USER Clients

Users who self-register (not created by a professional trainer) will see special AI buttons in both the ALLENAMENTO (Workout) and DIETA (Diet) sections.

#### Workout Section
- **Button Location**: Between "ESERCIZI" section and "AGGIUNGI ESERCIZIO" form
- **Button Style**: Purple gradient with sparkle emoji ✨
- **Button Text**: "CREA IL TUO PIANO CON L'IA"
- **Description**: "Genera un piano di allenamento personalizzato per mantenimento e tonificazione muscolare basato sulle tue misure."

#### Diet Section
- **Button Location**: Between "PIANO DIETA SETTIMANALE" and "AGGIUNGI PASTO AL PIANO" form
- **Button Style**: Green gradient with sparkle emoji ✨
- **Button Text**: "CREA IL TUO PIANO CON L'IA"
- **Description**: "Genera un piano nutrizionale mediterraneo personalizzato per mantenimento e tonificazione muscolare basato sulle tue misure."

### Prerequisites

Before clicking the AI button, users MUST have completed all measurements:
- Peso (Weight)
- Altezza (Height)
- Età (Age)
- Sesso (Gender)
- Circonferenze: Vita, Fianchi, Petto, Braccio, Coscia

If measurements are incomplete, the system shows an error: "DEVI COMPILARE TUTTE LE MISURE PRIMA DI CREARE UN PIANO CON L'IA."

## How It Works

### Workout Plan Generation

1. User clicks "CREA IL TUO PIANO CON L'IA" in ALLENAMENTO section
2. System validates all measurements are complete
3. System sends user measurements to Gemini AI with a prompt requesting:
   - Maintenance and muscle toning focused plan
   - Exercises suitable for user's anthropometric data
   - 15-20 exercises divided across training days
   - Format: Day, Exercise, Sets, Reps, Load
4. Generated plan is automatically added to user's workout
5. Success message shows number of exercises added

### Diet Plan Generation

1. User clicks "CREA IL TUO PIANO CON L'IA" in DIETA section
2. System validates all measurements are complete
3. System sends user measurements to Gemini AI with a prompt requesting:
   - **Mediterranean diet** plan
   - Maintenance and muscle toning focused
   - Suitable for user's anthropometric data
   - 7 days (LUNEDÌ-DOMENICA) with all meals
   - Format: Day, Meals (Category, Description, Weight, Type, Calories)
4. Generated plan replaces current diet plan
5. Success message shows number of days added

## Technical Details

### Functions

#### `isBaseUserClient()`
- Returns `true` if user's `createdBy` field matches BASE_USER UID (2478585977)
- Returns `false` otherwise

#### `hasAllMeasurements()`
- Checks if user has at least one measurement in `measurementsLog`
- Validates all required fields are present in the last measurement
- Required fields: weight, height, age, gender, waist, hips, chest, bicep, thigh

#### `generateAIWorkoutPlan()`
- Validates measurements
- Constructs prompt with user data
- Calls Gemini API
- Parses JSON response
- Updates `state.data.workout`
- Saves state and re-renders

#### `generateAIDietPlan()`
- Validates measurements
- Constructs prompt with user data
- Calls Gemini API
- Parses JSON response
- Updates `state.data.dietPlan.plan`
- Saves state and re-renders

### API Configuration

```javascript
const GEMINI_API_KEY = '--';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
```

### Prompt Structure

Both prompts include:
- User measurements (weight, height, age, gender, circumferences)
- Specific goal (maintenance and muscle toning)
- Diet type (Mediterranean for diet plan)
- Detailed output format specification
- Instruction to use UPPERCASE for all text

## Visibility Logic

The AI buttons are conditionally rendered:

```javascript
${isBaseUserClient() ? `<div class="card mt-6 bg-gradient-to-r ...">...</div>` : ''}
```

This ensures:
- ✅ Visible for users with `createdBy === "2478585977"`
- ❌ Hidden for users with `createdBy === null`
- ❌ Hidden for users with different trainer
- ❌ Hidden for professional users

## Error Handling

- **Incomplete Measurements**: "DEVI COMPILARE TUTTE LE MISURE PRIMA DI CREARE UN PIANO CON L'IA."
- **API Errors**: "ERRORE NELLA CREAZIONE DEL PIANO DI ALLENAMENTO: [error message]"
- **Network Errors**: Displays the fetch error message in uppercase

## Testing

Run `test_ai_button.html` to verify:
1. BASE_USER UID calculation
2. Measurement validation logic
3. Button visibility conditions
4. Prompt requirements

All tests should pass (8/8).

## Future Enhancements

Potential improvements:
1. Allow users to customize plan parameters (days per week, diet restrictions, etc.)
2. Save multiple AI-generated plans for comparison
3. Rate limiting to prevent API abuse
4. Plan regeneration with different variations
5. Export plans to PDF
6. Share plans with trainer
