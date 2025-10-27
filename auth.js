// =============================================
// AUTHENTICATION MODULE FOR LIFESTYLE DESIGNER
// =============================================
// Handles login, registration, and authentication logic
// with consistent data structure and syncing system.

// ---------------------------------------------
// API Configuration
// ---------------------------------------------
const API_URL = 'api.php';

// Generic API call helper
async function apiCall(method, params = {}) {
    try {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (method === 'GET') {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`${API_URL}?${query}`, options);
            const result = await response.json();
            return result;
        } else {
            options.body = JSON.stringify(params);
            const response = await fetch(API_URL, options);
            const result = await response.json();
            return result;
        }
    } catch (error) {
        console.error('Errore API:', error);
        return { success: false, error: error.message };
    }
}

// ---------------------------------------------
// Simple hash function
// ---------------------------------------------
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

// ---------------------------------------------
// Normalize user data to maintain consistent structure
// ---------------------------------------------
function normalizeUserData(uid, userData, createdBy = null) {
    const now = new Date().toISOString();

    return {
        uid: uid,
        userType: userData.userType || 'user',
        displayUsername: userData.displayUsername || '',
        passwordHash: userData.passwordHash || '',
        clients: userData.clients || [],
        data: {
            habits: userData.data?.habits || [],
            workout: userData.data?.workout || [],
            uploadedWorkoutPlans: userData.data?.uploadedWorkoutPlans || [],
            diet: userData.data?.diet || [],
            dietPlan: userData.data?.dietPlan || { targetCalories: 2000, plan: [] },
            uploadedDietPlans: userData.data?.uploadedDietPlans || [],
            dailyCompliance: userData.data?.dailyCompliance || [],
            measurementsLog: userData.data?.measurementsLog || []
        },
        sleepStartTimestamp: userData.sleepStartTimestamp || null,
        createdAt: userData.createdAt || now,
        createdBy: userData.createdBy || createdBy || null,
        updatedAt: now
    };
}

// ---------------------------------------------
// LocalStorage Helpers
// ---------------------------------------------
function saveToLocalStorage(userId, userData) {
    try {
        const localStorageUsers = localStorage.getItem('localStorageUsers');
        const users = localStorageUsers ? JSON.parse(localStorageUsers) : {};
        users[userId] = userData;
        localStorage.setItem('localStorageUsers', JSON.stringify(users));
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
    }
}

function getFromLocalStorage(userId) {
    try {
        const localStorageUsers = localStorage.getItem('localStorageUsers');
        if (!localStorageUsers) return null;
        const users = JSON.parse(localStorageUsers);
        return users[userId] || null;
    } catch (error) {
        console.error('Failed to read from localStorage:', error);
        return null;
    }
}

// ---------------------------------------------
// Sync LocalStorage → data.json
// ---------------------------------------------
async function syncLocalStorageToDataJson() {
    try {
        const localStorageUsers = localStorage.getItem('localStorageUsers');
        if (!localStorageUsers) return;

        const users = JSON.parse(localStorageUsers);
        let syncedCount = 0;
        let failedCount = 0;

        for (const [userId, userData] of Object.entries(users)) {
            try {
                const normalized = normalizeUserData(userId, userData, userData.createdBy);
                const result = await apiCall('POST', { userId, data: normalized });
                if (result.success) {
                    syncedCount++;
                    delete users[userId];
                } else {
                    failedCount++;
                }
            } catch (err) {
                console.error(`Failed to sync user ${userId}:`, err);
                failedCount++;
            }
        }

        if (Object.keys(users).length === 0) {
            localStorage.removeItem('localStorageUsers');
        } else {
            localStorage.setItem('localStorageUsers', JSON.stringify(users));
        }

        if (syncedCount > 0) {
            console.log(`Synced ${syncedCount} users from localStorage to data.json`);
        }
    } catch (error) {
        console.error('Error during localStorage sync:', error);
    }
}

// ---------------------------------------------
// AUTH MODULE
// ---------------------------------------------
export const Auth = {
    // -------------------
    // LOGIN
    // -------------------
    login: async function(username, password, displayError) {
        try {
            const userKey = username.toLowerCase();
            const hashBasedUid = simpleHash(userKey).toString();

            let userData = null;
            let actualUid = null;
            let fromLocalStorage = false;

            // Try to fetch by hash UID
            try {
                const result = await apiCall('GET', { userId: hashBasedUid });
                if (result.success && result.data) {
                    userData = result.data;
                    actualUid = hashBasedUid;
                }
            } catch (err) {
                console.error("Failed to read from data.json:", err);
            }

            // Search by displayUsername if not found
            if (!userData) {
                try {
                    const allResult = await apiCall('GET', {});
                    if (allResult.success && allResult.data) {
                        const allData = allResult.data;
                        for (const [uid, data] of Object.entries(allData)) {
                            if (data.displayUsername?.toLowerCase() === userKey) {
                                userData = data;
                                actualUid = uid;
                                break;
                            }
                        }
                    }
                } catch (err) {
                    console.error("Failed to search all users:", err);
                }
            }

            // Try localStorage fallback
            if (!userData) {
                userData = getFromLocalStorage(hashBasedUid);
                if (userData) {
                    actualUid = hashBasedUid;
                    fromLocalStorage = true;
                    console.log('User data loaded from localStorage fallback');
                }
            }

            // Validate credentials
            if (userData && actualUid) {
                const storedPasswordHash = userData.passwordHash || '';
                const inputPasswordHash = simpleHash(password).toString();
                const defaultPasswordHash = simpleHash(userKey).toString();

                const isValid =
                    storedPasswordHash === inputPasswordHash ||
                    (!storedPasswordHash && inputPasswordHash === defaultPasswordHash);

                if (!isValid) {
                    displayError('NOME UTENTE O PASSWORD NON VALIDI.');
                    return null;
                }

                // Normalize before use
                userData = normalizeUserData(actualUid, userData, userData.createdBy);

                // Save session
                localStorage.setItem(
                    'currentUser',
                    JSON.stringify({
                        uid: actualUid,
                        username: userKey.toUpperCase(),
                        userType: userData.userType
                    })
                );

                // Sync if loaded from localStorage
                if (fromLocalStorage) {
                    try {
                        const normalized = normalizeUserData(actualUid, userData, userData.createdBy);
                        const syncResult = await apiCall('POST', { userId: actualUid, data: normalized });
                        if (syncResult.success) {
                            console.log('Successfully synced localStorage data to data.json');
                            const localStorageUsers = localStorage.getItem('localStorageUsers');
                            if (localStorageUsers) {
                                const users = JSON.parse(localStorageUsers);
                                delete users[actualUid];
                                if (Object.keys(users).length === 0)
                                    localStorage.removeItem('localStorageUsers');
                                else
                                    localStorage.setItem('localStorageUsers', JSON.stringify(users));
                            }
                        }
                    } catch (syncErr) {
                        console.error('Failed to sync to data.json during login:', syncErr);
                    }
                }

                return {
                    username: userKey.toUpperCase(),
                    uid: actualUid,
                    userType: userData.userType,
                    userData
                };
            }

            displayError('NOME UTENTE O PASSWORD NON VALIDI.');
            return null;
        } catch (err) {
            console.error("Login error:", err);
            displayError('NOME UTENTE O PASSWORD NON VALIDI.');
            return null;
        }
    },

    // -------------------
    // REGISTER
    // -------------------
    register: async function(username, password, userType = "user", displayError) {
        try {
            const userKey = username.toLowerCase();
            const uid = simpleHash(userKey).toString();
            const passwordHash = simpleHash(password).toString();

            // Check if exists
            let existingUser = null;
            try {
                const result = await apiCall('GET', { userId: uid });
                if (result.success && result.data) existingUser = result.data;
            } catch (err) {
                console.error("Failed to check data.json:", err);
            }

            if (!existingUser) existingUser = getFromLocalStorage(uid);

            if (existingUser) {
                displayError('NOME UTENTE GIÀ IN USO. SCEGLI UN ALTRO NOME.');
                return null;
            }

            const user = {
                username: userKey.toUpperCase(),
                uid,
                userType
            };

            // BASE_USER trainer
            let baseUserUid = null;
            if (userType === "user") {
                const baseKey = "base_user";
                baseUserUid = simpleHash(baseKey).toString();

                let baseUserData = null;
                try {
                    const baseRes = await apiCall('GET', { userId: baseUserUid });
                    if (baseRes.success && baseRes.data) baseUserData = baseRes.data;
                } catch {}

                if (!baseUserData) {
                    const baseUserPasswordHash = simpleHash("base_user_password").toString();
                    baseUserData = normalizeUserData(baseUserUid, {
                        userType: "pro",
                        displayUsername: "BASE_USER",
                        passwordHash: baseUserPasswordHash,
                        clients: []
                    });
                    await apiCall('POST', { userId: baseUserUid, data: baseUserData });
                    console.log('BASE_USER created');
                }
            }

            // Create payload
            const payload = normalizeUserData(uid, {
                userType,
                displayUsername: user.username,
                passwordHash,
                clients: [],
                data: {
                    habits: [],
                    workout: [],
                    uploadedWorkoutPlans: [],
                    diet: [],
                    dietPlan: { targetCalories: 2000, plan: [] },
                    uploadedDietPlans: [],
                    dailyCompliance: [],
                    measurementsLog: []
                },
                createdBy: userType === "user" ? baseUserUid : null
            });

            // Save
            let savedToDataJson = false;
            try {
                const result = await apiCall('POST', { userId: uid, data: payload });
                if (result.success) {
                    savedToDataJson = true;
                    console.log('User registered successfully to data.json');
                }
            } catch {
                console.error("Failed to save to data.json");
            }

            // Fallback localStorage
            if (!savedToDataJson) {
                if (saveToLocalStorage(uid, payload)) {
                    console.log('User registered to localStorage (fallback)');
                    displayError('REGISTRAZIONE SALVATA LOCALMENTE. SARÀ SINCRONIZZATA QUANDO POSSIBILE.');
                } else {
                    displayError('ERRORE DURANTE LA REGISTRAZIONE.');
                    return null;
                }
            }

            // Add to BASE_USER clients
            if (userType === "user" && baseUserUid && savedToDataJson) {
                try {
                    const baseRes = await apiCall('GET', { userId: baseUserUid });
                    if (baseRes.success && baseRes.data) {
                        const baseData = baseRes.data;
                        baseData.clients = baseData.clients || [];
                        if (!baseData.clients.find(c => c.uid === uid)) {
                            baseData.clients.push({ uid, username: user.username });
                            await apiCall('POST', { userId: baseUserUid, data: baseData });
                        }
                    }
                } catch (err) {
                    console.error("Failed to add user to BASE_USER clients:", err);
                }
            }

            // Save session
            localStorage.setItem('currentUser', JSON.stringify({
                uid,
                username: user.username,
                userType
            }));

            return { ...user, savedToDataJson };
        } catch (err) {
            console.error("Register error:", err);
            displayError('ERRORE DURANTE LA REGISTRAZIONE.');
            return null;
        }
    },

    // -------------------
    // LOGOUT
    // -------------------
    logout: function() {
        try {
            localStorage.removeItem('currentUser');
            return true;
        } catch (err) {
            console.error("Logout error:", err);
            return false;
        }
    },

    // -------------------
    // CHECK AUTH
    // -------------------
    checkAuth: async function() {
        await syncLocalStorageToDataJson();
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            return {
                uid: user.uid,
                username: user.username,
                userType: user.userType || 'user'
            };
        }
        return null;
    },

    // -------------------
    // PWA INSTALL
    // -------------------
    // Store the deferred prompt event
    _deferredPrompt: null,

    // Setup PWA install prompt listener
    setupPWAInstallPrompt: function(callback) {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            Auth._deferredPrompt = e;
            if (callback) callback(e);
        });
    },

    // Check if PWA install is available
    isPWAInstallAvailable: function() {
        return Auth._deferredPrompt !== null;
    },

    // Install PWA
    installPWA: async function() {
        if (!Auth._deferredPrompt) {
            return {
                success: false,
                message: 'IL BROWSER NON SUPPORTA L\'INSTALLAZIONE DIRETTA O L\'APP È GIÀ INSTALLATA.'
            };
        }

        try {
            Auth._deferredPrompt.prompt();
            const { outcome } = await Auth._deferredPrompt.userChoice;
            Auth._deferredPrompt = null;

            if (outcome === 'accepted') {
                return {
                    success: true,
                    message: 'INSTALLAZIONE PWA ACCETTATA!'
                };
            } else {
                return {
                    success: false,
                    message: 'INSTALLAZIONE PWA RIFIUTATA.'
                };
            }
        } catch (error) {
            console.error('Error during PWA installation:', error);
            return {
                success: false,
                message: 'ERRORE DURANTE L\'INSTALLAZIONE PWA.'
            };
        }
    }
};
