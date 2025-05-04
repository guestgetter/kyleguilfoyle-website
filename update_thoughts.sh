#!/bin/bash

# Loop through all HTML files in the thoughts directory
for file in thoughts/*.html; do
    # Skip backup files
    if [[ $file == *.bak ]]; then
        continue
    fi
    
    # Create backup
    cp "$file" "${file}.bak"
    
    # Update the file with new structure
    sed -i '' -e '
        # Change relative paths to absolute
        s/href="..\/style.css"/href="\/style.css"/g
        s/href="..\/index.html"/href="\/">/g
        s/href="..\/about.html"/href="\/about.html"/g
        s/href="..\/thoughts.html"/href="\/thoughts.html"/g
        s/href="..\/contact.html"/href="\/contact.html"/g
        
        # Add article container and back link if not present
        /<article/i\
        <div class="article-container">\
        <a href="/thoughts.html" class="article-back-link">\
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>\
        </a>
        
        # Close article container div
        /<\/article>/a\
        </div>
    ' "$file"
done

echo "Updated all thought posts successfully!" 