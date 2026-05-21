# Configuration Setup

## Environment Variables Required

Add these to your `.env.local` file:


## Validate Configuratio

To check if all required env vars are set:

```javascript
import { validateConfig } from '@/lib/config';

validateConfig(); // Logs warnings if any vars are missing
```
