
        // High quality representations of Indian Currency
        const banknoteData = [
            { 
                denom: '10', 
                motif: 'Sun Temple, Konark', 
                color: 'Chocolate Brown', 
                size: '63 x 123 mm', 
                img: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=400', // Symbolic representation
                fallbackColor: '#7B3F00'
            },
            { 
                denom: '50', 
                motif: 'Hampi with Chariot', 
                color: 'Fluorescent Blue', 
                size: '66 x 135 mm', 
                img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=400',
                fallbackColor: '#00E5FF'
            },
            { 
                denom: '100', 
                motif: 'Rani ki Vav', 
                color: 'Lavender', 
                size: '66 x 142 mm', 
                img: 'https://images.unsplash.com/photo-1599661046289-e318878467ca?auto=format&fit=crop&q=80&w=400',
                fallbackColor: '#B39DDB'
            },
            { 
                denom: '200', 
                motif: 'Sanchi Stupa', 
                color: 'Bright Yellow', 
                size: '66 x 146 mm', 
                img: 'https://images.unsplash.com/photo-1620611753456-e970f5e1a789?auto=format&fit=crop&q=80&w=400',
                fallbackColor: '#FFD54F'
            },
            { 
                denom: '500', 
                motif: 'Red Fort', 
                color: 'Stone Grey', 
                size: '66 x 150 mm', 
                img: 'https://images.unsplash.com/photo-1585132804533-e89369701f8d?auto=format&fit=crop&q=80&w=400',
                fallbackColor: '#9E9E9E'
            }
        ];

        const coinData = [
            { denom: '1', metal: 'FSS', img: 'https://cdn-icons-png.flaticon.com/512/3034/3034403.png' },
            { denom: '2', metal: 'FSS', img: 'https://cdn-icons-png.flaticon.com/512/3034/3034403.png' },
            { denom: '5', metal: 'Nickel Brass', img: 'https://cdn-icons-png.flaticon.com/512/3034/3034403.png' },
            { denom: '10', metal: 'Bimetallic', img: 'https://cdn-icons-png.flaticon.com/512/3034/3034403.png' },
            { denom: '20', metal: 'Bimetallic', img: 'https://cdn-icons-png.flaticon.com/512/3034/3034403.png' }
        ];

        function initApp() {
            const notesContainer = document.querySelector('#sec-notes div');
            banknoteData.forEach(note => {
                notesContainer.innerHTML += `
                    <div class="currency-card bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div class="img-container" style="background-color: ${note.fallbackColor}20">
                            <img src="${note.img}" alt="₹${note.denom} Note Motif" onerror="this.src='https://placehold.co/400x140/${note.fallbackColor.replace('#','')}/ffffff?text=₹${note.denom}+Note'">
                        </div>
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-4">
                                <h2 class="text-2xl font-bold text-slate-900">₹${note.denom} Note</h2>
                                <span class="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">NEW SERIES</span>
                            </div>
                            <ul class="space-y-3 text-sm text-slate-600">
                                <li class="flex items-center"><i class="fas fa-image w-6 text-indigo-500"></i> <strong>Motif:</strong> ${note.motif}</li>
                                <li class="flex items-center"><i class="fas fa-palette w-6 text-indigo-500"></i> <strong>Color:</strong> ${note.color}</li>
                                <li class="flex items-center"><i class="fas fa-ruler-combined w-6 text-indigo-500"></i> <strong>Size:</strong> ${note.size}</li>
                            </ul>
                        </div>
                    </div>
                `;
            });

            const coinsContainer = document.querySelector('#sec-coins div');
            coinData.forEach(coin => {
                coinsContainer.innerHTML += `
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center hover:border-orange-200 transition-colors">
                        <img src="${coin.img}" alt="₹${coin.denom} Coin" class="coin-img mb-4">
                        <h3 class="text-xl font-bold">₹${coin.denom} Coin</h3>
                        <p class="text-xs text-slate-500 mt-1 uppercase font-semibold">${coin.metal}</p>
                    </div>
                `;
            });
        }

        function switchTab(tab) {
            document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`sec-${tab}`).classList.remove('hidden');
            document.getElementById(`btn-${tab}`).classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        window.onload = initApp;
    