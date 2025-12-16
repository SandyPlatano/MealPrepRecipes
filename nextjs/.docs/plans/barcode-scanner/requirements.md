# Feature: Barcode Scanner for Pantry

## Overview

Add barcode scanning capability to the Pantry feature, allowing users to scan grocery products to add them to their pantry and view nutrition information.

## Requirements Summary

| Aspect | Decision |
|--------|----------|
| **Primary Use Cases** | Add items to pantry + View nutrition info |
| **Location** | Pantry page (alongside existing photo scanner) |
| **Data Source** | Open Food Facts API (free, open-source) |
| **Found Flow** | Show details → Confirm → Add to pantry |
| **Not Found Flow** | Fallback to manual entry form |
| **Access Control** | Same quota as photo scanning (Free: none, Pro: 10/month, Premium: unlimited) |
| **Nutrition Storage** | Display only (not persisted) |

---

## User Flow

```
User selects "Barcode" mode in Smart Scan tab
        ↓
[Camera Permission Check]
        ↓
    ┌───┴───┐
    ↓       ↓
[Granted] [Denied] → Manual barcode entry
    ↓
[Active Scanning - Live camera with scan overlay]
        ↓
[Barcode Detected → API Lookup]
        ↓
    ┌───┴───┐
    ↓       ↓
[Found]  [Not Found] → Manual entry form (name + category)
    ↓
[Review Product]
 - Product name (editable)
 - Brand
 - Category (editable dropdown)
 - Nutrition panel (display only)
        ↓
[Confirm → Add to Pantry]
        ↓
[Success Toast → Option to "Scan Another"]
```

---

## Technical Implementation

### New Files to Create

| File | Purpose |
|------|---------|
| `components/pantry/barcode-scanner.tsx` | Main scanner component with camera UI |
| `components/pantry/barcode-result-review.tsx` | Product confirmation dialog |
| `app/api/pantry/lookup-barcode/route.ts` | API route for Open Food Facts lookup |
| `lib/open-food-facts.ts` | OFF API client utility |
| `types/barcode.ts` | TypeScript interfaces |

### Files to Modify

| File | Changes |
|------|---------|
| `components/pantry/enhanced-pantry-view.tsx` | Add barcode/photo toggle within "Smart Scan" tab |
| `types/shopping-list.ts` | Extend `PantryItem.source` to include `'barcode'` |

### Key Dependencies

```bash
npm install html5-qrcode
```

**Why html5-qrcode:**
- Lightweight (~200KB), pure JavaScript
- Excellent mobile camera support (critical for PWA)
- Supports all retail barcode formats: EAN-13, EAN-8, UPC-A, UPC-E
- No native dependencies (works with Next.js)

### Open Food Facts API

**Endpoint:** `GET https://world.openfoodfacts.org/api/v2/product/{barcode}`

**Key Response Fields:**
- `product_name` - Item name
- `brands` - Brand name
- `categories_tags` - Category array (map to app categories)
- `nutriments` - Nutrition data per 100g
- `image_url` - Product image

### Category Mapping

Map OFF categories to existing app categories:
```
en:beverages → Beverages
en:dairy → Dairy & Eggs
en:meats, en:seafood → Meat & Seafood
en:frozen-foods → Frozen
en:snacks → Snacks
en:sauces → Condiments
en:cereals, en:canned-foods → Pantry
en:breads → Bakery
en:fruits, en:vegetables → Produce
(default) → Other
```

---

## Component Specifications

### BarcodeScanner Component

**Props:**
```typescript
interface BarcodeScannerProps {
  onScanComplete: (product: ScannedProduct) => void;
  onNotFound: (barcode: string) => void;
  subscriptionTier: 'free' | 'pro' | 'premium';
}
```

**States:**
1. **Permission Request** - "Allow camera access to scan barcodes"
2. **Active Scanning** - Live camera feed with rectangular scan overlay
3. **Processing** - Loading spinner after barcode detected
4. **Error** - Network/API error with retry option

**Features:**
- Rear camera with `facingMode: "environment"`
- Rectangular scan area (optimized for linear barcodes)
- Haptic feedback on successful scan (Vibration API)
- Manual barcode entry fallback button
- Subscription gating (reuse pattern from pantry-scanner.tsx)
- Quota display badge (reuse existing pattern)

### BarcodeResultReview Component

**Display Elements:**
- Product image (if available from OFF)
- Product name (editable input)
- Brand name (read-only)
- Category dropdown (editable, pre-filled from mapping)
- Collapsible nutrition panel:
  - Calories per 100g
  - Protein, Carbs, Fat
  - Fiber, Sugar, Sodium (if available)
- "Add to Pantry" primary button
- "Scan Another" secondary button
- "Cancel" link

### API Route: `/api/pantry/lookup-barcode`

**Request:** `POST { barcode: string }`

**Response:**
```typescript
{
  found: boolean;
  product?: {
    barcode: string;
    name: string;
    brand?: string;
    category: string;
    quantity?: string;
    imageUrl?: string;
    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
    };
  };
  error?: string;
}
```

**Responsibilities:**
1. Validate authentication (reuse existing pattern)
2. Check subscription tier and quota
3. Call Open Food Facts API
4. Map categories to app categories
5. Increment `pantry_scans_used` quota counter
6. Return standardized response

---

## Implementation Order

### Phase 1: Foundation
1. Install `html5-qrcode` dependency
2. Create `types/barcode.ts` with interfaces
3. Create `lib/open-food-facts.ts` API client

### Phase 2: API Layer
4. Create `/api/pantry/lookup-barcode/route.ts`
5. Update `types/shopping-list.ts` - add `'barcode'` to source type

### Phase 3: Scanner Component
6. Create `barcode-scanner.tsx` component
7. Create `barcode-result-review.tsx` component

### Phase 4: Integration
8. Modify Smart Scan tab to support both modes:
   - Add mode toggle (Photo / Barcode) at top of Smart Scan tab
   - Conditionally render `PantryScanner` or `BarcodeScanner` based on mode
   - Handle scan completion and not-found flows for both modes

### Phase 5: Polish
9. Add loading states and error handling
10. Test on mobile devices (iOS Safari, Chrome Android)
11. Verify quota enforcement works correctly

---

## Critical Files Reference

Files to use as patterns:
- `src/components/pantry/pantry-scanner.tsx` - Subscription gating, quota display, scanning UI
- `src/components/pantry/scan-review.tsx` - Review/confirm pattern
- `src/app/api/pantry/scan-image/route.ts` - API auth, quota checking, error handling

Files to modify:
- `src/components/pantry/enhanced-pantry-view.tsx` - Add mode toggle in Smart Scan tab
- `src/types/shopping-list.ts` - Extend PantryItem.source
