import React from 'react';
import BrowseRecipes from './BrowseRecipes';
import RecipeDetail from './RecipeDetail';
import AddRecipe from './AddRecipe';

function App() {
  const [currentScreen, setCurrentScreen] = React.useState('browse'); // 'browse', 'detail', 'add'
  const [selectedRecipeId, setSelectedRecipeId] = React.useState(null);

  const handleSelectRecipe = (id) => {
    setSelectedRecipeId(id);
    setCurrentScreen('detail');
  };

  const handleNavigateBack = () => {
    setCurrentScreen('browse');
    setSelectedRecipeId(null);
  };

  const handleNavigateToAdd = () => {
    setCurrentScreen('add');
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
        <div className="flex-1 relative overflow-hidden">
          {currentScreen === 'browse' && (
            <BrowseRecipes
              onSelectRecipe={handleSelectRecipe}
              onNavigateToAdd={handleNavigateToAdd}
            />
          )}
          {currentScreen === 'detail' && (
            <RecipeDetail
              recipeId={selectedRecipeId}
              onNavigateBack={handleNavigateBack}
            />
          )}
          {currentScreen === 'add' && (
            <AddRecipe
              onNavigateBack={handleNavigateBack}
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
              currentScreen === 'browse' || currentScreen === 'detail' ? 'text-[#6f4627] scale-105' : 'text-[#83746b] hover:text-[#51443c]'
            }`}
          >
            <span className={`material-symbols-rounded text-[22px] ${
              currentScreen === 'browse' || currentScreen === 'detail' ? 'fill-current' : ''
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
              alert('Amma\'s handwritten heritage notebook collections are loaded locally!');
            }}
            className="flex flex-col items-center gap-1 font-sans text-[11px] font-bold tracking-wide uppercase text-[#83746b] hover:text-[#51443c] transition-all duration-200"
          >
            <span className="material-symbols-rounded text-[22px]">
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
