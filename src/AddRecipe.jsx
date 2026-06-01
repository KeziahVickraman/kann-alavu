import React from 'react';

const AddRecipe = ({ onNavigateBack }) => {
  const [url, setUrl] = React.useState('');
  const [customAlavu, setCustomAlavu] = React.useState('');
  const [alavuEntries, setAlavuEntries] = React.useState([
    'a lemon-sized ball of tamarind',
    'until the raw aroma shifts to sweet onions'
  ]);
  const [importing, setImporting] = React.useState(false);
  const [recipeTitle, setRecipeTitle] = React.useState('');

  const handleAddAlavu = (e) => {
    e.preventDefault();
    if (customAlavu.trim()) {
      setAlavuEntries([...alavuEntries, customAlavu.trim()]);
      setCustomAlavu('');
    }
  };

  const handleRemoveAlavu = (idx) => {
    setAlavuEntries(alavuEntries.filter((_, i) => i !== idx));
  };

  const handleImport = () => {
    if (!url.trim()) return;
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      alert('Successfully imported draft from link! Recipe title, ingredients, and cover image imported.');
      setRecipeTitle('Imported Spicy Curry Noodles');
    }, 1500);
  };

  return (
    <div className="page-enter flex flex-col h-full bg-[#fff8f1] overflow-y-auto pb-28">
      {/* Top Header */}
      <header className="pt-8 pb-4 text-center px-[20px] flex-shrink-0 relative border-b border-[#8b5e3c]/10">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <button
            onClick={onNavigateBack}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#6f4627] hover:bg-[#faf3ec] active:scale-95 transition-all"
          >
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
        </div>
        <h1 className="font-headline text-[24px] font-bold text-[#6f4627]">
          Add New Recipe
        </h1>
      </header>

      {/* Main Form Content */}
      <div className="px-[20px] pt-6 space-y-6">
        
        {/* Quick Import Tiles */}
        <div>
          <h3 className="font-headline text-[16px] font-bold text-[#6f4627] mb-1">
            Quick Import
          </h3>
          <p className="text-[12px] text-[#83746b] mb-3">
            Import recipes from social platforms or camera scans.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Paste Link', icon: 'link', active: true },
              { label: 'Voice Note', icon: 'mic', active: false },
              { label: 'Photo/Scan', icon: 'photo_camera', active: false },
              { label: 'Type it out', icon: 'edit_note', active: false }
            ].map((tile) => (
              <div
                key={tile.label}
                className={`p-4 rounded-[12px] border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
                  tile.active
                    ? 'border-[#8b5e3c] bg-[#faf3ec] text-[#6f4627]'
                    : 'border-[#8b5e3c]/15 bg-[#fff8f1] text-[#83746b] hover:border-[#8b5e3c]/40'
                }`}
              >
                <span className="material-symbols-rounded text-[24px]">{tile.icon}</span>
                <span className="text-[13px] font-semibold">{tile.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Link Input Field */}
        <div className="bg-[#faf3ec] p-4 rounded-[16px] border border-[#8b5e3c]/10">
          <label className="block text-[12px] uppercase tracking-wider text-[#83746b] font-bold mb-2">
            TikTok / Instagram / Recipe Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://www.tiktok.com/@chef..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 h-[42px] px-3 bg-[#fff8f1] border border-[#8b5e3c]/20 text-[#1e1b17] placeholder-[#83746b]/50 rounded-lg focus:outline-none focus:border-[#8b5e3c] text-[14px]"
            />
            <button
              onClick={handleImport}
              disabled={importing || !url.trim()}
              className="px-4 bg-[#8b5e3c] hover:bg-[#6f4627] disabled:opacity-50 text-white rounded-lg text-[13px] font-bold transition-colors flex items-center gap-1.5"
            >
              {importing ? (
                <span className="material-symbols-rounded animate-spin text-[16px]">sync</span>
              ) : (
                <span className="material-symbols-rounded text-[16px]">download</span>
              )}
              {importing ? 'Importing' : 'Pull'}
            </button>
          </div>
        </div>

        {/* Recipe Title Input */}
        <div>
          <label className="block text-[12px] uppercase tracking-wider text-[#83746b] font-bold mb-1.5">
            Recipe Title
          </label>
          <input
            type="text"
            placeholder="e.g. Grandma's Spiced Potato Curry"
            value={recipeTitle}
            onChange={(e) => setRecipeTitle(e.target.value)}
            className="w-full h-[46px] px-4 bg-[#faf3ec] border-b border-[#8b5e3c]/20 text-[#1e1b17] placeholder-[#83746b]/40 rounded-t-lg focus:outline-none focus:border-[#8b5e3c] text-[15px]"
          />
        </div>

        {/* Kann Alavu Measurements Section */}
        <div className="p-4 bg-[#faf3ec] border border-[#ffbf00]/30 rounded-[16px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#ffbf00]/10 to-transparent pointer-events-none rounded-bl-full"></div>
          
          <h3 className="font-headline text-[17px] font-bold text-[#6f4627] flex items-center gap-1.5">
            <span className="material-symbols-rounded text-[#ffbf00] fill-current">star</span>
            Kann Alavu Measurements
          </h3>
          <p className="text-[12px] text-[#51443c] mt-1 mb-4">
            Document intuitive measurements by sensory indicators rather than precise numbers.
          </p>

          {/* Added Alavu Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {alavuEntries.map((entry, idx) => (
              <span
                key={idx}
                className="badge-glow inline-flex items-center gap-1 bg-[#ffbf00] text-[#1e1b17] text-[12px] font-semibold italic px-3 py-1 rounded-full border border-[#ffbf00]/50"
              >
                <span className="material-symbols-rounded text-[13px] font-normal not-italic">visibility</span>
                {entry}
                <button
                  type="button"
                  onClick={() => handleRemoveAlavu(idx)}
                  className="ml-1 w-4 h-4 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/25 text-[#1e1b17] text-[10px] not-italic transition-all"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Add Custom Alavu */}
          <form onSubmit={handleAddAlavu} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. a fistful of coriander leaves"
              value={customAlavu}
              onChange={(e) => setCustomAlavu(e.target.value)}
              className="flex-1 h-[38px] px-3 bg-[#fff8f1] border-b border-[#8b5e3c]/20 text-[#1e1b17] placeholder-[#83746b]/40 focus:outline-none focus:border-[#8b5e3c] text-[13px] italic"
            />
            <button
              type="submit"
              className="h-[38px] px-3 bg-[#8b5e3c] hover:bg-[#6f4627] text-white rounded-lg text-[13px] font-bold transition-all"
            >
              Add Entry
            </button>
          </form>
        </div>

        {/* Cover Upload Placeholder */}
        <div>
          <label className="block text-[12px] uppercase tracking-wider text-[#83746b] font-bold mb-2">
            Recipe Cover
          </label>
          <div className="h-[120px] rounded-[16px] border-2 border-dashed border-[#8b5e3c]/20 flex flex-col items-center justify-center text-center p-4 bg-[#faf3ec]/40 hover:bg-[#faf3ec] cursor-pointer transition-colors">
            <span className="material-symbols-rounded text-[#83746b]/70 text-[32px]">image</span>
            <p className="text-[13px] font-bold text-[#6f4627] mt-1">Upload finished photo</p>
            <p className="text-[10px] text-[#83746b]">PNG or JPEG up to 5MB</p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => {
            alert('Recipe draft added to your local archive collection!');
            onNavigateBack();
          }}
          className="w-full h-[50px] bg-[#6f4627] hover:bg-[#8b5e3c] active:scale-[0.98] text-[#fff8f1] font-bold rounded-full text-[15px] transition-all shadow-md mt-6"
        >
          Save to Archive
        </button>

      </div>
    </div>
  );
};

export default AddRecipe;
