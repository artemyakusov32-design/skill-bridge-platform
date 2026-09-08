// TeamMatch - Full Frontend Application (Vanilla JS ES6+)
// Хранение данных: localStorage

// ========== УТИЛИТЫ ==========
const LS_KEYS = {
    users: 'teammatch_users',
    projects: 'teammatch_projects',
    session: 'teammatch_session'
};

// Получение данных из localStorage
function getData(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Ошибка чтения localStorage', e);
        return defaultValue;
    }
}

// Сохранение данных в localStorage
function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Генерация ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Получение текущего пользователя
function getCurrentUser() {
    const session = getData(LS_KEYS.session);
    if (!session || !session.currentUserId) return null;
    const users = getData(LS_KEYS.users);
    return users.find(u => u.id === session.currentUserId) || null;
}

// Установка текущего пользователя
function setCurrentUser(userId) {
    setData(LS_KEYS.session, { currentUserId: userId });
    updateUIForCurrentUser();
}

// Получение всех пользователей
function getUsers() {
    return getData(LS_KEYS.users);
}

// Получение всех проектов
function getProjects() {
    return getData(LS_KEYS.projects);
}

// Сохранение проектов
function saveProjects(projects) {
    setData(LS_KEYS.projects, projects);
}

// Сохранение пользователей
function saveUsers(users) {
    setData(LS_KEYS.users, users);
}

// ========== ИНИЦИАЛИЗАЦИЯ ДЕМО-ДАННЫХ ==========
function initDemoData() {
    let users = getUsers();
    if (users.length === 0) {
        const artem = {
            id: 'user_artem',
            email: 'artem@example.com',
            password: '123',
            name: 'Артём Смирнов',
            faculty: '',
            course: '',
            skills: '',
            about: '',
            isProfileComplete: false
        };
        const dima = {
            id: 'user_dima',
            email: 'dima@example.com',
            password: '123',
            name: 'Дима Козлов',
            faculty: 'Факультет информационных технологий',
            course: '3 курс',
            skills: 'Flutter, Dart, Firebase, REST API',
            about: 'Мобильный разработчик, ищу интересные проекты.',
            isProfileComplete: true
        };
        const anya = {
            id: 'user_anya',
            email: 'anya@example.com',
            password: '123',
            name: 'Аня Лебедева',
            faculty: 'Факультет дизайна',
            course: '2 курс',
            skills: 'UI/UX, Figma, Adobe XD, прототипирование',
            about: 'Дизайнер, люблю создавать удобные интерфейсы.',
            isProfileComplete: true
        };
        users = [artem, dima, anya];
        saveUsers(users);
    }
}

// ========== УПРАВЛЕНИЕ ЭКРАНАМИ (SPA) ==========
const screens = {
    auth: document.getElementById('screen-auth'),
    feed: document.getElementById('screen-feed'),
    profile: document.getElementById('screen-profile'),
    create: document.getElementById('screen-create'),
    projectDetail: document.getElementById('screen-project-detail')
};

function showScreen(screenName) {
    // Скрыть все экраны
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    // Показать нужный
    screens[screenName].classList.add('active');
    // Обновить навигацию
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.screen === screenName);
    });
    // Дополнительные действия при показе
    if (screenName === 'feed') renderProjects();
    if (screenName === 'profile') renderProfile();
    if (screenName === 'create') resetCreateForm();
}

// ========== АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ ==========
function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabs = document.querySelectorAll('.auth-tab');

    // Переключение вкладок
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        });
    });

    // Вход
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user.id);
            // Если профиль не заполнен, показать экран профиля, иначе ленту
            if (!user.isProfileComplete) {
                showScreen('profile');
            } else {
                showScreen('feed');
            }
            loginForm.reset();
        } else {
            alert('Неверный email или пароль');
        }
    });

    // Регистрация
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        const users = getUsers();
        if (users.some(u => u.email === email)) {
            alert('Пользователь с таким email уже существует');
            return;
        }
        const newUser = {
            id: generateId(),
            email,
            password,
            name: '',
            faculty: '',
            course: '',
            skills: '',
            about: '',
            isProfileComplete: false
        };
        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser.id);
        showScreen('profile');
        registerForm.reset();
        // Переключить вкладку обратно на вход
        document.querySelector('.auth-tab[data-tab="login"]').click();
    });
}

// ========== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ==========
function renderProfile() {
    const container = document.getElementById('profileContainer');
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = '<p>Необходимо войти</p>';
        return;
    }
    container.innerHTML = `
        <div class="profile-card">
            <h2>${user.name || 'Мой профиль'}</h2>
            <form id="profileForm">
                <div class="form-group">
                    <label>Имя</label>
                    <input type="text" id="profileName" value="${user.name}" required>
                </div>
                <div class="form-group">
                    <label>Факультет</label>
                    <input type="text" id="profileFaculty" value="${user.faculty}">
                </div>
                <div class="form-group">
                    <label>Курс</label>
                    <input type="text" id="profileCourse" value="${user.course}">
                </div>
                <div class="form-group">
                    <label>Навыки</label>
                    <input type="text" id="profileSkills" value="${user.skills}">
                </div>
                <div class="form-group">
                    <label>О себе</label>
                    <textarea id="profileAbout" rows="3">${user.about}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">Сохранить профиль</button>
            </form>
        </div>
    `;

    document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex === -1) return;
        users[userIndex] = {
            ...users[userIndex],
            name: document.getElementById('profileName').value.trim(),
            faculty: document.getElementById('profileFaculty').value.trim(),
            course: document.getElementById('profileCourse').value.trim(),
            skills: document.getElementById('profileSkills').value.trim(),
            about: document.getElementById('profileAbout').value.trim(),
            isProfileComplete: true
        };
        saveUsers(users);
        // Обновить сессию, чтобы текущий пользователь обновился
        setCurrentUser(user.id);
        // Показать ленту
        showScreen('feed');
    });
}

// ========== СОЗДАНИЕ ПРОЕКТА ==========
function resetCreateForm() {
    const form = document.getElementById('createProjectForm');
    if (form) form.reset();
    const rolesContainer = document.getElementById('rolesContainer');
    // Оставить одну пустую строку роли
    rolesContainer.innerHTML = `
        <div class="role-row">
            <input type="text" placeholder="Название роли" class="role-title" value="Мобильный разработчик (Flutter)" required>
            <input type="number" placeholder="Кол-во" min="1" value="1" class="role-count" required>
            <button type="button" class="remove-role" title="Удалить роль">×</button>
        </div>
    `;
    attachRoleEvents();
}

function addRoleRow(title = '', count = 1) {
    const rolesContainer = document.getElementById('rolesContainer');
    const row = document.createElement('div');
    row.className = 'role-row';
    row.innerHTML = `
        <input type="text" placeholder="Название роли" class="role-title" value="${title}" required>
        <input type="number" placeholder="Кол-во" min="1" value="${count}" class="role-count" required>
        <button type="button" class="remove-role" title="Удалить роль">×</button>
    `;
    rolesContainer.appendChild(row);
    attachRoleEvents();
}

function attachRoleEvents() {
    document.querySelectorAll('.remove-role').forEach(btn => {
        btn.onclick = function() {
            const row = this.parentElement;
            if (document.querySelectorAll('.role-row').length > 1) {
                row.remove();
            } else {
                alert('Должна быть хотя бы одна роль');
            }
        };
    });
}

function initCreateProject() {
    const form = document.getElementById('createProjectForm');
    const addRoleBtn = document.getElementById('addRoleBtn');
    const createProjectBtn = document.getElementById('createProjectBtn');

    addRoleBtn.addEventListener('click', () => addRoleRow());

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('projectTitle').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        const roles = [];
        document.querySelectorAll('.role-row').forEach(row => {
            const roleTitle = row.querySelector('.role-title').value.trim();
            const roleCount = parseInt(row.querySelector('.role-count').value);
            if (roleTitle && roleCount > 0) {
                roles.push({
                    title: roleTitle,
                    count: roleCount,
                    filled: 0
                });
            }
        });
        if (!title || !description || roles.length === 0) {
            alert('Заполните все поля и добавьте хотя бы одну роль');
            return;
        }
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Необходимо войти');
            return;
        }
        const project = {
            id: generateId(),
            ownerId: currentUser.id,
            title,
            description,
            roles,
            applicants: [],
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        const projects = getProjects();
        projects.unshift(project);
        saveProjects(projects);
        showScreen('feed');
        renderProjects();
    });

    createProjectBtn.addEventListener('click', () => {
        showScreen('create');
    });
}

// ========== ЛЕНТА ПРОЕКТОВ ==========
function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    const projects = getProjects();
    const currentUser = getCurrentUser();
    if (!currentUser) {
        grid.innerHTML = '<p class="empty-state">Войдите, чтобы видеть проекты</p>';
        return;
    }
    if (projects.length === 0) {
        grid.innerHTML = '<p class="empty-state">Пока нет проектов. Создайте первый!</p>';
        return;
    }
    grid.innerHTML = projects.map(project => {
        const totalSlots = project.roles.reduce((sum, r) => sum + r.count, 0);
        const filledSlots = project.roles.reduce((sum, r) => sum + (r.filled || 0), 0);
        const status = project.status === 'active' ? 'Ищем людей' : 'Завершён';
        return `
            <div class="project-card" data-id="${project.id}">
                <div class="project-card__header">
                    <h3>${project.title}</h3>
                    <span class="project-status">${status}</span>
                </div>
                <p class="project-card__desc">${project.description.substring(0, 120)}${project.description.length > 120 ? '...' : ''}</p>
                <div class="project-card__footer">
                    <span class="project-counter">${filledSlots} из ${totalSlots} человек</span>
                    <span class="project-roles">${project.roles.map(r => r.title).join(', ')}</span>
                </div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            openProjectDetail(card.dataset.id);
        });
    });
}

// ========== ДЕТАЛЬНЫЙ ПРОСМОТР ПРОЕКТА ==========
function openProjectDetail(projectId) {
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showScreen('auth');
        return;
    }
    const container = document.getElementById('projectDetailContainer');
    const totalSlots = project.roles.reduce((sum, r) => sum + r.count, 0);
    const filledSlots = project.roles.reduce((sum, r) => sum + (r.filled || 0), 0);
    const isOwner = project.ownerId === currentUser.id;
    const hasApplied = project.applicants.some(a => a.userId === currentUser.id && a.status !== 'rejected');

    container.innerHTML = `
        <div class="detail-card">
            <button class="btn btn-secondary back-btn" id="backToFeedBtn">← Назад</button>
            <h2>${project.title}</h2>
            <p class="detail-description">${project.description}</p>
            <div class="detail-roles">
                <h3>Роли в команде:</h3>
                <ul>
                    ${project.roles.map(r => `
                        <li>
                            <span>${r.title}</span>
                            <span>${r.filled || 0} / ${r.count}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="detail-progress">
                Прогресс: ${filledSlots} из ${totalSlots} участников
            </div>
            ${!isOwner && !hasApplied ? `
                <div class="apply-section">
                    <h4>Хочу участвовать</h4>
                    <form id="applyForm">
                        <div class="form-group">
                            <label>Выберите роль</label>
                            <select id="applyRole" required>
                                ${project.roles.map(r => `<option value="${r.title}">${r.title}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Сопроводительное сообщение</label>
                            <textarea id="applyMessage" rows="3" placeholder="Расскажите о себе" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Отправить отклик</button>
                    </form>
                </div>
            ` : ''}
            ${isOwner && project.applicants.length > 0 ? `
                <div class="applicants-section">
                    <h4>Заявки (${project.applicants.filter(a => a.status === 'pending').length})</h4>
                    ${project.applicants.map(a => {
        const applicantUser = getUsers().find(u => u.id === a.userId);
        const userName = applicantUser ? applicantUser.name : 'Неизвестный';
        return `
                            <div class="applicant-item">
                                <div class="applicant-info">
                                    <span class="applicant-name" data-user-id="${a.userId}">${userName}</span>
                                    <span class="applicant-role">${a.roleTitle}</span>
                                    <p class="applicant-message">${a.message}</p>
                                    <span class="applicant-status">${a.status === 'pending' ? 'Ожидает' : (a.status === 'accepted' ? 'Принят' : 'Отклонён')}</span>
                                </div>
                                ${a.status === 'pending' ? `
                                    <button class="btn btn-success btn-sm accept-btn" data-user-id="${a.userId}" data-role="${a.roleTitle}">Принять</button>
                                ` : ''}
                            </div>
                        `;
    }).join('')}
                </div>
            ` : ''}
            ${isOwner && project.applicants.length === 0 ? '<p>Заявок пока нет.</p>' : ''}
        </div>
    `;

    showScreen('projectDetail');

    document.getElementById('backToFeedBtn').addEventListener('click', () => showScreen('feed'));

    const applyForm = document.getElementById('applyForm');
    if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const roleTitle = document.getElementById('applyRole').value;
            const message = document.getElementById('applyMessage').value.trim();
            if (!message) {
                alert('Введите сообщение');
                return;
            }
            const newApplicant = {
                userId: currentUser.id,
                roleTitle,
                message,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            const projects = getProjects();
            const proj = projects.find(p => p.id === projectId);
            if (!proj) return;
            proj.applicants.push(newApplicant);
            saveProjects(projects);
            openProjectDetail(projectId);
        });
    }

    document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = btn.dataset.userId;
            const roleTitle = btn.dataset.role;
            const projects = getProjects();
            const proj = projects.find(p => p.id === projectId);
            if (!proj) return;
            const applicant = proj.applicants.find(a => a.userId === userId && a.roleTitle === roleTitle && a.status === 'pending');
            if (applicant) {
                applicant.status = 'accepted';
                const role = proj.roles.find(r => r.title === roleTitle);
                if (role && role.filled < role.count) {
                    role.filled += 1;
                } else {
                    alert('Для этой роли уже заполнены все места');
                    return;
                }
                saveProjects(projects);
                updateNotificationBadge();
                openProjectDetail(projectId);
            }
        });
    });

    document.querySelectorAll('.applicant-name').forEach(nameSpan => {
        nameSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = nameSpan.dataset.userId;
            openUserProfileModal(userId);
        });
    });
}

// ========== УВЕДОМЛЕНИЯ ==========
function updateNotificationBadge() {
    const currentUser = getCurrentUser();
    const badge = document.getElementById('notificationBadge');
    if (!currentUser) {
        badge.style.display = 'none';
        return;
    }
    const projects = getProjects();
    const ownedProjects = projects.filter(p => p.ownerId === currentUser.id);
    const pendingCount = ownedProjects.reduce((sum, proj) => {
        return sum + proj.applicants.filter(a => a.status === 'pending').length;
    }, 0);
    if (pendingCount > 0) {
        badge.textContent = pendingCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function openNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    const list = document.getElementById('notificationsList');
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const projects = getProjects();
    const ownedProjects = projects.filter(p => p.ownerId === currentUser.id);
    const pendingApplicants = [];
    ownedProjects.forEach(proj => {
        proj.applicants.forEach(a => {
            if (a.status === 'pending') {
                pendingApplicants.push({
                    ...a,
                    projectTitle: proj.title,
                    projectId: proj.id
                });
            }
        });
    });
    if (pendingApplicants.length === 0) {
        list.innerHTML = '<p class="empty-state">Нет новых уведомлений</p>';
    } else {
        list.innerHTML = pendingApplicants.map(a => {
            const user = getUsers().find(u => u.id === a.userId);
            const userName = user ? user.name : 'Неизвестный';
            return `
                <div class="notification-item">
                    <div class="notification-text">
                        <span class="notification-user" data-user-id="${a.userId}">${userName}</span>
                        откликнулся на проект "<strong>${a.projectTitle}</strong>" на роль "${a.roleTitle}"
                        <p class="notification-message">"${a.message}"</p>
                    </div>
                    <button class="btn btn-success btn-sm accept-notification-btn" data-project-id="${a.projectId}" data-user-id="${a.userId}" data-role="${a.roleTitle}">Принять</button>
                </div>
            `;
        }).join('');
    }
    modal.style.display = 'flex';

    document.querySelectorAll('.accept-notification-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.dataset.projectId;
            const userId = btn.dataset.userId;
            const roleTitle = btn.dataset.role;
            const projects = getProjects();
            const proj = projects.find(p => p.id === projectId);
            if (!proj) return;
            const applicant = proj.applicants.find(a => a.userId === userId && a.roleTitle === roleTitle && a.status === 'pending');
            if (applicant) {
                applicant.status = 'accepted';
                const role = proj.roles.find(r => r.title === roleTitle);
                if (role && role.filled < role.count) {
                    role.filled += 1;
                    saveProjects(projects);
                    updateNotificationBadge();
                    openNotificationsModal();
                } else {
                    alert('Место уже заполнено');
                }
            }
        });
    });

    document.querySelectorAll('.notification-user').forEach(el => {
        el.addEventListener('click', () => {
            const userId = el.dataset.userId;
            closeModal('notificationsModal');
            openUserProfileModal(userId);
        });
    });
}

// ========== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ (ПРОСМОТР) ==========
function openUserProfileModal(userId) {
    const user = getUsers().find(u => u.id === userId);
    if (!user) return;
    const content = document.getElementById('userProfileContent');
    content.innerHTML = `
        <div class="user-profile-view">
            <h3>${user.name}</h3>
            <p><strong>Факультет:</strong> ${user.faculty || 'Не указан'}</p>
            <p><strong>Курс:</strong> ${user.course || 'Не указан'}</p>
            <p><strong>Навыки:</strong> ${user.skills || 'Не указаны'}</p>
            <p><strong>О себе:</strong> ${user.about || 'Нет информации'}</p>
            <button class="btn btn-secondary" id="backToNotificationsBtn">Назад к списку</button>
        </div>
    `;
    document.getElementById('userProfileModal').style.display = 'flex';
    document.getElementById('backToNotificationsBtn').addEventListener('click', () => {
        closeModal('userProfileModal');
        openNotificationsModal();
    });
}

// Закрытие модалок
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ========== ПЕРЕКЛЮЧАТЕЛЬ ПОЛЬЗОВАТЕЛЕЙ ==========
function initUserSwitcher() {
    const switcherBtn = document.getElementById('userSwitcherBtn');
    const dropdown = document.getElementById('userSwitcherDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    function renderUserList() {
        const users = getUsers();
        const currentUser = getCurrentUser();
        dropdown.innerHTML = users.map(user => `
            <div class="user-switcher-item ${currentUser && currentUser.id === user.id ? 'active' : ''}" data-user-id="${user.id}">
                <span>${user.name || user.email}</span>
                ${!user.isProfileComplete ? '<span class="badge-warning">не заполнен</span>' : ''}
            </div>
        `).join('') + `<div class="user-switcher-item" data-user-id="logout">Выйти</div>`;
    }

    switcherBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
        if (dropdown.classList.contains('open')) {
            renderUserList();
        }
    });

    dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.user-switcher-item');
        if (!item) return;
        const userId = item.dataset.userId;
        if (userId === 'logout') {
            logout();
        } else {
            setCurrentUser(userId);
            const user = getCurrentUser();
            if (user && !user.isProfileComplete) {
                showScreen('profile');
            } else {
                showScreen('feed');
            }
        }
        dropdown.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-switcher')) {
            dropdown.classList.remove('open');
        }
    });

    logoutBtn.addEventListener('click', logout);

    function logout() {
        setData(LS_KEYS.session, { currentUserId: null });
        updateUIForCurrentUser();
        showScreen('auth');
    }
}

// ========== ОБНОВЛЕНИЕ UI ДЛЯ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ ==========
function updateUIForCurrentUser() {
    const currentUser = getCurrentUser();
    const currentUserNameSpan = document.getElementById('currentUserName');
    const logoutBtn = document.getElementById('logoutBtn');
    const userSwitcherBtn = document.getElementById('userSwitcherBtn');
    if (currentUser) {
        currentUserNameSpan.textContent = currentUser.name || currentUser.email;
        logoutBtn.style.display = 'inline-block';
        userSwitcherBtn.style.display = 'flex';
    } else {
        currentUserNameSpan.textContent = 'Гость';
        logoutBtn.style.display = 'none';
        userSwitcherBtn.style.display = 'flex';
    }
    updateNotificationBadge();
}

// ========== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    initDemoData();
    initAuth();
    initCreateProject();
    initUserSwitcher();

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const screen = link.dataset.screen;
            const currentUser = getCurrentUser();
            if (!currentUser && screen !== 'auth') {
                showScreen('auth');
            } else {
                showScreen(screen);
            }
        });
    });

    document.getElementById('notificationBtn').addEventListener('click', () => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Войдите в систему');
            return;
        }
        openNotificationsModal();
    });

    document.getElementById('closeNotificationsBtn').addEventListener('click', () => closeModal('notificationsModal'));
    document.getElementById('closeNotificationsBtn2').addEventListener('click', () => closeModal('notificationsModal'));
    document.getElementById('closeUserProfileBtn').addEventListener('click', () => closeModal('userProfileModal'));
    document.getElementById('closeUserProfileBtn2').addEventListener('click', () => closeModal('userProfileModal'));

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });
    });

    const session = getData(LS_KEYS.session);
    if (session && session.currentUserId) {
        const user = getCurrentUser();
        if (user) {
            updateUIForCurrentUser();
            showScreen(user.isProfileComplete ? 'feed' : 'profile');
        } else {
            showScreen('auth');
        }
    } else {
        updateUIForCurrentUser();
        showScreen('auth');
    }
});
