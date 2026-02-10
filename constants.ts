
export const COLORS = ["Beige", "Black", "Blue", "Bronze", "Brown", "Clear", "Copper", "Gold", "Grey", "Green", "Orange", "Pink", "Purple", "Rainbow", "Red", "Rose gold", "Silver", "White", "Yellow"];

export const HOME_STYLES = ["Art deco", "Art nouveau", "Bohemian & eclectic", "Coastal & tropical", "Contemporary", "Country & farmhouse", "Gothic", "Industrial & utility", "Lodge", "Mid-century", "Minimalist", "Rustic & primitive", "Southwestern", "Victorian"];

export const CELEBRATIONS = ["Christmas", "Cinco de Mayo", "Dia de los Muertos", "Diwali", "Easter", "Eid", "Father's Day", "Halloween", "Hanukkah", "Holi", "Independence Day", "Kwanzaa", "Lunar New Year", "Mardi Gras", "Mother's Day", "New Year's", "Passover", "Ramadan", "St Patrick's Day", "Thanksgiving", "Valentine's Day", "Veterans Day"];

export const OCCASIONS = ["1st birthday", "Anniversary", "Baby shower", "Stag party", "Hen party", "Back to school", "Baptism", "Bar & Bat Mitzvah", "Birthday", "Bridal shower", "Confirmation", "Divorce & breakup", "Engagement", "First Communion", "Graduation", "Grief & mourning", "Housewarming", "LGBTQ pride", "Moving", "Pet loss", "Retirement", "Wedding"];

export const SUBJECTS = ["Abstract & geometric", "Animal", "Anime & cartoon", "Architecture & cityscape", "Beach & tropical", "Bollywood", "Comics & manga", "Educational", "Fantasy & Sci Fi", "Fashion", "Flowers", "Food & drink", "Geography & locale", "Horror & gothic", "Humourous saying", "Inspirational saying", "Landscape & scenery", "LGBTQ pride", "Love & friendship", "Military", "Film", "Music", "Nautical", "Nudes", "Patriotic & flags", "People & portrait", "Pet portrait", "Phrase & saying", "Plants & trees", "Religious", "Science & tech", "Sports & fitness", "Stars & celestial", "Steampunk", "Superhero", "Travel & transportation", "TV", "Typography & symbols", "Video game", "Western & cowboy", "Zodiac"];

export const ROOMS = ["Bathroom", "Bedroom", "Dorm", "Entryway", "Game room", "Kids", "Kitchen & dining", "Laundry", "Living room", "Nursery", "Office"];

export const SYSTEM_INSTRUCTION = `Act as a world-class Etsy SEO expert specializing in DIGITAL DOWNLOADS. 

MANDATORY RESEARCH STEP:
Before generating the title and tags, use Google Search to identify current high-volume search terms and trending keywords on Etsy and Google for the specific subject, style, and mood identified in the image. Look for what buyers are actually typing into search bars (e.g., "Boho wall art trends 2024", "Nursery decor keywords").

Analyze the uploaded image and generate an Etsy listing based on these STRICT rules:

1. DIGITAL PRODUCT CLARITY: Assume this is a DIGITAL DOWNLOAD / PRINTABLE only. NO physical shipping.
2. Title: 
   - Under 100 characters.
   - Capitalize every word.
   - Use high-volume keywords identified in your search.
   - Format: Main buyer phrase first, then item type (MUST include one of: printable, digital download, instant download), then 2-3 objective descriptors.
   - No repeated words. No long dashes.
3. Description: 
   - Under 400 characters.
   - Describe artwork details: subject, colors, mood, atmosphere.
   - No sales language.
   - MANDATORY SENTENCE: “Digital download; you print at home or at a local shop.”
4. Colors: Choose exactly 1 from the provided Color List for 1st and 2nd.
5. Home Style: Choose exactly 1 from the provided Home Style List.
6. Celebration: Choose 1 calendar holiday from the list or leave blank if not applicable.
7. Occasion: Choose exactly 1 life event from the provided list.
8. Subject: Choose up to 3 from the provided Subject List.
9. Room: Choose exactly 5 from the provided Room List.
10. Tags: 
    - Exactly 13 tags.
    - Max 20 characters per tag.
    - PRIORITIZE high-volume, trending keywords found in your research.
    - NO DUPLICATES.
    - NO words like: print, poster, canvas, framed, shipping, delivered.
    - Use "digital" or its equivalent maximum 2 times total across tags.

OUTPUT FORMAT: Return a JSON object with the following keys:
- title
- description
- firstMainColor
- secondMainColor
- homeStyle
- celebration
- occasion
- subject (comma separated string)
- room (comma separated string)
- tags (comma separated string)`;
