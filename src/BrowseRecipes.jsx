import React from 'react';

const BrowseRecipes = ({ onSelectRecipe, onNavigateToAdd }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState('All');

  const filters = ['All', "Amma's Recipes", 'Kann Alavu', 'TikTok Saved'];

  const recipes = [
    {
      id: 'fish-curry',
      title: "Amma's Fish Curry",
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600',
      source: 'Amma',
      sourceType: 'amma',
      badgeColor: 'bg-[#6f4627] text-white',
    },
    {
      id: 'pepper-rasam',
      title: "Amma's Pepper Rasam",
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
      source: 'Family Heritage',
      sourceType: 'amma',
      badgeColor: 'bg-[#6f4627] text-white',
    },
    {
      id: 'honey-potatoes',
      title: 'Crispy Honey Potatoes',
      image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=600',
      source: 'TikTok',
      sourceType: 'tiktok',
      badgeColor: 'bg-[#00f2fe]/10 text-[#00a8b5]',
    },
    {
      id: 'samosas',
      title: "Grandma's Samosas",
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600',
      source: 'Grandma',
      sourceType: 'amma',
      badgeColor: 'bg-[#6f4627] text-white',
    },
    {
      id: 'poached-toast',
      title: 'Insta-Poached Toast',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600',
      source: 'Instagram',
      sourceType: 'instagram',
      badgeColor: 'bg-[#e1306c]/10 text-[#e1306c]',
    }
  ];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === "Amma's Recipes") return matchesSearch && (recipe.sourceType === 'amma' && recipe.source !== 'Family Heritage');
    if (selectedFilter === 'Kann Alavu') return matchesSearch && recipe.id === 'fish-curry'; // Has direct custom eyeball instructions
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
