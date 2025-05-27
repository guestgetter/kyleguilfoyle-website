#!/bin/bash

# Script to update SEO meta tags in all guide HTML files

echo "Updating SEO meta tags for guide HTML files..."

# Function to update SEO tags in a guide file
update_guide_seo_tags() {
    FILE=$1
    FILENAME=$(basename "$FILE")
    SLUG=${FILENAME%.html}
    
    # Extract the title from the file
    TITLE=$(grep -o '<title>.*</title>' "$FILE" | sed 's/<title>\(.*\)<\/title>/\1/')
    
    # If no title found, extract from h1
    if [ -z "$TITLE" ]; then
        TITLE=$(grep -o '<h1>.*</h1>' "$FILE" | sed 's/<h1>\(.*\)<\/h1>/\1/')
    fi
    
    # Create description based on title
    DESCRIPTION="$TITLE - Strategic guide for restaurant owners by Kyle Guilfoyle, Restaurant Growth Engineer. Learn how to transform your restaurant business."
    
    # Check if SEO meta tags already exist
    if grep -q "SEO Meta Tags" "$FILE"; then
        echo "SEO tags already exist in $FILENAME"
    else
        echo "Adding SEO tags to $FILENAME"
        
        # Use sed to insert SEO tags after the title
        sed -i '' "s#<title>.*</title>#<title>$TITLE</title>\n    \n    <!-- SEO Meta Tags -->\n    <meta name=\"description\" content=\"$DESCRIPTION\">\n    <meta name=\"keywords\" content=\"restaurant growth, restaurant marketing, $SLUG, restaurant systems, restaurant profitability\">\n    <meta name=\"author\" content=\"Kyle Guilfoyle\">\n    \n    <!-- Open Graph / Social Media -->\n    <meta property=\"og:type\" content=\"article\">\n    <meta property=\"og:title\" content=\"$TITLE\">\n    <meta property=\"og:description\" content=\"$DESCRIPTION\">\n    <meta property=\"og:url\" content=\"https://kyleguilfoyle.com/guides/$FILENAME\">\n    <meta property=\"og:image\" content=\"https://kyleguilfoyle.com/$SLUG.png\">\n    <link rel=\"canonical\" href=\"https://kyleguilfoyle.com/guides/$FILENAME\">#" "$FILE"
    fi
}

# Process all HTML files in the guides directory
for file in guides/*.html; do
    update_guide_seo_tags "$file"
done

echo "Guide SEO update complete!" 