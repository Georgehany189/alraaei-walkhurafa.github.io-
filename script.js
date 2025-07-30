document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables and DOM Elements ---
    let currentUser = null; // Stores the currently logged-in user
    let priest_app_users = {}; // Stores all registered users (simulated DB)
    let priest_app_data = {}; // Stores tasks, confessions, etc., per user

    // Authentication Page Elements
    const loginPage = document.getElementById('login-page');
    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const registerForm = document.getElementById('register-form');
    const registerNameInput = document.getElementById('register-name');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerDobInput = document.getElementById('register-dob');
    const registerAgeInput = document.getElementById('register-age');
    const loginToggleBtn = document.getElementById('login-toggle');
    const registerToggleBtn = document.getElementById('register-toggle');

    // Password Toggle Icons
    const toggleLoginPassword = document.getElementById('toggle-login-password');
    const toggleRegisterPassword = document.getElementById('toggle-register-password');


    // Validation/Message Display Elements
    const registerNameError = document.getElementById('register-name-error');
    const registerEmailError = document.getElementById('register-email-error');
    const registerPasswordError = document.getElementById('register-password-error');
    const registerDobError = document.getElementById('register-dob-error');
    const registerAgeError = document.getElementById('register-age-error');
    const loginEmailError = document.getElementById('login-email-error');
    const loginPasswordError = document.getElementById('login-password-error');
    const globalMessageDisplay = document.getElementById('global-message');

    // Main App Elements
    const container = document.querySelector('.container');
    const logoutBtn = document.getElementById('logout-btn'); // Both desktop and sidebar logout buttons share this ID
    const sidebar = document.querySelector('.sidebar');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelectorAll('.sidebar nav ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const currentSectionTitle = document.getElementById('current-section-title');

    // Dashboard Elements
    const userNameDisplay = document.getElementById('user-name-display');
    const userEmailDisplay = document.getElementById('user-email-display');
    const userDobDisplay = document.getElementById('user-dob-display');
    const userAgeDisplay = document.getElementById('user-age-display');

    // Tasks Section Elements
    const addTaskBtn = document.getElementById('add-task-btn');
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const tasksList = document.getElementById('tasks-list');
    const cancelAddTaskBtn = document.getElementById('cancel-add-task');

    // Confessions Section Elements
    const addConfessionBtn = document.getElementById('add-confession-btn');
    const addConfessionForm = document.getElementById('add-confession-form');
    const confessionTextInput = document.getElementById('confession-text-input');
    const confessionsList = document.getElementById('confessions-list');
    const cancelAddConfessionBtn = document.getElementById('cancel-add-confession');

    // Sermons Section Elements
    const addSermonBtn = document.getElementById('add-sermon-btn');
    const addSermonForm = document.getElementById('add-sermon-form');
    const sermonTitleInput = document.getElementById('sermon-title-input');
    const sermonDateInput = document.getElementById('sermon-date-input');
    const sermonTextarea = document.getElementById('sermon-textarea');
    const sermonsList = document.getElementById('sermons-list');
    const cancelAddSermonBtn = document.getElementById('cancel-add-sermon');

    // Spiritual Life Section Elements
    const addSpiritualEntryBtn = document.getElementById('add-spiritual-entry-btn');
    const addSpiritualEntryForm = document.getElementById('add-spiritual-entry-form');
    const spiritualEntryTitleInput = document.getElementById('spiritual-entry-title-input');
    const spiritualEntryDateInput = document.getElementById('spiritual-entry-date-input');
    const spiritualEntryTextarea = document.getElementById('spiritual-entry-textarea');
    const spiritualEntriesList = document.getElementById('spiritual-entries-list');
    const cancelAddSpiritualEntryBtn = document.getElementById('cancel-add-spiritual-entry');

    // Chat Section Elements
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');


    // --- Helper Functions ---

    // Function to load data from localStorage
    function loadData() {
        priest_app_users = JSON.parse(localStorage.getItem('priest_app_users') || '{}');
        const current_user_email = localStorage.getItem('priest_app_current_user_email');
        if (current_user_email && priest_app_users[current_user_email]) {
            currentUser = priest_app_users[current_user_email];
            priest_app_data = JSON.parse(localStorage.getItem(`priest_app_data_${currentUser.email}`) || '{}');
            showMainApp();
        } else {
            showLogin();
        }
    }

    // Function to save data to localStorage
    function saveData() {
        if (currentUser && currentUser.email) {
            localStorage.setItem(`priest_app_data_${currentUser.email}`, JSON.stringify(priest_app_data));
        }
        localStorage.setItem('priest_app_users', JSON.stringify(priest_app_users));
    }

    // Function to clear all validation error messages
    function clearValidationErrors() {
        document.querySelectorAll('.validation-error').forEach(el => {
            el.textContent = '';
            el.classList.remove('active');
        });
        globalMessageDisplay.textContent = '';
        globalMessageDisplay.classList.remove('success', 'error');
        globalMessageDisplay.style.display = 'none';
    }

    // Function to display a general message (success/error)
    function showGlobalMessage(message, type = 'error') {
        globalMessageDisplay.textContent = message;
        globalMessageDisplay.classList.remove('success', 'error');
        globalMessageDisplay.classList.add(type);
        globalMessageDisplay.classList.add('active');
        globalMessageDisplay.style.display = 'block';
        setTimeout(() => {
            globalMessageDisplay.classList.remove('active');
            globalMessageDisplay.style.display = 'none';
        }, 5000);
    }

    // Helper function to decode JWT token (for Google Sign-In)
    function parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    // Function to toggle password visibility
    function togglePasswordVisibility(inputElement, toggleIconElement) {
        if (inputElement.type === 'password') {
            inputElement.type = 'text';
            toggleIconElement.classList.remove('fa-eye');
            toggleIconElement.classList.add('fa-eye-slash');
        } else {
            inputElement.type = 'password';
            toggleIconElement.classList.remove('fa-eye-slash');
            toggleIconElement.classList.add('fa-eye');
        }
    }

    // --- Authentication Logic ---

    function showLogin() {
        loginPage.classList.add('active');
        container.style.display = 'none';
        document.getElementById('login-form').classList.add('active');
        document.getElementById('register-form').classList.remove('active');
        loginToggleBtn.classList.add('active');
        registerToggleBtn.classList.remove('active');
        clearValidationErrors(); // Clear errors on page switch
    }

    function showMainApp() {
        loginPage.classList.remove('active');
        container.style.display = 'flex';
        clearValidationErrors(); // Clear errors on successful login
        updateUserInfo();
        showSection('dashboard'); // Show dashboard by default
    }

    // Toggle between Login and Register forms
    loginToggleBtn.addEventListener('click', () => {
        document.getElementById('login-form').classList.add('active');
        document.getElementById('register-form').classList.remove('active');
        loginToggleBtn.classList.add('active');
        registerToggleBtn.classList.remove('active');
        clearValidationErrors();
    });

    registerToggleBtn.addEventListener('click', () => {
        document.getElementById('register-form').classList.add('active');
        document.getElementById('login-form').classList.remove('active');
        registerToggleBtn.classList.add('active');
        loginToggleBtn.classList.remove('active');
        clearValidationErrors();
    });

    // Event Listeners for Password Toggles
    toggleLoginPassword.addEventListener('click', () => {
        togglePasswordVisibility(loginPasswordInput, toggleLoginPassword.querySelector('i'));
    });

    toggleRegisterPassword.addEventListener('click', () => {
        togglePasswordVisibility(registerPasswordInput, toggleRegisterPassword.querySelector('i'));
    });


    // Handle Login Form Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearValidationErrors();

        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();
        let isValid = true;

        if (!email) {
            loginEmailError.textContent = 'البريد الإلكتروني مطلوب.';
            loginEmailError.classList.add('active');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            loginEmailError.textContent = 'صيغة البريد الإلكتروني غير صحيحة.';
            loginEmailError.classList.add('active');
            isValid = false;
        }

        if (!password) {
            loginPasswordError.textContent = 'كلمة المرور مطلوبة.';
            loginPasswordError.classList.add('active');
            isValid = false;
        }

        if (!isValid) {
            showGlobalMessage('الرجاء إدخال بيانات صحيحة لتسجيل الدخول.', 'error');
            return;
        }

        if (priest_app_users[email] && priest_app_users[email].password === password) {
            localStorage.setItem('priest_app_current_user_email', email);
            currentUser = priest_app_users[email];
            priest_app_data = JSON.parse(localStorage.getItem(`priest_app_data_${currentUser.email}`) || '{}');
            showMainApp();
            showGlobalMessage('تم تسجيل الدخول بنجاح!', 'success');
        } else {
            showGlobalMessage('البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'error');
        }
    });

    // Handle Register Form Submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearValidationErrors();

        const name = registerNameInput.value.trim();
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value.trim();
        const dob = registerDobInput.value;
        const age = registerAgeInput.value;
        let isValid = true;

        if (!name) {
            registerNameError.textContent = 'الاسم الكامل مطلوب.';
            registerNameError.classList.add('active');
            isValid = false;
        }
        if (!email) {
            registerEmailError.textContent = 'البريد الإلكتروني مطلوب.';
            registerEmailError.classList.add('active');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            registerEmailError.textContent = 'صيغة البريد الإلكتروني غير صحيحة.';
            registerEmailError.classList.add('active');
            isValid = false;
        }
        if (!password) {
            registerPasswordError.textContent = 'كلمة المرور مطلوبة.';
            registerPasswordError.classList.add('active');
            isValid = false;
        } else if (password.length < 6) {
            registerPasswordError.textContent = 'كلمة المرور يجب أن لا تقل عن 6 أحرف.';
            registerPasswordError.classList.add('active');
            isValid = false;
        }
        if (!dob) {
            registerDobError.textContent = 'تاريخ الميلاد مطلوب.';
            registerDobError.classList.add('active');
            isValid = false;
        }
        if (!age || age <= 0) {
            registerAgeError.textContent = 'السن مطلوب ويجب أن يكون رقماً موجباً.';
            registerAgeError.classList.add('active');
            isValid = false;
        }

        if (!isValid) {
            showGlobalMessage('الرجاء مراجعة الأخطاء في النموذج.', 'error');
            return;
        }

        if (priest_app_users[email]) {
            showGlobalMessage('البريد الإلكتروني هذا مسجل بالفعل. الرجاء تسجيل الدخول.', 'error');
            return;
        }

        priest_app_users[email] = {
            name: name,
            password: password,
            dob: dob,
            age: age,
            email: email // Store email for direct access in currentUser
        };
        saveData(); // Save updated users list
        localStorage.setItem('priest_app_current_user_email', email);
        currentUser = priest_app_users[email];
        priest_app_data = {}; // Initialize data for new user

        console.log('New user registered:', currentUser);
        showMainApp();
        showGlobalMessage('تم إنشاء الحساب بنجاح! مرحباً بك.', 'success');

        // Clear form fields
        registerNameInput.value = '';
        registerEmailInput.value = '';
        registerPasswordInput.value = '';
        registerDobInput.value = '';
        registerAgeInput.value = '';
    });

    // Logout Functionality
    // Select both desktop and sidebar logout buttons using their shared ID
    document.querySelectorAll('#logout-btn').forEach(button => {
        button.addEventListener('click', () => {
            localStorage.removeItem('priest_app_current_user_email');
            currentUser = null;
            priest_app_data = {}; // Clear current user data
            console.log('User logged out.');
            showLogin();
            showGlobalMessage('تم تسجيل الخروج بنجاح.', 'success');
        });
    });


    // --- Social Login Callbacks ---

    // Google Login Callback
    window.handleGoogleLoginResponse = function(response) {
        clearValidationErrors();
        console.log("Google login response:", response);
        const idToken = response.credential;
        const decodedToken = parseJwt(idToken);
        console.log("Decoded Google Token:", decodedToken);

        const googleUserEmail = decodedToken.email;
        const googleUserName = decodedToken.name;
        const googleUserId = decodedToken.sub; // Google User ID

        // Simulate user storage
        if (priest_app_users[googleUserEmail]) {
            // User exists, log them in
            localStorage.setItem('priest_app_current_user_email', googleUserEmail);
            currentUser = priest_app_users[googleUserEmail];
            priest_app_data = JSON.parse(localStorage.getItem(`priest_app_data_${currentUser.email}`) || '{}');
            console.log('User logged in with Google (existing profile):', currentUser);
            showMainApp();
            showGlobalMessage('تم تسجيل الدخول بحساب Google بنجاح!', 'success');
        } else {
            // New Google user, register them
            const defaultAge = 30; // Default age for new Google users for demo
            const defaultDob = "1995-01-01"; // Default DOB for new Google users for demo

            currentUser = {
                type: 'google',
                id: googleUserId,
                email: googleUserEmail,
                name: googleUserName,
                dob: defaultDob,
                age: defaultAge
            };
            // Store new Google user in our simulated database
            priest_app_users[googleUserEmail] = {
                type: 'google',
                id: googleUserId,
                name: currentUser.name,
                password: null, // No password for Google users
                dob: currentUser.dob,
                age: currentUser.age,
                email: googleUserEmail
            };
            saveData();
            localStorage.setItem('priest_app_current_user_email', googleUserEmail);
            priest_app_data = {}; // Initialize data for new user
            console.log('New Google user registered and logged in:', currentUser);
            showMainApp();
            showGlobalMessage('تم إنشاء الحساب بحساب Google بنجاح!', 'success');
        }
    };


    // --- Main App Logic ---

    // Update User Info on Dashboard
    function updateUserInfo() {
        if (currentUser) {
            userNameDisplay.textContent = currentUser.name;
            userEmailDisplay.textContent = currentUser.email;
            userDobDisplay.textContent = currentUser.dob || 'غير متاح';
            userAgeDisplay.textContent = currentUser.age || 'غير متاح';
        }
    }

    // Sidebar Toggle for Mobile
    hamburgerMenu.addEventListener('click', () => {
        container.classList.toggle('sidebar-open');
    });

    // Close sidebar when clicking outside on mobile
    container.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && container.classList.contains('sidebar-open') && !sidebar.contains(e.target) && !hamburgerMenu.contains(e.target)) {
            container.classList.remove('sidebar-open');
        }
    });

    // Show specific content section
    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        // Update active link in sidebar
        navLinks.forEach(link => {
            link.parentElement.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.parentElement.classList.add('active');
                currentSectionTitle.textContent = link.textContent.trim(); // Update header title
            }
        });

        // Close sidebar on mobile after clicking a link
        if (window.innerWidth <= 768) {
            container.classList.remove('sidebar-open');
        }

        // Render data specific to the section
        if (sectionId === 'tasks') {
            renderTasks();
        } else if (sectionId === 'confessions') {
            renderConfessions();
        } else if (sectionId === 'sermons') {
            renderSermons();
        } else if (sectionId === 'spiritual-life') {
            renderSpiritualEntries();
        }
        // Chat messages don't need re-rendering, just ensure scroll
        if (sectionId === 'chat') {
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
    }

    // Add event listeners for sidebar navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('a').dataset.section;
            if (section) {
                showSection(section);
            }
        });
    });

    // --- Tasks Management ---

    // Render Tasks
    function renderTasks() {
        if (!priest_app_data.tasks) {
            priest_app_data.tasks = [];
        }
        tasksList.innerHTML = '';
        if (priest_app_data.tasks.length === 0) {
            tasksList.innerHTML = '<p>لا توجد مهام حالياً. أضف مهمة جديدة!</p>';
            return;
        }
        priest_app_data.tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskItem.dataset.taskId = task.id; // Store task ID for easy access
            taskItem.innerHTML = `
                <div class="task-item-info">
                    <h4>${task.text}</h4>
                    <p>${new Date(task.dateAdded).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div class="task-actions">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} class="complete-checkbox">
                    <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            tasksList.appendChild(taskItem);
        });
    }

    // Add Task
    addTaskBtn.addEventListener('click', () => {
        addTaskForm.style.display = 'block';
    });

    cancelAddTaskBtn.addEventListener('click', () => {
        addTaskForm.style.display = 'none';
        taskInput.value = ''; // Clear input on cancel
    });

    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (!text) {
            showGlobalMessage('لا يمكن إضافة مهمة فارغة.', 'error');
            return;
        }

        const newTask = {
            id: Date.now().toString(), // Unique ID
            text: text,
            completed: false,
            dateAdded: new Date().toISOString()
        };
        if (!priest_app_data.tasks) {
            priest_app_data.tasks = [];
        }
        priest_app_data.tasks.push(newTask);
        saveData();
        renderTasks();
        showGlobalMessage('تمت إضافة المهمة بنجاح.', 'success');
        taskInput.value = ''; // Clear input
        addTaskForm.style.display = 'none'; // Hide form
    });

    // Toggle Task Completion / Delete Task (Event Delegation)
    tasksList.addEventListener('click', (e) => {
        const taskId = e.target.closest('.task-item')?.dataset.taskId;
        if (!taskId) return;

        if (e.target.classList.contains('complete-checkbox')) {
            toggleTaskCompletion(taskId);
            showGlobalMessage('تم تحديث حالة المهمة.', 'success');
        } else if (e.target.closest('.delete-btn')) {
            if (confirm('هل أنت متأكد أنك تريد حذف هذه المهمة؟')) {
                deleteTask(taskId);
                showGlobalMessage('تم حذف المهمة بنجاح.', 'success');
            }
        }
    });

    function toggleTaskCompletion(taskId) {
        const taskIndex = priest_app_data.tasks.findIndex(task => task.id === taskId);
        if (taskIndex > -1) {
            priest_app_data.tasks[taskIndex].completed = !priest_app_data.tasks[taskIndex].completed;
            saveData();
            renderTasks();
        }
    }

    function deleteTask(taskId) {
        priest_app_data.tasks = priest_app_data.tasks.filter(task => task.id !== taskId);
        saveData();
        renderTasks();
    }

    // --- Confessions Management ---

    function renderConfessions() {
        if (!priest_app_data.confessions) {
            priest_app_data.confessions = [];
        }
        confessionsList.innerHTML = '';
        if (priest_app_data.confessions.length === 0) {
            confessionsList.innerHTML = '<p>لا توجد اعترافات مسجلة حالياً. أضف اعترافاً جديداً.</p>';
            return;
        }
        priest_app_data.confessions.forEach(confession => {
            const confessionItem = document.createElement('div');
            confessionItem.classList.add('task-item'); // Reusing task-item style
            if (confession.completed) {
                confessionItem.classList.add('completed');
            }
            confessionItem.dataset.confessionId = confession.id; // Store ID
            confessionItem.innerHTML = `
                <div class="task-item-info">
                    <h4>${confession.text}</h4>
                    <p>${new Date(confession.dateAdded).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div class="task-actions">
                    <button class="action-btn complete-btn"><i class="fas fa-check"></i></button>
                    <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            confessionsList.appendChild(confessionItem);
        });
    }

    addConfessionBtn.addEventListener('click', () => {
        addConfessionForm.style.display = 'block';
    });

    cancelAddConfessionBtn.addEventListener('click', () => {
        addConfessionForm.style.display = 'none';
        confessionTextInput.value = '';
    });

    addConfessionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = confessionTextInput.value.trim();
        if (!text) {
            showGlobalMessage('لا يمكن إضافة اعتراف فارغ.', 'error');
            return;
        }
        const newConfession = {
            id: Date.now().toString(),
            text: text,
            completed: false, // New property for completion
            dateAdded: new Date().toISOString()
        };
        if (!priest_app_data.confessions) {
            priest_app_data.confessions = [];
        }
        priest_app_data.confessions.push(newConfession);
        saveData();
        renderConfessions();
        showGlobalMessage('تمت إضافة الاعتراف بنجاح.', 'success');
        confessionTextInput.value = '';
        addConfessionForm.style.display = 'none';
    });

    confessionsList.addEventListener('click', (e) => {
        const confessionId = e.target.closest('.task-item')?.dataset.confessionId;
        if (!confessionId) return;

        if (e.target.closest('.complete-btn')) {
            toggleConfessionCompletion(confessionId);
            showGlobalMessage('تم تحديث حالة الاعتراف.', 'success');
        } else if (e.target.closest('.delete-btn')) {
            if (confirm('هل أنت متأكد أنك تريد حذف هذا الاعتراف؟')) {
                deleteConfession(confessionId);
                showGlobalMessage('تم حذف الاعتراف بنجاح.', 'success');
            }
        }
    });

    function toggleConfessionCompletion(confessionId) {
        const confessionIndex = priest_app_data.confessions.findIndex(c => c.id === confessionId);
        if (confessionIndex > -1) {
            priest_app_data.confessions[confessionIndex].completed = !priest_app_data.confessions[confessionIndex].completed;
            saveData();
            renderConfessions();
        }
    }

    function deleteConfession(confessionId) {
        priest_app_data.confessions = priest_app_data.confessions.filter(c => c.id !== confessionId);
        saveData();
        renderConfessions();
    }

    // --- Sermons Management ---
    function renderSermons() {
        if (!priest_app_data.sermons) {
            priest_app_data.sermons = [];
        }
        sermonsList.innerHTML = '';
        if (priest_app_data.sermons.length === 0) {
            sermonsList.innerHTML = '<p>لا توجد عظات مسجلة حالياً. أضف عظة جديدة.</p>';
            return;
        }
        priest_app_data.sermons.forEach(sermon => {
            const sermonItem = document.createElement('div');
            sermonItem.classList.add('task-item'); // Reusing task-item style
            if (sermon.completed) {
                sermonItem.classList.add('completed');
            }
            sermonItem.dataset.sermonId = sermon.id; // Store ID
            sermonItem.innerHTML = `
                <div class="task-item-info">
                    <h4>${sermon.title}</h4>
                    <p>التاريخ: ${new Date(sermon.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>${sermon.text.substring(0, 100)}...</p>
                </div>
                <div class="task-actions">
                    <button class="action-btn complete-btn"><i class="fas fa-check"></i></button>
                    <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            sermonsList.appendChild(sermonItem);
        });
    }

    addSermonBtn.addEventListener('click', () => {
        addSermonForm.style.display = 'block';
    });

    cancelAddSermonBtn.addEventListener('click', () => {
        addSermonForm.style.display = 'none';
        sermonTitleInput.value = '';
        sermonDateInput.value = '';
        sermonTextarea.value = '';
    });

    addSermonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = sermonTitleInput.value.trim();
        const date = sermonDateInput.value;
        const text = sermonTextarea.value.trim();

        if (!title || !date || !text) {
            showGlobalMessage('جميع حقول العظة مطلوبة.', 'error');
            return;
        }

        const newSermon = {
            id: Date.now().toString(),
            title: title,
            date: date,
            text: text,
            completed: false // New property for completion
        };
        if (!priest_app_data.sermons) {
            priest_app_data.sermons = [];
        }
        priest_app_data.sermons.push(newSermon);
        saveData();
        renderSermons();
        showGlobalMessage('تمت إضافة العظة بنجاح.', 'success');
        sermonTitleInput.value = '';
        sermonDateInput.value = '';
        sermonTextarea.value = '';
        addSermonForm.style.display = 'none';
    });

    sermonsList.addEventListener('click', (e) => {
        const sermonId = e.target.closest('.task-item')?.dataset.sermonId;
        if (!sermonId) return;

        if (e.target.closest('.complete-btn')) {
            toggleSermonCompletion(sermonId);
            showGlobalMessage('تم تحديث حالة العظة.', 'success');
        } else if (e.target.closest('.delete-btn')) {
            if (confirm('هل أنت متأكد أنك تريد حذف هذه العظة؟')) {
                deleteSermon(sermonId);
                showGlobalMessage('تم حذف العظة بنجاح.', 'success');
            }
        }
    });

    function toggleSermonCompletion(sermonId) {
        const sermonIndex = priest_app_data.sermons.findIndex(s => s.id === sermonId);
        if (sermonIndex > -1) {
            priest_app_data.sermons[sermonIndex].completed = !priest_app_data.sermons[sermonIndex].completed;
            saveData();
            renderSermons();
        }
    }

    function deleteSermon(sermonId) {
        priest_app_data.sermons = priest_app_data.sermons.filter(s => s.id !== sermonId);
        saveData();
        renderSermons();
    }

    // --- Spiritual Life Management ---
    function renderSpiritualEntries() {
        if (!priest_app_data.spiritualEntries) {
            priest_app_data.spiritualEntries = [];
        }
        spiritualEntriesList.innerHTML = '';
        if (priest_app_data.spiritualEntries.length === 0) {
            spiritualEntriesList.innerHTML = '<p>لا توجد إدخالات للحياة الروحية حالياً. أضف إدخالاً جديداً.</p>';
            return;
        }
        priest_app_data.spiritualEntries.forEach(entry => {
            const entryItem = document.createElement('div');
            entryItem.classList.add('task-item'); // Reusing task-item style
            if (entry.completed) {
                entryItem.classList.add('completed');
            }
            entryItem.dataset.entryId = entry.id; // Store ID
            entryItem.innerHTML = `
                <div class="task-item-info">
                    <h4>${entry.title}</h4>
                    <p>التاريخ: ${new Date(entry.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>${entry.text.substring(0, 100)}...</p>
                </div>
                <div class="task-actions">
                    <button class="action-btn complete-btn"><i class="fas fa-check"></i></button>
                    <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            spiritualEntriesList.appendChild(entryItem);
        });
    }

    addSpiritualEntryBtn.addEventListener('click', () => {
        addSpiritualEntryForm.style.display = 'block';
    });

    cancelAddSpiritualEntryBtn.addEventListener('click', () => {
        addSpiritualEntryForm.style.display = 'none';
        spiritualEntryTitleInput.value = '';
        spiritualEntryDateInput.value = '';
        spiritualEntryTextarea.value = '';
    });

    addSpiritualEntryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = spiritualEntryTitleInput.value.trim();
        const date = spiritualEntryDateInput.value;
        const text = spiritualEntryTextarea.value.trim();

        if (!title || !date || !text) {
            showGlobalMessage('جميع حقول الإدخال مطلوبة.', 'error');
            return;
        }

        const newEntry = {
            id: Date.now().toString(),
            title: title,
            date: date,
            text: text,
            completed: false // New property for completion
        };
        if (!priest_app_data.spiritualEntries) {
            priest_app_data.spiritualEntries = [];
        }
        priest_app_data.spiritualEntries.push(newEntry);
        saveData();
        renderSpiritualEntries();
        showGlobalMessage('تمت إضافة الإدخال بنجاح.', 'success');
        spiritualEntryTitleInput.value = '';
        spiritualEntryDateInput.value = '';
        spiritualEntryTextarea.value = '';
        addSpiritualEntryForm.style.display = 'none';
    });

    spiritualEntriesList.addEventListener('click', (e) => {
        const entryId = e.target.closest('.task-item')?.dataset.entryId;
        if (!entryId) return;

        if (e.target.closest('.complete-btn')) {
            toggleSpiritualEntryCompletion(entryId);
            showGlobalMessage('تم تحديث حالة الإدخال.', 'success');
        } else if (e.target.closest('.delete-btn')) {
            if (confirm('هل أنت متأكد أنك تريد حذف هذا الإدخال؟')) {
                deleteSpiritualEntry(entryId);
                showGlobalMessage('تم حذف الإدخال بنجاح.', 'success');
            }
        }
    });

    function toggleSpiritualEntryCompletion(entryId) {
        const entryIndex = priest_app_data.spiritualEntries.findIndex(e => e.id === entryId);
        if (entryIndex > -1) {
            priest_app_data.spiritualEntries[entryIndex].completed = !priest_app_data.spiritualEntries[entryIndex].completed;
            saveData();
            renderSpiritualEntries();
        }
    }

    function deleteSpiritualEntry(entryId) {
        priest_app_data.spiritualEntries = priest_app_data.spiritualEntries.filter(e => e.id !== entryId);
        saveData();
        renderSpiritualEntries();
    }

    // --- AI Chat Logic ---

    // Function to append messages to chat
    function appendMessage(message, isUser = true) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        const senderName = isUser ? currentUser.name : 'شهاب'; // AI name is شهاب
        const senderClass = isUser ? 'user-message' : 'ai-message';
        messageElement.classList.add(senderClass);
        messageElement.innerHTML = `<strong>${senderName}:</strong> ${message}`;
        chatMessagesContainer.appendChild(messageElement);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
    }

    // Simulate AI response (شهاب) - INSTANTANEOUS RESPONSE
    function getAiResponse(userMessage) {
        userMessage = userMessage.toLowerCase(); // For easier matching
        let aiResponse = "آسف، أنا شهاب، مساعدك في هذا التطبيق. معرفتي محدودة بالمعلومات المخزنة لدي. هل يمكنني مساعدتك بشيء يتعلق بالمهام أو الاعترافات أو العظات أو الحياة الروحية؟";

        if (userMessage.includes("مرحبا") || userMessage.includes("سلام")) {
            aiResponse = "مرحباً بك! أنا شهاب، مساعدك الذكي في تطبيق 'الراعي والخراف'. كيف يمكنني مساعدتك اليوم؟";
        } else if (userMessage.includes("كيف حالك")) {
            aiResponse = "أنا بخير بفضل مساعدتك. شكراً على سؤالك، آمل أن تكون بخير أنت أيضاً!";
        } else if (userMessage.includes("من انت") || userMessage.includes("ما اسمك")) {
            aiResponse = "أنا شهاب، مساعدك الشخصي في هذا التطبيق. تم تدريبي للمساعدة في تنظيم المهام والاعترافات والعظات وإدخالات الحياة الروحية. ليس لدي وعي أو مشاعر، أنا مجرد برنامج.";
        } else if (userMessage.includes("مهام")) {
            aiResponse = "لإدارة المهام، انتقل إلى قسم 'المهام' في الشريط الجانبي. يمكنك إضافة مهام جديدة وتحديد ما تم إنجازه لمساعدتك على البقاء منظمًا.";
        } else if (userMessage.includes("اعترافات")) {
            aiResponse = "يمكنك تسجيل اعترافاتك في قسم 'الاعترافات'. هذا يساعدك على تذكرها ومتابعتها بانتظام. هل تحتاج مساعدة في كيفية الإضافة؟";
        } else if (userMessage.includes("عظات")) {
            aiResponse = "في قسم 'العظات'، يمكنك إضافة نصوص عظات وتاريخها للرجوع إليها لاحقًا أو لمراجعتها. هذا مفيد للحفاظ على سجل لمواعظك الروحية.";
        } else if (userMessage.includes("الحياة الروحية") || userMessage.includes("روحي") || userMessage.includes("نمو روحي")) {
            aiResponse = "قسم 'الحياة الروحية' مصمم لمساعدتك على تتبع نموك الروحي وإنجازاتك الشخصية في رحلتك الروحية. يمكنك تسجيل تأملاتك أو تجاربك الهامة هنا.";
        } else if (userMessage.includes("شكرا") || userMessage.includes("شكر")) {
            aiResponse = "على الرحب والسعة! أنا سعيد بتقديم المساعدة. لا تتردد في طرح المزيد من الأسئلة.";
        } else if (userMessage.includes("معلومات") || userMessage.includes("معرفة") || userMessage.includes("مصدر") || userMessage.includes("بحث")) {
            aiResponse = "أنا شهاب، ونطاق معرفتي يقتصر على البيانات التي تمت برمجتها وتدريبي عليها داخل هذا التطبيق. ليس لدي وصول مباشر للإنترنت للبحث عن معلومات عالمية أو تحديد مصادر. لأسئلة المعرفة العامة أو البحث عن مصادر خارجية، ستحتاج إلى استخدام محرك بحث أو أداة ذكاء اصطناعي متصلة بالويب.";
        } else if (userMessage.includes("مساعدة")) {
            aiResponse = "أستطيع مساعدتك في إدارة بياناتك الشخصية داخل التطبيق (المهام، الاعترافات، العظات، الحياة الروحية). فقط أخبرني بما تحتاج، أو اختر قسماً من الشريط الجانبي.";
        } else if (userMessage.includes("تاريخ اليوم") || userMessage.includes("ما هو التاريخ")) {
            aiResponse = "اليوم هو " + new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ".";
        } else if (userMessage.includes("وقت الان") || userMessage.includes("كم الساعة")) {
            aiResponse = "الوقت الحالي هو " + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ".";
        } else if (userMessage.includes("قواعد")) {
            aiResponse = "أنا أعمل وفقًا للقواعد المبرمجة مسبقًا. مهمتي هي تسهيل استخدامك للتطبيق وليس اتخاذ قرارات بدلاً منك.";
        } else if (userMessage.includes("ميزات") || userMessage.includes("ماذا تفعل")) {
            aiResponse = "أنا أساعدك في تتبع المهام، تسجيل الاعترافات، حفظ العظات، وتوثيق رحلتك الروحية. كما يمكنك الدردشة معي للحصول على توجيهات حول استخدام التطبيق.";
        }

        // Removed setTimeout here to make the response immediate
        appendMessage(aiResponse, false);
    }

    // Handle chat message sending
    chatSendBtn.addEventListener('click', () => {
        sendMessage();
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText) {
            appendMessage(messageText, true);
            getAiResponse(messageText); // AI responds immediately
            chatInput.value = ''; // Clear input field
        }
    }


    // --- Initial Load ---
    loadData(); // Load user data and decide which page to show

});