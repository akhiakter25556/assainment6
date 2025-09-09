    const API_BASE = 'https://openapi.programming-hero.com/api';



    const els = {
     categories: document.getElementById('category-list'),
      cards: document.getElementById('cards'),
      empty: document.getElementById('empty'),
      loading: document.getElementById('loading'),
      btnAll: document.getElementById('btn-all'),
      btnRefresh: document.getElementById('btn-refresh'),
      cartList: document.getElementById('cart-list'),
      cartTotal: document.getElementById('cart-total'),
      modal: document.getElementById('details-modal'),
      modalTitle: document.getElementById('modal-title'),
      modalBody: document.getElementById('modal-body'),
      donateForm: document.getElementById('donation-form')
    };

    const cart = { items: [], total: 0 };


    const money = (n) => `৳${Number(n || 0).toLocaleString()} `;
    const show = (el) => el.classList.remove('hidden');
    const hide = (el) => el.classList.add('hidden');

    function spinner(on) { on ? show(els.loading) : hide(els.loading); }

    function setActiveCategory(btn) {
      document.querySelectorAll('#category-list .btn').forEach(b =>
         b.classList.remove('cat-active'));
      if (btn) btn.classList.add('cat-active');
    }

    async function fetchJSON(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network error');
      return res.json();
    }

    // Load Categories (left)
    async function loadCategories() {
      try {
        const data = await fetchJSON(`${API_BASE}/categories`);
        const categories = data?.categories || data?.data || [];
        els.categories.innerHTML = '';

        // "All Trees" shortcut at top for mobile
        const allBtn = document.createElement('button');
        allBtn.className = 'btn  w-full bg-green-600';
        allBtn.textContent = 'All Trees ';
        allBtn.addEventListener('click', () => { setActiveCategory(null);
           loadAllPlants(); });
        els.categories.appendChild(allBtn);

        categories.forEach(cat => {
          const id = cat?.id || cat?.category_id || cat?.categoryId ||
           cat?.category_id?.toString?.();
          const name = cat?.category || cat?.category_name ||
           cat?.name || `Category ${id}`;

          const btn = document.createElement('button');
          btn.className = 'btn bg-white justify-start';
          btn.textContent = name;
          btn.dataset.catId = id;
          btn.addEventListener('click', () => {
            setActiveCategory(btn);
            loadPlantsByCategory(id);
          });
          els.categories.appendChild(btn);
        });
      } catch (e) {
        els.categories.innerHTML =
         '<p class="opacity-70">Failed to load categories.</p>';
      }
    }

    //  plant cards
    function renderCards(plants = []) {
      els.cards.innerHTML = '';
      if (!plants.length) { show(els.empty); return; }
      hide(els.empty);

      const tpl = document.getElementById('card-template');
      plants.forEach(p => {
        const node = tpl.content.cloneNode(true);
        const img = node.querySelector('img');
        const nameLink = node.querySelector('.name-link');
        const desc = node.querySelector('.desc');
        const cat = node.querySelector('.cat');
        const price = node.querySelector('.price');
        const addBtn = node.querySelector('.add-btn');

        const id = p?.id || p?.plantId || p?._id || p?.plant_id;
        const title = p?.plant_name || p?.name || p?.title || 'Unknown Plant';
        const image = p?.image || p?.img || p?.thumbnail || 
        'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop';
        const short = p?.short_description || p?.description ||
         'A beautiful plant to green your world.';
        const category = p?.category || p?.type || '—';
        const priceVal = Number(p?.price || p?.cost || 0);

        img.src = image; img.alt = title;
        nameLink.textContent = title; nameLink.href = '#';
        desc.textContent = short;
        cat.textContent = category;
        price.textContent = money(priceVal);

        nameLink.addEventListener('click', (ev) => { ev.preventDefault();
           openDetails(id, title); });
        addBtn.addEventListener('click', () => addToCart({ id, title, price: priceVal }));

        els.cards.appendChild(node);
      });
    }

    // Loaders
    async function loadAllPlants() {
      spinner(true);
      try {
        const data = await fetchJSON(`${API_BASE}/plants`);
        const plants = data?.plants || data?.data || [];
        renderCards(plants);
      } catch (e) {
        els.cards.innerHTML = '<p class="opacity-70">Failed to load plants.</p>';
        hide(els.empty);
      } finally { spinner(false); }
    }

    async function loadPlantsByCategory(id) {
      spinner(true);
      try {
        const data = await fetchJSON(`${API_BASE}/category/${id}`);
        const plants = data?.plants || data?.data || [];
        renderCards(plants);
      } catch (e) {
        els.cards.innerHTML = '<p class="opacity-70">Failed to load this category.</p>';
        hide(els.empty);
      } finally { spinner(false); }
    }

    async function openDetails(id, fallbackTitle) {
      try {
        const data = await fetchJSON(`${API_BASE}/plant/${id}`);
        const p = data?.plant || data?.data || {};
        const title = p?.plant_name || p?.name || fallbackTitle || 'Plant Details';
        els.modalTitle.textContent = title;

        const fields = [
          ['Category', p?.category],
          ['Price', p?.price ? money(p.price) : null],
          ['Origin', p?.origin || p?.native],
          ['Sunlight', p?.sunlight],
          ['Watering', p?.watering],
          ['Description', p?.description || p?.short_description],
        ].filter(([k,v]) => v);

        els.modalBody.innerHTML = `
          <img src="${p?.image || p?.img || ''}" alt="${title}" class="w-full
           rounded-xl mb-4 object-cover max-h-80"/>
          ${fields.map(([k,v]) => `<div><span class='font-semibold'>${k}:</span> 
          <span class='opacity-80'>${v}</span></div>`).join('')}
        `;
        els.modal.showModal();
      } catch (e) {
        els.modalTitle.textContent = fallbackTitle || 'Plant Details';
        els.modalBody.textContent = 'Failed to load details.';
        els.modal.showModal();
      }
    }

    // Cart
    function renderCart() {
      els.cartList.innerHTML = '';
      cart.total = 0;
      cart.items.forEach(item => cart.total += item.price);
      els.cartTotal.textContent = money(cart.total);

      cart.items.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = ' items-center justify-between gap-3';
        li.innerHTML = `
          <span class="truncate">${item.title}</span>
          <div class="flex items-center gap-3 shrink-0 w-[50%]">
            <span class="text-sm opacity-70">${money(item.price)}</span>
            <button class="btn btn-ghost btn-xs" title="Remove"
             aria-label="Remove"> X </button>
          </div>
        `;
        li.querySelector('button').addEventListener('click',
             () => removeFromCart(idx));
        els.cartList.appendChild(li);
      });
    }

    function addToCart(item) {
      cart.items.push(item);
      renderCart();
    }

    function removeFromCart(index) {
      cart.items.splice(index, 1);
      renderCart();
    }


    els.btnAll.addEventListener('click', () => { setActiveCategory(null);
         loadAllPlants(); });
    els.btnRefresh.addEventListener('click', () => {
   
      const active = document.querySelector('#category-list .cat-active');
      active ? loadPlantsByCategory(active.dataset.catId) : loadAllPlants();
    });

    els.donateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const name = fd.get('name');
      const email = fd.get('email');
      const count = fd.get('count');
      alert(`Thank you, ${name}! You pledged ${count} tree(s). 
        A confirmation will be sent to ${email}.`);
      e.currentTarget.reset();
    });


    loadCategories();
    loadAllPlants();