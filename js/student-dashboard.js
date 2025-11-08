// Student Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initNotifications();
    initProfileDropdown();
    initDateDisplay();
    initAttendanceChart();
    loadUpcomingTests();
    loadTodaysSchedule();
    
    // Show welcome toast
    setTimeout(() => {
        showToast('Welcome back to your dashboard!', 'success');
    }, 1000);
});

// Initialize notifications
function initNotifications() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const markAllRead = document.getElementById('mark-all-read');
    
    // Sample notifications data
    const notifications = [
        {
            id: 1,
            title: 'New Assignment',
            message: 'Math homework #3 has been assigned. Due: Nov 5',
            time: '10 min ago',
            read: false
        },
        {
            id: 2,
            title: 'Class Rescheduled',
            message: 'Physics class on Friday has been moved to 2 PM',
            time: '1 hour ago',
            read: false
        },
        {
            id: 3,
            title: 'Fee Reminder',
            message: 'Semester fee payment due in 3 days',
            time: '5 hours ago',
            read: true
        },
        {
            id: 4,
            title: 'New Grade Posted',
            message: 'Your grade for Chemistry Lab has been updated',
            time: '1 day ago',
            read: true
        }
    ];
    
    // Toggle notification dropdown
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
            
            // Mark notifications as read when opened
            if (notificationDropdown.classList.contains('show')) {
                const unreadCount = notifications.filter(n => !n.read).length;
                if (unreadCount > 0) {
                    updateNotificationBadge(0);
                    notifications.forEach(n => n.read = true);
                    renderNotifications();
                }
            }
        });
    }
    
    // Mark all as read
    if (markAllRead) {
        markAllRead.addEventListener('click', function(e) {
            e.stopPropagation();
            notifications.forEach(n => n.read = true);
            renderNotifications();
            updateNotificationBadge(0);
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        notificationDropdown.classList.remove('show');
    });
    
    // Render notifications
    function renderNotifications() {
        const container = document.getElementById('notification-list');
        if (!container) return;
        
        container.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                <div class="title">${notification.title}</div>
                <div class="message">${notification.message}</div>
                <div class="time">${notification.time}</div>
            </div>
        `).join('');
        
        // Add click handlers to notification items
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function() {
                const notificationId = parseInt(this.dataset.id);
                const notification = notifications.find(n => n.id === notificationId);
                if (notification && !notification.read) {
                    notification.read = true;
                    this.classList.remove('unread');
                    updateNotificationBadge(notifications.filter(n => !n.read).length);
                }
                // In a real app, you would navigate to the relevant page
                console.log('Notification clicked:', notification);
                notificationDropdown.classList.remove('show');
            });
        });
    }
    
    // Initial render
    renderNotifications();
    updateNotificationBadge(notifications.filter(n => !n.read).length);
}

// Initialize profile dropdown
function initProfileDropdown() {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            profileDropdown.classList.remove('show');
        });
    }
}

// Initialize date display
function initDateDisplay() {
    const dateElement = document.getElementById('current-date');
    if (!dateElement) return;
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);
    
    // Update welcome message based on time of day
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        const hour = new Date().getHours();
        let greeting = 'Welcome back';
        
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';
        else greeting = 'Good evening';
        
        welcomeMessage.textContent = `${greeting}, John!`;
    }
}

// Initialize attendance chart
function initAttendanceChart() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;
    
    // Sample data - in a real app, this would come from an API
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [
            {
                label: 'Attendance %',
                data: [85, 82, 88, 87, 90, 89, 91, 93, 92, 95],
                borderColor: '#2f67ec',
                backgroundColor: 'rgba(47, 103, 236, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }
        ]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 75,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    };
    
    new Chart(ctx, config);
}

// Load upcoming tests
function loadUpcomingTests() {
    const container = document.getElementById('upcoming-tests-list');
    if (!container) return;
    
    // Sample data - in a real app, this would come from an API
    const tests = [
        {
            subject: 'Mathematics',
            type: 'Quiz',
            date: 'Nov 5, 2023',
            time: '10:00 AM',
            syllabus: 'Chapters 1-5',
            status: 'upcoming'
        },
        {
            subject: 'Physics',
            type: 'Midterm',
            date: 'Nov 10, 2023',
            time: '1:00 PM',
            syllabus: 'Units 1-3',
            status: 'upcoming'
        },
        {
            subject: 'Chemistry',
            type: 'Lab Test',
            date: 'Nov 15, 2023',
            time: '9:30 AM',
            syllabus: 'Organic Chemistry',
            status: 'upcoming'
        }
    ];
    
    container.innerHTML = tests.map(test => `
        <tr>
            <td class="py-3">${test.subject}</td>
            <td class="py-3">${test.type}</td>
            <td class="py-3">${test.date}<br><span class="text-xs text-gray-500">${test.time}</span></td>
            <td class="py-3">${test.syllabus}</td>
            <td class="py-3">
                <span class="badge ${getStatusBadgeClass(test.status)}">
                    ${test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                </span>
            </td>
        </tr>
    `).join('');
    
    // Update the upcoming tests count in the stats card
    document.getElementById('upcoming-tests').textContent = tests.length;
}

// Load today's schedule
function loadTodaysSchedule() {
    const container = document.getElementById('todays-schedule');
    if (!container) return;
    
    // Sample data - in a real app, this would come from an API
    const schedule = [
        { time: '09:00 - 10:30', subject: 'Mathematics', room: 'A-101', type: 'lecture' },
        { time: '11:00 - 12:30', subject: 'Physics', room: 'B-205', type: 'lab' },
        { time: '02:00 - 03:30', subject: 'Computer Science', room: 'C-301', type: 'lecture' }
    ];
    
    if (schedule.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                No classes scheduled for today
            </div>
        `;
        return;
    }
    
    container.innerHTML = schedule.map(cls => `
        <div class="schedule-item">
            <div class="schedule-time">${cls.time}</div>
            <div class="schedule-details">
                <div class="schedule-subject">${cls.subject}</div>
                <div class="schedule-meta">
                    <span class="schedule-room">${cls.room}</span>
                    <span class="schedule-type ${cls.type}">${cls.type === 'lecture' ? 'Lecture' : 'Lab'}</span>
                </div>
            </div>
            <button class="schedule-action">
                <i class="ri-arrow-right-line"></i>
            </button>
        </div>
    `).join('');
}

// Helper function to get status badge class
function getStatusBadgeClass(status) {
    const classes = {
        'upcoming': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'missed': 'bg-red-100 text-red-800',
        'cancelled': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

// Update notification badge
function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    const types = {
        'success': { icon: 'ri-checkbox-circle-line', bg: 'bg-green-500' },
        'error': { icon: 'ri-error-warning-line', bg: 'bg-red-500' },
        'warning': { icon: 'ri-alert-line', bg: 'bg-yellow-500' },
        'info': { icon: 'ri-information-line', bg: 'bg-blue-500' }
    };
    
    const toastType = types[type] || types.info;
    
    toast.className = `toast ${type} ${toastType.bg} text-white p-4 rounded-lg shadow-lg flex items-start max-w-md`;
    toast.innerHTML = `
        <i class="${toastType.icon} text-xl mr-3"></i>
        <div class="flex-1">
            <div class="font-medium">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="text-sm opacity-90">${message}</div>
        </div>
        <button class="ml-4 opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">
            <i class="ri-close-line"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Make showToast available globally
window.showToast = showToast;
