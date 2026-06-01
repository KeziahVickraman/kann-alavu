import React from 'react';
import BrowseRecipes from './BrowseRecipes';
import RecipeDetail from './RecipeDetail';
import AddRecipe from './AddRecipe';
import Notebook from './Notebook';

const INITIAL_PRESETS = [
  {
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
    ],
    source: 'Amma',
    sourceType: 'amma'
  },
  {
    id: 'pepper-rasam',
    title: "Amma's Pepper Rasam",
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    notes: "Perfect for cold days. Sauté the black peppercorns slowly so the heat doesn't burn their woody aroma.",
    ingredients: [
      { amount: '1 tbsp', name: 'Black Peppercorns', badge: 'toasted until fragrant' },
      { amount: '1 tsp', name: 'Cumin Seeds', badge: null },
      { amount: '2 cups', name: 'Tomato Tamarind Broth', badge: null }
    ],
    instructions: [
      'Coarsely crush the toasted pepper and cumin seeds.',
      'Simmer with the tomato tamarind broth, garlic, and fresh coriander stems.'
    ],
    mediaStrip: [],
    source: 'Family Heritage',
    sourceType: 'amma'
  },
  {
    id: 'honey-potatoes',
    title: 'Crispy Honey Potatoes',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=600',
    notes: "Double-fry the potatoes for that maximum crispy bite that stays crunchy even when glazed with syrup.",
    ingredients: [
      { amount: '3', name: 'Large Potatoes, sliced', badge: null },
      { amount: '2 tbsp', name: 'Honey Glaze', badge: 'sticky golden coating' }
    ],
    instructions: [
      'Deep fry potatoes until crisp.',
      'Toss in garlic, soy sauce, chili flakes, and glaze with honey.'
    ],
    mediaStrip: [],
    source: 'TikTok',
    sourceType: 'tiktok'
  },
  {
    id: 'samosas',
    title: "Grandma's Samosas",
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600',
    notes: "The dough must rest under a damp cloth so it stays soft and pliable. Samosas are all in the pleats.",
    ingredients: [
      { amount: '2 cups', name: 'All Purpose Flour', badge: null },
      { amount: '3', name: 'Spiced Potatoes & Peas', badge: 'well-mashed and cooled' }
    ],
    instructions: [
      'Knead flour with carom seeds and oil. Rest the dough.',
      'Roll out, fill with spiced potatoes, shape into pyramids, and deep fry.'
    ],
    mediaStrip: [],
    source: 'Grandma',
    sourceType: 'amma'
  },
  {
    id: 'poached-toast',
    title: 'Insta-Poached Toast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600',
    notes: "Add a splash of vinegar to the boiling water to help the egg whites fold perfectly around the yolk.",
    ingredients: [
      { amount: '1', name: 'Fresh Egg', badge: null },
      { amount: '1 slice', name: 'Sourdough Bread', badge: 'thick toasted golden' }
    ],
    instructions: [
      'Create a gentle whirlpool in simmering water and slide in the egg.',
      'Poach for 3 minutes, drain, and serve on buttered toasted sourdough.'
    ],
    mediaStrip: [],
    source: 'Instagram',
    sourceType: 'instagram'
  }
];

function App() {
  const [currentScreen, setCurrentScreen] = React.useState('browse'); // 'browse', 'detail', 'add', 'notebook'
  const [selectedRecipeId, setSelectedRecipeId] = React.useState(null);

  const [recipes, setRecipes] = React.useState(() => {
    const saved = localStorage.getItem('kann_alavu_custom_recipes');
    const custom = saved ? JSON.parse(saved) : [];
    return [...INITIAL_PRESETS, ...custom];
  });

  const handleSelectRecipe = (id) => {
    setSelectedRecipeId(id);
    setCurrentScreen('detail');
  };

  const handleNavigateBack = () => {
    // If the selected recipe is a custom notebook one, go back to notebook, otherwise browse
    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (recipe && recipe.isCustom) {
      setCurrentScreen('notebook');
    } else {
      setCurrentScreen('browse');
    }
    setSelectedRecipeId(null);
  };

  const handleNavigateToAdd = () => {
    setCurrentScreen('add');
  };

  const handleAddRecipe = (newRecipe) => {
    const saved = localStorage.getItem('kann_alavu_custom_recipes');
    const custom = saved ? JSON.parse(saved) : [];
    const updatedCustom = [newRecipe, ...custom];
    localStorage.setItem('kann_alavu_custom_recipes', JSON.stringify(updatedCustom));
    setRecipes([...INITIAL_PRESETS, ...updatedCustom]);
    // Redirect to Notebook view immediately to see the logged recipe
    setCurrentScreen('notebook');
  };

  return (
    <div className="min-h-screen bg-[#f4ede5] flex items-center justify-center p-0 sm:p-6 md:p-8">
      {/* Device Frame Wrapper for Premium Presentation */}
      <div className="w-full h-screen sm:h-[800px] sm:w-[390px] bg-[#fff8f1] sm:rounded-[36px] sm:shadow-2xl sm:border-[8px] sm:border-[#33302b] relative overflow-hidden flex flex-col">
        {/* Mock Status Bar for native mobile appearance */}
        <div className="hidden sm:flex justify-between items-center px-6 pt-3 pb-1 text-[12px] font-bold text-[#83746b] bg-[#fff8f1] select-none z-20">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-rounded text-[14px]">signal_cellular_4_bar</span>
            <span className="material-symbols-rounded text-[14px]">wifi</span>
            <span className="material-symbols-rounded text-[14px]">battery_5_bar</span>
          </div>
        </div>

        {/* Dynamic Screen Area */}
        <div className="flex-1 relative overflow-hidden bg-[#fff8f1]">
          {currentScreen === 'browse' && (
            <BrowseRecipes
              recipes={recipes}
              onSelectRecipe={handleSelectRecipe}
              onNavigateToAdd={handleNavigateToAdd}
            />
          )}
          {currentScreen === 'detail' && (
            <RecipeDetail
              recipeId={selectedRecipeId}
              recipes={recipes}
              onNavigateBack={handleNavigateBack}
            />
          )}
          {currentScreen === 'add' && (
            <AddRecipe
              onAddRecipe={handleAddRecipe}
              onNavigateBack={handleNavigateBack}
            />
          )}
          {currentScreen === 'notebook' && (
            <Notebook
              recipes={recipes}
              onSelectRecipe={handleSelectRecipe}
              onNavigateToAdd={handleNavigateToAdd}
            />
          )}
        </div>

        {/* Global Bottom Tab Bar Navigation */}
        <div className="absolute bottom-0 left-0 right-0 h-[64px] bg-[#fff8f1]/95 backdrop-blur-md border-t border-[#8b5e3c]/10 flex items-center justify-around px-4 z-20 shadow-lg">
          <button
            onClick={() => {
              setCurrentScreen('browse');
              setSelectedRecipeId(null);
            }}
            className={`flex flex-col items-center gap-1 font-sans text-[11px] font-bold tracking-wide uppercase transition-all duration-200 ${
              currentScreen === 'browse' || (currentScreen === 'detail' && !recipes.find(r => r.id === selectedRecipeId)?.isCustom)
                ? 'text-[#6f4627] scale-105'
                : 'text-[#83746b] hover:text-[#51443c]'
            }`}
          >
            <span className={`material-symbols-rounded text-[22px] ${
              currentScreen === 'browse' || (currentScreen === 'detail' && !recipes.find(r => r.id === selectedRecipeId)?.isCustom)
                ? 'fill-current'
                : ''
            }`}>
              restaurant_menu
            </span>
            <span>Browse</span>
          </button>

          <button
            onClick={() => setCurrentScreen('add')}
            className={`flex flex-col items-center gap-1 font-sans text-[11px] font-bold tracking-wide uppercase transition-all duration-200 ${
              currentScreen === 'add' ? 'text-[#6f4627] scale-105' : 'text-[#83746b] hover:text-[#51443c]'
            }`}
          >
            <span className={`material-symbols-rounded text-[22px] ${
              currentScreen === 'add' ? 'fill-current' : ''
            }`}>
              add_circle
            </span>
            <span>Add</span>
          </button>

          <button
            onClick={() => {
              setCurrentScreen('notebook');
              setSelectedRecipeId(null);
            }}
            className={`flex flex-col items-center gap-1 font-sans text-[11px] font-bold tracking-wide uppercase transition-all duration-200 ${
              currentScreen === 'notebook' || (currentScreen === 'detail' && recipes.find(r => r.id === selectedRecipeId)?.isCustom)
                ? 'text-[#6f4627] scale-105'
                : 'text-[#83746b] hover:text-[#51443c]'
            }`}
          >
            <span className={`material-symbols-rounded text-[22px] ${
              currentScreen === 'notebook' || (currentScreen === 'detail' && recipes.find(r => r.id === selectedRecipeId)?.isCustom)
                ? 'fill-current'
                : ''
            }`}>
              menu_book
            </span>
            <span>Notebook</span>
          </button>
        </div>

        {/* Mock Home Indicator for modern iOS style */}
        <div className="hidden sm:block absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#33302b]/20 rounded-full z-30"></div>
      </div>
    </div>
  );
}

export default App;
