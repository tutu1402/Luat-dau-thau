// Chờ DOM tải xong
document.addEventListener('DOMContentLoaded', () => {

    // --- Biến toàn cục ---
    // 'allQuestions' SẼ ĐƯỢC TẢI TỪ TỆP data.js
    let currentQuestions = []; 
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let score = 0;
    let timerInterval;
    let totalTimeTaken = 0; // Đếm thời gian thi (giây)
    let isExamMode = false;

    // Biến lưu trữ chế độ thi cuối cùng
    let lastExamCount = 70;
    let lastExamTime = 60 * 60; // Mặc định là 70 câu, 60 phút
    
    // --- Lấy các phần tử DOM ---
    const modeSelection = document.getElementById('mode-selection');
    const quizContainer = document.getElementById('quiz-container');
    const resultsContainer = document.getElementById('results-container');

    const startLearnSequentialBtn = document.getElementById('start-learn-sequential-btn');
    const startLearnRandomBtn = document.getElementById('start-learn-random-btn');
    const startExam70Btn = document.getElementById('start-exam-70-btn');
    const startExam10Btn = document.getElementById('start-exam-10-btn');

    const backToMenuBtn = document.getElementById('back-to-menu-btn'); 
    const quizModeTitle = document.getElementById('quiz-mode-title');
    const timerContainer = document.getElementById('timer-container');
    const timerEl = document.getElementById('timer');
    const currentQNumEl = document.getElementById('current-q-num');
    const totalQNumEl = document.getElementById('total-q-num');
    
    const headerSubmitBtn = document.getElementById('header-submit-btn');
    const questionMatrix = document.getElementById('question-matrix');
    
    const quizSettings = document.getElementById('quiz-settings');
    const autoAdvanceCheck = document.getElementById('auto-advance-check');

    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackText = document.getElementById('feedback-text');

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    const timeTakenEl = document.getElementById('time-taken');
    const correctCountEl = document.getElementById('correct-count');
    const incorrectCountEl = document.getElementById('incorrect-count');
    const unansweredCountEl = document.getElementById('unanswered-count');
    const classificationTextEl = document.getElementById('classification-text');
    const scorePercentEl = document.getElementById('score-percent');
    
    const restartBtn = document.getElementById('restart-btn');
    const reviewBtn = document.getElementById('review-btn');
    const reviewSection = document.getElementById('review-section');
    const reviewMatrix = document.getElementById('review-matrix');
    
    const backToMenuBtnResults = document.getElementById('back-to-menu-btn-results');

    // === THÊM MỚI: 3 NÚT Ở CUỐI TRANG REVIEW ===
    const scrollTopBtn = document.getElementById('scroll-to-top-btn');
    const restartBtnBottom = document.getElementById('restart-btn-bottom');
    const backToMenuBtnBottom = document.getElementById('back-to-menu-btn-bottom');

    // --- Hàm khởi tạo ---
    function initializeApp() {
        if (typeof allQuestions === 'undefined' || allQuestions.length === 0) {
            document.getElementById('app-container').innerHTML = '<p style="color: red; padding: 20px;">LỖI: Không tìm thấy dữ liệu câu hỏi. Hãy đảm bảo tệp `data.js` đã được tải và được tải TRƯỚC tệp `app.js` trong HTML.</p>';
            return; 
        }
        setupEventListeners();
    }

    // --- Thiết lập sự kiện ---
    function setupEventListeners() {
        startLearnSequentialBtn.addEventListener('click', startLearnSequentialMode);
        startLearnRandomBtn.addEventListener('click', startLearnRandomMode);
        startExam70Btn.addEventListener('click', () => startExamMode(70, 60 * 60)); // 70 câu, 60 phút
        startExam10Btn.addEventListener('click', () => startExamMode(10, 10 * 60)); // 10 câu, 10 phút

        prevBtn.addEventListener('click', showPreviousQuestion);
        nextBtn.addEventListener('click', showNextQuestion);
        headerSubmitBtn.addEventListener('click', confirmSubmitExam);
        
        restartBtn.addEventListener('click', () => {
            startExamMode(lastExamCount, lastExamTime);
        }); 
        
        reviewBtn.addEventListener('click', () => {
            reviewSection.classList.toggle('hidden');
            reviewMatrix.classList.toggle('hidden'); 
        });
        
        backToMenuBtn.addEventListener('click', resetToModeSelection);
        
        backToMenuBtnResults.addEventListener('click', resetToModeSelection);

        // === THÊM MỚI: SỰ KIỆN CHO 3 NÚT MỚI ===
        scrollTopBtn.addEventListener('click', () => {
            // Cuộn lên đầu trang (hoặc đầu #app-container)
            document.getElementById('app-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        restartBtnBottom.addEventListener('click', () => {
            // Mô phỏng lại hành động nhấn nút "Thi lại" ở trên
            restartBtn.click();
        });
        backToMenuBtnBottom.addEventListener('click', () => {
            // Mô phỏng lại hành động nhấn nút "Quay về Menu" ở trên
            backToMenuBtnResults.click();
        });
        // === KẾT THÚC THÊM MỚI ===
    }

    // --- Các hàm Chế độ ---

    // Chế độ 1: Học theo thứ tự
    function startLearnSequentialMode() {
        isExamMode = false;
        currentQuestions = [...allQuestions]; // Không xáo trộn
        currentQuestionIndex = 0;
        
        modeSelection.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        
        backToMenuBtn.classList.remove('hidden'); 
        questionMatrix.classList.add('hidden'); 
        headerSubmitBtn.classList.add('hidden'); 
        quizSettings.classList.add('hidden'); 
        
        quizModeTitle.innerText = "HỌC THEO THỨ TỰ"; 
        timerContainer.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        prevBtn.classList.remove('hidden'); 

        displayQuestion();
    }

    // Chế độ 2: Học ngẫu nhiên
    function startLearnRandomMode() {
        isExamMode = false;
        currentQuestions = shuffleArray(allQuestions); // Xáo trộn
        currentQuestionIndex = 0;
        
        modeSelection.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        
        backToMenuBtn.classList.remove('hidden'); 
        questionMatrix.classList.add('hidden'); 
        headerSubmitBtn.classList.add('hidden'); 
        quizSettings.classList.add('hidden'); 
        
        quizModeTitle.innerText = "LUYỆN TẬP NGẪU NHIÊN"; 
        timerContainer.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        prevBtn.classList.remove('hidden'); 

        displayQuestion();
    }

    // Hàm Thi (chung)
    function startExamMode(questionCount, timeInSeconds) {
        isExamMode = true;
        
        lastExamCount = questionCount;
        lastExamTime = timeInSeconds;

        let examQuestionPool = shuffleArray(allQuestions);
        if (examQuestionPool.length >= questionCount) {
             currentQuestions = examQuestionPool.slice(0, questionCount);
        } else {
             currentQuestions = examQuestionPool; 
        }
        
        currentQuestionIndex = 0;
        score = 0; 
        totalTimeTaken = 0; 
        userAnswers = new Array(currentQuestions.length).fill(null);

        modeSelection.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        
        backToMenuBtn.classList.add('hidden'); 
        questionMatrix.classList.remove('hidden'); 
        headerSubmitBtn.classList.remove('hidden'); 
        quizSettings.classList.remove('hidden'); 
        
        quizModeTitle.innerText = `THI ${questionCount} CÂU`; 
        timerContainer.classList.remove('hidden');
        timerEl.innerText = `${String(Math.floor(timeInSeconds / 60)).padStart(2, '0')}:00`;
        nextBtn.classList.remove('hidden');

        startTimer(timeInSeconds);
        displayQuestion(); 
    }

    // --- Vẽ ma trận (Khi thi) ---
    function renderMatrix() {
        questionMatrix.innerHTML = ''; 
        for (let i = 0; i < currentQuestions.length; i++) {
            const box = document.createElement('div');
            box.className = 'matrix-box';
            box.innerText = (i + 1); 

            if (userAnswers[i] !== null) {
                box.classList.add('answered');
            }
            if (i === currentQuestionIndex) {
                box.classList.add('current');
            }

            box.addEventListener('click', () => jumpToQuestion(i));
            questionMatrix.appendChild(box);
        }
    }

    // --- Nhảy câu (Khi thi) ---
    function jumpToQuestion(index) {
        if (index >= 0 && index < currentQuestions.length) {
            currentQuestionIndex = index;
            displayQuestion();
        }
    }

    // --- Hiển thị câu hỏi ---
    function displayQuestion() {
        feedbackContainer.classList.add('hidden');
        const question = currentQuestions[currentQuestionIndex];
        
        if (!question) {
            console.error("Lỗi: Không tìm thấy câu hỏi ở chỉ số", currentQuestionIndex);
            return;
        }

        questionText.innerText = `Câu ${currentQuestionIndex + 1}: ${question.question}`;
        optionsContainer.innerHTML = '';

        currentQNumEl.innerText = currentQuestionIndex + 1;
        totalQNumEl.innerText = currentQuestions.length;

        if (typeof question.options !== 'object' || question.options === null) {
            console.error("Lỗi: Cấu trúc 'options' không hợp lệ cho câu hỏi:", question);
            return;
        }

        for (const [key, value] of Object.entries(question.options)) {
            const button = document.createElement('button');
            button.className = 'option-btn';
            
            button.innerHTML = `<strong>${key}.</strong> ${value}`; 
            
            button.dataset.key = key; 

            if (isExamMode && userAnswers[currentQuestionIndex] === key) {
                button.classList.add('selected');
            }

            button.addEventListener('click', () => handleAnswer(key, button));
            optionsContainer.appendChild(button);
        }
        
        if (isExamMode) {
            renderMatrix(); 
        }
        updateNavigationButtons();
    }

    // --- Xử lý trả lời ---
    function handleAnswer(selectedKey, buttonEl) {
        const question = currentQuestions[currentQuestionIndex];
        const correctKey = question.answer;

        if (isExamMode) {
            userAnswers[currentQuestionIndex] = selectedKey;
            document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
            buttonEl.classList.add('selected');
            renderMatrix(); 

            if (autoAdvanceCheck.checked) {
                setTimeout(() => {
                    if(currentQuestionIndex < currentQuestions.length - 1) {
                        showNextQuestion();
                    }
                }, 200); 
            }

        } else {
            // Chế độ Học
            optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
                btn.disabled = true;
            });

            if (selectedKey === correctKey) {
                buttonEl.classList.add('correct');
            } else {
                buttonEl.classList.add('incorrect');
                const correctButton = optionsContainer.querySelector(`[data-key="${correctKey}"]`);
                if (correctButton) {
                    correctButton.classList.add('correct');
                }
            }

            feedbackText.innerHTML = question.explanation; 
            feedbackContainer.classList.remove('hidden');
        }
    }

    // --- Điều hướng câu hỏi ---
    function showPreviousQuestion() {
        if (isExamMode) {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                displayQuestion();
            }
        } else {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
            } else {
                currentQuestionIndex = currentQuestions.length - 1; 
            }
            displayQuestion();
        }
    }

    function showNextQuestion() {
        if (isExamMode) {
            if (currentQuestionIndex < currentQuestions.length - 1) {
                currentQuestionIndex++;
                displayQuestion();
            }
        } else {
            if (currentQuestionIndex < currentQuestions.length - 1) {
                currentQuestionIndex++;
            } else {
                currentQuestionIndex = 0; 
            }
            displayQuestion();
        }
    }

    function updateNavigationButtons() {
        if (isExamMode) {
            prevBtn.classList.toggle('hidden', currentQuestionIndex === 0);
            nextBtn.classList.toggle('hidden', currentQuestionIndex === currentQuestions.length - 1);
        } else {
            prevBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
            nextBtn.innerText = "Câu tiếp theo";
        }
    }

    // --- Hẹn giờ Thi thử ---
    function startTimer(duration) {
        let timeLeft = duration;
        totalTimeTaken = 0; 
        clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            timeLeft--;
            totalTimeTaken++; 

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerEl.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            if (timeLeft < 0) {
                clearInterval(timerInterval);
                alert("Đã hết thời gian làm bài!");
                submitExam();
            }
        }, 1000);
    }
    
    // --- Xác nhận nộp bài ---
    function confirmSubmitExam() {
        const unansweredCount = userAnswers.filter(ans => ans === null).length;
        if (unansweredCount > 0) {
            if (!confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài không?`)) {
                return; 
            }
        } else {
            if (!confirm("Bạn có chắc chắn muốn nộp bài?")) {
                return; 
            }
        }
        submitExam();
    }

    // --- Nộp bài & Hiển thị Kết quả ---
    function submitExam() {
        clearInterval(timerInterval);
        
        score = 0;
        let unansweredCount = 0;
        for (let i = 0; i < currentQuestions.length; i++) {
            if (userAnswers[i] === currentQuestions[i].answer) {
                score++;
            } else if (userAnswers[i] === null) {
                unansweredCount++;
            }
        }
        
        let incorrectCount = currentQuestions.length - score - unansweredCount;
        let percentage = (score / currentQuestions.length) * 100;
        let scoreDisplay = (percentage).toFixed(0); 

        const minutesTaken = Math.floor(totalTimeTaken / 60);
        const secondsTaken = totalTimeTaken % 60;
        
        let classification = "";
        let classificationColor = "#0d47a1"; 
        
        if (percentage > 90) { 
            classification = "Xuất sắc";
            classificationColor = "#2e7d32"; 
        } else if (percentage >= 80) { 
            classification = "Giỏi";
            classificationColor = "#0d47a1"; 
        } else if (percentage >= 60) { 
            classification = "Khá";
            classificationColor = "#f57f17"; 
        } else if (percentage >= 50) { 
            classification = "Trung bình";
            classificationColor = "#555"; 
        } else { 
            classification = "Không đạt yêu cầu";
            classificationColor = "#c62828"; 
        }

        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        reviewSection.classList.add('hidden'); 
        
        // ======================================
        // === SỬA LỖI Ở ĐÂY ===
        // Thay vì xóa innerHTML, chỉ xóa các '.review-item' cũ
        const oldItems = reviewSection.querySelectorAll('.review-item');
        oldItems.forEach(item => item.remove());
        // ======================================
        
        reviewBtn.classList.remove('hidden');
        restartBtn.innerText = "Thi lại";
        backToMenuBtnResults.classList.remove('hidden'); 

        timeTakenEl.innerText = `${minutesTaken} phút ${secondsTaken} giây`;
        correctCountEl.innerText = score;
        incorrectCountEl.innerText = incorrectCount;
        unansweredCountEl.innerText = unansweredCount;
        scorePercentEl.innerText = scoreDisplay; 
        classificationTextEl.innerText = classification; 
        classificationTextEl.style.color = classificationColor; 

        generateReviewMatrix(); 
        generateReviewContent(); 
    }

    // --- Vẽ ma trận kết quả ---
    function generateReviewMatrix() {
        reviewMatrix.innerHTML = ''; 
        reviewMatrix.classList.remove('hidden'); 

        currentQuestions.forEach((q, index) => {
            const box = document.createElement('div');
            box.className = 'review-box';
            
            box.innerText = (index + 1); 
            
            const userAnsKey = userAnswers[index];
            const correctAnsKey = q.answer;

            if (userAnsKey === null) {
                box.classList.add('unanswered'); 
            } else if (userAnsKey === correctAnsKey) {
                box.classList.add('correct'); 
            } else {
                box.classList.add('incorrect'); 
            }
            
            box.addEventListener('click', () => jumpToReviewItem(index));
            reviewMatrix.appendChild(box);
        });
    }
    
    // --- Nhảy đến câu review ---
    function jumpToReviewItem(index) {
        reviewSection.classList.remove('hidden');
        
        const targetElement = document.getElementById(`review-item-${index}`);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            targetElement.style.transition = 'none';
            targetElement.style.backgroundColor = '#fffde7'; 
            setTimeout(() => {
                targetElement.style.transition = 'background-color 0.5s ease';
                targetElement.style.backgroundColor = ''; 
            }, 500); 
        }
    }

    // --- Hiển thị Review ---
    function generateReviewContent() {
        // Lấy footer ra (nó đã có sẵn trong HTML)
        const footerNav = document.querySelector('.review-footer-nav');
        
        currentQuestions.forEach((q, index) => {
            const item = document.createElement('div');
            item.className = 'review-item';
            item.id = `review-item-${index}`; 
            
            const userAnsKey = userAnswers[index]; 
            const correctAnsKey = q.answer;
            const isCorrect = userAnsKey === correctAnsKey;

            if (userAnsKey === null) {
                item.classList.add('review-unanswered'); 
            } else if (isCorrect) {
                item.classList.add('review-correct'); 
            } else {
                item.classList.add('review-incorrect'); 
            }

            let optionsHtml = '';
            for (const [key, value] of Object.entries(q.options)) {
                let classType = '';
                if (key === correctAnsKey) {
                    classType = 'correct'; 
                } else if (key === userAnsKey && !isCorrect) {
                    classType = 'user-wrong'; 
                }
                
                optionsHtml += `<div class="review-answer ${classType}"><strong>${key}.</strong> ${value}</div>`;
            }

            let questionTitle = `<strong>Câu ${index + 1}:</strong> ${q.question}`;
            if (userAnsKey === null) {
                questionTitle += ` <strong style="color: #c62828;">(Chưa trả lời)</strong>`;
            }

            item.innerHTML = `
                <p>${questionTitle}</p>
                ${optionsHtml}
                <hr class="review-explanation-hr">
                <div class="feedback-container" style="display:block; border-color: #fbc02d; background-color: #fffde7;"><strong>Giải thích:</strong> ${q.explanation || 'Không có giải thích.'}
                </div>
            `;
            // Thêm item VÀO TRƯỚC footer
            reviewSection.insertBefore(item, footerNav);
        });
    }

    function resetToModeSelection() {
        resultsContainer.classList.add('hidden');
        quizContainer.classList.add('hidden');
        modeSelection.classList.remove('hidden');
        
        backToMenuBtn.classList.add('hidden'); 
        questionMatrix.classList.add('hidden');
        headerSubmitBtn.classList.add('hidden');
        quizSettings.classList.add('hidden');
        reviewMatrix.classList.add('hidden'); 
        backToMenuBtnResults.classList.add('hidden'); 

        clearInterval(timerInterval);
    }

    // --- Hàm tiện ích (Xáo trộn mảng) ---
    function shuffleArray(array) {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }

    // --- Khởi chạy ứng dụng ---
    initializeApp();

});

