# Feature: Professional Plan Creation

## Descrizione

Questa funzionalità consente ai professionisti della salute di creare piani di allenamento e piani nutrizionali personalizzati per i loro clienti utilizzando l'intelligenza artificiale (Gemini AI).

## Nuove Schede nella Dashboard Professionista

### 1. Crea Piano Allenamento

Questa scheda permette al professionista di creare un piano di allenamento personalizzato per un cliente.

**Campi disponibili:**
- **Utente**: Seleziona il cliente per cui creare il piano
- **Obiettivo Principale**: 
  - Tonificazione Muscolare
  - Ipertrofia/Massa Muscolare
  - Forza
  - Dimagrimento
  - Resistenza
  - Mantenimento
- **Frequenza Allenamento**: da 2 a 6 giorni/settimana
- **Luogo di Allenamento**:
  - Palestra (con attrezzature complete)
  - Casa (con attrezzature base)
  - Casa (solo corpo libero)
  - All'aperto
- **Note Aggiuntive**: campo opzionale per specificare preferenze particolari

**Funzionamento:**
1. Il professionista seleziona un cliente
2. Compila i parametri del piano
3. Clicca su "Genera Piano con AI"
4. Il sistema utilizza Gemini AI per generare un piano personalizzato basato su:
   - Misure antropometriche del cliente (peso, altezza, età, sesso, circonferenze)
   - Parametri specificati dal professionista
5. Il piano viene automaticamente salvato nella sezione "Allenamento" del cliente

### 2. Crea Piano Nutrizionale

Questa scheda permette al professionista di creare un piano nutrizionale personalizzato per un cliente.

**Campi disponibili:**
- **Utente**: Seleziona il cliente per cui creare il piano
- **Obiettivo Nutrizionale**:
  - Dimagrimento
  - Mantenimento
  - Aumento Massa Muscolare
  - Definizione Muscolare
  - Miglioramento Salute Generale
- **Tipologia Dieta**:
  - Mediterranea
  - Zona
  - Chetogenica
  - Paleo
  - Vegetariana
  - Vegana
  - Bilanciata Classica
- **Obiettivo Calorico Giornaliero**: valore in kcal (min: 1000, max: 5000)
- **Numero Pasti al Giorno**: da 3 a 6 pasti
- **Note Aggiuntive**: campo opzionale per specificare intolleranze, allergie, preferenze

**Funzionamento:**
1. Il professionista seleziona un cliente
2. Compila i parametri del piano
3. Clicca su "Genera Piano con AI"
4. Il sistema utilizza Gemini AI per generare un piano personalizzato basato su:
   - Misure antropometriche del cliente
   - Parametri specificati dal professionista
5. Il piano viene automaticamente salvato nella sezione "Dieta" del cliente con un piano settimanale completo (7 giorni)

## Requisiti

- Il cliente deve avere almeno una misurazione salvata
- Il professionista deve avere una chiave API Gemini valida configurata
- Il cliente deve essere associato al professionista

## Vantaggi

1. **Personalizzazione Completa**: I piani sono creati specificamente per ogni cliente
2. **Risparmio di Tempo**: L'AI genera piani completi in pochi secondi
3. **Basati su Dati Reali**: I piani considerano le misure antropometriche effettive del cliente
4. **Flessibilità**: Il professionista può specificare obiettivi, preferenze e vincoli
5. **Integrazione Automatica**: I piani vengono salvati direttamente nell'account del cliente

## Implementazione Tecnica

### Funzioni Principali

1. **`renderWorkoutPlanCreation()`**: Renderizza il form per la creazione del piano di allenamento
2. **`renderDietPlanCreation()`**: Renderizza il form per la creazione del piano nutrizionale
3. **`createWorkoutPlanForClient()`**: Genera e salva il piano di allenamento utilizzando Gemini AI
4. **`createDietPlanForClient()`**: Genera e salva il piano nutrizionale utilizzando Gemini AI

### Flusso di Dati

```
Professionista → Form → Gemini AI → Piano Generato → Salvataggio su data.json → Sincronizzazione con Cliente
```

### Formato dei Dati

**Piano di Allenamento:**
```javascript
[
  {
    "id": timestamp,
    "day": "GIORNO A",
    "exercise": "PANCA PIANA",
    "sets": 3,
    "reps": 10,
    "load": "60KG"
  }
]
```

**Piano Nutrizionale:**
```javascript
[
  {
    "day": "LUNEDÌ",
    "meals": [
      {
        "category": "COLAZIONE",
        "description": "YOGURT GRECO CON MIELE E NOCI",
        "weight": "200G",
        "type": "RICETTA",
        "calories": 350
      }
    ]
  }
]
```

## Messaggi di Errore

- **"Seleziona un utente"**: Nessun cliente selezionato
- **"Dati del cliente non trovati"**: Cliente non valido o non più esistente
- **"L'utente non ha misurazioni salvate"**: Il cliente deve avere almeno una misurazione prima di creare un piano
- **"Errore durante la creazione del piano"**: Errore nella chiamata API o nella generazione del piano

## Test

Per testare la funzionalità:

1. Accedere come professionista
2. Assicurarsi di avere almeno un cliente con misurazioni salvate
3. Navigare alla scheda "Crea Piano Allenamento" o "Crea Piano Nutrizionale"
4. Compilare il form e generare un piano
5. Verificare che il piano sia stato salvato nella sezione corrispondente del cliente

## Note di Sicurezza

- I piani vengono generati utilizzando l'API Gemini, che richiede una chiave API valida
- I dati dei clienti vengono utilizzati solo per la generazione dei piani
- Tutti i dati vengono salvati su data.json sul server
- Solo il professionista proprietario può creare piani per i suoi clienti
