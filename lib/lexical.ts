/**
 * Extracts plain text from a Lexical JSON string.
 * Lexical stores editor state as a nested JSON structure.
 * This utility traverses that structure to get a readable string.
 */
export function extractTextFromLexical(jsonString: string | null | undefined): string {
  if (!jsonString) return '';
  
  // Basic check to see if it's even a JSON string
  if (!jsonString.trim().startsWith('{')) {
    return jsonString;
  }

  try {
    const data = JSON.parse(jsonString);
    
    // Check if it's a Lexical structure (has a root property)
    if (!data || !data.root) {
      return jsonString;
    }

    /**
     * Recursively extracts text from nodes
     */
    const extract = (node: any): string => {
      if (!node) return '';
      
      // Text nodes contain the actual content
      if (node.type === 'text') {
        return node.text || '';
      }
      
      // If the node has children, process them
      if (node.children && Array.isArray(node.children)) {
        let text = node.children.map(extract).join('');
        
        // Add newlines for block-level elements to maintain basic structure
        if (['paragraph', 'heading', 'listitem'].includes(node.type)) {
          text += '\n';
        }
        
        return text;
      }
      
      return '';
    };

    return extract(data.root).trim();
  } catch (e) {
    // If parsing fails, it's likely just plain text that happened to start with {
    return jsonString;
  }
}
