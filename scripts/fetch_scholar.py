import json

# In reality, you would import 'scholarly' here and fetch data
# For now, this script ensures the format matches what React expects.

data = [
    {
        "title": "Real-time Data Analysis in Python",
        "authors": "M Mohsin",
        "journal": "Dalhousie CS Journal",
        "citations": 5,
        "year": "2025",
        "link": "https://scholar.google.com/citations?user=L6Esq54AAAAJ&hl=en"
    },
    # Add logic here to fetch real data
]

with open('public/scholar.json', 'w') as f:
    json.dump(data, f)