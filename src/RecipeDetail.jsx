import React from 'react';

const RecipeDetail = ({ recipeId, recipes, onNavigateBack }) => {
  const [voicePlaying, setVoicePlaying] = React.useState(false);

  // Find the recipe dynamically from the database prop
  const recipe = recipes.find(r => r.id === recipeId) || {
    id: 'fish-curry',
    title: "Amma's Fish Curry",
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600',
    notes: "Don't rush the onions. They need to turn the color of a sunset before the tamarind goes in. This is how your grandmother taught me—it’s all in the patience.",
    ingredients: [
      { amount: '500g', name: 'King Fish or Pomfret', badge: null },
      { amount: '3 tbsp', name: 'Vegetable Oil', badge: 'until the oil separates' },
      { amount: '2', name: 'Large Red Onions, diced', badge: null },
      { amount: '1 cup', name: 'Tamarind Water', badge: 'tangy like a green mango' },
      { amount: '1 tsp', name: 'Turmeric Powder', badge: null }
    ],
    instructions: [
      'Heat oil in a heavy-bottomed clay pot or kadai. Add mustard seeds and curry leaves until they crackle and release their aroma.',
      'Sauté the onions until deep golden brown. Add the ginger-garlic paste and cook until the raw smell disappears.',
      'Stir in the spice powders and tamarind water. Let it simmer on medium heat. This is the critical stage—watch for the oil to bead at the surface.'
    ],
    mediaStrip: [
      { type: 'voice', label: "Amma's Note", duration: '0:45', icon: 'mic' },
      { type: 'reel', label: 'Tamarind prep', duration: '0:15', icon: 'play_circle' },
      { type: 'photo', label: 'Sunset color', duration: '', icon: 'photo' }
    ]
  };

  return (
    <div className="page-enter flex flex-col h-full bg-[#fff8f1] overflow-y-auto pb-24">
      {/* Top Navigation Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onNavigateBack}
          className="w-10 h-10 rounded-full bg-[#fff8f1]/90 backdrop-blur-sm flex items-center justify-center text-[#6f4627] hover:bg-[#fff8f1] active:scale-95 shadow-sm transition-all"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-[280px] flex-shrink-0 bg-[#f4ede5]">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fff8f1] via-transparent to-transparent"></div>
      </div>

      {/* Recipe Info Container */}
      <div className="px-[20px] -mt-6 relative z-10">
        {/* Title */}
        <h2 className="font-headline text-[30px] font-bold text-[#6f4627] leading-tight">
          {recipe.title}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 bg-[#ffdfa0] text-[#6d5000] px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase">
            <span className="material-symbols-rounded text-[11px]">star</span>
            Kann Alavu
          </span>
          <span className="text-[12px] text-[#83746b]">Amma's Recipe Archive</span>
        </div>

        {/* Amma's Notes */}
        <div className="mt-6 p-4 bg-[#faf3ec] border-l-4 border-[#8b5e3c] rounded-r-lg">
          <h4 className="font-headline text-[15px] font-bold text-[#6f4627] mb-1">
            Amma's Notes
          </h4>
          <p className="font-sans text-[14px] italic text-[#51443c] leading-relaxed">
            "{recipe.notes}"
          </p>
        </div>

        {/* Media Strip */}
        <div className="mt-6">
          <h3 className="font-headline text-[18px] font-bold text-[#6f4627] mb-3">
            Heritage Media Strip
          </h3>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar py-1">
            {recipe.mediaStrip.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (item.type === 'voice') setVoicePlaying(!voicePlaying);
                }}
                className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-[#f4ede5] hover:bg-[#eee7df] active:scale-95 transition-all rounded-[12px] border border-[#8b5e3c]/15 text-left min-w-[160px]"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.type === 'voice' && voicePlaying ? 'bg-[#ffbf00] text-[#1e1b17] animate-pulse' : 'bg-[#8b5e3c]/10 text-[#6f4627]'
                }`}>
                  <span className="material-symbols-rounded text-[18px]">
                    {item.type === 'voice' && voicePlaying ? 'pause' : item.icon}
                  </span>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#1e1b17]">{item.label}</p>
                  <p className="text-[10px] text-[#83746b]">
                    {item.type === 'voice' && voicePlaying ? 'Playing' : item.duration || 'View photo'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="mt-8">
          <h3 className="font-headline text-[18px] font-bold text-[#6f4627] mb-4">
            Ingredients
          </h3>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <li
                key={idx}
                className="flex flex-col pb-3 border-b border-[#8b5e3c]/10 last:border-b-0"
              >
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline text-[17px] font-bold text-[#6f4627] min-w-[60px]">
                      {ing.amount}
                    </span>
                    <span className="text-[15px] font-medium text-[#1e1b17] font-sans">
                      {ing.name}
                    </span>
                  </div>
                </div>
                {ing.badge && (
                  <div className="mt-1.5 self-start">
                    <span className="badge-glow inline-flex items-center gap-1 bg-[#ffbf00] text-[#1e1b17] font-sans text-[11px] font-semibold italic px-2.5 py-0.5 rounded-full">
                      <span className="material-symbols-rounded text-[12px] font-normal not-italic">visibility</span>
                      {ing.badge}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="mt-8">
          <h3 className="font-headline text-[18px] font-bold text-[#6f4627] mb-4">
            Instructions
          </h3>
          <div className="space-y-4">
            {recipe.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8b5e3c]/10 text-[#6f4627] flex items-center justify-center font-bold text-[13px] font-sans">
                  {idx + 1}
                </div>
                <p className="text-[15px] text-[#51443c] leading-relaxed font-sans pt-0.5">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
