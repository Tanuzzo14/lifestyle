// Authentication Module for Lifestyle Designer
// This module handles login, registration, and authentication logic

// API Configuration
const API_URL = 'api.php';

// API call to server using data.json
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

// Simple hash function
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Save user data to localStorage as fallback
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

// Get user data from localStorage
function getFromLocalStorage(userId) {
  try {
    const localStorageUsers = localStorage.getItem('localStorageUsers');
    if (!localStorageUsers) {
      return null;
    }
    const users = JSON.parse(localStorageUsers);
    return users[userId] || null;
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return null;
  }
}

// Sync localStorage user data to data.json when possible
async function syncLocalStorageToDataJson() {
  try {
    const localStorageUsers = localStorage.getItem('localStorageUsers');
    if (!localStorageUsers) {
      return; // No pending data to sync
    }

    const users = JSON.parse(localStorageUsers);
    let syncedCount = 0;
    let failedCount = 0;

    for (const [userId, userData] of Object.entries(users)) {
      try {
        const result = await apiCall('POST', { userId: userId, data: userData });
        if (result.success) {
          syncedCount++;
          // Remove from localStorage after successful sync
          delete users[userId];
        } else {
          failedCount++;
        }
      } catch (err) {
        console.error(`Failed to sync user ${userId}:`, err);
        failedCount++;
      }
    }

    // Update localStorage with remaining unsync'd users
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

// Authentication Module
export const Auth = {
  /**
   * Login with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @param {Function} displayError - Callback function to display errors
   * @returns {Promise<Object|null>} User object if successful, null otherwise
   */
  login: async function(username, password, displayError) {
    try {
      const userKey = username.toLowerCase();
      const hashBasedUid = simpleHash(userKey).toString();
      
      let userData = null;
      let actualUid = null;
      let fromLocalStorage = false;
      
      // Try to get user data from data.json first using hash-based UID
      try {
        const result = await apiCall('GET', { userId: hashBasedUid });
        if (result.success && result.data) {
          userData = result.data;
          actualUid = hashBasedUid;
        }
      } catch (err) {
        console.error("Failed to read from data.json:", err);
      }
      
      // If not found by hash-based UID, search all users by username (for trainer-created users)
      if (!userData) {
        try {
          const allDataResult = await apiCall('GET', {});
          if (allDataResult.success && allDataResult.data) {
            const allData = allDataResult.data;
            // Search for user with matching displayUsername
            for (const [uid, data] of Object.entries(allData)) {
              if (data && data.displayUsername && data.displayUsername.toLowerCase() === userKey) {
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
      
      // If still not found in data.json, try localStorage
      if (!userData) {
        userData = getFromLocalStorage(hashBasedUid);
        if (userData) {
          actualUid = hashBasedUid;
          fromLocalStorage = true;
          console.log('User data loaded from localStorage fallback');
        }
      }
      
      if (userData && actualUid) {
        // Verify password (simple hash comparison)
        const storedPasswordHash = userData.passwordHash || '';
        const inputPasswordHash = simpleHash(password).toString();
        
        if (storedPasswordHash === inputPasswordHash) {
          const user = {
            username: userKey.toUpperCase(),
            uid: actualUid,
            userType: userData.userType || 'user',
            userData: userData
          };
          
          // Save to localStorage
          localStorage.setItem('currentUser', JSON.stringify({
            uid: actualUid,
            username: user.username,
            userType: user.userType
          }));
          
          // If data was from localStorage, try to sync it to data.json
          if (fromLocalStorage) {
            try {
              const syncResult = await apiCall('POST', { userId: actualUid, data: userData });
              if (syncResult.success) {
                console.log('Successfully synced localStorage data to data.json');
                // Remove from localStorage after successful sync
                const localStorageUsers = localStorage.getItem('localStorageUsers');
                if (localStorageUsers) {
                  const users = JSON.parse(localStorageUsers);
                  delete users[actualUid];
                  if (Object.keys(users).length === 0) {
                    localStorage.removeItem('localStorageUsers');
                  } else {
                    localStorage.setItem('localStorageUsers', JSON.stringify(users));
                  }
                }
              }
            } catch (syncErr) {
              console.error('Failed to sync to data.json during login:', syncErr);
            }
          }
          
          return user;
        } else {
          displayError('NOME UTENTE O PASSWORD NON VALIDI.');
          return null;
        }
      } else {
        displayError('NOME UTENTE O PASSWORD NON VALIDI.');
        return null;
      }
    } catch (err) {
      console.error("Login error:", err);
      displayError('NOME UTENTE O PASSWORD NON VALIDI.');
      return null;
    }
  },

  /**
   * Register a new user
   * @param {string} username - Desired username
   * @param {string} password - Desired password
   * @param {string} userType - User type: "user" or "pro"
   * @param {Function} displayError - Callback function to display errors/messages
   * @returns {Promise<Object|null>} User object if successful, null otherwise
   */
  register: async function(username, password, userType = "user", displayError) {
    try {
      const userKey = username.toLowerCase();
      const uid = simpleHash(userKey).toString();
      const passwordHash = simpleHash(password).toString();

      // Check if user already exists in data.json or localStorage
      let existingUser = null;
      try {
        const result = await apiCall('GET', { userId: uid });
        if (result.success && result.data) {
          existingUser = result.data;
        }
      } catch (err) {
        console.error("Failed to check data.json:", err);
      }
      
      if (!existingUser) {
        existingUser = getFromLocalStorage(uid);
      }
      
      if (existingUser) {
        displayError('NOME UTENTE GIÀ IN USO. SCEGLI UN ALTRO NOME.');
        return null;
      }

      const user = {
        username: userKey.toUpperCase(),
        uid: uid,
        userType: userType
      };

      // Save user data
      const payload = {
        userType: userType, 
        displayUsername: user.username,
        passwordHash: passwordHash,
        clients: [],
        data: {
          habits: [],
          workout: [],
          uploadedWorkoutPlans: [],
          diet: [],
          dietPlan: { targetCalories: 2000, plan: [] },
          uploadedDietPlans: [],
          dailyCompliance: {},
          measurementsLog: []
        },
        sleepStartTimestamp: null,
        createdAt: new Date().toISOString()
      };
      
      let savedToDataJson = false;
      
      // Try to save to data.json first
      try {
        const result = await apiCall('POST', { userId: uid, data: payload });
        if (result.success) {
          savedToDataJson = true;
          console.log('User registered successfully to data.json');
        }
      } catch (err) {
        console.error("Failed to save to data.json:", err);
      }
      
      // If data.json save failed, save to localStorage
      if (!savedToDataJson) {
        const savedToLocalStorage = saveToLocalStorage(uid, payload);
        if (savedToLocalStorage) {
          console.log('User registered to localStorage (fallback)');
          displayError('REGISTRAZIONE SALVATA LOCALMENTE. SARÀ SINCRONIZZATA QUANDO POSSIBILE.');
        } else {
          displayError('ERRORE DURANTE LA REGISTRAZIONE.');
          return null;
        }
      }
      
      // Save to localStorage for session
      localStorage.setItem('currentUser', JSON.stringify({
        uid: uid,
        username: user.username,
        userType: userType
      }));
      
      return {
        ...user,
        savedToDataJson: savedToDataJson
      };
    } catch (err) {
      console.error("Register error:", err);
      displayError('ERRORE DURANTE LA REGISTRAZIONE.');
      return null;
    }
  },

  /**
   * Logout the current user
   */
  logout: function() {
    try {
      localStorage.removeItem('currentUser');
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      return false;
    }
  },

  /**
   * Check if user is already authenticated
   * @returns {Object|null} User object if authenticated, null otherwise
   */
  checkAuth: async function() {
    // Always try to sync localStorage data to data.json on app start
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
  }
};
