import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // --- CONFIGURATION START ---
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
            apiKey: "AIzaSyDw3ZozNb_NJgv3l_7vN7XTXIPdMHEAtRM",
            authDomain: "medimitra1-4fac0.firebaseapp.com",
            projectId: "medimitra1-4fac0",
            storageBucket: "medimitra1-4fac0.firebasestorage.app",
            messagingSenderId: "158778950976",
            appId: "1:158778950976:web:5c9108464a747e111026a5",
            measurementId: "G-9B2FCCF52Z"
        };
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'medimitra-prod-v2';
        // --- CONFIGURATION END ---

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        let currentUser = null;
        let medications = [];
        let selectedColor = 'blue';
        let isSignup = false;
        let activeAlarmId = null;
        let unsubscribeMeds = null;
        let isAuthReady = false;

        const alarmSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        alarmSound.loop = true;

        window.testSound = () => {
            alarmSound.play().catch(e => console.warn("Interaction needed"));
            setTimeout(() => { alarmSound.pause(); alarmSound.currentTime = 0; }, 2000);
        };

        window.toggleAuthMode = () => {
            isSignup = !isSignup;
            document.getElementById('auth-btn').innerText = isSignup ? 'Secure Create' : 'Enter Mitra';
            document.getElementById('auth-switch').innerText = isSignup ? 'I already have a key' : 'New user? Create secure account';
        };

        window.handleAuth = async () => {
            if (!isAuthReady) return;
            const user = document.getElementById('auth-username').value.trim();
            const pass = document.getElementById('auth-password').value.trim();
            const err = document.getElementById('auth-error');
            const btn = document.getElementById('auth-btn');

            if (!user || !pass) {
                err.innerText = "Identification required";
                err.classList.remove('hidden');
                return;
            }

            try {
                btn.disabled = true;
                btn.innerText = "Authenticating...";
                const cleanUser = user.toLowerCase().replace(/[^a-z0-9]/g, '');
                const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', cleanUser);
                const userDoc = await getDoc(userRef);

                if (isSignup) {
                    if (userDoc.exists()) {
                        err.innerText = "Username already claimed.";
                        err.classList.remove('hidden');
                    } else {
                        await setDoc(userRef, { password: btoa(pass), createdAt: Date.now(), username: cleanUser });
                        window.proceedLogin(cleanUser);
                    }
                } else {
                    if (userDoc.exists() && userDoc.data().password === btoa(pass)) {
                        window.proceedLogin(cleanUser);
                    } else {
                        err.innerText = "Invalid credentials.";
                        err.classList.remove('hidden');
                    }
                }
            } catch (e) {
                err.innerText = "Connection issue.";
                err.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerText = isSignup ? 'Secure Create' : 'Enter Mitra';
            }
        };

        window.proceedLogin = (username) => {
            localStorage.setItem('medimitra_user', username);
            setupApp(username);
        };

        window.logout = () => {
            if (unsubscribeMeds) unsubscribeMeds();
            localStorage.removeItem('medimitra_user');
            location.reload();
        };

        function setupApp(username) {
            if (!auth.currentUser) return;
            currentUser = username;
            document.getElementById('display-name').innerText = username;
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('app-content').classList.remove('hidden');
            setTimeout(() => { document.getElementById('app-content').style.opacity = '1'; }, 10);
            
            if (unsubscribeMeds) unsubscribeMeds();
            const qMeds = collection(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'meds');
            unsubscribeMeds = onSnapshot(qMeds, (snapshot) => {
                medications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderSchedule();
                updateStats();
            });

            if (!window.clockStarted) {
                window.clockStarted = true;
                setInterval(() => {
                    const now = new Date();
                    const timeStr = now.getHours().toString().padStart(2,'0') + ":" + now.getMinutes().toString().padStart(2,'0');
                    document.getElementById('live-clock').innerText = timeStr;
                    checkAlarms(timeStr);
                }, 1000);
            }
        }

        function updateStats() {
            const total = medications.length;
            const taken = medications.filter(m => m.takenToday).length;
            const remaining = total - taken;
            const percent = total === 0 ? 0 : Math.round((taken / total) * 100);
            document.getElementById('stat-percent').innerText = `${percent}%`;
            document.getElementById('stat-remaining').innerText = remaining;
        }

        function checkAlarms(time) {
            const med = medications.find(m => m.time === time && !m.takenToday && activeAlarmId !== m.id);
            if (med) {
                activeAlarmId = med.id;
                document.getElementById('alarm-med-name').innerText = med.name;
                document.getElementById('alarm-overlay').classList.remove('hidden');
                document.getElementById('alarm-overlay').classList.add('flex');
                alarmSound.play().catch(e => console.log("Sound interaction needed"));
            }
        }

        window.acknowledgeAlarm = async () => {
            alarmSound.pause();
            alarmSound.currentTime = 0;
            if (activeAlarmId && auth.currentUser) {
                const medRef = doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'meds', activeAlarmId);
                await updateDoc(medRef, { takenToday: true });
            }
            document.getElementById('alarm-overlay').classList.add('hidden');
            document.getElementById('alarm-overlay').classList.remove('flex');
            activeAlarmId = null;
        };

        window.toggleAddModal = (s) => {
            const el = document.getElementById('add-modal');
            el.classList.toggle('hidden', !s);
            el.classList.toggle('flex', s);
            document.body.classList.toggle('modal-open', s);
        };
        window.toggleSettings = (s) => {
            const el = document.getElementById('settings-modal');
            el.classList.toggle('hidden', !s);
            el.classList.toggle('flex', s);
            document.body.classList.toggle('modal-open', s);
        };

        window.selectColor = (c) => {
            selectedColor = c;
            ['blue', 'orange', 'green', 'indigo', 'rose', 'amber'].forEach(col => {
                const el = document.getElementById('color-'+col);
                if (el) {
                    el.classList.toggle('ring-blue-100', col === c);
                    el.classList.toggle('ring-transparent', col !== c);
                }
            });
        };

        window.saveNewMedicine = async () => {
            const name = document.getElementById('new-med-name').value;
            const dose = document.getElementById('new-med-dose').value;
            const time = document.getElementById('new-med-time').value;
            if (!name || !time || !auth.currentUser) return;

            try {
                await addDoc(collection(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'meds'), {
                    name, dose, time, color: selectedColor, takenToday: false, addedAt: Date.now()
                });
                window.toggleAddModal(false);
                document.getElementById('new-med-name').value = "";
                document.getElementById('new-med-dose').value = "";
                document.getElementById('new-med-time').value = "";
            } catch (e) { console.error(e); }
        };

        window.deleteMed = async (id) => {
            if (auth.currentUser) await deleteDoc(doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'meds', id));
        };

        function renderSchedule() {
            const list = document.getElementById('schedule-list');
            list.innerHTML = medications.length ? "" : `<div class="text-center py-20 animate-slide"><div class="text-slate-200 mb-4"><i data-lucide="calendar-plus" class="w-16 h-16 mx-auto"></i></div><p class="text-slate-400 font-bold">Plan your medications</p></div>`;
            [...medications].sort((a,b) => a.time.localeCompare(b.time)).forEach(med => {
                const div = document.createElement('div');
                div.className = `med-card bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 flex items-center gap-4 sm:gap-5 border border-slate-100 card-shadow ${med.takenToday ? 'opacity-40 grayscale-[0.5]' : ''}`;
                div.innerHTML = `
                    <div class="tag-${med.color} w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                        <i data-lucide="pill" class="w-6 h-6 sm:w-7 sm:h-7"></i>
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <h3 class="font-extrabold text-sm sm:text-base text-slate-900 truncate">${med.name}</h3>
                        <p class="text-[10px] sm:text-xs text-slate-500 font-bold flex items-center gap-1">
                            <i data-lucide="clock" class="w-3 h-3"></i> ${med.time} • ${med.dose || 'Dosage'}
                        </p>
                    </div>
                    <div class="flex items-center gap-1 sm:gap-3">
                        <button onclick="window.deleteMed('${med.id}')" class="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                        </button>
                        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${med.takenToday ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-slate-50 border border-slate-100 text-slate-200'}">
                            <i data-lucide="check" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                        </div>
                    </div>
                `;
                list.appendChild(div);
            });
            lucide.createIcons();
        }

        const initAuth = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (e) {
                const btn = document.getElementById('auth-btn');
                if (btn) btn.innerText = "Retry Config";
            }
        };
        initAuth();

        onAuthStateChanged(auth, (user) => {
            if (user) {
                isAuthReady = true;
                const btn = document.getElementById('auth-btn');
                if (btn) btn.innerText = isSignup ? 'Secure Create' : 'Enter Mitra';
                const savedUser = localStorage.getItem('medimitra_user');
                if (savedUser) setupApp(savedUser);
            }
        });

        lucide.createIcons();

        