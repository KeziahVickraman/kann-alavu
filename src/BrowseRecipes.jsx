import React from 'react';

const BrowseRecipes = ({ recipes, onSelectRecipe, onNavigateToAdd }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState('All');

  const filters = ['All', "Amma's Recipes", 'Kann Alavu', 'TikTok Saved'];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === "Amma's Recipes") return matchesSearch && (recipe.sourceType === 'amma' && recipe.source !== 'Family Heritage' && !recipe.isCustom);
    if (selectedFilter === 'Kann Alavu') return matchesSearch && (recipe.id === 'fish-curry' || recipe.ingredients.some(i => i.badge));
    if (selectedFilter === 'TikTok Saved') return matchesSearch && recipe.sourceType === 'tiktok';
    return matchesSearch;
  });

  return (
    <div className="page-enter flex flex-col h-full bg-[#fff8f1]">
      {/* Header */}
      <header className="pt-8 pb-4 text-center px-[20px] flex-shrink-0">
        <h1 className="font-headline text-[32px] font-bold text-[#6f4627] tracking-tight">
          Kann Alavu
        </h1>
        <p className="text-[12px] uppercase tracking-wider text-[#83746b] font-medium mt-1">
          Heritage Recipe Archive
        </p>
      </header>

      {/* Search Bar */}
      <div className="px-[20px] mb-4 flex-shrink-0">
        <div className="relative">
          <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-[#83746b] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search family recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[48px] pl-11 pr-4 bg-[#faf3ec] border-b border-[#8b5e3c]/20 text-[#1e1b17] placeholder-[#83746b]/60 rounded-lg focus:outline-none focus:border-[#8b5e3c] text-[15px] font-sans transition-all"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto px-[20px] hide-scrollbar py-1">
          {filters.map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#8b5e3c] text-[#fff8f1] shadow-sm'
                    : 'bg-[#faf3ec] text-[#51443c] hover:bg-[#eee7df]'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto px-[20px] pb-24">
        <div className="grid grid-cols-2 gap-4">
          {filteredRecipes.map((recipe, index) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe.id)}
              className="stagger-item cursor-pointer flex flex-col group"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Card Image */}
              <div className="relative aspect-[4/5] rounded-[16px] overflow-hidden bg-[#faf3ec] border border-[#8b5e3c]/10 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.02]">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Source Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                    recipe.sourceType === 'amma'
                      ? 'bg-[#6f4627] text-[#ffdcc5]'
                      : recipe.sourceType === 'tiktok'
                      ? 'bg-black text-white'
                      : 'bg-[#e1306c] text-white'
                  }`}>
                    {recipe.sourceType === 'amma' ? (
                      <span className="material-symbols-rounded text-[10px]">favorite</span>
                    ) : null}
                    {recipe.source}
                  </span>
                </div>
              </div>

              {/* Card Title */}
              <h3 className="font-headline text-[16px] font-bold text-[#1e1b17] mt-3 group-hover:text-[#6f4627] transition-colors line-clamp-2 leading-tight">
                {recipe.title}
              </h3>
              <p className="text-[11px] text-[#83746b] font-medium mt-1">
                {recipe.sourceType === 'amma' ? 'Written by Amma' : 'Imported via URL'}
              </p>
            </div>
          ))}

          {filteredRecipes.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <span className="material-symbols-rounded text-[40px] text-[#83746b]/40">
                menu_book
              </span>
              <p className="text-[#83746b] text-[14px] mt-2 font-medium">No recipes found in this archive.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseRecipes;
