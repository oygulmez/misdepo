-- Add slug column to products table
ALTER TABLE products ADD COLUMN slug VARCHAR(600) UNIQUE;

-- Create index for better performance
CREATE INDEX idx_products_slug ON products(slug);

-- Update existing products with slugs based on their names
UPDATE products 
SET slug = LOWER(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REGEXP_REPLACE(
                TRIM(name), 
                '[^a-zA-ZÇĞIİÖŞÜçğıiöşü0-9\s]', 
                '', 
                'g'
              ), 
              'ğ', 'g'
            ), 
            'ü', 'u'
          ), 
          'ş', 's'
        ), 
        'ı', 'i'
      ), 
      'ö', 'o'
    ), 
    'ç', 'c'
  )
)
WHERE slug IS NULL;

-- Replace spaces with hyphens and multiple hyphens with single hyphen
UPDATE products 
SET slug = REGEXP_REPLACE(
  REGEXP_REPLACE(slug, '\s+', '-', 'g'),
  '-+', '-', 'g'
)
WHERE slug IS NOT NULL;

-- Ensure no trailing or leading hyphens
UPDATE products 
SET slug = TRIM(BOTH '-' FROM slug)
WHERE slug IS NOT NULL;

-- Make slug column NOT NULL after updating existing records
ALTER TABLE products ALTER COLUMN slug SET NOT NULL; 