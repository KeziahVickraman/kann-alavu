import React from 'react';

const AddRecipe = ({ onAddRecipe, onNavigateBack }) => {
  // Persistence using localstorage so navigating away and returning preserves edit state
  const [editorExpanded, setEditorExpanded] = React.useState(() => {
    return localStorage.getItem('kann_alavu_editor_expanded') === 'true';
  });

  const [recipeTitle, setRecipeTitle] = React.useState(() => {
    return localStorage.getItem('kann_alavu_recipe_title') || '';
  });

  const [ingredients, setIngredients] = React.useState(() => {
    const saved = localStorage.getItem('kann_alavu_ingredients');
    return saved ? JSON.parse(saved) : [
      { id: 'ing-1', name: '', quantity: '', unit: 'g', customAlavu: '' }
    ];
  });

  const [steps, setSteps] = React.useState(() => {
    const saved = localStorage.getItem('kann_alavu_steps');
    return saved ? JSON.parse(saved) : [
      { id: 'step-1', text: '' }
    ];
  });

  const [showAlavuToggle, setShowAlavuToggle] = React.useState(() => {
    return localStorage.getItem('kann_alavu_show_alavu') === 'true';
  });

  const [ammasNotes, setAmmasNotes] = React.useState(() => {
    return localStorage.getItem('kann_alavu_ammas_notes') || '';
  });

  const [url, setUrl] = React.useState('');
  const [importing, setImporting] = React.useState(false);
  const [expandedAlavuIds, setExpandedAlavuIds] = React.useState([]);

  const toggleAlavuDrilldown = (id) => {
    if (expandedAlavuIds.includes(id)) {
      setExpandedAlavuIds(expandedAlavuIds.filter(item => item !== id));
    } else {
      setExpandedAlavuIds([...expandedAlavuIds, id]);
    }
  };

  // Sync to localStorage
  React.useEffect(() => {
    localStorage.setItem('kann_alavu_editor_expanded', editorExpanded);
    localStorage.setItem('kann_alavu_recipe_title', recipeTitle);
    localStorage.setItem('kann_alavu_ingredients', JSON.stringify(ingredients));
    localStorage.setItem('kann_alavu_steps', JSON.stringify(steps));
    localStorage.setItem('kann_alavu_show_alavu', showAlavuToggle);
    localStorage.setItem('kann_alavu_ammas_notes', ammasNotes);
  }, [editorExpanded, recipeTitle, ingredients, steps, showAlavuToggle, ammasNotes]);

  // Reset form helper
  const resetForm = () => {
    setRecipeTitle('');
    setIngredients([{ id: 'ing-1', name: '', quantity: '', unit: 'g', customAlavu: '' }]);
    setSteps([{ id: 'step-1', text: '' }]);
    setShowAlavuToggle(false);
    setAmmasNotes('');
    setEditorExpanded(false);
    localStorage.removeItem('kann_alavu_editor_expanded');
    localStorage.removeItem('kann_alavu_recipe_title');
    localStorage.removeItem('kann_alavu_ingredients');
    localStorage.removeItem('kann_alavu_steps');
    localStorage.removeItem('kann_alavu_show_alavu');
    localStorage.removeItem('kann_alavu_ammas_notes');
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

  // Import handler for existing flow
  const handleImport = () => {
    if (!url.trim()) return;
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      alert('Successfully imported recipe metadata!');
      setRecipeTitle('Spicy Tamarind Curry Noodles');
      setIngredients([
        { id: 'ing- noodles', name: 'Egg Noodles', quantity: '200', unit: 'g', customAlavu: '' },
        { id: 'ing- oil', name: 'Vegetable Oil', quantity: '2', unit: 'tbsp', customAlavu: 'until fragrant' },
        { id: 'ing- paste', name: 'Tamarind Paste', quantity: '1', unit: 'tbsp', customAlavu: 'tangy flavor' }
      ]);
      setSteps([
        { id: 'step-1', text: 'Boil noodles according to package instructions.' },
        { id: 'step-2', text: 'Heat oil and sauté paste until fragrant and oil beads.' }
      ]);
      setEditorExpanded(true);
    }, 1200);
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
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 h-[42px] px-3 bg-[#fff8f1] border border-[#8b5e3c]/20 text-[#1e1b17] placeholder-[#83746b]/50 rounded-lg focus:outline-none focus:border-[#6B3A2A] text-[14px]"
              />
              <button
                onClick={handleImport}
                disabled={importing || !url.trim()}
                className="px-4 bg-[#6B3A2A] hover:bg-[#8b5e3c] disabled:opacity-50 text-white rounded-lg text-[13px] font-bold transition-colors flex items-center gap-1"
              >
                {importing ? (
                  <span className="material-symbols-rounded animate-spin text-[16px]">sync</span>
                ) : (
                  <span className="material-symbols-rounded text-[16px]">download</span>
                )}
                {importing ? '...' : 'Pull'}
              </button>
            </div>
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
                        <span className="badge-glow inline-flex items-center gap-1 bg-[#F5C242] text-[#1e1b17] text-[11px] font-semibold italic px-2 py-0.5 rounded-full border border-[#F5C242]/50">
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
