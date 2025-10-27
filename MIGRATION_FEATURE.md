# User Migration Feature

## Overview
This feature allows professional users to migrate multiple users at once by uploading files containing user data. The system uses Google's Gemini AI to automatically extract and structure the data.

## How to Use

### 1. Access the Migration Tab
- Log in as a professional user
- Navigate to the "Migrazione" tab in the dashboard

### 2. Upload Files
- Click the drop zone or drag and drop files
- Supported formats: PDF, DOCX, XLS, XLSX, DOC, TXT
- Multiple files can be uploaded at once

### 3. Review and Migrate
- Click "Inizia Migrazione" to start the process
- The system will:
  - Read each file
  - Use Gemini AI to extract user data
  - Create user accounts automatically
  - Display results for each file

## Data Extraction

### What Gemini Extracts
The AI attempts to extract the following information from files:

1. **Username**: Person's name (e.g., "MARIO_ROSSI")
2. **Measurements** (if available):
   - Weight, height, age, gender
   - Body circumferences (waist, hips, chest, bicep, thigh)
   - Calculated BMI, WHR, body fat percentage

3. **Workout Plan** (if available):
   - Exercises grouped by day
   - Sets, reps, and load for each exercise

4. **Diet Plan** (if available):
   - Meals organized by day of the week
   - Meal categories (breakfast, lunch, dinner, snacks)
   - Portion sizes and calories

## User Creation Rules

### Default Password
All migrated users are created with the password: **123456**
- This password is hashed using the same hash function as regular users
- Users should change their password after first login

### Username Handling
If a username already exists, the system automatically adds underscores:
- First attempt: `MARIO_ROSSI`
- If exists: `MARIO_ROSSI_`
- If still exists: `MARIO_ROSSI__`
- Maximum: `MARIO_ROSSI____` (4 underscores)

If a unique username cannot be generated after 4 attempts, the migration for that user fails.

### Username Normalization
- Spaces are converted to underscores
- All characters are converted to UPPERCASE
- Example: "Mario Rossi" → "MARIO_ROSSI"

## File Format Examples

### Text File Example
```
Nome: Mario Rossi
Età: 30 anni
Sesso: Uomo

Misure corporee:
- Peso: 80 kg
- Altezza: 175 cm
- Circonferenza vita: 85 cm
- Circonferenza fianchi: 95 cm

Piano di allenamento:
GIORNO A:
- Panca piana: 4 serie x 10 ripetizioni, 60 kg
- Squat: 4 serie x 12 ripetizioni, 80 kg

Piano dieta:
LUNEDÌ:
- Colazione: Uova (150g) e pane - 400 kcal
- Pranzo: Pollo (200g) con insalata - 450 kcal
```

### CSV Format Example
For structured data, CSV files with headers work well:
```csv
Nome,Età,Sesso,Peso,Altezza
Mario Rossi,30,Uomo,80,175
```

## Migration Results

After migration, the system displays results for each file:
- ✓ Success: User created successfully with username
- ✗ Error: Failed with error message

## Security Considerations

### Password Security
⚠️ **Important**: The default password "123456" is a security risk.
- Recommend users change their password immediately
- Consider implementing forced password change on first login
- The hash function used is simple (not bcrypt/Argon2)

### Data Privacy
- File contents are sent to Gemini AI for processing
- Ensure compliance with data protection regulations (GDPR, etc.)
- Consider adding user consent for AI processing

### Access Control
- Only professional (pro) users can access the migration feature
- Migrated users are automatically added to the professional's client list
- All migrated users are created with userType: "user"

## Troubleshooting

### Migration Fails
**Problem**: All migrations fail with "Gemini API error"
**Solution**: 
- Check that GEMINI_API_KEY is configured in config.json
- Verify the API key has sufficient quota
- Check internet connectivity

### No Data Extracted
**Problem**: File uploaded but no user data found
**Solution**:
- Ensure file contains clear, readable text
- Try reformatting data to be more structured
- Check file is not corrupted or password-protected

### Username Conflicts
**Problem**: "Username not available (limite _ raggiunto)"
**Solution**:
- Manually create user with a different name
- Delete existing conflicting users if appropriate
- Modify the source file to use a different name

## Technical Details

### File Processing
1. File is read using FileReader API
2. For text files: Direct text extraction
3. For binary files (PDF, DOCX): Attempt base64 decoding
4. Content is truncated to 15,000 characters for Gemini

### Gemini Integration
- API: Gemini 2.5 Flash model
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- Timeout: Standard HTTP timeout (no custom timeout set)
- Response: JSON with structured user data

### User Data Structure
Created users have the following structure:
```json
{
  "userType": "user",
  "displayUsername": "MARIO_ROSSI",
  "passwordHash": "1450575459",
  "uid": "client_timestamp_random",
  "data": {
    "habits": [],
    "workout": [...],
    "dietPlan": {...},
    "measurementsLog": [...]
  },
  "createdBy": "professional_uid",
  "createdAt": "2025-10-27T..."
}
```

## Future Improvements

### Potential Enhancements
1. **Batch Processing**: Process multiple files in parallel
2. **Data Preview**: Show extracted data before creating users
3. **Custom Password**: Allow setting custom password per user
4. **Import Templates**: Provide downloadable templates
5. **Error Recovery**: Retry failed migrations
6. **Progress Tracking**: Show progress bar for large batches
7. **Export Results**: Download migration report as CSV
8. **Validation Rules**: Custom validation for extracted data
9. **Duplicate Detection**: More sophisticated duplicate checking
10. **File Type Support**: Add support for more file formats

## API Reference

### Main Functions

#### `startMigration()`
Starts the migration process for all uploaded files.

#### `migrateUserFromFile(file)`
Migrates a single user from a file.
- **Parameters**: `file` - File object
- **Returns**: Result object with success status and message

#### `extractUserDataWithGemini(textContent, filename)`
Extracts user data using Gemini AI.
- **Parameters**: 
  - `textContent` - String content from file
  - `filename` - Name of the file being processed
- **Returns**: User data object

#### `generateUniqueUsername(baseUsername)`
Generates a unique username by adding underscores if needed.
- **Parameters**: `baseUsername` - Base username to use
- **Returns**: Unique username string or null if limit reached

## Support
For issues or questions:
- Check the console for error messages
- Review the TROUBLESHOOTING section above
- Ensure all prerequisites are met (API key, permissions, etc.)
