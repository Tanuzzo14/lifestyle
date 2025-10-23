# Security Policy

## Supported Versions

This project is actively maintained. Security updates are provided for the latest version.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Older   | :x:                |

## Security Measures

### API Key Protection

The Gemini API integration has been secured to prevent exposure of sensitive API keys:

1. **Server-Side Proxy**: All Gemini API calls are routed through `gemini_proxy.php` which acts as a secure server-side proxy.

2. **Configuration File**: API keys are stored in `config.php` which:
   - Is excluded from version control via `.gitignore`
   - Contains sensitive credentials that should never be committed
   - Must be created from `config.php.example` template

3. **Setup Instructions**:
   ```bash
   # Copy the example configuration
   cp config.php.example config.php
   
   # Edit config.php and add your actual API key
   # Never commit config.php to version control
   ```

4. **Client-Side Protection**: The client-side code (`config.js`) no longer contains any API keys. It only references the proxy URL.

### Data Storage

- User data is stored in `data.json` which is also excluded from version control
- Password hashes are used instead of plain text passwords
- All sensitive data files are listed in `.gitignore`

### Best Practices

When deploying this application:

1. **Environment Variables**: Consider using environment variables for API keys instead of config files
2. **HTTPS Only**: Always use HTTPS in production
3. **Access Control**: Implement proper authentication and authorization
4. **Rate Limiting**: Add rate limiting to the proxy endpoint to prevent abuse
5. **Regular Updates**: Keep dependencies and API versions up to date

## Reporting a Vulnerability

If you discover a security vulnerability in this project:

1. **Do NOT** create a public GitHub issue
2. Contact the repository owner directly via email or private message
3. Provide detailed information about the vulnerability
4. Allow reasonable time for the issue to be addressed before public disclosure

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (critical issues prioritized)

## Security Checklist for Deployment

- [ ] `config.php` is created with valid API keys
- [ ] `config.php` is NOT committed to version control
- [ ] `.gitignore` includes `config.php` and `data.json`
- [ ] Application is served over HTTPS
- [ ] File permissions are properly configured (config.php should not be world-readable)
- [ ] Rate limiting is implemented on API endpoints
- [ ] Regular security audits are performed
