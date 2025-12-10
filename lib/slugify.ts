/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns A lowercase, hyphenated slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')    // Remove non-word characters (except hyphens)
    .replace(/\-\-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')          // Remove leading hyphens
    .replace(/-+$/, '')          // Remove trailing hyphens
    .substring(0, 50)            // Limit to 50 characters
}

/**
 * Generate a unique slug by appending a number if the base slug already exists
 * @param baseSlug - The base slug to start with
 * @param checkExists - Function to check if a slug exists
 * @returns A unique slug
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug
  let counter = 1
  
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
    
    // Safety limit to prevent infinite loops
    if (counter > 100) {
      // Fallback to timestamp if too many duplicates
      slug = `${baseSlug}-${Date.now()}`
      break
    }
  }
  
  return slug
}

