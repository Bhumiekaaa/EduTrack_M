document.addEventListener('DOMContentLoaded', function() {
    // Comprehensive dummy data for quick links
    const quickLinksData = {
        studyMaterials: [
            { 
                name: 'Mathematics - Calculus I Notes.pdf', 
                type: 'PDF', 
                size: '4.2 MB',
                subject: 'Mathematics',
                uploaded: '2 days ago',
                author: 'Prof. Sharma'
            },
            { 
                name: 'Physics - Thermodynamics Lab Manual.pdf', 
                type: 'PDF', 
                size: '3.8 MB',
                subject: 'Physics',
                uploaded: '1 week ago',
                author: 'Dr. Patel'
            },
            { 
                name: 'Chemistry - Organic Reactions.pptx', 
                type: 'PPTX', 
                size: '5.1 MB',
                subject: 'Chemistry',
                uploaded: '3 days ago',
                author: 'Dr. Gupta'
            },
            { 
                name: 'DSA - Sorting Algorithms.pdf', 
                type: 'PDF', 
                size: '2.7 MB',
                subject: 'Data Structures',
                uploaded: '5 days ago',
                author: 'Prof. Kumar'
            },
            { 
                name: 'English - Writing Skills Guide.docx', 
                type: 'DOCX', 
                size: '1.9 MB',
                subject: 'English',
                uploaded: '1 week ago',
                author: 'Prof. Johnson'
            }
        ],
        timetable: [
            { 
                time: '09:00 - 10:00', 
                mon: { subject: 'Mathematics', room: 'B-201', teacher: 'Prof. Sharma' },
                tue: { subject: 'Physics', room: 'Lab-3', teacher: 'Dr. Patel' },
                wed: { subject: 'Mathematics', room: 'B-201', teacher: 'Prof. Sharma' },
                thu: { subject: 'Chemistry', room: 'Lab-2', teacher: 'Dr. Gupta' },
                fri: { subject: 'English', room: 'A-105', teacher: 'Prof. Johnson' }
            },
            { 
                time: '10:00 - 11:00',
                mon: { subject: 'Physics', room: 'Lab-3', teacher: 'Dr. Patel' },
                tue: { subject: 'Chemistry', room: 'Lab-2', teacher: 'Dr. Gupta' },
                wed: { subject: 'Data Structures', room: 'C-301', teacher: 'Prof. Kumar' },
                thu: { subject: 'Mathematics', room: 'B-201', teacher: 'Prof. Sharma' },
                fri: { subject: 'Physics', room: 'Lab-3', teacher: 'Dr. Patel' }
            },
            { 
                time: '11:30 - 12:30',
                mon: { subject: 'Chemistry', room: 'Lab-2', teacher: 'Dr. Gupta' },
                tue: { subject: 'Data Structures', room: 'C-301', teacher: 'Prof. Kumar' },
                wed: { subject: 'Physics', room: 'Lab-3', teacher: 'Dr. Patel' },
                thu: { subject: 'English', room: 'A-105', teacher: 'Prof. Johnson' },
                fri: { subject: 'Mathematics', room: 'B-201', teacher: 'Prof. Sharma' }
            },
            { 
                time: '13:30 - 14:30',
                mon: { subject: 'English', room: 'A-105', teacher: 'Prof. Johnson' },
                tue: { subject: 'Mathematics', room: 'B-201', teacher: 'Prof. Sharma' },
                wed: { subject: 'Chemistry', room: 'Lab-2', teacher: 'Dr. Gupta' },
                thu: { subject: 'Data Structures', room: 'C-301', teacher: 'Prof. Kumar' },
                fri: { subject: 'Chemistry', room: 'Lab-2', teacher: 'Dr. Gupta' }
            }
        ],
        doubts: [
            {
                id: 1,
                subject: 'Mathematics',
                question: 'I\'m having trouble understanding integration by parts. Can you explain with an example?',
                status: 'Answered',
                date: '2023-11-04',
                answer: 'Integration by parts is based on the formula: ∫u dv = uv - ∫v du. Let me show you with an example: ∫x·eˣ dx. Let u = x (so du = dx) and dv = eˣ dx (so v = eˣ). Then ∫x·eˣ dx = x·eˣ - ∫eˣ dx = x·eˣ - eˣ + C = eˣ(x - 1) + C.'
            },
            {
                id: 2,
                subject: 'Physics',
                question: 'What is the difference between heat and temperature?',
                status: 'Pending',
                date: '2023-11-05',
                answer: ''
            },
            {
                id: 3,
                subject: 'Chemistry',
                question: 'How do I balance this redox reaction: KMnO₄ + HCl → KCl + MnCl₂ + H₂O + Cl₂?',
                status: 'Answered',
                date: '2023-11-03',
                answer: 'The balanced equation is: 2KMnO₄ + 16HCl → 2KCl + 2MnCl₂ + 8H₂O + 5Cl₂. Remember to balance the atoms and charges in both half-reactions.'
            }
        ],
        feePayments: [
            {
                id: 'FEE20231101',
                date: '2023-11-01',
                amount: 25000,
                status: 'Paid',
                dueDate: '2023-11-01',
                items: [
                    { name: 'Tuition Fee', amount: 20000 },
                    { name: 'Library Fee', amount: 2000 },
                    { name: 'Lab Fee', amount: 2000 },
                    { name: 'Sports Fee', amount: 1000 }
                ]
            },
            {
                id: 'FEE20231201',
                date: null,
                amount: 25000,
                status: 'Pending',
                dueDate: '2023-12-01',
                items: [
                    { name: 'Tuition Fee', amount: 20000 },
                    { name: 'Library Fee', amount: 2000 },
                    { name: 'Lab Fee', amount: 2000 },
                    { name: 'Sports Fee', amount: 1000 }
                ]
            },
            {
                id: 'FEE20240101',
                date: null,
                amount: 25000,
                status: 'Upcoming',
                dueDate: '2024-01-01',
                items: [
                    { name: 'Tuition Fee', amount: 20000 },
                    { name: 'Library Fee', amount: 2000 },
                    { name: 'Lab Fee', amount: 2000 },
                    { name: 'Sports Fee', amount: 1000 }
                ]
            }
        ]
    };

    // Initialize the application
    function init() {
        setupNavigation();
        setupQuickLinks();
        setupAttendanceCard();
        setupViewAllButtons();
    }

    // Set up navigation
    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                // Add active class to clicked item
                this.classList.add('active');
                
                // Get the target page from the span text
                const target = this.querySelector('span').textContent.toLowerCase();
                
                // In a real app, you would load the appropriate content here
                console.log(`Navigating to: ${target}`);
                
                // Show a toast notification
                showToast(`Loading ${target}...`);
            });
        });
    }

    // Set up quick links functionality
    function setupQuickLinks() {
        // Add click handlers to quick links
        document.addEventListener('click', function(e) {
            const quickLink = e.target.closest('.quick-link');
            if (!quickLink) return;
            
            const linkType = quickLink.getAttribute('data-link');
            if (!linkType) return;
            
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
        });
    }

    // Set up attendance card flip
    function setupAttendanceCard() {
        const attendanceCard = document.querySelector('.attendance-card');
        if (!attendanceCard) return;
        
        // Add click handler for attendance card
        attendanceCard.addEventListener('click', function() {
            this.classList.toggle('flipped');
            
            if (this.classList.contains('flipped')) {
                showAttendanceDetails();
            } else {
                showAttendanceSummary();
            }
        });
        
        // Initialize with summary view
        showAttendanceSummary();
    }

    // Set up view all buttons
    function setupViewAllButtons() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('view-all-btn')) {
                const section = e.target.closest('.card')?.querySelector('h3')?.textContent || 'section';
                showToast(`No more items in ${section.toLowerCase()}`);
            }
        });
    }

    // Show attendance summary (front of card)
    function showAttendanceSummary() {
        const attendanceCard = document.querySelector('.attendance-card');
        if (!attendanceCard) return;
        
        attendanceCard.innerHTML = `
            <div class="card-front">
                <h3>Overall Attendance</h3>
                <div class="attendance-percentage">84%</div>
                <p>Click to view details</p>
            </div>
        `;
    }

    // Show attendance details (back of card)
    function showAttendanceDetails() {
        const attendanceCard = document.querySelector('.attendance-card');
        if (!attendanceCard) return;
        
        const subjects = [
            { subject: 'DSA', attended: 18, total: 20, percentage: 90 },
            { subject: 'Mathematics', attended: 15, total: 20, percentage: 75 },
            { subject: 'Physics', attended: 19, total: 20, percentage: 95 },
            { subject: 'Software Engineering', attended: 17, total: 20, percentage: 85 },
            { subject: 'Chemistry', attended: 16, total: 20, percentage: 80 },
            { subject: 'Communication Skills', attended: 20, total: 20, percentage: 100 }
        ];
        
        let detailsHtml = '<div class="card-back">';
        detailsHtml += '<h3>Attendance by Subject</h3>';
        detailsHtml += '<div class="attendance-details">';
        
        subjects.forEach(subj => {
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
        attendanceCard.innerHTML = detailsHtml;
    }

    // Show Study Materials modal
    function showStudyMaterials() {
        const modal = createModal('Study Materials');
        let content = `
            <div class="materials-actions">
                <div class="search-box">
                    <input type="text" placeholder="Search materials...">
                    <i class="ri-search-line"></i>
                </div>
                <div class="filter-options">
                    <select>
                        <option value="all">All Subjects</option>
                        <option value="math">Mathematics</option>
                        <option value="physics">Physics</option>
                        <option value="chemistry">Chemistry</option>
                        <option value="dsa">Data Structures</option>
                        <option value="english">English</option>
                    </select>
                    <select>
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest</option>
                        <option value="name">Name (A-Z)</option>
                    </select>
                </div>
            </div>
            <div class="materials-list">
        `;
        
        quickLinksData.studyMaterials.forEach(item => {
            content += `
                <div class="material-item">
                    <div class="material-icon" title="${item.type} file">${item.type}</div>
                    <div class="material-info">
                        <div class="material-name" title="${item.name}">${item.name}</div>
                        <div class="material-meta">
                            <span>${item.subject}</span>
                            <span>•</span>
                            <span>${item.size}</span>
                            <span>•</span>
                            <span>${item.uploaded}</span>
                            <span>•</span>
                            <span>${item.author}</span>
                        </div>
                    </div>
                    <button class="btn-download" title="Download ${item.name}">
                        <i class="ri-download-line"></i>
                    </button>
                </div>
            `;
        });
        
        content += '</div>';
        modal.querySelector('.modal-body').innerHTML = content;
        
        // Add download button handlers
        modal.querySelectorAll('.btn-download').forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const material = quickLinksData.studyMaterials[index];
                showToast(`Downloading ${material.name}...`, 'info');
                // Simulate download delay
                setTimeout(() => {
                    showToast(`${material.name} downloaded successfully!`, 'success');
                }, 1500);
            });
        });
        
        showModal(modal);
    }

    // Show Doubt Form modal with existing doubts
    function showDoubtForm() {
        const modal = createModal('Ask a Doubt');
        
        // Create tabs for new doubt and doubt history
        const content = `
            <div class="doubt-tabs">
                <button class="tab-btn active" data-tab="new-doubt">Ask New Doubt</button>
                <button class="tab-btn" data-tab="doubt-history">My Doubts (${quickLinksData.doubts.length})</button>
            </div>
            <div class="tab-content">
                <div id="new-doubt" class="tab-pane active">
                    <form id="doubtForm" class="doubt-form">
                        <div class="form-group">
                            <label for="subject">Subject</label>
                            <select id="subject" required>
                                <option value="">Select Subject</option>
                                <option value="math">Mathematics</option>
                                <option value="physics">Physics</option>
                                <option value="chemistry">Chemistry</option>
                                <option value="dsa">Data Structures</option>
                                <option value="english">English</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="question">Your Question</label>
                            <textarea id="question" rows="4" required placeholder="Type your question here..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="attachment">Attachment (Optional)</label>
                            <div class="file-upload">
                                <input type="file" id="attachment">
                                <label for="attachment" class="file-upload-label">
                                    <i class="ri-upload-line"></i> Choose File
                                </label>
                                <span class="file-name">No file chosen</span>
                            </div>
                        </div>
                        <button type="submit" class="btn-submit">
                            <i class="ri-send-plane-line"></i> Submit Doubt
                        </button>
                    </form>
                </div>
                <div id="doubt-history" class="tab-pane">
                    <div class="doubts-list">
                        ${quickLinksData.doubts.map(doubt => `
                            <div class="doubt-item ${doubt.status.toLowerCase()}">
                                <div class="doubt-header">
                                    <span class="doubt-subject">${doubt.subject}</span>
                                    <span class="doubt-status ${doubt.status.toLowerCase()}">${doubt.status}</span>
                                    <span class="doubt-date">${formatDate(doubt.date)}</span>
                                </div>
                                <div class="doubt-question">${doubt.question}</div>
                                ${doubt.answer ? `
                                    <div class="doubt-answer">
                                        <div class="answer-label">Teacher's Response:</div>
                                        <div class="answer-text">${doubt.answer}</div>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-body').innerHTML = content;
        
        // Add tab switching functionality
        const tabs = modal.querySelectorAll('.tab-btn');
        const panes = modal.querySelectorAll('.tab-pane');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and panes
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding pane
                tab.classList.add('active');
                const tabId = tab.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // Add file input handler
        const fileInput = modal.querySelector('#attachment');
        const fileName = modal.querySelector('.file-name');
        
        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;
            } else {
                fileName.textContent = 'No file chosen';
            }
        });
        
        // Add form submission handler
        modal.querySelector('#doubtForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const subject = this.querySelector('#subject').value;
            const question = this.querySelector('#question').value;
            
            // Add to doubts list
            const newDoubt = {
                id: quickLinksData.doubts.length + 1,
                subject: document.querySelector(`#subject option[value="${subject}"]`).text,
                question: question,
                status: 'Pending',
                date: new Date().toISOString().split('T')[0],
                answer: ''
            };
            
            quickLinksData.doubts.unshift(newDoubt);
            
            // Update the doubts count in the tab
            const doubtsTab = modal.querySelector('[data-tab="doubt-history"]');
            if (doubtsTab) {
                doubtsTab.textContent = `My Doubts (${quickLinksData.doubts.length})`;
            }
            
            // Show success message and reset form
            showToast('Your doubt has been submitted successfully!', 'success');
            this.reset();
            fileName.textContent = 'No file chosen';
            
            // Switch to doubts tab
            const doubtsPane = modal.querySelector('#doubt-history');
            if (doubtsPane) {
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                
                modal.querySelector('[data-tab="doubt-history"]').classList.add('active');
                doubtsPane.classList.add('active');
            }
        });
        
        showModal(modal);
    }

    // Show Timetable modal with enhanced view
    function showTimetable() {
        const modal = createModal('Class Timetable');
        
        // Add week selector
        const currentDate = new Date();
        const options = { month: 'long', year: 'numeric' };
        const currentMonth = currentDate.toLocaleDateString('en-US', options);
        
        let content = `
            <div class="timetable-header">
                <div class="month-selector">
                    <button class="btn-icon" id="prev-month"><i class="ri-arrow-left-s-line"></i></button>
                    <h3>${currentMonth}</h3>
                    <button class="btn-icon" id="next-month"><i class="ri-arrow-right-s-line"></i></button>
                </div>
                <div class="view-options">
                    <button class="view-option active" data-view="weekly">Weekly</button>
                    <button class="view-option" data-view="daily">Daily</button>
                </div>
            </div>
            <div class="timetable-container">
                <table class="timetable">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Mon</th>
                            <th>Tue</th>
                            <th>Wed</th>
                            <th>Thu</th>
                            <th>Fri</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        quickLinksData.timetable.forEach(row => {
            content += `
                <tr>
                    <td class="time-slot">${row.time}</td>
                    ${['mon', 'tue', 'wed', 'thu', 'fri'].map(day => {
                        const cls = row[day];
                        return `
                            <td class="class-slot ${cls ? 'has-class' : 'free-slot'}" 
                                data-subject="${cls?.subject || ''}"
                                data-teacher="${cls?.teacher || ''}"
                                data-room="${cls?.room || ''}">
                                ${cls ? `
                                    <div class="class-subject">${cls.subject}</div>
                                    <div class="class-details">
                                        <span class="class-room"><i class="ri-map-pin-line"></i> ${cls.room}</span>
                                        <span class="class-teacher"><i class="ri-user-line"></i> ${cls.teacher}</span>
                                    </div>
                                ` : 'Free'}
                            </td>
                        `;
                    }).join('')}
                </tr>
            `;
        });
        
        content += `
                    </tbody>
                </table>
            </div>
            <div class="timetable-legend">
                <div class="legend-item">
                    <span class="legend-color has-class"></span>
                    <span>Class</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color free-slot"></span>
                    <span>Free Period</span>
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-body').innerHTML = content;
        
        // Add event listeners for view options
        const viewOptions = modal.querySelectorAll('.view-option');
        viewOptions.forEach(option => {
            option.addEventListener('click', () => {
                viewOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                // In a real app, you would switch between weekly and daily views here
            });
        });
        
        // Add month navigation
        const prevMonthBtn = modal.querySelector('#prev-month');
        const nextMonthBtn = modal.querySelector('#next-month');
        const monthTitle = modal.querySelector('.month-selector h3');
        
        let currentMonthIndex = currentDate.getMonth();
        
        function updateMonthDisplay() {
            const date = new Date();
            date.setMonth(currentMonthIndex);
            monthTitle.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        
        prevMonthBtn?.addEventListener('click', () => {
            currentMonthIndex--;
            if (currentMonthIndex < 0) currentMonthIndex = 11;
            updateMonthDisplay();
        });
        
        nextMonthBtn?.addEventListener('click', () => {
            currentMonthIndex++;
            if (currentMonthIndex > 11) currentMonthIndex = 0;
            updateMonthDisplay();
        });
        
        // Add class slot click handler
        modal.querySelectorAll('.class-slot.has-class').forEach(slot => {
            slot.addEventListener('click', () => {
                const subject = slot.getAttribute('data-subject');
                const teacher = slot.getAttribute('data-teacher');
                const room = slot.getAttribute('data-room');
                
                // Show class details in a toast
                showToast(`<strong>${subject}</strong><br>${teacher} • ${room}`, 'info');
            });
        });
        
        showModal(modal);
    }

    // Show Payment Form modal with fee history
    function showPaymentForm() {
        const modal = createModal('Fee Payment');
        
        // Get current fee payment (first pending or upcoming)
        const currentFee = window.quickLinksData.feePayments.find(fee => fee.status === 'Pending' || fee.status === 'Upcoming');
        const feeHistory = window.quickLinksData.feePayments.filter(fee => fee.status === 'Paid');
        
        // Format date for display
        function formatDate(dateStr) {
            if (!dateStr) return '';
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateStr).toLocaleDateString('en-US', options);
        }
        
        // Format currency
        function formatCurrency(amount) {
            if (typeof amount !== 'number') return '₹0';
            return '₹' + amount.toLocaleString('en-IN', { 
                maximumFractionDigits: 0,
                minimumFractionDigits: 0 
            });
        }
        
        let content = `
            <div class="payment-tabs">
                <button class="tab-btn active" data-tab="make-payment">Make Payment</button>
                <button class="tab-btn" data-tab="payment-history">Payment History</button>
            </div>
            <div class="tab-content">
                <div id="make-payment" class="tab-pane active">
                    <div class="payment-info">
                        <div class="payment-summary">
                            <h4>Payment Summary</h4>
                            ${currentFee ? `
                                ${currentFee.items.map(item => `
                                    <div class="payment-row">
                                        <span>${item.name}</span>
                                        <span>${formatCurrency(item.amount)}</span>
                                    </div>
                                `).join('')}
                                <div class="payment-row total">
                                    <span>Total Amount Due</span>
                                    <span>${formatCurrency(currentFee.amount)}</span>
                                </div>
                                <div class="payment-due">
                                    <i class="ri-alarm-warning-line"></i>
                                    Due by: ${formatDateDisplay(currentFee.dueDate)}
                                </div>
                            ` : '<p>No pending payments at this time.</p>'}
                        </div>
                        
                        ${currentFee ? `
                            <form id="paymentForm" class="payment-form">
                                <h4>Payment Method</h4>
                                <div class="payment-methods">
                                    <label class="payment-method">
                                        <input type="radio" name="paymentMethod" value="credit" checked>
                                        <span><i class="ri-bank-card-line"></i> Credit/Debit Card</span>
                                    </label>
                                    <label class="payment-method">
                                        <input type="radio" name="paymentMethod" value="upi">
                                        <span><i class="ri-smartphone-line"></i> UPI</span>
                                    </label>
                                    <label class="payment-method">
                                        <input type="radio" name="paymentMethod" value="netbanking">
                                        <span><i class="ri-bank-line"></i> Net Banking</span>
                                    </label>
                                </div>
                                
                                <div id="creditCardForm" class="payment-details">
                                    <div class="form-group">
                                        <label for="cardNumber">Card Number</label>
                                        <div class="input-with-icon">
                                            <i class="ri-bank-card-line"></i>
                                            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" required>
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="expiry">Expiry Date</label>
                                            <div class="input-with-icon">
                                                <i class="ri-calendar-line"></i>
                                                <input type="text" id="expiry" placeholder="MM/YY" required>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="cvv">CVV</label>
                                            <div class="input-with-icon">
                                                <i class="ri-shield-keyhole-line"></i>
                                                <input type="text" id="cvv" placeholder="123" required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="cardName">Name on Card</label>
                                        <div class="input-with-icon">
                                            <i class="ri-user-line"></i>
                                            <input type="text" id="cardName" placeholder="John Doe" required>
                                        </div>
                                    </div>
                                </div>
                                
                                <button type="submit" class="btn-pay">
                                    <i class="ri-money-dollar-circle-line"></i>
                                    Pay ${formatCurrency(currentFee.amount)}
                                </button>
                                
                                <div class="payment-security">
                                    <i class="ri-shield-check-line"></i>
                                    Your payment is secure and encrypted
                                </div>
                            </form>
                        ` : ''}
                    </div>
                </div>
                
                <div id="payment-history" class="tab-pane">
                    <div class="payment-history">
                        ${feeHistory.length > 0 ? `
                            <div class="payment-history-list">
                                ${feeHistory.map(payment => `
                                    <div class="payment-history-item">
                                        <div class="payment-header">
                                            <div class="payment-id">#${payment.id}</div>
                                            <div class="payment-amount">${formatCurrency(payment.amount)}</div>
                                            <div class="payment-status ${payment.status.toLowerCase()}">
                                                <i class="ri-checkbox-circle-line"></i> ${payment.status}
                                            </div>
                                        </div>
                                        <div class="payment-details">
                                            <div class="payment-date">
                                                <i class="ri-calendar-line"></i>
                                                ${formatDateDisplay(payment.date)}
                                            </div>
                                            <div class="payment-method">
                                                <i class="ri-bank-card-line"></i>
                                                Credit Card •••• 4532
                                            </div>
                                            <button class="btn-receipt">
                                                <i class="ri-download-line"></i> Receipt
                                            </button>
                                        </div>
                                        <div class="payment-breakdown">
                                            ${payment.items.map(item => `
                                                <div class="breakdown-item">
                                                    <span>${item.name}</span>
                                                    <span>${formatCurrency(item.amount)}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="no-payments">
                                <i class="ri-file-list-3-line"></i>
                                <p>No payment history available</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-body').innerHTML = content;
        showModal(modal);
        
        // Add payment method toggle
        const paymentMethods = modal.querySelectorAll('input[name="paymentMethod"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', function() {
                const creditCardForm = modal.querySelector('#creditCardForm');
                if (creditCardForm) {
                    creditCardForm.style.display = this.value === 'credit' ? 'block' : 'none';
                }
            });
        });
        
        // Add form submission handler
        modal.querySelector('#paymentForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.innerHTML = `
                <div class="success-icon">✓</div>
                <h3>Payment Successful!</h3>
                <p>Your payment of ₹27,000.00 has been processed successfully.</p>
                <p>Transaction ID: TXN${Math.random().toString(36).substr(2, 10).toUpperCase()}</p>
                <button class="btn-close-modal">Close</button>
            `;
            
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = '';
            modalBody.appendChild(successMsg);
            
            // Add close button handler
            modalBody.querySelector('.btn-close-modal')?.addEventListener('click', () => closeModal());
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
        modal.querySelector('.close-modal')?.addEventListener('click', closeModal);
        
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
        const closeOnEscape = function(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }

    // Close modal
    function closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        }
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const toastContainer = document.getElementById('toast-container') || document.body;
        toastContainer.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Initialize the application
    init();
});
