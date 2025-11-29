# Quick Start Guide - Backend Server

## Problem
The backend server won't start because you're running the command from the wrong directory.

## Solution

### Step 1: Navigate to the correct directory
```bash
cd "c:\Users\SRIDHAR RAO\OneDrive\Desktop\PharmAI Nexus"
```
**Important:** You must be in the `PharmAI Nexus` folder, NOT in the `backend` subfolder!

### Step 2: Run the backend server
```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

### Step 3: Verify it's running
You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

### Step 4: Test the analysis
1. Go to http://localhost:5175
2. Click "RUN ANALYSIS"
3. The analysis should now work!

## Why This Happens
The backend uses relative imports like:
```python
from .models import ...
from .graph_builder import ...
```

These only work when Python can see `backend` as a module, which requires running from the parent directory.

## Current Directory Check
Run this to see where you are:
```bash
pwd  # or on Windows: cd
```

You should see: `C:\Users\SRIDHAR RAO\OneDrive\Desktop\PharmAI Nexus`
NOT: `C:\Users\SRIDHAR RAO\OneDrive\Desktop\PharmAI Nexus\backend`
