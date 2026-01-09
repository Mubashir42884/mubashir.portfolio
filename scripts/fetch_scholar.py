import json
from scholarly import scholarly

# Your Google Scholar ID
AUTHOR_ID = 'L6Esq54AAAAJ'

def fetch_publications():
    print(f"Fetching data for Author ID: {AUTHOR_ID}...")
    
    try:
        # Search for the author
        author = scholarly.search_author_id(AUTHOR_ID)
        # Fill the author object with sections (publications, etc.)
        author = scholarly.fill(author, sections=['publications'])
        
        cleaned_pubs = []
        
        # Sort publications by year (newest first)
        pubs = author['publications']
        pubs.sort(key=lambda x: x['bib'].get('pub_year', '0'), reverse=True)

        for pub in pubs:
            # Create a clean dictionary for our website
            # We use .get() to avoid errors if a field is missing
            entry = {
                "title": pub['bib'].get('title', 'Untitled'),
                "authors": pub['bib'].get('author', 'Unknown Author'),
                "journal": pub['bib'].get('journal', pub['bib'].get('venue', 'Preprint/Unknown')),
                "year": pub['bib'].get('pub_year', 'n.d.'),
                "citations": pub.get('num_citations', 0),
                "link": f"https://scholar.google.com/citations?view_op=view_citation&hl=en&user={AUTHOR_ID}&citation_for_view={pub['author_pub_id']}"
            }
            cleaned_pubs.append(entry)

        # Save to the public folder where Next.js can read it
        with open('public/scholar.json', 'w', encoding='utf-8') as f:
            json.dump(cleaned_pubs, f, indent=2)
            
        print(f"Successfully scraped {len(cleaned_pubs)} publications.")

    except Exception as e:
        print(f"Error occurred: {e}")
        # We don't overwrite the file if there's an error, to preserve old data
        exit(1)

if __name__ == "__main__":
    fetch_publications()