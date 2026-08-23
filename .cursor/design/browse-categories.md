# Browse — Flat Category Discovery

Reference layout: banner parent categories with nested list rows for sub/child levels.

```text
Discover

┌─────────────────────────────┐
│ CLOTHING          [photo]   │  ← tap expands
└─────────────────────────────┘
│ Jacket                    › │
│ Skirts                    › │
│ Dresses                   ⌄ │
│     Sweaters              › │  ← indented child
│     Jeans                 › │
├─────────────────────────────┤
│ ACCESSORIES       [photo]   │  ← collapsed
└─────────────────────────────┘
```

## Interaction

- **Parent banner** → expand/collapse subcategory list (lazy-loaded)
- **Subcategory row (no children)** → Product Listing
- **Subcategory row (has children)** → expand indented child rows
- **Child row** → Product Listing filtered to child
- **Empty parent** → "Shop all {category}" row

## APIs (unchanged)

- `GET /categories`
- `GET /sub-categories/search/parent/{parentId}`
- `GET /child-category/search/parent/{parentId}`

No search bar or filter on this screen.
