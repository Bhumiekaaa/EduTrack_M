document.addEventListener('DOMContentLoaded', function () {
    const classes = [
        { id: 1, name: 'Data Structures & Algorithms', students: 65, next: '10:00 AM', room: 'Lab 201', attendance: 88 },
        { id: 2, name: 'Computer Networks', students: 58, next: '11:30 AM', room: 'LH 102', attendance: 92 },
        { id: 3, name: 'Database Management Systems', students: 62, next: '2:00 PM', room: 'Lab 301', attendance: 85 },
        { id: 4, name: 'Software Engineering', students: 55, next: '3:30 PM', room: 'LH 201', attendance: 76 },
    ];

    const classOverview = document.getElementById('class-overview');
    const attendanceSelect = document.getElementById('attendance-class-select');
    const assignmentsPanel = document.getElementById('assignments-panel');
    const gradeEntry = document.getElementById('grade-entry');
    const announcementsList = document.getElementById('announcements-list');
    const postBtn = document.getElementById('post-announcement');
    const announcementInput = document.getElementById('announcement-input');
    const upcomingLectures = document.getElementById('upcoming-lectures');
    const notificationBadge = document.getElementById('notification-badge');

    // populate classes
    classes.forEach(c => {
        const el = document.createElement('div');
        el.className = 'class-card';
        el.innerHTML = `
            <div class="class-meta">
                <div class="class-name">${c.name}</div>
                <div class="muted">${c.students} students • Room ${c.room}</div>
            </div>
            <div class="class-actions">
                <div class="muted">Next: ${c.next}</div>
                <button class="btn btn-sm view-btn" data-id="${c.id}">View Details</button>
            </div>`;
        classOverview.appendChild(el);

        const opt = document.createElement('option');
        opt.value = c.id; opt.textContent = c.name; attendanceSelect.appendChild(opt);
    });

    // populate assignments panel (sample)
    const sampleAssignments = [
        { title: 'DSA Assignment - Binary Trees', submitted: 58, pending: 7, graded: 51 },
        { title: 'CN Lab - Packet Tracer', submitted: 55, pending: 0, graded: 55 },
        { title: 'DBMS Project Phase 1', submitted: 45, pending: 17, graded: 28 },
        { title: 'SE Case Study Analysis', submitted: 42, pending: 13, graded: 29 },
    ];
    sampleAssignments.forEach(a => {
        const row = document.createElement('div');
        row.style.display = 'flex'; row.style.justifyContent = 'space-between'; row.style.alignItems = 'center';
        row.style.padding = '8px 0';
        row.innerHTML = `<div><strong>${a.title}</strong><div class="muted">Submitted: ${a.submitted}</div></div>
            <div class="assign-status">
                <span class="badge sub">${a.submitted}</span>
                <span class="badge pending">${a.pending}</span>
                <span class="badge graded">${a.graded}</span>
            </div>`;
        assignmentsPanel.appendChild(row);
    });

    // populate grade entry quick rows
    classes.forEach(c => {
        const r = document.createElement('div');
        r.style.display = 'flex'; r.style.justifyContent = 'space-between'; r.style.alignItems = 'center'; r.style.padding = '8px 0';
        r.innerHTML = `<div>${c.name} <div class="muted">${c.students} students</div></div>
            <div><button class="btn btn-sm">Open</button></div>`;
        gradeEntry.appendChild(r);
    });

    // announcements
    const addAnnouncement = (text) => {
        const a = document.createElement('div');
        a.className = 'announcement';
        a.textContent = text;
        announcementsList.prepend(a);
    };
    postBtn.addEventListener('click', () => {
        const txt = announcementInput.value.trim();
        if(!txt) return showToast('Enter some text before posting.');
        addAnnouncement(txt);
        announcementInput.value = '';
        showToast('Announcement posted.');
    });

    // upcoming lectures
    classes.forEach(c => {
        const li = document.createElement('div');
        li.style.padding = '8px 0';
        li.innerHTML = `<strong>${c.name}</strong> <div class="muted">${c.next} • Room ${c.room}</div>`;
        upcomingLectures.appendChild(li);
    });

    // simple toast
    const toastContainer = document.getElementById('toast-container');
    function showToast(msg, timeout = 3000){
        const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
        toastContainer.appendChild(t);
        setTimeout(()=>{ t.remove(); }, timeout);
    }

    // simulate assignment submission notification
    setTimeout(()=>{
        incrementNotifications(1);
        showToast('New assignment submitted by a student.');
    }, 6000);

    function incrementNotifications(n){
        let cur = parseInt(notificationBadge.textContent || '0',10) || 0;
        cur += n; notificationBadge.textContent = String(cur);
        notificationBadge.style.display = cur>0? 'inline-flex' : 'none';
    }

    // hide badge if 0 on load
    if((notificationBadge.textContent||'0').trim() === '0') notificationBadge.style.display = 'none';

    // attendance check: warn if below 80 for any class
    document.getElementById('mark-attendance').addEventListener('click', ()=>{
        const low = classes.filter(c=>c.attendance < 80);
        if(low.length) {
            showToast(`Warning: ${low.length} class(es) have attendance below 80%.`);
        } else {
            showToast('All class attendance rates are healthy.');
        }
    });

    // simple search interaction
    document.getElementById('search-input').addEventListener('keypress', (e)=>{
        if(e.key === 'Enter'){
            showToast(`Search: ${e.target.value}`);
        }
    });

    // theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', ()=>{
        document.body.classList.toggle('dark');
        showToast('Theme toggled.');
    });

    // profile dropdown behavior: toggle aria-hidden, close on outside click
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileBtn && profileDropdown) {
        // start closed
        profileDropdown.setAttribute('aria-hidden', 'true');

        profileBtn.addEventListener('click', (e)=>{
            e.stopPropagation();
            const isOpen = profileDropdown.getAttribute('aria-hidden') === 'false';
            profileDropdown.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
        });

        // prevent clicks inside dropdown from closing it
        profileDropdown.addEventListener('click', (e)=> e.stopPropagation());

        // close when clicking elsewhere
        document.addEventListener('click', ()=> profileDropdown.setAttribute('aria-hidden', 'true'));
    }

    // logout: attach to header or sidebar logout link (supporting both places)
    const logoutBtn = document.getElementById('logout-btn') || document.querySelector('.nav-item.text-danger');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e)=>{
            e.preventDefault();
            showToast('Logged out (demo).');
            setTimeout(()=> location.href = 'login.html', 600);
        });
    }

    // view details click
    document.querySelectorAll('.view-btn').forEach(b=>b.addEventListener('click', (e)=>{
        const id = e.target.dataset.id; showToast('Open class details for id: ' + id);
    }));

});
// Teacher Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI components
    initSidebar();
    initThemeToggle();
    initNotifications();
    initAttendanceToggles();
    
    // Welcome message
    showWelcomeMessage();
    
    // Load sample data
    loadDashboardData();
});

// Initialize sidebar functionality
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('sidebar-mini');
            mainContent.classList.toggle('ml-20');
            mainContent.classList.toggle('ml-64');
        });
    }
    
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
        });
    }
}

// Initialize theme toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply the saved theme
    if (savedTheme === 'dark') {
        html.classList.add('dark');
        themeToggle.innerHTML = '<i class="ri-sun-line"></i>';
    } else {
        html.classList.remove('dark');
        themeToggle.innerHTML = '<i class="ri-moon-line"></i>';
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');
        themeToggle.innerHTML = isDark ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-line"></i>';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Initialize notifications
function initNotifications() {
    const notificationButton = document.getElementById('notification-button');
    const notificationPanel = document.getElementById('notification-panel');
    
    if (notificationButton && notificationPanel) {
        notificationButton.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationPanel.classList.toggle('hidden');
        });
        
        // Close notification panel when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationPanel.contains(e.target) && e.target !== notificationButton) {
                notificationPanel.classList.add('hidden');
            }
        });
    }
    
    // Mark all as read
    const markAllRead = document.getElementById('mark-all-read');
    if (markAllRead) {
        markAllRead.addEventListener('click', function() {
            document.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
                item.classList.add('read');
            });
            updateNotificationBadge(0);
        });
    }
}

// Update notification badge count
function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Initialize attendance toggles
function initAttendanceToggles() {
    document.querySelectorAll('.attendance-toggle').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const studentId = this.dataset.studentId;
            const isPresent = this.checked;
            
            // In a real app, you would make an API call here to update attendance
            console.log(`Student ${studentId} marked as ${isPresent ? 'Present' : 'Absent'}`);
            
            // Show feedback
            showToast(`Attendance updated: ${this.dataset.studentName} marked as ${isPresent ? 'Present' : 'Absent'}`);
        });
    });
}

// Show welcome message
function showWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        const hour = new Date().getHours();
        let greeting = 'Welcome back';
        
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';
        else greeting = 'Good evening';
        
        welcomeMessage.textContent = `${greeting}, Prof. Sharma!`;
    }
}

// Load sample dashboard data
function loadDashboardData() {
    // In a real app, you would fetch this data from an API
    const stats = {
        totalStudents: 142,
        subjectsTaught: 5,
        attendanceRate: 92,
        assignmentsToReview: 7
    };
    
    // Update stats cards
    document.getElementById('total-students').textContent = stats.totalStudents;
    document.getElementById('subjects-taught').textContent = stats.subjectsTaught;
    document.getElementById('attendance-rate').textContent = `${stats.attendanceRate}%`;
    document.getElementById('assignments-to-review').textContent = stats.assignmentsToReview;
    
    // Update attendance rate color based on value
    const attendanceElement = document.getElementById('attendance-rate');
    if (stats.attendanceRate < 80) {
        attendanceElement.classList.add('text-yellow-500');
        // Show warning if attendance is below 80%
        showToast('Warning: Attendance rate is below 80%', 'warning');
    } else {
        attendanceElement.classList.add('text-green-500');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    const types = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    toast.className = `animate-fade-in fixed bottom-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg flex items-center ${types[type] || types.info} text-sm`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="ml-4 text-white hover:text-gray-100" onclick="this.parentElement.remove()">
            <i class="ri-close-line"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Export functions for use in HTML onclick handlers
window.showToast = showToast;
