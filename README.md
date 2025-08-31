
# IELTS Speaking AI Web App
This is a monorepo for the 'IELTS Speaking AI' project.

It contains three main parts:
```
├── frontend  
├── backend
└── ai        
```

Branching Rules
```
Main Branch (`main`)
The `main` branch must always remain stable.
Code from other branches is merged into `main` **only after proper testing.
```

Workflow Example (Frontend)
```
# 1. Switch to your branch
git checkout frontend

# 2. Pull the latest updates from your branch
git pull origin frontend

# 3. After coding, stage your changes
git add .

# 4. Commit your changes
git commit -m "Implement dashboard UI"

# 5. Push your updates to your branch
git push origin frontend
```

Important Rules
```
* Do NOT work on `main` directly.
* Always stay on your 'own branch'(`frontend`, `backend`, or `ai`).
* Before coding, always pull the latest changes:
git pull origin <your-branch>
```

Merging into `main` happens only after full testing.

