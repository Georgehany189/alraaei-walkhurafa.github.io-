document.addEventListener('DOMContentLoaded', () => {
    // --- Login Page Elements ---
    const loginPage = document.querySelector('.login-page');
    const loginError = document.getElementById('login-error');

    // Authentication Forms & Toggles
    const showLoginFormBtn = document.getElementById('show-login-form');
    const showSignupFormBtn = document.getElementById('show-signup-form');
    const standardLoginForm = document.getElementById('standard-login-form');
    const socialSignInSection = document.getElementById('social-sign-in-section'); // Updated ID
    const signupForm = document.getElementById('signup-form');

    // Standard Login Fields
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');

    // Signup Fields
    const signupNameInput = document.getElementById('signup-name');
    const signupEmailInput = document.getElementById('signup-email');
    const signupPasswordInput = document.getElementById('signup-password');
    const signupConfirmPasswordInput = document.getElementById('signup-confirm-password');
    const signupDobInput = document.getElementById('signup-dob');
    const signupAgeInput = document.getElementById('signup-age');

    // --- Main App Elements ---
    const mainAppContainer = document.querySelector('.container');
    const sidebarLinks = document.querySelectorAll('.sidebar nav ul li');
    const contentSections = document.querySelectorAll('.content-section');
    const addButtons = document.querySelectorAll('.content-section .add-btn');
    const cancelButtons = document.querySelectorAll('.form-card .cancel-btn');
    const languageButtons = document.querySelectorAll('.language-switcher button');
    const htmlElement = document.documentElement;
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mainHeaderTitle = document.getElementById('main-header-title');

    // --- Task Specific Elements ---
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskFormCard = document.getElementById('task-form');
    const newTaskForm = document.getElementById('new-task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskDateInput = document.getElementById('task-date');
    const taskTimeInput = document.getElementById('task-time');
    const tasksListDiv = document.querySelector('.tasks-list');

    // --- AI Chat Specific Elements ---
    const chatMessagesDiv = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');

    // Global variable to store current user info
    let currentUser = null; // { type: 'google' | 'facebook' | 'standard', email: '', name: '', dob: '', age: '' }

    // Set today's date as default for DOB input for user convenience
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    signupDobInput.value = `${year}-${month}-${day}`;


    // --- Authentication Form Switching Logic ---
    function showAuthForm(formToShow) {
        // Deactivate all toggle buttons
        showLoginFormBtn.classList.remove('active');
        showSignupFormBtn.classList.remove('active');

        // Hide all auth forms
        standardLoginForm.classList.remove('active');
        socialSignInSection.classList.remove('active'); // Use the new social section ID
        signupForm.classList.remove('active');
        loginError.style.display = 'none'; // Hide error messages

        // Show the selected form and activate its button
        if (formToShow === 'login') {
            showLoginFormBtn.classList.add('active');
            standardLoginForm.classList.add('active');
            socialSignInSection.classList.add('active'); // Social buttons are part of the login flow
        } else if (formToShow === 'signup') {
            showSignupFormBtn.classList.add('active');
            signupForm.classList.add('active');
        }
    }

    showLoginFormBtn.addEventListener('click', () => showAuthForm('login'));
    showSignupFormBtn.addEventListener('click', () => showAuthForm('signup'));

    // --- Google Sign-In Callback Function ---
    window.handleCredentialResponse = async (response) => {
        console.log("Encoded JWT ID token: " + response.credential);

        // For this frontend-only example, we'll decode it locally for demonstration.
        // In production, NEVER parse the ID token on the client side for security.
        const decodedToken = parseJwt(response.credential);
        console.log('Decoded Google ID Token:', decodedToken);

        // Check if user already exists (simulated with localStorage)
        const storedUsers = JSON.parse(localStorage.getItem('priest_app_users') || '{}');
        const userEmail = decodedToken.email;

        if (storedUsers[userEmail]) {
            // User exists, log them in
            currentUser = {
                type: 'google',
                id: decodedToken.sub, // Google user ID
                email: userEmail,
                name: storedUsers[userEmail].name || decodedToken.name,
                dob: storedUsers[userEmail].dob,
                age: storedUsers[userEmail].age
            };
            console.log('User logged in with Google (existing profile):', currentUser);
            showMainApp();
        } else {
            // New Google user, save basic info and show app (or prompt for more)
            const defaultAge = 30; // Default age for new Google users for demo
            const defaultDob = "1995-01-01"; // Default DOB for new Google users for demo

            currentUser = {
                type: 'google',
                id: decodedToken.sub,
                email: userEmail,
                name: decodedToken.name || userEmail,
                dob: defaultDob, // Google doesn't provide DOB, so use a default or prompt user
                age: defaultAge // Google doesn't provide age, so use a default or prompt user
            };
            // Store new Google user in our simulated database
            storedUsers[userEmail] = {
                type: 'google',
                id: decodedToken.sub,
                name: currentUser.name,
                password: null, // No password for Google users
                dob: currentUser.dob,
                age: currentUser.age
            };
            localStorage.setItem('priest_app_users', JSON.stringify(storedUsers));
            localStorage.setItem('priest_app_current_user_email', userEmail);
            console.log('New Google user registered and logged in:', currentUser);
            showMainApp();
        }
    };

    // Helper to parse JWT (for demo purposes only, not for production security)
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Error parsing JWT:", e);
            return {};
        }
    }

    // --- Facebook Login Initialization and Logic ---

    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
        FB.init({
            appId      : 'YOUR_FACEBOOK_APP_ID', // <<<<<<<<<<<< REPLACE WITH YOUR FACEBOOK APP ID
            cookie     : true,                     // Enable cookies to allow the server to access the session
            xfbml      : true,                     // Parse social plugins on this page
            version    : 'v18.0'                   // Use graph API version 18.0 or newer
        });

        // Optional: Check login status on page load (if you want persistent login)
        // FB.getLoginStatus(function(response) {
        //     statusChangeCallback(response);
        // });
    };

    // This function is called when a Facebook login event occurs
    function statusChangeCallback(response) {
        console.log('Facebook Login Status Change Callback:', response);
        if (response.status === 'connected') {
            // User logged in and authenticated your app
            // Get user's profile information
            FB.api('/me?fields=id,name,email', function(userResponse) {
                console.log('Facebook User Data:', userResponse);
                handleFacebookLoginResponse(userResponse);
            });
        } else if (response.status === 'not_authorized') {
            // The user is logged into Facebook, but has not yet authenticated your app
            loginError.textContent = translations[htmlElement.lang].facebookNotAuthorized;
            loginError.style.display = 'block';
        } else {
            // The user is not logged into Facebook, or not logged into Facebook and not authenticated your app
            loginError.textContent = translations[htmlElement.lang].facebookNotLoggedIn;
            loginError.style.display = 'block';
        }
    }

    // Function to handle the Facebook login button click
    window.checkFacebookLoginStatus = function() {
        FB.login(function(response) {
            statusChangeCallback(response);
        }, {scope: 'public_profile,email'}); // Request public profile and email
    };


    // Process Facebook user data
    function handleFacebookLoginResponse(fbUser) {
        const userEmail = fbUser.email || (fbUser.id + "@facebook.com"); // Use ID if email not available
        const userName = fbUser.name || "Facebook User";
        const fbUserId = fbUser.id;

        const storedUsers = JSON.parse(localStorage.getItem('priest_app_users') || '{}');

        if (storedUsers[userEmail]) {
            // User exists, log them in
            currentUser = {
                type: 'facebook',
                id: fbUserId,
                email: userEmail,
                name: storedUsers[userEmail].name || userName,
                dob: storedUsers[userEmail].dob,
                age: storedUsers[userEmail].age
            };
            console.log('User logged in with Facebook (existing profile):', currentUser);
            showMainApp();
        } else {
            // New Facebook user, save basic info and show app
            const defaultAge = 30; // Default age for new Facebook users for demo
            const defaultDob = "1995-01-01"; // Default DOB for new Facebook users for demo

            currentUser = {
                type: 'facebook',
                id: fbUserId,
                email: userEmail,
                name: userName,
                dob: defaultDob,
                age: defaultAge
            };
            // Store new Facebook user in our simulated database
            storedUsers[userEmail] = {
                type: 'facebook',
                id: fbUserId,
                name: currentUser.name,
                password: null, // No password for Facebook users
                dob: currentUser.dob,
                age: currentUser.age
            };
            localStorage.setItem('priest_app_users', JSON.stringify(storedUsers));
            localStorage.setItem('priest_app_current_user_email', userEmail);
            console.log('New Facebook user registered and logged in:', currentUser);
            showMainApp();
        }
    }


    // --- Handle Standard Login Form Submission ---
    standardLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value;

        const storedUsers = JSON.parse(localStorage.getItem('priest_app_users') || '{}');
        const user = storedUsers[email];

        if (user && user.type === 'standard' && user.password === password) { // Simple password check (NOT SECURE FOR PRODUCTION)
            currentUser = {
                type: 'standard',
                email: email,
                name: user.name,
                dob: user.dob,
                age: user.age
            };
            localStorage.setItem('priest_app_current_user_email', email);
            console.log('Standard user logged in:', currentUser);
            showMainApp();
        } else {
            loginError.textContent = translations[htmlElement.lang].loginFailed;
            loginError.style.display = 'block';
        }
    });

    // --- Handle New Account Creation (Signup) Form Submission ---
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = signupNameInput.value.trim();
        const email = signupEmailInput.value.trim();
        const password = signupPasswordInput.value;
        const confirmPassword = signupConfirmPasswordInput.value;
        const dob = signupDobInput.value;
        const age = signupAgeInput.value;

        if (!name || !email || !password || !confirmPassword || !dob || !age) {
            loginError.textContent = translations[htmlElement.lang].fillAllFields;
            loginError.style.display = 'block';
            return;
        }
        if (password !== confirmPassword) {
            loginError.textContent = translations[htmlElement.lang].passwordsMismatch;
            loginError.style.display = 'block';
            return;
        }
        if (parseInt(age) < 18) {
            loginError.textContent = translations[htmlElement.lang].ageRestriction;
            loginError.style.display = 'block';
            return;
        }

        let storedUsers = JSON.parse(localStorage.getItem('priest_app_users') || '{}');
        if (storedUsers[email]) {
            loginError.textContent = translations[htmlElement.lang].emailAlreadyExists;
            loginError.style.display = 'block';
            return;
        }

        // Simulate storing new user (NOT SECURE FOR PRODUCTION - plain text password)
        storedUsers[email] = {
            type: 'standard', // Mark as standard user
            name: name,
            password: password, // In production, hash this password!
            dob: dob,
            age: age
        };
        localStorage.setItem('priest_app_users', JSON.stringify(storedUsers));
        localStorage.setItem('priest_app_current_user_email', email); // Auto-login after signup

        currentUser = {
            type: 'standard',
            email: email,
            name: name,
            dob: dob,
            age: age
        };
        console.log('New standard user registered and logged in:', currentUser);
        alert(translations[htmlElement.lang].signupSuccess); // Alert success
        showMainApp();
    });

    // Function to display the main app after successful login/info completion
    function showMainApp() {
        loginPage.classList.remove('active');
        mainAppContainer.style.display = 'flex'; // Change to 'flex' to activate main layout
        loginError.style.display = 'none';
        standardLoginForm.classList.remove('active'); // Hide forms
        socialSignInSection.classList.remove('active'); // Hide social forms
        signupForm.classList.remove('active');
        showLoginFormBtn.classList.remove('active');
        showSignupFormBtn.classList.remove('active');


        // Update dashboard welcome message with user's name
        const welcomeMessage = document.querySelector('#dashboard h3');
        if (welcomeMessage && currentUser && currentUser.name) {
            welcomeMessage.textContent = `${translations[htmlElement.lang].welcome.replace('أيها الكاهن!', currentUser.name + '!')}`;
        }

        loadTasks(); // Load tasks on app start
    }


    // --- Navigation Logic ---
    sidebarLinks.forEach(linkItem => {
        linkItem.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior

            // Remove active class from all links
            sidebarLinks.forEach(item => item.classList.remove('active'));
            // Add active class to the clicked link
            linkItem.classList.add('active');

            // Hide all content sections
            contentSections.forEach(section => section.classList.remove('active'));

            // Show the corresponding content section
            const targetSectionId = linkItem.dataset.section;
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Update header title
            mainHeaderTitle.textContent = linkItem.querySelector('a').textContent;

            // Hide all forms when switching sections
            document.querySelectorAll('.form-card').forEach(form => form.style.display = 'none');

            // If the tasks section is activated, load tasks
            if (targetSectionId === 'tasks') {
                loadTasks();
            }

            // Close sidebar after clicking a link on mobile
            if (window.innerWidth <= 768) {
                mainAppContainer.classList.remove('sidebar-open');
            }
        });
    });

    // --- Add/Cancel Form Logic (General for all sections) ---
    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            const parentSection = button.closest('.content-section');
            const formCard = parentSection.querySelector('.form-card');
            if (formCard) {
                formCard.style.display = 'block';
            }
        });
    });

    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const formCard = button.closest('.form-card');
            if (formCard) {
                formCard.style.display = 'none';
                formCard.querySelector('form').reset(); // Clear form fields
            }
        });
    });

    // --- Task Management Logic ---

    // Show task creation form
    addTaskBtn.addEventListener('click', () => {
        taskFormCard.style.display = 'block';
    });

    // Handle new task submission
    newTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        const startDate = taskDateInput.value;
        const timeOfDay = taskTimeInput.value;

        if (!title) {
            alert(translations[htmlElement.lang].enterTaskTitle);
            return;
        }

        try {
            // Call the create_reminder tool
            const result = await generic_reminders.create_reminder(
                title,
                null, // description
                startDate || null, // start_date (null if empty)
                timeOfDay || null, // time_of_day (null if empty)
                (timeOfDay ? 'UNKNOWN' : null) // am_pm_or_unknown
            );
            console.log('Create Reminder Result:', result);
            alert(translations[htmlElement.lang].taskAddedSuccess);
            newTaskForm.reset();
            taskFormCard.style.display = 'none';
            loadTasks(); // Reload tasks to show the new one
        } catch (error) {
            console.error('Error creating reminder:', error);
            alert(translations[htmlElement.lang].taskAddError);
        }
    });

    // Function to load and display tasks
    async function loadTasks() {
        tasksListDiv.innerHTML = `<p>${translations[htmlElement.lang].loadingTasks}</p>`; // Loading message
        try {
            // Call show_matching_reminders to get all tasks (completed and incomplete)
            const result = await generic_reminders.show_matching_reminders(
                null, // reminder_ids
                new generic_reminders.RetrievalQuery({ include_completed: true })
            );
            console.log('Show Matching Reminders Result:', result);

            const tasks = result.reminders;
            tasksListDiv.innerHTML = ''; // Clear previous tasks

            if (tasks && tasks.length > 0) {
                tasks.forEach(task => {
                    const taskItem = document.createElement('div');
                    taskItem.classList.add('task-item');
                    if (task.completed) {
                        taskItem.classList.add('completed');
                    }
                    taskItem.dataset.taskId = task.id; // Store task ID

                    const taskInfo = document.createElement('div');
                    taskInfo.classList.add('task-item-info');
                    const titleElem = document.createElement('h4');
                    titleElem.textContent = task.title;
                    taskInfo.appendChild(titleElem);

                    if (task.schedule) {
                        const scheduleElem = document.createElement('p');
                        scheduleElem.textContent = `${translations[htmlElement.lang].scheduledFor} ${task.schedule}`; // Display schedule with translation
                        taskInfo.appendChild(scheduleElem);
                    }

                    const taskActions = document.createElement('div');
                    taskActions.classList.add('task-actions');

                    const completeCheckbox = document.createElement('input');
                    completeCheckbox.type = 'checkbox';
                    completeCheckbox.classList.add('action-btn', 'complete-btn');
                    completeCheckbox.checked = task.completed;
                    completeCheckbox.title = task.completed ? translations[htmlElement.lang].undoCompleteTask : translations[htmlElement.lang].markCompleteTask; // Translated tooltips
                    completeCheckbox.addEventListener('change', (e) => toggleTaskCompletion(task.id, e.target.checked));

                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('action-btn', 'delete-btn');
                    deleteButton.innerHTML = '<i class="fas fa-trash"></i>'; // Font Awesome trash icon
                    deleteButton.title = translations[htmlElement.lang].deleteTask; // Translated tooltip
                    deleteButton.addEventListener('click', () => deleteTask(task.id));

                    taskActions.appendChild(completeCheckbox);
                    taskActions.appendChild(deleteButton);

                    taskItem.appendChild(taskInfo);
                    taskItem.appendChild(taskActions);
                    tasksListDiv.appendChild(taskItem);
                });
            } else {
                tasksListDiv.innerHTML = `<p>${translations[htmlElement.lang].noTasks}</p>`;
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasksListDiv.innerHTML = `<p>${translations[htmlElement.lang].tasksLoadError}</p>`;
        }
    }

    // Function to toggle task completion status
    async function toggleTaskCompletion(taskId, isCompleted) {
        try {
            const result = await generic_reminders.modify_reminder(
                [taskId], // reminder_ids
                null, // retrieval_query
                isCompleted, // completed status
                null, // deleted
                false, // ask_for_confirmation
                false // is_bulk_mutation
            );
            console.log('Toggle Completion Result:', result);
            alert(isCompleted ? translations[htmlElement.lang].taskMarkedComplete : translations[htmlElement.lang].taskUnmarkedComplete);
            loadTasks(); // Reload tasks to update display
        } catch (error) {
                console.error('Error toggling task completion:', error);
            alert(translations[htmlElement.lang].taskUpdateError);
        }
    }

    // Function to delete a task
    async function deleteTask(taskId) {
        if (confirm(translations[htmlElement.lang].confirmDeleteTask)) {
            try {
                const result = await generic_reminders.modify_reminder(
                    [taskId], // reminder_ids
                    null, // retrieval_query
                    null, // completed
                    true, // deleted
                    false, // ask_for_confirmation
                    false // is_bulk_mutation
                );
                console.log('Delete Task Result:', result);
                alert(translations[htmlElement.lang].taskDeleted);
                loadTasks(); // Reload tasks to update display
            } catch (error) {
                console.error('Error deleting task:', error);
                alert(translations[htmlElement.lang].taskDeleteError);
            }
        }
    }


    // --- AI Chat Logic ---

    // Function to add a message to the chat display
    function addMessageToChat(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
        const paragraph = document.createElement('p');
        paragraph.textContent = message;
        messageDiv.appendChild(paragraph);
        chatMessagesDiv.appendChild(messageDiv);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight; // Scroll to bottom
    }

    // Simulate AI response based on user input
    function simulateAIChatResponse(userInput, lang) {
        userInput = userInput.toLowerCase();
        const t = translations[lang];

        if (userInput.includes(t.aiChatKeywords.sermon)) {
            return t.aiChatResponses.sermonHelp;
        } else if (userInput.includes(t.aiChatKeywords.confession)) {
            return t.aiChatResponses.confessionHelp;
        } else if (userInput.includes(t.aiChatKeywords.task)) {
            return t.aiChatResponses.taskHelp;
        } else if (userInput.includes(t.aiChatKeywords.spiritual)) {
            return t.aiChatResponses.spiritualHelp;
        } else if (userInput.includes(t.aiChatKeywords.greeting)) {
            return t.aiChatResponses.greetingResponse;
        } else if (userInput.includes(t.aiChatKeywords.thanks)) {
            return t.aiChatResponses.thanksResponse;
        } else {
            return t.aiChatResponses.defaultResponse;
        }
    }

    // Handle sending a chat message
    sendChatBtn.addEventListener('click', () => {
        sendMessage();
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        addMessageToChat(userMessage, 'user');
        chatInput.value = ''; // Clear input

        // Simulate AI response after a short delay
        setTimeout(() => {
            const aiResponse = simulateAIChatResponse(userMessage, htmlElement.lang);
            addMessageToChat(aiResponse, 'ai');
        }, 800); // Simulate network delay
    }


    // --- Language Switcher Logic ---
    const translations = {
        ar: {
            appTitle: "الراعي و الخراف",
            loginTitle: "تسجيل الدخول / إنشاء حساب",
            loginButton: "دخول",
            createAccountButton: "إنشاء حساب جديد", // New
            standardLoginPrompt: "الرجاء تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور.", // New
            signupPrompt: "الرجاء إدخال بياناتك لإنشاء حساب جديد.", // New
            emailLabel: "البريد الإلكتروني:", // New
            passwordLabel: "كلمة المرور:", // New
            confirmPasswordLabel: "تأكيد كلمة المرور:", // New
            nameLabel: "الاسم:", // New
            dobLabel: "تاريخ الميلاد:", // New
            ageLabel: "السن:", // New
            createAccount: "إنشاء حساب", // New
            fillAllFields: "الرجاء ملء جميع الحقول.",
            passwordsMismatch: "كلمتا المرور غير متطابقتين.", // New
            ageRestriction: "يجب أن يكون العمر 18 عامًا أو أكثر.",
            emailAlreadyExists: "البريد الإلكتروني مسجل بالفعل. الرجاء تسجيل الدخول أو استخدام بريد إلكتروني آخر.", // New
            signupSuccess: "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.", // New
            loginFailed: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", // New
            facebookNotAuthorized: "لم يتم ترخيص تطبيقك من قبل فيسبوك. الرجاء التحقق من إعدادات فيسبوك.", // New
            facebookNotLoggedIn: "أنت غير مسجل الدخول إلى فيسبوك أو لم تصرح لتطبيقنا.", // New

            dashboard: "الرئيسية",
            welcome: "مرحباً بك، أيها الكاهن!",
            overview: "هنا ستجد نظرة عامة على مهامك.",
            upcomingConfessions: "الاعترافات القادمة",
            noConfessions: "لا توجد اعترافات مجدولة.",
            upcomingSermons: "الخطب القادمة",
            sermonExample: "خطبة الأحد: العدل الإلهي",

            confessions: "إدارة الاعترافات",
            addConfession: "إضافة اعتراف جديد",
            confessionsList: "قائمة الاعترافات ستظهر هنا.",
            addConfessionForm: "إضافة اعتراف",
            date: "التاريخ:",
            summary: "ملخص (ملاحظات خاصة):",
            penance: "التوبة المقترحة:",
            save: "حفظ",
            cancel: "إلغاء",

            sermons: "إعداد الخطب",
            addSermon: "إضافة خطبة جديدة",
            sermonsList: "قائمة الخطب ستظهر هنا.",
            addSermonForm: "إضافة خطبة",
            title: "العنوان:",
            content: "المحتوى:",

            spiritualLife: "الحياة الروحية",
            addSpiritualEntry: "إضافة مدخل جديد",
            spiritualEntriesList: "سجل الحياة الروحية سيظهر هنا.",
            addSpiritualEntryForm: "إضافة مدخل روحي",
            type: "النوع:",
            prayer: "صلاة",
            journal: "تأمل/يوميات",
            reading: "قراءة روحية",

            tasks: "المهام",
            addTask: "إضافة مهمة جديدة",
            noTasks: "لا توجد مهام حالياً. أضف مهمة جديدة!",
            addTaskForm: "إضافة مهمة",
            taskTitle: "عنوان المهمة:",
            taskDueDate: "تاريخ الاستحقاق (اختياري):",
            taskDueTime: "وقت الاستحقاق (اختياري):",
            saveTask: "حفظ المهمة",
            scheduledFor: "مجدولة لـ:",
            markCompleteTask: "تحديد كمنجز",
            undoCompleteTask: "إلغاء تحديد كمنجز",
            deleteTask: "حذف المهمة",
            confirmDeleteTask: "هل أنت متأكد أنك تريد حذف هذه المهمة؟",
            taskMarkedComplete: "تم تحديد المهمة كمنجزة!",
            taskUnmarkedComplete: "تم إلغاء تحديد المهمة كمنجزة.",
            taskUpdateError: "حدث خطأ أثناء تحديث حالة المهمة. الرجاء المحاولة مرة أخرى.",
            taskDeleted: "تم حذف المهمة بنجاح!",
            taskDeleteError: "حدث خطأ أثناء حذف المهمة. الرجاء المحاولة مرة أخرى.",
            tasksLoadError: "حدث خطأ أثناء تحميل المهام. الرجاء المحاولة مرة أخرى.",
            enterTaskTitle: "الرجاء إدخال عنوان للمهمة.", // New
            taskAddedSuccess: "تمت إضافة المهمة بنجاح!", // New
            taskAddError: "حدث خطأ أثناء إضافة المهمة. الرجاء المحاولة مرة أخرى.", // New
            loadingTasks: "جاري تحميل المهام...", // New

            aiChat: "شهاب", // New
            aiChatPlaceholder: "اكتب رسالتك هنا...", // New
            aiChatWelcome: "مرحباً بك! أنا شهاب، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟", // New
            aiChatKeywords: { // New
                sermon: "خطبة",
                confession: "اعتراف",
                task: "مهمة",
                spiritual: "روحي",
                greeting: "مرحبا",
                thanks: "شكرا"
            },
            aiChatResponses: { // New
                sermonHelp: "يمكنني مساعدتك في البحث عن أفكار للخطب أو ترتيب النقاط الرئيسية. ما هو موضوع الخطبة؟",
                confessionHelp: "هل تحتاج إلى نصيحة حول كيفية التعامل مع حالة اعتراف معينة؟ تذكر السرية التامة.",
                taskHelp: "يمكنني مساعدتك في إضافة مهام جديدة أو تذكيرك بالمهام المستحقة. ما هي المهمة التي تود إضافتها؟",
                spiritualHelp: "أبحث عن آيات كتابية أو تأملات روحية يمكن أن تفيد كلاً من الكاهن والمصلين. ما هو محور اهتمامك الروحي؟",
                greetingResponse: "أهلاً بك أيها الكاهن! يسعدني أن أكون هنا لمساعدتك. كيف تسير أمورك اليوم؟",
                thanksResponse: "على الرحب والسعة! أنا هنا لمساعدتك في أي وقت تحتاج فيه الدعم.",
                defaultResponse: "أنا هنا لمساعدتك في إدارة شؤونك الكهنوتية. يرجى توضيح سؤالك لمساعدتك بشكل أفضل."

            },
            logout: "تسجيل الخروج",
            logoutMessage: "تم تسجيل الخروج بنجاح." // New
        },
        en: {
            appTitle: "The Shepherd and The Sheep",
            loginTitle: "Login / Sign Up",
            loginButton: "Login",
            createAccountButton: "Create New Account", // New
            standardLoginPrompt: "Please log in using your email and password.", // New
            signupPrompt: "Please enter your details to create a new account.", // New
            emailLabel: "Email:", // New
            passwordLabel: "Password:", // New
            confirmPasswordLabel: "Confirm Password:", // New
            nameLabel: "Name:", // New
            dobLabel: "Date of Birth:", // New
            ageLabel: "Age:", // New
            createAccount: "Create Account", // New
            fillAllFields: "Please fill in all fields.",
            passwordsMismatch: "Passwords do not match.", // New
            ageRestriction: "Age must be 18 or older.",
            emailAlreadyExists: "Email already registered. Please log in or use another email.", // New
            signupSuccess: "Account created successfully! You can now log in.", // New
            loginFailed: "Incorrect email or password.", // New
            facebookNotAuthorized: "Your app is not authorized by Facebook. Please check your Facebook settings.", // New
            facebookNotLoggedIn: "You are not logged into Facebook or have not authorized our app.", // New

            dashboard: "Dashboard",
            welcome: "Welcome, Father!",
            overview: "Here you'll find an overview of your duties.",
            upcomingConfessions: "Upcoming Confessions",
            noConfessions: "No confessions scheduled.",
            upcomingSermons: "Upcoming Sermons",
            sermonExample: "Sunday Sermon: Divine Justice",

            confessions: "Confessions Management",
            addConfession: "Add New Confession",
            confessionsList: "Confessions list will appear here.",
            addConfessionForm: "Add Confession",
            date: "Date:",
            summary: "Summary (Private Notes):",
            penance: "Suggested Penance:",
            save: "Save",
            cancel: "Cancel",

            sermons: "Sermon Preparation",
            addSermon: "Add New Sermon",
            sermonsList: "Sermons list will appear here.",
            addSermonForm: "Add Sermon",
            title: "Title:",
            content: "Content:",

            spiritualLife: "Spiritual Life",
            addSpiritualEntry: "Add New Entry",
            spiritualEntriesList: "Spiritual life entries will appear here.",
            addSpiritualEntryForm: "Add Spiritual Entry",
            type: "Type:",
            prayer: "Prayer",
            journal: "Meditation/Journal",
            reading: "Spiritual Reading",

            tasks: "Tasks",
            addTask: "Add New Task",
            noTasks: "No tasks currently. Add a new task!",
            addTaskForm: "Add Task",
            taskTitle: "Task Title:",
            taskDueDate: "Due Date (Optional):",
            taskDueTime: "Due Time (Optional):",
            saveTask: "Save Task",
            scheduledFor: "Scheduled for:",
            markCompleteTask: "Mark as Complete",
            undoCompleteTask: "Undo Completion",
            deleteTask: "Delete Task",
            confirmDeleteTask: "Are you sure you want to delete this task?",
            taskMarkedComplete: "Task marked as complete!",
            taskUnmarkedComplete: "Task unmarked as complete.",
            taskUpdateError: "Error updating task status. Please try again.",
            taskDeleted: "Task deleted successfully!",
            taskDeleteError: "Error deleting task. Please try again.",
            tasksLoadError: "Error loading tasks. Please try again.",
            enterTaskTitle: "Please enter a task title.", // New
            taskAddedSuccess: "Task added successfully!", // New
            taskAddError: "An error occurred while adding the task. Please try again.", // New
            loadingTasks: "Loading tasks...", // New

            aiChat: "AI Chat", // New
            aiChatPlaceholder: "Type your message here...", // New
            aiChatWelcome: "Hello! I am your AI assistant for priest management. How can I help you today?", // New
            aiChatKeywords: { // New
                sermon: "sermon",
                confession: "confession",
                task: "task",
                spiritual: "spiritual",
                greeting: "hello",
                thanks: "thank"
            },
            aiChatResponses: { // New
                sermonHelp: "I can help you brainstorm sermon ideas or organize key points. What topic are you thinking about?",
                confessionHelp: "Do you need advice on handling a specific confession case? Remember strict confidentiality.",
                taskHelp: "I can help you add new tasks or remind you of upcoming deadlines. What task would you like to add?",
                spiritualHelp: "I can find scripture verses or spiritual reflections that might benefit both you and your parishioners. What's your spiritual focus?",
                greetingResponse: "Hello, Father! I'm glad to be here to assist you. How are things going today?",
                thanksResponse: "You're most welcome! I'm here to help whenever you need support.",
                defaultResponse: "I'm here to assist you with your priestly duties. Please clarify your question for better assistance."
            },
            logout: "Logout",
            logoutMessage: "Logged out successfully." // New
        }
    };

    function setLanguage(lang) {
        htmlElement.lang = lang;
        htmlElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

        // Update login page texts
        document.querySelector('.login-card h2').textContent = translations[lang].loginTitle;
        showLoginFormBtn.textContent = translations[lang].loginButton;
        showSignupFormBtn.textContent = translations[lang].createAccountButton;
        standardLoginForm.querySelector('p').textContent = translations[lang].standardLoginPrompt;
        signupForm.querySelector('p').textContent = translations[lang].signupPrompt;

        document.querySelector('#standard-login-form label[for="login-email"]').textContent = translations[lang].emailLabel;
        document.querySelector('#standard-login-form label[for="login-password"]').textContent = translations[lang].passwordLabel;
        document.querySelector('#standard-login-form button[type="submit"]').textContent = translations[lang].loginButton;


        document.querySelector('#signup-form label[for="signup-name"]').textContent = translations[lang].nameLabel;
        document.querySelector('#signup-form label[for="signup-email"]').textContent = translations[lang].emailLabel;
        document.querySelector('#signup-form label[for="signup-password"]').textContent = translations[lang].passwordLabel;
        document.querySelector('#signup-form label[for="signup-confirm-password"]').textContent = translations[lang].confirmPasswordLabel;
        document.querySelector('#signup-form label[for="signup-dob"]').textContent = translations[lang].dobLabel;
        document.querySelector('#signup-form label[for="signup-age"]').textContent = translations[lang].ageLabel;
        document.querySelector('#signup-form button[type="submit"]').textContent = translations[lang].createAccount;

        // Dashboard content
        // Update dashboard welcome message with current user's name
        const welcomeMessage = document.querySelector('#dashboard h3');
        if (welcomeMessage) {
            if (currentUser && currentUser.name) {
                welcomeMessage.textContent = `${translations[lang].welcome.replace('أيها الكاهن!', currentUser.name + '!')}`;
            } else {
                welcomeMessage.textContent = translations[lang].welcome;
            }
        }
        document.querySelector('#dashboard p').textContent = translations[lang].overview;
        document.querySelector('.cards .card:nth-child(1) h4').textContent = translations[lang].upcomingConfessions;
        document.querySelector('.cards .card:nth-child(1) p').textContent = translations[lang].noConfessions;
        document.querySelector('.cards .card:nth-child(2) h4').textContent = translations[lang].upcomingSermons;
        document.querySelector('.cards .card:nth-child(2) p').textContent = translations[lang].sermonExample;

        // Sidebar links
        document.title = translations[lang].appTitle;
        document.querySelector('.sidebar .logo h1').textContent = translations[lang].appTitle;
        document.querySelector('[data-section="dashboard"] a').textContent = translations[lang].dashboard;
        document.querySelector('[data-section="confessions"] a').textContent = translations[lang].confessions;
        document.querySelector('[data-section="sermons"] a').textContent = translations[lang].sermons;
        document.querySelector('[data-section="spiritual-life"] a').textContent = translations[lang].spiritualLife;
        document.querySelector('[data-section="tasks"] a').textContent = translations[lang].tasks;
        document.querySelector('[data-section="ai-chat"] a').textContent = translations[lang].aiChat;
        document.getElementById('logout-btn').textContent = translations[lang].logout;

        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            mainHeaderTitle.textContent = translations[lang][activeSection.id];
        }


        // Confessions section
        document.querySelector('#confessions h3').textContent = translations[lang].confessions;
        document.querySelector('#confessions .add-btn').textContent = translations[lang].addConfession;
        document.querySelector('.confessions-list p').textContent = translations[lang].confessionsList;
        document.querySelector('#confession-form h4').textContent = translations[lang].addConfessionForm;
        document.querySelector('label[for="confession-date"]').textContent = translations[lang].date;
        document.querySelector('label[for="confession-summary"]').textContent = translations[lang].summary;
        document.querySelector('label[for="confession-penance"]').textContent = translations[lang].penance;
        document.querySelector('#confession-form button[type="submit"]').textContent = translations[lang].save;
        document.querySelector('#confession-form .cancel-btn').textContent = translations[lang].cancel;


        // Sermons section
        document.querySelector('#sermons h3').textContent = translations[lang].sermons;
        document.querySelector('#sermons .add-btn').textContent = translations[lang].addSermon;
        document.querySelector('.sermons-list p').textContent = translations[lang].sermonsList;
        document.querySelector('#sermon-form h4').textContent = translations[lang].addSermonForm;
        document.querySelector('label[for="sermon-title"]').textContent = translations[lang].title;
        document.querySelector('label[for="sermon-date"]').textContent = translations[lang].date;
        document.querySelector('label[for="sermon-content"]').textContent = translations[lang].content;
        document.querySelector('#sermon-form button[type="submit"]').textContent = translations[lang].save;
        document.querySelector('#sermon-form .cancel-btn').textContent = translations[lang].cancel;


        // Spiritual Life section
        document.querySelector('#spiritual-life h3').textContent = translations[lang].spiritualLife;
        document.querySelector('#spiritual-life .add-btn').textContent = translations[lang].addSpiritualEntry;
        document.querySelector('.spiritual-entries-list p').textContent = translations[lang].spiritualEntriesList;
        document.querySelector('#spiritual-form h4').textContent = translations[lang].addSpiritualEntryForm;
        document.querySelector('label[for="spiritual-date"]').textContent = translations[lang].date;
        document.querySelector('label[for="spiritual-type"]').textContent = translations[lang].type;
        document.querySelector('label[for="spiritual-content"]').textContent = translations[lang].content;
        document.querySelector('#spiritual-form button[type="submit"]').textContent = translations[lang].save;
        document.querySelector('#spiritual-form .cancel-btn').textContent = translations[lang].cancel;

        document.querySelector('#spiritual-type option[value="prayer"]').textContent = translations[lang].prayer;
        document.querySelector('#spiritual-type option[value="journal"]').textContent = translations[lang].journal;
        document.querySelector('#spiritual-type option[value="reading"]').textContent = translations[lang].reading;

        // Tasks section
        document.querySelector('#tasks h3').textContent = translations[lang].tasks;
        document.getElementById('add-task-btn').textContent = translations[lang].addTask;
        // The p tag inside tasks-list is dynamic, so update it if it exists
        if (tasksListDiv.querySelector('p')) { // Check if the default "no tasks" message is there
             tasksListDiv.querySelector('p').textContent = translations[lang].noTasks;
        } else if (tasksListDiv.children.length === 0) { // If no tasks and no default message, add it
            tasksListDiv.innerHTML = `<p>${translations[lang].noTasks}</p>`;
        }
        document.querySelector('#task-form h4').textContent = translations[lang].addTaskForm;
        document.querySelector('label[for="task-title"]').textContent = translations[lang].taskTitle;
        document.querySelector('label[for="task-date"]').textContent = translations[lang].taskDueDate;
        document.querySelector('label[for="task-time"]').textContent = translations[lang].taskDueTime;
        document.querySelector('#new-task-form button[type="submit"]').textContent = translations[lang].saveTask;
        document.querySelector('#new-task-form .cancel-btn').textContent = translations[lang].cancel;

        // Update scheduled for text in task items if they exist
        document.querySelectorAll('.task-item-info p').forEach(p => {
            if (p.textContent.includes(translations['ar'].scheduledFor) || p.textContent.includes(translations['en'].scheduledFor)) {
                // This logic needs to be more robust if the date format changes significantly between languages.
                // For now, it assumes "Scheduled for: DATE" format.
                const currentLang = (htmlElement.lang === 'ar') ? 'ar' : 'en';
                const oldPrefix = translations[currentLang].scheduledFor;
                const newPrefix = translations[lang].scheduledFor;
                p.textContent = p.textContent.replace(oldPrefix, newPrefix);
            }
        });

        // AI Chat section
        document.querySelector('#ai-chat h3').textContent = translations[lang].aiChat;
        chatInput.placeholder = translations[lang].aiChatPlaceholder;
        // Update welcome message if it's the only message and it's the default one
        if (chatMessagesDiv.children.length === 1 && chatMessagesDiv.querySelector('.ai-message p').textContent === translations['ar'].aiChatWelcome) {
            chatMessagesDiv.querySelector('.ai-message p').textContent = translations[lang].aiChatWelcome;
        }
    }

    languageButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            setLanguage(e.target.dataset.lang);
        });
    });

    // Set default language to Arabic on load
    setLanguage('ar');

    // --- Hamburger Menu Toggle Logic ---
    hamburgerBtn.addEventListener('click', () => {
        mainAppContainer.classList.toggle('sidebar-open');
    });

    // Close sidebar if clicking outside of it (overlay)
    mainAppContainer.addEventListener('click', (e) => {
        if (mainAppContainer.classList.contains('sidebar-open') &&
            !e.target.closest('.sidebar') &&
            !e.target.closest('.hamburger-menu')) {
            mainAppContainer.classList.remove('sidebar-open');
        }
    });

    // --- Logout button logic ---
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        // Clear stored user info
        localStorage.removeItem('priest_app_current_user_email');
        currentUser = null;

        // Sign out from Google (if applicable)
        // For GSI, clearing local storage and reloading is sufficient for frontend.

        // Sign out from Facebook (if user was logged in via Facebook)
        if (typeof FB !== 'undefined' && FB.getAccessToken()) {
            FB.logout(function(response) {
                console.log('Facebook Logout Response:', response);
            });
        }

        alert(translations[htmlElement.lang].logoutMessage);
        mainAppContainer.style.display = 'none';
        loginPage.classList.add('active');
        // Reset login page to default view
        showAuthForm('login');
        // Reload the page to ensure fresh Google/Facebook button states and clean slate
        location.reload();
    });

    // Initial check on page load: if a user is logged in (simulated via localStorage)
    const storedCurrentUserEmail = localStorage.getItem('priest_app_current_user_email');
    if (storedCurrentUserEmail) {
        const storedUsers = JSON.parse(localStorage.getItem('priest_app_users') || '{}');
        const user = storedUsers[storedCurrentUserEmail];
        if (user) {
            currentUser = {
                type: user.type, // Use the stored type
                id: user.id || null, // Store ID for social logins
                email: storedCurrentUserEmail,
                name: user.name,
                dob: user.dob,
                age: user.age
            };
            showMainApp();
        } else {
            // If current user email is stored but user data is missing, clear it
            localStorage.removeItem('priest_app_current_user_email');
            showAuthForm('login'); // Show login form
        }
    } else {
        showAuthForm('login'); // Show login form by default
    }
});
// ... (Your existing script.js code) ...

document.addEventListener('DOMContentLoaded', () => {
    // ... (Your existing variable declarations) ...

    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mainAppContainer = document.querySelector('.container'); // Make sure this variable is correctly defined

    // ... (Your existing functions and event listeners) ...

    // --- Hamburger Menu Toggle Logic ---
    hamburgerBtn.addEventListener('click', () => {
        mainAppContainer.classList.toggle('sidebar-open');
    });

    // Close sidebar if clicking outside of it (overlay)
    mainAppContainer.addEventListener('click', (e) => {
        if (mainAppContainer.classList.contains('sidebar-open') &&
            !e.target.closest('.sidebar') &&
            !e.target.closest('.hamburger-menu')) {
            mainAppContainer.classList.remove('sidebar-open');
        }
    });

    // ... (Rest of your script.js code) ...
});