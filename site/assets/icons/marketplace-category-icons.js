/* Shared marketplace category icon sprite. Add new category SVG symbols here once. */
(() => {
  if (document.getElementById('marketplace-category-icon-sprite')) return;
  const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  sprite.id = 'marketplace-category-icon-sprite';
  sprite.setAttribute('aria-hidden', 'true');
  sprite.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  sprite.innerHTML = `
    <symbol id="marketplace-icon-appliances-electronics" viewBox="0 0 32 32"><rect x="3" y="5" width="26" height="18" rx="2"/><path d="M11 28h10M16 23v5"/></symbol>
    <symbol id="marketplace-icon-automotive" viewBox="0 0 32 32"><path d="M4 20l3-8h18l3 8v6H4zM9 12l2-4h10l2 4"/><circle cx="9" cy="23" r="2"/><circle cx="23" cy="23" r="2"/></symbol>
    <symbol id="marketplace-icon-baby" viewBox="0 0 32 32"><path d="M9 5v11a7 7 0 0 0 14 0h-7M23 16h5l-2 7h-4"/><circle cx="11" cy="27" r="2"/><circle cx="23" cy="27" r="2"/></symbol>
    <symbol id="marketplace-icon-beauty-health" viewBox="0 0 32 32"><path d="M16 28C7 24 5 15 8 10c5 0 8 4 8 9 0-8 4-13 9-15 2 7-1 14-9 24zM16 19c-4-7-9-7-12-5 0 6 5 10 12 10M16 19c4-5 8-5 12-3-1 5-5 8-12 8"/></symbol>
    <symbol id="marketplace-icon-fashion-jewellery" viewBox="0 0 32 32"><path d="M5 25h22L16 18v-4c3-1 4-3 3-5-1-3-6-3-7 0"/></symbol>
    <symbol id="marketplace-icon-furniture" viewBox="0 0 32 32"><path d="M5 15a5 5 0 0 1 5-5h12a5 5 0 0 1 5 5v9H5zM8 24v4M24 24v4M5 18h22"/></symbol>
    <symbol id="marketplace-icon-groceries-alcohol" viewBox="0 0 32 32"><path d="M3 6h4l3 15h15l3-10H8"/><circle cx="12" cy="27" r="2"/><circle cx="23" cy="27" r="2"/></symbol>
    <symbol id="marketplace-icon-hardware-tools" viewBox="0 0 32 32"><path d="M20 5a7 7 0 0 0-8 9L4 22l6 6 8-8a7 7 0 0 0 9-8l-5 5-5-2-2-5z"/></symbol>
    <symbol id="marketplace-icon-hobbies-entertainment" viewBox="0 0 32 32"><path d="M9 11h14l5 10-5 5-5-5h-4l-5 5-5-5z"/><path d="M11 15v6M8 18h6M21 16h.1M24 20h.1"/></symbol>
    <symbol id="marketplace-icon-home-garden" viewBox="0 0 32 32"><path d="M3 15 16 4l13 11M7 13v15h18V13M13 28V18h6v10"/></symbol>
    <symbol id="marketplace-icon-office-products" viewBox="0 0 32 32"><rect x="8" y="3" width="16" height="21" rx="2"/><path d="M5 22v4h22v-4M11 29h10"/></symbol>
    <symbol id="marketplace-icon-pet-products" viewBox="0 0 32 32"><circle cx="10" cy="10" r="3"/><circle cx="22" cy="10" r="3"/><circle cx="6" cy="17" r="3"/><circle cx="26" cy="17" r="3"/><path d="M10 27c0-6 3-10 6-10s6 4 6 10c-3 2-9 2-12 0z"/></symbol>
    <symbol id="marketplace-icon-photography" viewBox="0 0 32 32"><rect x="3" y="9" width="26" height="18" rx="3"/><circle cx="16" cy="18" r="6"/><path d="M9 9l2-4h10l2 4"/></symbol>
    <symbol id="marketplace-icon-sports-outdoor" viewBox="0 0 32 32"><circle cx="16" cy="16" r="13"/><path d="M16 3l4 6-4 4-4-4zM3 16l7-3 4 4-2 6-6 1M29 16l-7-3-4 4 2 6 6 1M12 23l4-4 4 4-2 6h-4z"/></symbol>
    <symbol id="marketplace-icon-toys-games" viewBox="0 0 32 32"><circle cx="16" cy="17" r="8"/><circle cx="10" cy="9" r="4"/><circle cx="22" cy="9" r="4"/><path d="M11 18h.1M21 18h.1M13 22c2 2 4 2 6 0M8 23l-3 5M24 23l3 5"/></symbol>
    <symbol id="marketplace-icon-camping" viewBox="0 0 32 32"><path d="M4 27 16 6l12 21zM16 6v21M10 17h12"/></symbol>
    <symbol id="marketplace-icon-luggage" viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="21" rx="2"/><path d="M12 8V4h8v4M12 14v10M20 14v10"/></symbol>
    <symbol id="marketplace-icon-kitchenware" viewBox="0 0 32 32"><path d="M8 3v26M13 3v9c0 4-5 4-5 0M21 3v26M21 15c7 0 7-12 0-12"/></symbol>`;
  document.documentElement.prepend(sprite);
})();
