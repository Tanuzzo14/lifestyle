# Istruzioni di Login per Utenti Normali

## Problema Risolto
Gli utenti normali (creati da trainer) che non avevano una password impostata ora possono effettuare il login.

## Come Effettuare il Login

### Per Utenti SENZA Password Impostata
Se sei un utente normale e non hai mai impostato una password, puoi accedere utilizzando il tuo **nome utente come password**.

#### Esempi:

**Utente: G.SMARIO1**
- Nome utente: `G.SMARIO1` (o `g.smario1`)
- Password: `g.smario1` (il nome utente in minuscolo)

**Utente: 123456**
- Nome utente: `123456`
- Password: `123456`

### Per Utenti CON Password Impostata
Se hai già una password impostata, continua a usare quella:

**Utente: BASE_USER**
- Nome utente: `BASE_USER`
- Password: `base_user_password` (la tua password esistente)

## Dettagli Tecnici

### Come Funziona
Il sistema verifica il login in questo modo:

1. **Se hai una password impostata**: Usa la tua password normale
2. **Se NON hai una password impostata**: Usa il nome utente (in minuscolo) come password

### Sicurezza
- ✓ Le password sbagliate vengono rifiutate
- ✓ Gli utenti con password esistenti continuano a funzionare normalmente
- ✓ Il sistema è retrocompatibile con tutti gli utenti

## Come Cambiare la Password (Future Feature)
Attualmente, non è possibile cambiare la password dall'interfaccia utente. Se necessario:

1. Contatta il tuo trainer/amministratore
2. Il trainer può creare un nuovo account con una password diversa
3. Oppure, attendere l'implementazione della funzionalità "Cambia Password"

## Risoluzione Problemi

### "NOME UTENTE O PASSWORD NON VALIDI"
Se ricevi questo errore:

1. Verifica di aver inserito il nome utente correttamente
2. Se non hai una password:
   - Prova a usare il nome utente in **minuscolo** come password
   - Esempio: Per `G.SMARIO1` usa password `g.smario1`
3. Se hai una password:
   - Assicurati di inserire la password corretta
   - Ricorda che le password sono case-sensitive

### Test di Verifica
Per verificare che il sistema funzioni correttamente, puoi eseguire:
```bash
node test_login_fix.js
```

Dovresti vedere:
```
✓ ALL TESTS PASSED!
```

## Supporto
Per ulteriore assistenza, contatta l'amministratore del sistema.
