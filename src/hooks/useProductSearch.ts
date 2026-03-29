import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Normalize Albanian characters for fuzzy matching
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .replace(/[^\w\s]/g, "");
}

// Check if query words match the target (supports typos via Levenshtein)
function fuzzyMatch(query: string, target: string): number {
  var normQuery = normalize(query);
  var normTarget = normalize(target);

  // Exact substring match — best score
  if (normTarget.includes(normQuery)) return 100;

  // Word-level matching
  var queryWords = normQuery.split(/\s+/).filter(Boolean);
  var score = 0;
  var matched = 0;

  for (var i = 0; i < queryWords.length; i++) {
    var qw = queryWords[i];
    // Check if any word in target starts with query word
    var targetWords = normTarget.split(/\s+/);
    var bestWordScore = 0;
    for (var j = 0; j < targetWords.length; j++) {
      var tw = targetWords[j];
      if (tw.startsWith(qw)) {
        bestWordScore = Math.max(bestWordScore, 90);
      } else if (tw.includes(qw)) {
        bestWordScore = Math.max(bestWordScore, 70);
      } else if (qw.length >= 3) {
        // Levenshtein for typo tolerance (only for 3+ char words)
        var dist = levenshtein(qw, tw.substring(0, qw.length + 1));
        if (dist <= 1) {
          bestWordScore = Math.max(bestWordScore, 50);
        } else if (dist <= 2 && qw.length >= 5) {
          bestWordScore = Math.max(bestWordScore, 30);
        }
      }
    }
    score += bestWordScore;
    if (bestWordScore > 0) matched++;
  }

  // All query words must match something
  if (matched < queryWords.length) return 0;
  return score / queryWords.length;
}

function levenshtein(a: string, b: string): number {
  var matrix: number[][] = [];
  for (var i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (var j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  for (var i = 1; i <= a.length; i++) {
    for (var j = 1; j <= b.length; j++) {
      var cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

export const useProductSearch = (query: string) => {
  var trimmed = query.trim().toLowerCase();

  var productsQuery = useQuery({
    queryKey: ["products-search"],
    queryFn: async function () {
      var result = await supabase
        .from("products")
        .select("id, title_al, title_en, code, image_url, collection_id, composition_al, composition_en, slug")
        .eq("visible", true)
        .order("sort_order");
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 60000,
  });
  var products = productsQuery.data;

  var collectionsQuery = useQuery({
    queryKey: ["collections-search"],
    queryFn: async function () {
      var result = await supabase
        .from("collections")
        .select("id, slug, title_al, title_en")
        .eq("visible", true);
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 60000,
  });
  var collections = collectionsQuery.data;

  var collectionMap = useMemo(function () {
    var map = new Map<string, { slug: string; title_al: string; title_en: string }>();
    if (collections) {
      collections.forEach(function (c) { map.set(c.id, c); });
    }
    return map;
  }, [collections]);

  var results = useMemo(function () {
    if (!trimmed || trimmed.length < 1 || !products) return [];

    var scored: { product: any; score: number }[] = [];

    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      var searchFields = [
        p.title_al || "",
        p.title_en || "",
        p.code || "",
        p.composition_al || "",
        p.composition_en || "",
      ].join(" ");

      var score = fuzzyMatch(trimmed, searchFields);

      // Boost if title starts with query
      if (normalize(p.title_al || "").startsWith(normalize(trimmed)) ||
          normalize(p.title_en || "").startsWith(normalize(trimmed))) {
        score += 20;
      }

      // Boost exact code match
      if (p.code && normalize(p.code).includes(normalize(trimmed))) {
        score += 30;
      }

      if (score > 0) {
        scored.push({ product: p, score: score });
      }
    }

    // Sort by score descending
    scored.sort(function (a, b) { return b.score - a.score; });

    return scored.slice(0, 10).map(function (item) {
      var col = collectionMap.get(item.product.collection_id);
      return Object.assign({}, item.product, {
        collectionSlug: col ? col.slug : "",
        collectionTitle_al: col ? col.title_al : "",
        collectionTitle_en: col ? col.title_en : "",
      });
    });
  }, [trimmed, products, collectionMap]);

  return { results: results, hasQuery: trimmed.length >= 1 };
};
