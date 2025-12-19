'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, ShoppingCart, Copy, Check } from 'lucide-react';
import type { QuickCookIngredient } from '@/types/quick-cook';

interface QuickCookShoppingProps {
  ingredients: QuickCookIngredient[];
  onAffiliateClick?: () => void;
}

/**
 * Generate Amazon Fresh search URL for an ingredient
 * Uses affiliate tag from environment if available
 */
function getAmazonSearchUrl(ingredient: QuickCookIngredient): string {
  const searchTerm = ingredient.affiliate_search_term || ingredient.item;
  const encodedSearch = encodeURIComponent(searchTerm);

  // Get affiliate tag from environment (set in .env.local)
  // NEXT_PUBLIC_ prefix makes it available on client
  const affiliateTag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || '';

  const baseUrl = 'https://www.amazon.com/s';
  const params = new URLSearchParams({
    k: encodedSearch,
    i: 'amazonfresh', // Search in Amazon Fresh category
  });

  if (affiliateTag) {
    params.set('tag', affiliateTag);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a consolidated shopping list URL
 */
function getConsolidatedSearchUrl(ingredients: QuickCookIngredient[]): string {
  const items = ingredients
    .map((i) => i.affiliate_search_term || i.item)
    .slice(0, 5) // Limit to first 5 for reasonable search
    .join(' ');

  const encodedSearch = encodeURIComponent(items);
  const affiliateTag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || '';

  const baseUrl = 'https://www.amazon.com/s';
  const params = new URLSearchParams({
    k: encodedSearch,
    i: 'amazonfresh',
  });

  if (affiliateTag) {
    params.set('tag', affiliateTag);
  }

  return `${baseUrl}?${params.toString()}`;
}

export function QuickCookShopping({
  ingredients,
  onAffiliateClick,
}: QuickCookShoppingProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const handleCheck = (item: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(item)) {
      newChecked.delete(item);
    } else {
      newChecked.add(item);
    }
    setCheckedItems(newChecked);
  };

  const handleCopyList = async () => {
    const listText = ingredients
      .map((i) => `${i.quantity} ${i.item}${i.notes ? ` (${i.notes})` : ''}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(listText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShopAmazon = () => {
    onAffiliateClick?.();
    // Open consolidated search
    window.open(getConsolidatedSearchUrl(ingredients), '_blank');
  };

  const uncheckedCount = ingredients.length - checkedItems.size;

  return (
    <div className="flex flex-col gap-4">
      {/* Info banner about affiliate setup */}
      {!process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <strong>Note:</strong> Amazon affiliate tracking is not configured.
          Shopping links will still work, but you won&apos;t earn commission.
          <a
            href="https://affiliate-program.amazon.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-coral-500 hover:underline ml-1"
          >
            Set up Amazon Associates
          </a>
        </div>
      )}

      {/* Shopping list */}
      <div className="flex flex-col gap-2">
        {ingredients.map((ingredient, index) => {
          const isChecked = checkedItems.has(ingredient.item);
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isChecked ? 'bg-muted/50 opacity-60' : 'hover:bg-muted/30'
              }`}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => handleCheck(ingredient.item)}
                id={`ingredient-${index}`}
              />
              <label
                htmlFor={`ingredient-${index}`}
                className={`flex-1 text-sm cursor-pointer ${
                  isChecked ? 'line-through' : ''
                }`}
              >
                <strong>{ingredient.quantity}</strong> {ingredient.item}
                {ingredient.notes && (
                  <span className="text-muted-foreground"> ({ingredient.notes})</span>
                )}
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  onAffiliateClick?.();
                  window.open(getAmazonSearchUrl(ingredient), '_blank');
                }}
                title={`Search for ${ingredient.item} on Amazon Fresh`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 pt-2 border-t">
        <Button
          onClick={handleShopAmazon}
          className="w-full bg-[#FF9900] hover:bg-[#e88b00] text-black"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Shop on Amazon Fresh
          {uncheckedCount < ingredients.length && ` (${uncheckedCount} items)`}
        </Button>

        <Button variant="outline" onClick={handleCopyList} className="w-full">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Shopping List
            </>
          )}
        </Button>
      </div>

      {/* Affiliate disclosure */}
      <p className="text-[10px] text-muted-foreground text-center">
        As an Amazon Associate, we may earn from qualifying purchases.
      </p>
    </div>
  );
}
