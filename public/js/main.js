document.addEventListener('DOMContentLoaded', function() {
    // Current active page
    let currentPage = 'dashboard';
    
    // Dummy data
    const dummyData = {
        attendance: [
            { subject: 'DSA', attended: 18, total: 20, percentage: 90 },
            { subject: 'Mathematics', attended: 15, total: 20, percentage: 75 },
            { subject: 'Physics', attended: 19, total: 20, percentage: 95 },
            { subject: 'Software Engineering', attended: 17, total: 20, percentage: 85 },
            { subject: 'Chemistry', attended: 16, total: 20, percentage: 80 },
            { subject: 'Communication Skills', attended: 20, total: 20, percentage: 100 }
        ],
        upcomingAssignments: [
            { id: 1, title: 'Math Assignment 1', subject: 'Mathematics', dueDate: '2023-11-15', status: 'Pending' },
            { id: 2, title: 'Science Project', subject: 'Physics', dueDate: '2023-11-20', status: 'Pending' }
        ],
        upcomingTests: [
            { id: 1, title: 'Midterm Exam', subject: 'Mathematics', date: '2023-11-25', time: '10:00 AM' },
            { id: 2, title: 'Unit Test', subject: 'Physics', date: '2023-11-28', time: '11:30 AM' }
        ],
        todaySchedule: [
            { time: '09:00 - 10:00', subject: 'Mathematics', room: 'Room 101' },
            { time: '10:00 - 11:00', subject: 'Physics', room: 'Lab 1' },
            { time: '11:30 - 12:30', subject: 'Chemistry', room: 'Room 102' }
        ],
        studyMaterials: [
            { name: 'Math Chapter 1 Notes.pdf', type: 'PDF', size: '2.4 MB' },
            { name: 'Physics Formulas.docx', type: 'DOCX', size: '1.8 MB' },
            { name: 'Chemistry Lab Manual.pdf', type: 'PDF', size: '3.2 MB' }
        ],
        timetable: [
            { time: '09:00 - 10:00', mon: 'Math', tue: 'Physics', wed: 'Chem', thu: 'Math', fri: 'Physics' },
            { time: '10:00 - 11:00', mon: 'Physics', tue: 'Chem', wed: 'Math', thu: 'Physics', fri: 'Chem' },
            { time: '11:30 - 12:30', mon: 'Chem', tue: 'Math', wed: 'Physics', thu: 'Chem', fri: 'Math' }
        ]
    };

    // Initialize the page
    function init() {
        setupNavigation();
        loadDashboard();
        setupEventListeners();
    }

    // Set up navigation
    function setupNavigation() {
        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                // Add active class to clicked item
                this.classList.add('active');
                
                // Get the target page
                const target = this.getAttribute('data-page');
                currentPage = target;
                
                // Load the appropriate page
                loadPage(target);
            });
        });
    }

    // Load page content
    function loadPage(page) {
        const content = document.querySelector('.main-content');
        
        switch(page) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'schedule':
                loadSchedule();
                break;
            case 'subjects':
                loadSubjects();
                break;
            case 'assignments':
                loadAssignments();
                break;
            case 'results':
                loadResults();
                break;
            case 'fees':
                loadFees();
                break;
            default:
                loadDashboard();
        }
    }

    // Set up event listeners
    function setupEventListeners() {
        // Attendance card flip
        const attendanceCard = document.querySelector('.attendance-card');
        if (attendanceCard) {
            attendanceCard.addEventListener('click', function() {
                this.classList.toggle('flipped');
                
                if (this.classList.contains('flipped')) {
                    showAttendanceDetails();
                } else {
                    showAttendanceSummary();
                }
            });
        }

        // View All buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('view-all-btn')) {
                const section = e.target.getAttribute('data-section');
                handleViewAll(section);
            }
        });

        // Quick Links
        document.addEventListener('click', function(e) {
            if (e.target.closest('.quick-link')) {
                const linkType = e.target.closest('.quick-link').getAttribute('data-link');
                handleQuickLink(linkType);
            }
        });
    }

    // Show attendance summary (front of card)
    function showAttendanceSummary() {
        const totalAttendance = dummyData.attendance.reduce((sum, subj) => sum + subj.percentage, 0) / dummyData.attendance.length;
        document.querySelector('.attendance-card').innerHTML = `
            <div class="card-front">
                <h3>Overall Attendance</h3>
                <div class="attendance-percentage">${Math.round(totalAttendance)}%</div>
                <p>Click to view details</p>
            </div>
        `;
    }

    // Show attendance details (back of card)
    function showAttendanceDetails() {
        let detailsHtml = '<div class="card-back">';
        detailsHtml += '<h3>Attendance by Subject</h3>';
        detailsHtml += '<div class="attendance-details">';
        
        dummyData.attendance.forEach(subj => {
            detailsHtml += `
                <div class="attendance-item">
                    <span class="subject">${subj.subject}</span>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${subj.percentage}%;"></div>
                    </div>
                    <span class="percentage">${subj.percentage}%</span>
                    <span class="attended">(${subj.attended}/${subj.total})</span>
                </div>
            `;
        });
        
        detailsHtml += '</div></div>';
        document.querySelector('.attendance-card').innerHTML = detailsHtml;
    }

    // Handle View All buttons
    function handleViewAll(section) {
        switch(section) {
            case 'assignments':
                alert('No more tests or assignments scheduled!');
                break;
            case 'tests':
                alert('No more tests or assignments scheduled!');
                break;
            case 'schedule':
                alert('YAY! No more lectures.');
                break;
        }
    }

    // Handle Quick Links
    function handleQuickLink(linkType) {
        switch(linkType) {
            case 'materials':
                showStudyMaterials();
                break;
            case 'doubt':
                showDoubtForm();
                break;
            case 'timetable':
                showTimetable();
                break;
            case 'payment':
                showPaymentForm();
                break;
        }
    }

    // Show Study Materials modal
    function showStudyMaterials() {
        const modal = createModal('Study Materials');
        let content = '<div class="materials-list">';
        
        dummyData.studyMaterials.forEach(item => {
            content += `
                <div class="material-item">
                    <div class="material-icon">${item.type}</div>
                    <div class="material-info">
                        <div class="material-name">${item.name}</div>
                        <div class="material-meta">${item.size}</div>
                    </div>
                    <button class="btn-download">Download</button>
                </div>
            `;
        });
        
        content += '</div>';
        modal.querySelector('.modal-body').innerHTML = content;
        showModal(modal);
    }

    // Show Doubt Form modal
    function showDoubtForm() {
        const modal = createModal('Ask a Doubt');
        const content = `
            <form id="doubtForm" class="doubt-form">
                <div class="form-group">
                    <label for="subject">Subject</label>
                    <select id="subject" required>
                        <option value="">Select Subject</option>
                        <option value="math">Mathematics</option>
                        <option value="physics">Physics</option>
                        <option value="chemistry">Chemistry</option>
                        <option value="dsa">DSA</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="question">Your Question</label>
                    <textarea id="question" rows="4" required placeholder="Type your question here..."></textarea>
                </div>
                <div class="form-group">
                    <label for="attachment">Attachment (Optional)</label>
                    <input type="file" id="attachment">
                </div>
                <button type="submit" class="btn-submit">Submit Doubt</button>
            </form>
        `;
        
        modal.querySelector('.modal-body').innerHTML = content;
        showModal(modal);
        
        // Add form submission handler
        document.getElementById('doubtForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Your doubt has been submitted successfully!');
            closeModal();
        });
    }

    // Show Timetable modal
    function showTimetable() {
        const modal = createModal('Class Timetable');
        let content = '<div class="timetable-container"><table class="timetable"><thead><tr><th>Time</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th></tr></thead><tbody>';
        
        dummyData.timetable.forEach(row => {
            content += `
                <tr>
                    <td>${row.time}</td>
                    <td>${row.mon}</td>
                    <td>${row.tue}</td>
                    <td>${row.wed}</td>
                    <td>${row.thu}</td>
                    <td>${row.fri}</td>
                </tr>
            `;
        });
        
        content += '</tbody></table></div>';
        modal.querySelector('.modal-body').innerHTML = content;
        showModal(modal);
    }

    // Show Payment Form modal
    function showPaymentForm() {
        const modal = createModal('Fee Payment');
        const content = `
            <div class="payment-info">
                <div class="payment-summary">
                    <h4>Payment Summary</h4>
                    <div class="payment-row">
                        <span>Tuition Fee</span>
                        <span>₹25,000.00</span>
                    </div>
                    <div class="payment-row">
                        <span>Library Fee</span>
                        <span>₹2,000.00</span>
                    </div>
                    <div class="payment-row total">
                        <span>Total Amount</span>
                        <span>₹27,000.00</span>
                    </div>
                </div>
                
                <form id="paymentForm" class="payment-form">
                    <h4>Payment Method</h4>
                    <div class="payment-methods">
                        <label class="payment-method">
                            <input type="radio" name="paymentMethod" value="credit" checked>
                            <span>Credit/Debit Card</span>
                        </label>
                        <label class="payment-method">
                            <input type="radio" name="paymentMethod" value="upi">
                            <span>UPI</span>
                        </label>
                        <label class="payment-method">
                            <input type="radio" name="paymentMethod" value="netbanking">
                            <span>Net Banking</span>
                        </label>
                    </div>
                    
                    <div id="creditCardForm" class="payment-details">
                        <div class="form-group">
                            <label for="cardNumber">Card Number</label>
                            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="expiry">Expiry Date</label>
                                <input type="text" id="expiry" placeholder="MM/YY" required>
                            </div>
                            <div class="form-group">
                                <label for="cvv">CVV</label>
                                <input type="text" id="cvv" placeholder="123" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="cardName">Name on Card</label>
                            <input type="text" id="cardName" placeholder="John Doe" required>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn-pay">Pay ₹27,000.00</button>
                </form>
            </div>
        `;
        
        modal.querySelector('.modal-body').innerHTML = content;
        showModal(modal);
        
        // Add payment method toggle
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', function() {
                // In a real app, you would show different forms based on payment method
                document.getElementById('creditCardForm').style.display = 
                    this.value === 'credit' ? 'block' : 'none';
            });
        });
        
        // Add form submission handler
        document.getElementById('paymentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.innerHTML = `
                <div class="success-icon">✓</div>
                <h3>Payment Successful!</h3>
                <p>Your payment of ₹27,000.00 has been processed successfully.</p>
                <p>Transaction ID: ${'TXN' + Math.random().toString(36).substr(2, 10).toUpperCase()}</p>
                <button class="btn-close-modal">Close</button>
            `;
            
            modal.querySelector('.modal-body').innerHTML = '';
            modal.querySelector('.modal-body').appendChild(successMsg);
            
            // Add close button handler
            modal.querySelector('.btn-close-modal').addEventListener('click', closeModal);
        });
    }

    // Create a modal
    function createModal(title) {
        // Remove existing modal if any
        const existingModal = document.querySelector('.modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body"></div>
            </div>
        `;
        
        // Add close button handler
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        
        return modal;
    }

    // Show modal
    function showModal(modal) {
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Close with escape key
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }

    // Close modal
    function closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        }
    }

    // Load Dashboard
    function loadDashboard() {
        // In a real app, you would fetch this data from the backend
        const dashboardHtml = `
            <h2>Dashboard</h2>
            
            <div class="dashboard-cards">
                <div class="card attendance-card">
                    <div class="card-front">
                        <h3>Overall Attendance</h3>
                        <div class="attendance-percentage">84%</div>
                        <p>Click to view details</p>
                    </div>
                </div>
                
                <div class="card assignments-card">
                    <h3>Pending Assignments</h3>
                    <div class="count">${dummyData.upcomingAssignments.length}</div>
                    <p>Due soon</p>
                </div>
                
                <div class="card tests-card">
                    <h3>Upcoming Tests</h3>
                    <div class="count">${dummyData.upcomingTests.length}</div>
                    <p>This week</p>
                </div>
                
                <div class="card fees-card">
                    <h3>Fee Status</h3>
                    <div class="status paid">Paid</div>
                    <p>Next due: 15 Dec 2023</p>
                </div>
            </div>
            
            <div class="dashboard-sections">
                <div class="section upcoming-assignments">
                    <div class="section-header">
                        <h3>Upcoming Assignments</h3>
                        <button class="view-all-btn" data-section="assignments">View All</button>
                    </div>
                    <div class="assignments-list">
                        ${dummyData.upcomingAssignments.map(assignment => `
                            <div class="assignment-item">
                                <div class="assignment-info">
                                    <h4>${assignment.title}</h4>
                                    <p>${assignment.subject} • Due: ${assignment.dueDate}</p>
                                </div>
                                <span class="status ${assignment.status.toLowerCase()}">${assignment.status}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="section today-schedule">
                    <div class="section-header">
                        <h3>Today's Schedule</h3>
                        <button class="view-all-btn" data-section="schedule">View All</button>
                    </div>
                    <div class="schedule-list">
                        ${dummyData.todaySchedule.map(lecture => `
                            <div class="schedule-item">
                                <div class="time">${lecture.time}</div>
                                <div class="lecture-info">
                                    <h4>${lecture.subject}</h4>
                                    <p>${lecture.room}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="section quick-links">
                    <h3>Quick Links</h3>
                    <div class="quick-links-grid">
                        <div class="quick-link" data-link="materials">
                            <div class="icon">📚</div>
                            <span>Study Materials</span>
                        </div>
                        <div class="quick-link" data-link="doubt">
                            <div class="icon">❓</div>
                            <span>Ask Doubt</span>
                        </div>
                        <div class="quick-link" data-link="timetable">
                            <div class="icon">📅</div>
                            <span>Time Table</span>
                        </div>
                        <div class="quick-link" data-link="payment">
                            <div class="icon">💳</div>
                            <span>Fee Payment</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('.main-content').innerHTML = dashboardHtml;
        
        // Re-attach event listeners
        setupEventListeners();
    }

    // Load Schedule
    function loadSchedule() {
        document.querySelector('.main-content').innerHTML = `
            <h2>Class Schedule</h2>
            <div class="timetable-container">
                ${showTimetable().outerHTML}
            </div>
        `;
    }

    // Load Subjects
    function loadSubjects() {
        const subjectsHtml = `
            <h2>My Subjects</h2>
            <div class="subjects-grid">
                ${dummyData.attendance.map(subj => `
                    <div class="subject-card">
                        <div class="subject-header">
                            <h3>${subj.subject}</h3>
                            <div class="attendance-badge">${subj.percentage}%</div>
                        </div>
                        <div class="subject-meta">
                            <p><strong>Teacher:</strong> Prof. ${subj.subject.split(' ')[0]}</p>
                            <p><strong>Classes:</strong> Mon, Wed, Fri</p>
                            <p><strong>Time:</strong> 9:00 AM - 10:00 AM</p>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${subj.percentage}%;"></div>
                        </div>
                        <div class="subject-actions">
                            <button class="btn-outline">View Materials</button>
                            <button class="btn-primary">View Details</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.querySelector('.main-content').innerHTML = subjectsHtml;
    }

    // Load Assignments
    function loadAssignments() {
        const assignmentsHtml = `
            <div class="assignments-header">
                <h2>My Assignments</h2>
                <div class="filter-options">
                    <button class="btn-filter active">All</button>
                    <button class="btn-filter">Pending</button>
                    <button class="btn-filter">Submitted</button>
                    <button class="btn-filter">Graded</button>
                </div>
            </div>
            
            <div class="assignments-list detailed">
                ${dummyData.upcomingAssignments.map(assignment => `
                    <div class="assignment-card">
                        <div class="assignment-info">
                            <h3>${assignment.title}</h3>
                            <p class="subject">${assignment.subject}</p>
                            <p class="due-date"><strong>Due:</strong> ${assignment.dueDate}</p>
                            <p class="status"><strong>Status:</strong> <span class="tag ${assignment.status.toLowerCase()}">${assignment.status}</span></p>
                        </div>
                        <div class="assignment-actions">
                            <button class="btn-outline">View Details</button>
                            ${assignment.status === 'Pending' ? '<button class="btn-primary">Submit</button>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.querySelector('.main-content').innerHTML = assignmentsHtml;
    }

    // Load Results
    function loadResults() {
        const resultsHtml = `
            <h2>My Results</h2>
            <div class="results-container">
                <div class="results-summary">
                    <div class="overall-score">
                        <div class="score">87%</div>
                        <p>Overall Grade</p>
                    </div>
                    <div class="stats">
                        <div class="stat">
                            <div class="value">A</div>
                            <div class="label">Current Grade</div>
                        </div>
                        <div class="stat">
                            <div class="value">5th</div>
                            <div class="label">Class Rank</div>
                        </div>
                        <div class="stat">
                            <div class="value">95%</div>
                            <div class="label">Attendance</div>
                        </div>
                    </div>
                </div>
                
                <div class="subject-results">
                    <h3>Subject-wise Performance</h3>
                    ${dummyData.attendance.map((subj, index) => `
                        <div class="subject-result">
                            <div class="subject-info">
                                <h4>${subj.subject}</h4>
                                <div class="grade">${['A', 'A+', 'B+', 'A', 'A-', 'A+'][index]}</div>
                            </div>
                            <div class="progress-container">
                                <div class="progress-bar" style="width: ${85 + index * 2}%;"></div>
                            </div>
                            <div class="marks">${85 + index * 2}/100</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.querySelector('.main-content').innerHTML = resultsHtml;
    }

    // Load Fees
    function loadFees() {
        const feesHtml = `
            <h2>Fee Details</h2>
            <div class="fees-container">
                <div class="fee-summary">
                    <div class="fee-card total">
                        <h3>Total Fee</h3>
                        <div class="amount">₹50,000</div>
                        <p>Per Semester</p>
                    </div>
                    <div class="fee-card paid">
                        <h3>Paid</h3>
                        <div class="amount">₹30,000</div>
                        <p>Last payment: 15 Oct 2023</p>
                    </div>
                    <div class="fee-card due">
                        <h3>Due</h3>
                        <div class="amount">₹20,000</div>
                        <p>Due date: 15 Dec 2023</p>
                    </div>
                </div>
                
                <div class="payment-history">
                    <div class="section-header">
                        <h3>Payment History</h3>
                        <button class="btn-primary" id="makePaymentBtn">Make Payment</button>
                    </div>
                    
                    <table class="payments-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction ID</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>15 Oct 2023</td>
                                <td>TXN12345678</td>
                                <td>Semester Fee (Partial)</td>
                                <td>₹30,000</td>
                                <td><span class="status-badge success">Paid</span></td>
                            </tr>
                            <tr>
                                <td>15 Jul 2023</td>
                                <td>TXN12345677</td>
                                <td>Semester Fee</td>
                                <td>₹50,000</td>
                                <td><span class="status-badge success">Paid</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.querySelector('.main-content').innerHTML = feesHtml;
        
        // Add click handler for Make Payment button
        document.getElementById('makePaymentBtn')?.addEventListener('click', showPaymentForm);
    }

    // Initialize the application
    init();
});
