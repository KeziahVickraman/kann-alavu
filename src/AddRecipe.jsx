import React from 'react';

const readStoredValue = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const readStoredBoolean = (key) => {
  return readStoredValue(key, 'false') === 'true';
};

const readStoredJson = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const EXTRACTION_ERROR_MESSAGE = "Couldn't extract a recipe from that link. Try pasting the recipe manually.";
const MISSING_TEXT_ERROR_MESSAGE = 'Paste the caption or recipe text below, then import.';
const SOCIAL_URL_TIP = "Open this post, copy the caption or recipe text, and paste it below. We'll do the rest.";
const SOURCE_TAGS = ['TikTok', 'Instagram', 'YouTube', 'Manual'];

const EXTRACTION_SYSTEM_PROMPT = 'You are a recipe extraction assistant. Extract a recipe from the following text and return JSON only — no markdown, no explanation, no backticks. Return exactly this shape: { "title": "string", "ingredients": [{ "name": "string", "quantity": "string", "unit": "string", "customAlavu": "string or empty string" }], "steps": ["string"], "ammasNotes": "string or empty string" }. For customAlavu, if the source describes an ingredient by feel or sense rather than precise measurement, capture that sensory description. Otherwise empty string.';
const URL_EXTRACTION_SYSTEM_PROMPT = 'You are a recipe extraction assistant. When given a publicly readable recipe URL, extract the recipe and return JSON only — no markdown, no explanation, no backticks. Return exactly this shape: { "title": "string", "ingredients": [{ "name": "string", "quantity": "string", "unit": "string", "customAlavu": "string or empty string" }], "steps": ["string"], "ammasNotes": "string or empty string" }. For customAlavu, if the source describes an ingredient by feel or sense rather than precise measurement, capture that sensory description. Otherwise empty string.';

const isSocialRecipeUrl = (value) => {
  return /(?:^|\.)tiktok\.com\/|(?:^|\.)instagram\.com\//i.test(value.trim());
};

const getSourceTag = (value) => {
  const trimmedValue = value.trim();
  if (/(?:^|\.)tiktok\.com\//i.test(trimmedValue)) return 'TikTok';
  if (/(?:^|\.)instagram\.com\//i.test(trimmedValue)) return 'Instagram';
  if (/(?:^|\.)youtube\.com\/|(?:^|\.)youtu\.be\//i.test(trimmedValue)) return 'YouTube';
  return 'Manual';
};

const truncateUrl = (value) => {
  return value.length > 42 ? `${value.slice(0, 39)}...` : value;
};

const uniqueTags = (nextTags) => {
  return [...new Set(nextTags.map((tag) => tag.trim()).filter(Boolean))];
};

const extractJsonObject = (text) => {
  const withoutFences = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const jsonStart = withoutFences.indexOf('{');
  const jsonEnd = withoutFences.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error('No JSON object found in extraction response');
  }

  return withoutFences.slice(jsonStart, jsonEnd + 1);
};

const parseExtractionResponse = (text, rawApiResponse) => {
  const parsed = JSON.parse(extractJsonObject(text));
  const ingredients = Array.isArray(parsed.ingredients)
    ? parsed.ingredients.map((ingredient) => ({
      name: String(ingredient.name || ''),
      quantity: String(ingredient.quantity || ''),
      unit: String(ingredient.unit || ''),
      customAlavu: String(ingredient.customAlavu || '')
    })).filter((ingredient) => ingredient.name.trim() !== '')
    : [];
  const steps = Array.isArray(parsed.steps)
    ? parsed.steps.map((step) => String(step || '')).filter((step) => step.trim() !== '')
    : [];

  if (
    typeof parsed.title !== 'string'
    || parsed.title.trim() === ''
    || ingredients.length === 0
    || steps.length === 0
  ) {
    const error = new Error('Invalid extraction response');
    console.error('Recipe extraction validation failed', {
      error,
      rawApiResponse,
      extractedText: text,
      parsed
    });
    throw error;
  }

  return {
    title: parsed.title,
    ingredients,
    steps,
    ammasNotes: typeof parsed.ammasNotes === 'string' ? parsed.ammasNotes : ''
  };
};

const AddRecipe = ({ onAddRecipe, onNavigateBack }) => {
  // Persistence using localstorage so navigating away and returning preserves edit state
  const [editorExpanded, setEditorExpanded] = React.useState(() => {
    return readStoredBoolean('kann_alavu_editor_expanded');
  });

  const [recipeTitle, setRecipeTitle] = React.useState(() => {
    return readStoredValue('kann_alavu_recipe_title', '');
  });

  const [ingredients, setIngredients] = React.useState(() => {
    return readStoredJson('kann_alavu_ingredients', [
      { id: 'ing-1', name: '', quantity: '', unit: 'g', customAlavu: '' }
    ]);
  });

  const [steps, setSteps] = React.useState(() => {
    return readStoredJson('kann_alavu_steps', [
      { id: 'step-1', text: '' }
    ]);
  });

  const [showAlavuToggle, setShowAlavuToggle] = React.useState(() => {
    return readStoredBoolean('kann_alavu_show_alavu');
  });

  const [ammasNotes, setAmmasNotes] = React.useState(() => {
    return readStoredValue('kann_alavu_ammas_notes', '');
  });

  const [url, setUrl] = React.useState('');
  const trimmedUrl = url.trim();
  const isSocialUrl = isSocialRecipeUrl(trimmedUrl);
  const showCaptionField = trimmedUrl && isSocialUrl;
  const [pastedRecipeText, setPastedRecipeText] = React.useState('');
  const [importedSourceUrl, setImportedSourceUrl] = React.useState('');
  const [importing, setImporting] = React.useState(false);
  const [importError, setImportError] = React.useState('');
  const [expandedAlavuIds, setExpandedAlavuIds] = React.useState([]);
  const [customTagInput, setCustomTagInput] = React.useState('');
  const [tags, setTags] = React.useState(() => {
    return readStoredJson('kann_alavu_tags', ['Manual']);
  });
  const sourceTag = getSourceTag(trimmedUrl);

  const toggleAlavuDrilldown = (id) => {
    if (expandedAlavuIds.includes(id)) {
      setExpandedAlavuIds(expandedAlavuIds.filter(item => item !== id));
    } else {
      setExpandedAlavuIds([...expandedAlavuIds, id]);
    }
  };

  const toggleTag = (tag) => {
    setTags((currentTags) => {
      if (currentTags.includes(tag)) {
        return currentTags.filter((item) => item !== tag);
      }
      return uniqueTags([...currentTags, tag]);
    });
  };

  const addCustomTag = () => {
    const nextTag = customTagInput.trim();
    if (!nextTag) return;
    setTags((currentTags) => uniqueTags([...currentTags, nextTag]));
    setCustomTagInput('');
  };

  const setSourceTag = (tag) => {
    setTags((currentTags) => uniqueTags([
      ...currentTags.filter((item) => !SOURCE_TAGS.includes(item)),
      tag
    ]));
  };

  // Sync to localStorage
  React.useEffect(() => {
    localStorage.setItem('kann_alavu_editor_expanded', editorExpanded);
    localStorage.setItem('kann_alavu_recipe_title', recipeTitle);
    localStorage.setItem('kann_alavu_ingredients', JSON.stringify(ingredients));
    localStorage.setItem('kann_alavu_steps', JSON.stringify(steps));
    localStorage.setItem('kann_alavu_show_alavu', showAlavuToggle);
    localStorage.setItem('kann_alavu_ammas_notes', ammasNotes);
    localStorage.setItem('kann_alavu_tags', JSON.stringify(tags));
  }, [editorExpanded, recipeTitle, ingredients, steps, showAlavuToggle, ammasNotes, tags]);

  // Reset form helper
  const resetForm = () => {
    setRecipeTitle('');
    setIngredients([{ id: 'ing-1', name: '', quantity: '', unit: 'g', customAlavu: '' }]);
    setSteps([{ id: 'step-1', text: '' }]);
    setShowAlavuToggle(false);
    setAmmasNotes('');
    setUrl('');
    setPastedRecipeText('');
    setImportedSourceUrl('');
    setCustomTagInput('');
    setTags(['Manual']);
    setEditorExpanded(false);
    localStorage.removeItem('kann_alavu_editor_expanded');
    localStorage.removeItem('kann_alavu_recipe_title');
    localStorage.removeItem('kann_alavu_ingredients');
    localStorage.removeItem('kann_alavu_steps');
    localStorage.removeItem('kann_alavu_show_alavu');
    localStorage.removeItem('kann_alavu_ammas_notes');
    localStorage.removeItem('kann_alavu_tags');
  };

  // Ingredients operations
  const handleAddIngredient = () => {
    const newId = `ing-${Date.now()}`;
    setIngredients([...ingredients, { id: newId, name: '', quantity: '', unit: 'g', customAlavu: '' }]);
  };

  const handleRemoveIngredient = (id) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(item => item.id !== id));
    } else {
      // Clear values of single row
      setIngredients([{ id: 'ing-1', name: '', quantity: '', unit: 'g', customAlavu: '' }]);
    }
  };

  const handleUpdateIngredient = (id, field, value) => {
    setIngredients(ingredients.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Steps operations
  const handleAddStep = () => {
    const newId = `step-${Date.now()}`;
    setSteps([...steps, { id: newId, text: '' }]);
  };

  const handleRemoveStep = (id) => {
    if (steps.length > 1) {
      setSteps(steps.filter(item => item.id !== id));
    } else {
      setSteps([{ id: 'step-1', text: '' }]);
    }
  };

  const handleUpdateStep = (id, value) => {
    setSteps(steps.map(item => {
      if (item.id === id) {
        return { ...item, text: value };
      }
      return item;
    }));
  };

  const handleMoveStep = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    setSteps(newSteps);
  };

  const handleImport = async () => {
    const extractionText = isSocialUrl ? pastedRecipeText.trim() : trimmedUrl;
    if (!extractionText) {
      setImportError(isSocialUrl ? MISSING_TEXT_ERROR_MESSAGE : EXTRACTION_ERROR_MESSAGE);
      return;
    }
    setImporting(true);
    setImportError('');
    let rawApiResponse = null;
    let extractedText = '';

    try {
      // TODO: Move this API call to a server-side function before production.
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY?.trim();
      if (!apiKey) {
        throw new Error('Missing VITE_ANTHROPIC_API_KEY. Restart the Vite dev server after editing .env.local.');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          system: isSocialUrl ? EXTRACTION_SYSTEM_PROMPT : URL_EXTRACTION_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: isSocialUrl
                ? `Extract the recipe from this text: ${extractionText}`
                : `Extract the recipe from this URL: ${extractionText}`
            }
          ]
        })
      });

      const rawResponseText = await response.text();
      try {
        rawApiResponse = JSON.parse(rawResponseText);
      } catch {
        rawApiResponse = rawResponseText;
      }

      if (!response.ok) {
        throw new Error(`Extraction request failed with status ${response.status}`);
      }

      extractedText = rawApiResponse.content?.find((item) => item.type === 'text')?.text || '';
      if (!extractedText) {
        throw new Error('Missing extraction text');
      }

      const extractedRecipe = parseExtractionResponse(extractedText, rawApiResponse);
      const importId = String(rawApiResponse.id || extractedRecipe.title).replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const nextIngredients = extractedRecipe.ingredients.map((ingredient, index) => ({
        id: `ing-${importId}-${index}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        customAlavu: ingredient.customAlavu
      }));
      const nextSteps = extractedRecipe.steps.map((step, index) => ({
        id: `step-${importId}-${index}`,
        text: step
      }));
      const nextSourceTag = getSourceTag(trimmedUrl);

      setRecipeTitle(extractedRecipe.title);
      setIngredients(nextIngredients);
      setSteps(nextSteps);
      setAmmasNotes(extractedRecipe.ammasNotes);
      setShowAlavuToggle(nextIngredients.some((ingredient) => ingredient.customAlavu.trim() !== ''));
      setImportedSourceUrl(trimmedUrl);
      setSourceTag(nextSourceTag);
      setEditorExpanded(true);
    } catch (error) {
      console.error('Recipe extraction failed', {
        error,
        rawApiResponse,
        extractedText
      });
      setImportError(EXTRACTION_ERROR_MESSAGE);
    } finally {
      setImporting(false);
    }
  };

  // Save validation
  const handleSaveToArchive = () => {
    if (!recipeTitle.trim()) {
      alert('Please enter a Recipe Title.');
      return;
    }
    const hasValidIngredient = ingredients.some(ing => ing.name.trim() !== '');
    if (!hasValidIngredient) {
      alert('Please fill out at least one Ingredient name.');
      return;
    }
    const hasValidStep = steps.some(st => st.text.trim() !== '');
    if (!hasValidStep) {
      alert('Please fill out at least one Instruction Step.');
      return;
    }

    const newRecipe = {
      id: `custom-${Date.now()}`,
      title: recipeTitle,
      image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=600',
      notes: ammasNotes || "No notes left for this recipe.",
      ingredients: ingredients
        .filter(ing => ing.name.trim() !== '')
        .map(ing => ({
          amount: ing.quantity ? `${ing.quantity} ${ing.unit}` : ing.unit,
          name: ing.name,
          badge: ing.customAlavu || null
        })),
      instructions: steps
        .filter(st => st.text.trim() !== '')
        .map(st => st.text),
      mediaStrip: [
        { type: 'photo', label: 'Dish photo', duration: '', icon: 'photo' }
      ],
      source: 'Custom Note',
      sourceType: 'amma',
      sourceUrl: importedSourceUrl,
      tags,
      isCustom: true
    };

    onAddRecipe(newRecipe);
    alert(`Success! "${recipeTitle}" has been added to your Kann Alavu heritage collection.`);
    resetForm();
    onNavigateBack();
  };

  return (
    <div className="page-enter flex flex-col h-full bg-[#fff8f1] overflow-y-auto pb-28">
      {/* Top Header */}
      <header className="pt-6 pb-4 text-center px-[20px] flex-shrink-0 relative border-b border-[#8b5e3c]/10 bg-[#fff8f1]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <button
            onClick={onNavigateBack}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#6f4627] hover:bg-[#faf3ec] active:scale-95 transition-all"
          >
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
        </div>
        <h1 className="font-headline text-[22px] font-bold text-[#6f4627]">
          Add New Recipe
        </h1>
      </header>

      <div className="px-[20px] pt-5 space-y-5">
        {/* Quick Import Tiles */}
        <div>
          <h3 className="font-headline text-[15px] font-bold text-[#6f4627] mb-1">
            Quick Import
          </h3>
          <p className="text-[12px] text-[#83746b] mb-2.5">
            Import recipes from social platforms or camera scans.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'link', label: 'Paste Link', icon: 'link', active: !editorExpanded },
              { id: 'voice', label: 'Voice Note', icon: 'mic', active: false },
              { id: 'photo', label: 'Photo/Scan', icon: 'photo_camera', active: false },
              { id: 'type', label: 'Type it out', icon: 'edit_note', active: editorExpanded }
            ].map((tile) => (
              <button
                key={tile.id}
                onClick={() => {
                  if (tile.id === 'type') {
                    setEditorExpanded(true);
                    setSourceTag('Manual');
                  } else if (tile.id === 'link') {
                    setEditorExpanded(false);
                  }
                }}
                className={`p-3.5 rounded-[12px] border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${
                  tile.active
                    ? 'border-[#6B3A2A] bg-[#faf3ec] text-[#6B3A2A]'
                    : 'border-[#8b5e3c]/15 bg-[#fff8f1] text-[#83746b] hover:border-[#8b5e3c]/40'
                }`}
              >
                <span className="material-symbols-rounded text-[22px]">{tile.icon}</span>
                <span className="text-[12px] font-bold tracking-wide">{tile.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Link Input Field (Only visible when editor is not expanded or alongside it) */}
        {!editorExpanded && (
          <div className="bg-[#faf3ec] p-4 rounded-[16px] border border-[#8b5e3c]/10">
            <label className="block text-[11px] uppercase tracking-wider text-[#83746b] font-bold mb-2">
              TikTok / Instagram / Recipe Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://www.tiktok.com/@chef..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  const nextSourceTag = getSourceTag(e.target.value);
                  setSourceTag(nextSourceTag);
                  setImportError('');
                }}
                className="flex-1 h-[42px] px-3 bg-[#fff8f1] border border-[#8b5e3c]/20 text-[#1e1b17] placeholder-[#83746b]/50 rounded-lg focus:outline-none focus:border-[#6B3A2A] text-[14px]"
              />
              <button
                onClick={handleImport}
                disabled={importing || !trimmedUrl || (isSocialUrl && !pastedRecipeText.trim())}
                className="px-4 bg-[#6B3A2A] hover:bg-[#8b5e3c] disabled:opacity-50 text-white rounded-lg text-[13px] font-bold transition-colors flex items-center gap-1"
              >
                {importing ? (
                  <span className="material-symbols-rounded animate-spin text-[16px]">sync</span>
                ) : (
                  <span className="material-symbols-rounded text-[16px]">download</span>
                )}
                {importing ? '...' : 'Import'}
              </button>
            </div>
            {isSocialUrl && (
              <p className="mt-2 rounded-lg bg-[#F5C242]/20 border border-[#F5C242]/40 px-3 py-2 text-[12px] font-semibold text-[#7A5C00] leading-snug">
                {SOCIAL_URL_TIP}
              </p>
            )}
            {showCaptionField && (
              <>
                <label className="block text-[11px] uppercase tracking-wider text-[#83746b] font-bold mt-3 mb-2">
                  Paste the recipe text or caption here
                </label>
                <textarea
                  placeholder="Copy the caption, description, or recipe text from the post and paste it here"
                  rows="4"
                  value={pastedRecipeText}
                  onChange={(e) => {
                    setPastedRecipeText(e.target.value);
                    setImportError('');
                  }}
                  className="w-full px-3 py-2 bg-[#fff8f1] border border-[#8b5e3c]/20 text-[#1e1b17] placeholder-[#83746b]/50 rounded-lg focus:outline-none focus:border-[#6B3A2A] text-[14px] resize-none"
                />
              </>
            )}
            {importError && (
              <p className="mt-2 text-[12px] font-semibold text-[#ba1a1a] leading-snug">
                {importError}
              </p>
            )}
          </div>
        )}

        {/* Structured Recipe Editor Area */}
        {editorExpanded && (
          <div className="space-y-6 pt-2 border-t border-[#8b5e3c]/10 transition-all duration-300">
            
            {/* Section 1: Recipe Title */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#83746b] font-bold mb-1.5">
                Recipe Title
              </label>
              <input
                type="text"
                placeholder="e.g. Grandma's Spiced Potato Curry"
                value={recipeTitle}
                onChange={(e) => setRecipeTitle(e.target.value)}
                className="w-full h-[46px] px-4 bg-[#faf3ec] border-b-2 border-[#8b5e3c]/20 text-[#1e1b17] placeholder-[#83746b]/40 rounded-t-lg focus:outline-none focus:border-[#6B3A2A] text-[15px] font-medium"
              />
              {importedSourceUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#83746b] font-bold">
                    Source
                  </span>
                  <span className="inline-flex max-w-full items-center rounded-full bg-[#8b5e3c]/10 px-2.5 py-1 text-[11px] font-semibold text-[#83746b]">
                    {truncateUrl(importedSourceUrl)}
                  </span>
                </div>
              )}
            </div>

            {/* Section 2: Ingredients list */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] uppercase tracking-wider text-[#83746b] font-bold">
                  Ingredients List
                </label>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="text-[12px] font-bold text-[#6B3A2A] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-rounded text-[16px]">add</span> Add Ingredient
                </button>
              </div>

              <div className="space-y-2.5">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="flex flex-col gap-1.5 p-3 bg-[#faf3ec]/60 rounded-xl border border-[#8b5e3c]/10 relative group">
                    <div className="flex items-center gap-2">
                      {/* Ingredient name */}
                      <input
                        type="text"
                        placeholder="Ingredient name"
                        value={ing.name}
                        onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)}
                        className="flex-1 min-w-0 h-[38px] px-2 bg-transparent border-b border-[#8b5e3c]/15 text-[#1e1b17] placeholder-[#83746b]/45 focus:outline-none focus:border-[#6B3A2A] text-[14px]"
                      />

                      {/* Quantity */}
                      <input
                        type="text"
                        placeholder="Qty"
                        value={ing.quantity}
                        onChange={(e) => handleUpdateIngredient(ing.id, 'quantity', e.target.value)}
                        className="w-[50px] h-[38px] px-1 bg-transparent border-b border-[#8b5e3c]/15 text-[#1e1b17] placeholder-[#83746b]/45 focus:outline-none focus:border-[#6B3A2A] text-[14px] text-center"
                      />

                      {/* Unit select */}
                      <select
                        value={ing.unit}
                        onChange={(e) => handleUpdateIngredient(ing.id, 'unit', e.target.value)}
                        className="h-[38px] px-1 bg-transparent border-b border-[#8b5e3c]/15 text-[#1e1b17] focus:outline-none focus:border-[#6B3A2A] text-[13px] font-semibold cursor-pointer"
                      >
                        <option value="qty">qty</option>
                        <option value="handful">handful</option>
                        <option value="pinch">pinch</option>
                        <option value="to taste">to taste</option>
                        <option value="piece">piece</option>
                        <option value="clove">clove</option>
                        <option value="sprig">sprig</option>
                        <option value="slice">slice</option>
                        <option value="bunch">bunch</option>
                        <option value="cup">cup</option>
                        <option value="tsp">tsp</option>
                        <option value="tbsp">tbsp</option>
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                      </select>

                      {/* Delete row */}
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ing.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#ba1a1a] hover:bg-[#ba1a1a]/10 active:scale-90 transition-all"
                      >
                        <span className="material-symbols-rounded text-[18px]">delete</span>
                      </button>
                    </div>

                    {/* Ingredient-level Kann Alavu Drilldown Toggle Button */}
                    <div className="flex justify-between items-center mt-1 border-t border-[#8b5e3c]/5 pt-1.5">
                      <button
                        type="button"
                        onClick={() => toggleAlavuDrilldown(ing.id)}
                        className="text-[11px] font-bold text-[#6f4627] flex items-center gap-1 hover:text-[#6B3A2A] transition-colors"
                      >
                        <span className="material-symbols-rounded text-[14px] text-[#F5C242] fill-current">star</span>
                        {ing.customAlavu ? 'Edit Kann Alavu description' : 'Add Kann Alavu sensory description'}
                      </button>

                      {/* Inline Amber Pill Badge once sensory description is typed */}
                      {ing.customAlavu && (
                        <span className="badge-glow inline-flex items-center gap-1 bg-[#F5C242] text-[#7A5C00] text-[11px] font-semibold italic px-2 py-0.5 rounded-full border border-[#F5C242]/50">
                          <span className="material-symbols-rounded text-[12px] font-normal not-italic">visibility</span>
                          {ing.customAlavu}
                        </span>
                      )}
                    </div>

                    {/* Expandable localized Kann Alavu input row */}
                    {(expandedAlavuIds.includes(ing.id) || ing.customAlavu) && (
                      <div className="mt-1.5 animate-fadeIn">
                        <input
                          type="text"
                          placeholder="e.g. until oil separates, a lemon-sized ball..."
                          value={ing.customAlavu}
                          onChange={(e) => handleUpdateIngredient(ing.id, 'customAlavu', e.target.value)}
                          className="w-full h-[32px] px-2.5 bg-[#fff8f1] border border-[#F5C242]/40 rounded text-[#1e1b17] placeholder-[#83746b]/40 text-[12px] italic focus:outline-none focus:border-[#6B3A2A]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Kann Alavu Toggle & linked inputs */}
            <div className="p-4 bg-[#faf3ec] border border-[#F5C242]/40 rounded-[16px] relative overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-[#F5C242] fill-current">star</span>
                  <span className="font-headline text-[15px] font-bold text-[#6f4627]">
                    Add kann alavu measurements
                  </span>
                </div>
                {/* Custom toggle button */}
                <button
                  type="button"
                  onClick={() => setShowAlavuToggle(!showAlavuToggle)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                    showAlavuToggle ? 'bg-[#6B3A2A]' : 'bg-[#8b5e3c]/20'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-[#fff8f1] absolute transition-transform duration-200 ${
                    showAlavuToggle ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {showAlavuToggle && (
                <div className="space-y-3.5 pt-2 border-t border-[#8b5e3c]/10 transition-all duration-300">
                  <p className="text-[11px] text-[#51443c] leading-relaxed italic">
                    Type family eyeball measurements linked to each ingredient above (e.g. "a lemon-sized ball", "until the color matches a sunset").
                  </p>
                  
                  <div className="space-y-3">
                    {ingredients.map((ing) => (
                      <div key={ing.id} className="flex flex-col gap-1">
                        <span className="text-[12px] font-bold text-[#6f4627]">
                          {ing.name || 'Unnamed Ingredient'} {ing.quantity && `(${ing.quantity} ${ing.unit})`}
                        </span>
                        <input
                          type="text"
                          placeholder="Describe sensory measure (e.g. until oil separates)..."
                          value={ing.customAlavu}
                          onChange={(e) => handleUpdateIngredient(ing.id, 'customAlavu', e.target.value)}
                          className="h-[36px] px-3 bg-[#fff8f1] border-b border-[#8b5e3c]/20 text-[#1e1b17] placeholder-[#83746b]/40 focus:outline-none focus:border-[#6B3A2A] text-[13px] italic"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Steps builder */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] uppercase tracking-wider text-[#83746b] font-bold">
                  Steps Instructions
                </label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="text-[12px] font-bold text-[#6B3A2A] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-rounded text-[16px]">add</span> Add Step
                </button>
              </div>

              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex gap-2 p-3 bg-[#faf3ec]/60 rounded-xl border border-[#8b5e3c]/10">
                    {/* Drag and Reorder Controls */}
                    <div className="flex flex-col items-center justify-between text-[#83746b] pr-1 border-r border-[#8b5e3c]/10">
                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, -1)}
                        disabled={idx === 0}
                        className="w-5 h-5 rounded hover:bg-[#8b5e3c]/10 disabled:opacity-30 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-rounded text-[16px]">keyboard_arrow_up</span>
                      </button>
                      
                      <span className="text-[12px] font-bold text-[#6f4627] font-sans my-1">
                        {idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, 1)}
                        disabled={idx === steps.length - 1}
                        className="w-5 h-5 rounded hover:bg-[#8b5e3c]/10 disabled:opacity-30 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-rounded text-[16px]">keyboard_arrow_down</span>
                      </button>
                    </div>

                    {/* Step textarea */}
                    <textarea
                      placeholder="Describe this instruction step..."
                      rows="2"
                      value={step.text}
                      onChange={(e) => handleUpdateStep(step.id, e.target.value)}
                      className="flex-1 bg-transparent p-1 text-[#1e1b17] placeholder-[#83746b]/45 text-[14px] resize-none focus:outline-none"
                    />

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(step.id)}
                      className="self-center w-8 h-8 rounded-full flex items-center justify-center text-[#ba1a1a] hover:bg-[#ba1a1a]/10 active:scale-90 transition-all"
                    >
                      <span className="material-symbols-rounded text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Amma's Notes */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#83746b] font-bold mb-1.5">
                Amma's Notes
              </label>
              <div className="relative border-l-4 border-[#F5C242] pl-3">
                <textarea
                  placeholder="Things she always said…"
                  rows="3"
                  value={ammasNotes}
                  onChange={(e) => setAmmasNotes(e.target.value)}
                  className="w-full bg-[#faf3ec]/60 p-2.5 text-[#1e1b17] placeholder-[#83746b]/50 text-[14px] italic font-sans rounded-r-lg border border-[#8b5e3c]/10 border-l-0 focus:outline-none focus:border-[#6B3A2A]"
                />
              </div>
            </div>

            {/* Section 6: Tags */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#83746b] font-bold mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueTags(["Amma's recipe", sourceTag, ...tags.filter((tag) => tag !== "Amma's recipe" && tag !== sourceTag)]).map((tag) => {
                  const isActive = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-bold transition-colors ${
                        isActive
                          ? 'bg-[#F5C242] text-[#7A5C00] border-[#F5C242]'
                          : 'bg-[#fff8f1] text-[#6B3A2A] border-[#6B3A2A]/30'
                      }`}
                    >
                      {tag}
                      {isActive && <span className="text-[13px] leading-none">×</span>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a custom tag"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  className="flex-1 h-[38px] px-3 bg-[#faf3ec] border border-[#8b5e3c]/20 text-[#1e1b17] placeholder-[#83746b]/45 rounded-lg focus:outline-none focus:border-[#6B3A2A] text-[13px]"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="px-4 bg-[#6B3A2A] hover:bg-[#8b5e3c] text-white rounded-lg text-[12px] font-bold transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Section 6: Recipe Cover */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#83746b] font-bold mb-2">
            Recipe Cover
          </label>
          <div className="h-[110px] rounded-[16px] border-2 border-dashed border-[#8b5e3c]/20 flex flex-col items-center justify-center text-center p-4 bg-[#faf3ec]/40 hover:bg-[#faf3ec] cursor-pointer transition-colors">
            <span className="material-symbols-rounded text-[#83746b]/70 text-[28px]">image</span>
            <p className="text-[12px] font-bold text-[#6f4627] mt-1">Upload finished photo</p>
            <p className="text-[10px] text-[#83746b]">PNG or JPEG up to 5MB</p>
          </div>
        </div>

        {/* Section 7: Save to Archive */}
        <button
          onClick={handleSaveToArchive}
          className="w-full h-[48px] bg-[#6B3A2A] hover:bg-[#8b5e3c] active:scale-[0.98] text-[#fff8f1] font-bold rounded-full text-[14px] transition-all shadow-md mt-4"
        >
          Save to Archive
        </button>

      </div>
    </div>
  );
};

export default AddRecipe;
