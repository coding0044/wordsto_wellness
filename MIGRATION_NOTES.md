# Category-Subcategory Relationship Migration

## Overview
Updated the database schema to support **multiple parent categories per subcategory** instead of the previous one-to-one relationship.

## Schema Changes

### Before
```javascript
{
  _id: ObjectId,
  name: "Extended Family",
  slug: "extended-family",
  category: ObjectId("category1Id"),  // Single category reference
  description: "...",
  createdAt: Date
}
```

### After
```javascript
{
  _id: ObjectId,
  name: "Extended Family",
  slug: "extended-family",
  categories: [ObjectId("category1Id"), ObjectId("category4Id")],  // Array of categories
  description: "...",
  createdAt: Date
}
```

## Files Modified

### Database Models
- `app/lib/models/Subcategory.ts` - Changed `category` field to `categories` (array)
- `src/lib/models/Subcategory.ts` - Same changes as above

### API Routes
**Public API (Read-only):**
- `app/api/public/subcategories/route.ts` - Updated query to use `$in` operator with categories array
- `app/api/public/categories/route.ts` - Updated filtering logic to check if category ID exists in categories array
- `app/api/public/content-tree/route.ts` - Updated normalization and filtering
- `src/app/api/public/subcategories/route.ts` - Same as above
- `src/app/api/public/categories/route.ts` - Same as above
- `src/app/api/public/content-tree/route.ts` - Same as above

**Admin API (Read/Write):**
- `app/api/content/subcategories/route.ts` - Updated POST/PUT to accept `categories` array instead of single `category`
- `src/app/api/content/subcategories/route.ts` - Same as above

### Service Layer
- `app/services/content-service.ts` - Updated Subcategory interface to use `categories: string[]`
- `app/services/content-service.ts` - Updated CreateSubcategoryData interface to use `categories: string[]`
- `src/services/content-service.ts` - Same changes as above

## Removed Workarounds

The following hardcoded workarounds have been **removed** as the schema now properly supports the use case:

1. **Virtual "Relationship Issues" Category** - Previously created in response if it didn't exist in DB
2. **targetSubcategoryIds** - Set of hardcoded IDs for subcategories to duplicate under Relationship Issues:
   - `6a1db8deba24320b8a390c99`
   - `6a1db8deba24320b8a390c90`
   - `6a1db8deba24320b8a390c93`
   - `6a1db8deba24320b8a390c8f`
   - `6a1db8deba24320b8a390c96`

3. **targetSubcategoryNames** - Hardcoded name patterns for matching subcategories

## Data Migration Required

### Important: Existing data must be migrated before deploying to production

The old `category` field (single ObjectId) needs to be converted to the new `categories` field (array of ObjectIds).

**MongoDB Migration Script:**
```javascript
db.subcategories.updateMany(
  { category: { $exists: true, $ne: null } },
  [
    {
      $set: {
        categories: { $cond: [{ $isArray: "$category" }, "$category", ["$category"]] }
      }
    },
    {
      $unset: ["category"]
    }
  ]
);
```

Or using Mongoose in a migration file:
```javascript
const result = await Subcategory.updateMany(
  { category: { $exists: true } },
  [
    {
      $set: {
        categories: {
          $cond: [
            { $isArray: "$category" },
            "$category",
            ["$category"]
          ]
        }
      }
    },
    { $unset: ["category"] }
  ]
);
```

## API Changes

### Creating Subcategories
**Before:**
```json
POST /api/content/subcategories
{
  "name": "Extended Family",
  "category": "category1Id",
  "description": "..."
}
```

**After:**
```json
POST /api/content/subcategories
{
  "name": "Extended Family",
  "categories": ["category1Id", "category4Id"],
  "description": "..."
}
```

### Updating Subcategories
**Before:**
```json
PUT /api/content/subcategories
{
  "id": "subcategoryId",
  "name": "Extended Family",
  "category": "category1Id",
  "description": "..."
}
```

**After:**
```json
PUT /api/content/subcategories
{
  "id": "subcategoryId",
  "name": "Extended Family",
  "categories": ["category1Id", "category4Id"],
  "description": "..."
}
```

### Fetching Subcategories
**Endpoint:** `GET /api/public/subcategories?categoryId=category1Id`

The query parameter remains the same, but now:
- Internally uses MongoDB `$in` operator: `{ categories: { $in: [categoryId] } }`
- Returns all subcategories that have the given category ID in their categories array
- A subcategory can now appear under multiple categories

## Result

### Before
- "Extended Family" subcategory appears only under Category 4
- To have it under multiple categories required:
  - Creating duplicate subcategories (not ideal)
  - Hardcoding workarounds in API routes

### After
- "Extended Family" subcategory has `categories: ["category1Id", "category4Id"]`
- When fetching subcategories for Category 1, it automatically appears
- When fetching subcategories for Category 4, it also automatically appears
- Single source of truth - one record, multiple associations
- Topics continue to reference the same subcategory record

## Backward Compatibility

The API normalizeSubcategory functions handle both old and new formats gracefully:
- Checks for `categories` array
- Falls back to `category_ids`, `categoryIds`, or legacy `category` field if present
- Ensures smooth transition during migration

## Testing

After deployment and data migration:
1. Verify that existing subcategories appear correctly under their categories
2. Test creating a new subcategory with multiple categories
3. Test updating a subcategory to add/remove categories
4. Verify that content-tree and categories endpoints return correct associations
5. Confirm that topics still reference the correct subcategories
