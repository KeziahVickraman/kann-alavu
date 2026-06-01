const Notebook = ({ recipes, onSelectRecipe, onNavigateToAdd }) => {
  const customRecipes = recipes.filter(r => r.isCustom);

  return (
    <div className="page-enter flex flex-col h-full bg-[#fff8f1]">
      {/* Header */}
      <header className="pt-8 pb-4 text-center px-[20px] flex-shrink-0 border-b border-[#8b5e3c]/10 bg-[#fff8f1]">
        <h1 className="font-headline text-[26px] font-bold text-[#6f4627]">
          My Heritage Notebook
        </h1>
        <p className="text-[11px] uppercase tracking-wider text-[#83746b] font-medium mt-1">
          Logged Family Notebooks & Custom Recipes
        </p>
      </header>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto px-[20px] py-6 pb-24">
        {customRecipes.length > 0 ? (
          <div className="space-y-4">
            <p className="text-[12px] text-[#83746b] font-medium uppercase tracking-wider mb-2">
              Saved Archives ({customRecipes.length})
            </p>
            {customRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="stagger-item cursor-pointer p-4 bg-[#faf3ec] border border-[#8b5e3c]/15 hover:border-[#6B3A2A] rounded-2xl flex gap-4 transition-all duration-300 shadow-sm hover:shadow-md"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Image thumb */}
                <div className="w-[70px] h-[70px] rounded-lg overflow-hidden flex-shrink-0 bg-[#f4ede5]">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline text-[16px] font-bold text-[#1e1b17] leading-tight truncate">
                      {recipe.title}
                    </h3>
                    <p className="text-[13px] italic text-[#51443c] font-serif line-clamp-1 mt-1">
                      "{recipe.notes}"
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="inline-flex items-center gap-1 bg-[#F5C242] text-[#7A5C00] text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase">
                      <span className="material-symbols-rounded text-[10px]">menu_book</span>
                      Custom Log
                    </span>
                    <span className="text-[10px] text-[#83746b] font-semibold">
                      {recipe.ingredients.length} Ingredients
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <span className="material-symbols-rounded text-[54px] text-[#83746b]/30">
              menu_book
            </span>
            <h3 className="font-headline text-[18px] font-bold text-[#6f4627] mt-3">
              Your Notebook is Empty
            </h3>
            <p className="text-[#83746b] text-[13px] mt-2 max-w-[280px] mx-auto leading-relaxed">
              Log recipes using the "Type it out" flow or url imports to compile your handwritten heritage notebooks.
            </p>
            <button
              onClick={onNavigateToAdd}
              className="mt-6 px-5 py-2.5 bg-[#6B3A2A] hover:bg-[#8b5e3c] text-white font-bold rounded-full text-[13px] transition-all shadow-sm"
            >
              Add Your First Recipe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notebook;
