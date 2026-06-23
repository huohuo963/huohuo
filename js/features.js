/* ============================================
   火火考公资料站 - 功能模块 (刷题/打卡/每日一题/计时器)
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

  // ==========================================
  // 1. QUIZ - 在线刷题
  // ==========================================
  const quizData = [
    {
      topic: '言语理解',
      question: '"宝剑锋从磨砺出，梅花香自苦寒来。" 这句话最适合用来说明什么道理？',
      options: ['成功需要天赋', '成功需要坚持不懈的努力', '环境决定一切', '运气很重要'],
      answer: 1,
      explanation: '诗句以宝剑的锋利需要磨砺、梅花的清香来自苦寒为喻，说明任何成就都需要经过艰苦的努力和磨练。'
    },
    {
      topic: '判断推理',
      question: '如果所有的鸟都会飞，企鹅是鸟，那么企鹅会飞。但事实上企鹅不会飞。这说明了什么？',
      options: [
        '所有的鸟都会飞这个前提是错误的',
        '企鹅不是鸟',
        '逻辑推理不可靠',
        '企鹅是特例'
      ],
      answer: 0,
      explanation: '这是一个典型的逻辑推理题。大前提"所有的鸟都会飞"为假（因为有企鹅、鸵鸟等不会飞的鸟），所以即使推理形式正确，结论也未必为真。'
    },
    {
      topic: '数量关系',
      question: '甲、乙两人分别从A、B两地同时出发相向而行，甲的速度是5km/h，乙的速度是3km/h，两地相距24km。他们相遇时甲走了多少千米？',
      options: ['12km', '15km', '9km', '18km'],
      answer: 1,
      explanation: '相遇时间 = 24 ÷ (5+3) = 3小时。甲走的路程 = 5 × 3 = 15km。'
    },
    {
      topic: '资料分析',
      question: '某市2025年GDP为5000亿元，较上年增长8%，则该市2024年GDP约为多少亿元？（四舍五入到整数）',
      options: ['4600亿元', '4630亿元', '4700亿元', '5400亿元'],
      answer: 1,
      explanation: '2024年GDP = 5000 ÷ (1+8%) = 5000 ÷ 1.08 ≈ 4630亿元。'
    },
    {
      topic: '常识判断',
      question: '吉林省的省会是哪个城市？',
      options: ['沈阳', '哈尔滨', '长春', '吉林市'],
      answer: 2,
      explanation: '吉林省省会是长春市。吉林市是吉林省的一个地级市，容易混淆。'
    },
    {
      topic: '言语理解',
      question: '下列成语中，与"持之以恒"意思最接近的是：',
      options: ['朝三暮四', '半途而废', '锲而不舍', '见异思迁'],
      answer: 2,
      explanation: '"锲而不舍"意为不停地雕刻，比喻坚持不懈，与"持之以恒"意思相近。"朝三暮四""见异思迁"和"半途而废"都表示不能坚持。'
    },
    {
      topic: '判断推理',
      question: '如果"所有公务员都要通过考试"，"小李是公务员"，那么可以推出：',
      options: ['小李通过了考试', '小李可能要参加考试', '有些通过考试的是公务员', '通过考试的都是公务员'],
      answer: 0,
      explanation: '这是一个直言三段论：大前提"所有公务员都要通过考试"，小前提"小李是公务员"，结论"小李通过了考试"。'
    },
    {
      topic: '数量关系',
      question: '一本书300页，第一天看了全书的1/5，第二天看了余下的1/4，还剩下多少页没看？',
      options: ['180页', '150页', '120页', '200页'],
      answer: 0,
      explanation: '第一天：300×1/5=60页。剩余：300-60=240页。第二天：240×1/4=60页。还剩：240-60=180页。'
    },
    {
      topic: '常识判断',
      question: '"春风又绿江南岸"中的"绿"字在修辞上属于什么用法？',
      options: ['比喻', '拟人', '通感', '使动用法'],
      answer: 3,
      explanation: '"绿"在这里是形容词的使动用法，"使……变绿"的意思。王安石经过多次修改才选定"绿"字，成为炼字的经典案例。'
    },
    {
      topic: '资料分析',
      question: '2025年某省公务员报名人数为15万人，招录人数为5000人，则该年考录比（报录比）是多少？',
      options: ['20:1', '30:1', '25:1', '35:1'],
      answer: 1,
      explanation: '考录比 = 报名人数 ÷ 招录人数 = 150000 ÷ 5000 = 30:1。即平均30人竞争1个岗位。'
    }
  ];

  let quizState = {
    currentIndex: 0,
    score: 0,
    answered: false,
    questions: shuffleArray([...quizData])
  };

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function renderQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container) return;
    const q = quizState.questions[quizState.currentIndex];
    const total = quizState.questions.length;
    const answered = quizState.answered;

    let html = `
      <div class="quiz-header">
        <span class="quiz-progress">第 ${quizState.currentIndex + 1}/${total} 题</span>
        <span class="quiz-score">✅ ${quizState.score} 分</span>
      </div>
      <div class="quiz-body">
        <span class="quiz-topic">${q.topic}</span>
        <h3>${q.question}</h3>
        <div class="quiz-options">
    `;

    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, idx) => {
      let cls = 'quiz-option';
      if (answered) {
        cls += ' disabled';
        if (idx === q.answer) cls += ' correct';
        if (idx === quizState.selected && idx !== q.answer) cls += ' wrong';
      }
      html += `<div class="${cls}" data-idx="${idx}">
        <span class="option-letter">${letters[idx]}</span>
        <span>${opt}</span>
      </div>`;
    });

    html += `
        </div>
        <div class="quiz-feedback ${answered ? (quizState.selected === q.answer ? 'correct' : 'wrong') : ''} ${answered ? 'show' : ''}">
          ${answered ? (quizState.selected === q.answer
            ? `<strong>✅ 回答正确！</strong><br>${q.explanation}`
            : `<strong>❌ 回答错误！</strong><br>正确答案是 ${letters[q.answer]}。<br>${q.explanation}`)
            : ''}
        </div>
      </div>
      <div class="quiz-footer">
        ${answered && quizState.currentIndex < total - 1
          ? `<button class="quiz-btn quiz-btn-primary" id="quiz-next">下一题 <i class="fa-solid fa-arrow-right"></i></button>`
          : ''}
        ${answered && quizState.currentIndex === total - 1
          ? `<button class="quiz-btn quiz-btn-primary" id="quiz-finish">查看成绩 <i class="fa-solid fa-trophy"></i></button>`
          : ''}
        ${!answered
          ? `<span></span><button class="quiz-btn quiz-btn-primary" id="quiz-submit" disabled>确认答案</button>`
          : ''}
      </div>
    `;

    container.innerHTML = html;

    // Attach events
    if (!answered) {
      let selectedIdx = null;
      document.querySelectorAll('.quiz-option').forEach(el => {
        el.addEventListener('click', function() {
          if (quizState.answered) return;
          document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
          this.classList.add('selected');
          this.style.borderColor = 'var(--color-primary)';
          selectedIdx = parseInt(this.dataset.idx);
          document.getElementById('quiz-submit').disabled = false;
        });
      });
      document.getElementById('quiz-submit')?.addEventListener('click', function() {
        if (selectedIdx === null) return;
        quizState.answered = true;
        quizState.selected = selectedIdx;
        if (selectedIdx === q.answer) quizState.score++;
        renderQuiz();
      });
    } else {
      document.getElementById('quiz-next')?.addEventListener('click', function() {
        quizState.currentIndex++;
        quizState.answered = false;
        renderQuiz();
      });
      document.getElementById('quiz-finish')?.addEventListener('click', function() {
        showQuizResult();
      });
    }
  }

  function showQuizResult() {
    const total = quizState.questions.length;
    const score = quizState.score;
    const pct = Math.round(score / total * 100);
    let icon, msg;
    if (pct >= 80) { icon = '🏆'; msg = '太强了！继续保持！'; }
    else if (pct >= 60) { icon = '👍'; msg = '不错！还有提升空间！'; }
    else if (pct >= 40) { icon = '💪'; msg = '加油！多练练就能提高！'; }
    else { icon = '📚'; msg = '知识点还需要巩固，加油！'; }

    document.getElementById('quiz-container').innerHTML = `
      <div class="quiz-result">
        <div class="result-icon">${icon}</div>
        <h3>${msg}</h3>
        <div class="result-score">得分：<strong>${score}</strong> / ${total}（${pct}%）</div>
        <button class="quiz-btn quiz-btn-primary" id="quiz-restart">
          <i class="fa-solid fa-rotate"></i> 再来一次
        </button>
        <button class="quiz-btn quiz-btn-secondary" id="quiz-new-set" style="margin-left:10px">
          <i class="fa-solid fa-shuffle"></i> 重新抽题
        </button>
      </div>
    `;
    document.getElementById('quiz-restart')?.addEventListener('click', function() {
      quizState.currentIndex = 0;
      quizState.score = 0;
      quizState.answered = false;
      renderQuiz();
    });
    document.getElementById('quiz-new-set')?.addEventListener('click', function() {
      quizState = {
        currentIndex: 0,
        score: 0,
        answered: false,
        questions: shuffleArray([...quizData])
      };
      renderQuiz();
    });
  }

  // Init quiz
  const quizContainer = document.getElementById('quiz-container');
  if (quizContainer) renderQuiz();

  // ==========================================
  // 2. CHECK-IN - 每日打卡
  // ==========================================
  function getCheckins() {
    try {
      return JSON.parse(localStorage.getItem('huohuo_checkins') || '[]');
    } catch { return []; }
  }

  function saveCheckin(dateStr) {
    const list = getCheckins();
    if (!list.includes(dateStr)) {
      list.push(dateStr);
      localStorage.setItem('huohuo_checkins', JSON.stringify(list));
    }
  }

  function isChecked(dateStr) {
    return getCheckins().includes(dateStr);
  }

  function getStreak() {
    const list = getCheckins().sort().reverse();
    if (list.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < list.length; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const expected = formatDate(d);
      if (list.includes(expected)) streak++;
      else break;
    }
    return streak;
  }

  function formatDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function renderCheckin() {
    const today = new Date();
    const todayStr = formatDate(today);
    const checked = isChecked(todayStr);
    const streak = getStreak();
    const total = getCheckins().length;

    // Button
    const btn = document.getElementById('checkin-btn');
    if (btn) {
      if (checked) {
        btn.textContent = '✅ 今日已打卡';
        btn.className = 'checkin-btn done';
      } else {
        btn.textContent = '🔥 今日打卡学习';
        btn.className = 'checkin-btn todo';
        btn.onclick = function() {
          saveCheckin(todayStr);
          renderCheckin();
        };
      }
    }

    // Stats
    document.getElementById('checkin-streak') && (document.getElementById('checkin-streak').textContent = streak);
    document.getElementById('checkin-total') && (document.getElementById('checkin-total').textContent = total);
    document.getElementById('checkin-month') && (document.getElementById('checkin-month').textContent = getMonthlyCount(today.getFullYear(), today.getMonth()));

    // Calendar
    renderCalendar(today.getFullYear(), today.getMonth());
  }

  function getMonthlyCount(year, month) {
    const list = getCheckins();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return list.filter(d => d.startsWith(prefix)).length;
  }

  function renderCalendar(year, month) {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = formatDate(today);
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    document.getElementById('cal-title') && (document.getElementById('cal-title').textContent = `${year}年${monthNames[month]}`);

    let html = weekDays.map(d => `<div class="cal-header">${d}</div>`).join('');
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="cal-day empty"></div>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let cls = 'cal-day';
      const checkDate = new Date(year, month, d);
      if (checkDate > today) cls += ' future';
      else if (dateStr === todayStr) cls += ' today';
      if (isChecked(dateStr)) cls += ' checked';
      html += `<div class="${cls}">${d}</div>`;
    }
    grid.innerHTML = html;
  }

  // Init check-in
  if (document.getElementById('checkin-section')) renderCheckin();

  // ==========================================
  // 3. DAILY QUESTION - 每日一题
  // ==========================================
  const dailyQuestions = [
    {
      question: '行测中，资料分析常用的"估算法"核心是什么？',
      tags: ['行测', '资料分析'],
      answer: '估算法核心是"四舍五入取整"和"保留有效数字"。在计算增长率、比重时，将数据进行合理近似，简化计算过程。关键要判断误差是否在可接受范围内。'
    },
    {
      question: '申论大作文的"凤头、猪肚、豹尾"分别指什么？',
      tags: ['申论', '写作技巧'],
      answer: '"凤头"指开头要精彩亮眼，快速点明主题；"猪肚"指主体部分内容充实、论据充分、层次分明；"豹尾"指结尾要简洁有力、升华主题、给人留下深刻印象。'
    },
    {
      question: '面试中遇到不会的问题怎么办？',
      tags: ['面试', '应试技巧'],
      answer: '首先保持冷静，不要慌张。可以用"这个问题我之前了解不多，但我的理解是……"来过渡，然后结合相关知识或类似案例作答。关键是要展现分析问题的思维过程，而非追求完美答案。'
    },
    {
      question: '行测数量关系中，"工程问题"的核心公式是什么？',
      tags: ['行测', '数量关系'],
      answer: '工程问题核心公式：工作总量 = 工作效率 × 工作时间。常用解法：设总工作量为1或最小公倍数，分别计算各对象的工作效率。多人合作时，效率相加。'
    },
    {
      question: '吉林省考笔试各科目分值占比是怎样的？',
      tags: ['吉林省考', '考试说明'],
      answer: '吉林省考笔试总分为200分，其中《行政职业能力测验》100分（全部为客观题），《申论》100分（全部为主观题）。行测考试时长120分钟，申论150分钟。'
    },
    {
      question: '什么是"三支一扶"？考公有优势吗？',
      tags: ['考公政策', '基层项目'],
      answer: '"三支一扶"是指大学生在毕业后到农村基层从事支农、支教、支医和帮扶乡村振兴工作。服务期满后，在报考公务员时可享受定向招录、加分等优惠政策，是考公的重要"跳板"。'
    },
    {
      question: '申论如何积累热点素材？',
      tags: ['申论', '素材积累'],
      answer: '1.每日浏览"学习强国"APP的时政要闻；2.关注《人民日报》评论版，学习官方论述；3.分类整理热点（经济、民生、生态、文化等）；4.每个热点记住2-3个核心数据和1个典型案例即可。'
    },
    {
      question: '行测做题顺序有什么建议？',
      tags: ['行测', '应试技巧'],
      answer: '推荐顺序：资料分析（先做，分值高易得分）→ 言语理解（稳定拿分）→ 判断推理 → 常识判断（快速作答）→ 数量关系（最后做，做不完就蒙）。关键是先做自己擅长的模块，把能拿的分先拿到。'
    },
    {
      question: '结构化面试的四大测评要素是什么？',
      tags: ['面试', '测评要素'],
      answer: '1.综合分析能力（对社会现象、政策的分析和判断）；2.组织协调能力（计划、组织、协调活动）；3.应急应变能力（应对突发事件）；4.人际交往能力（处理人际关系）。各个省份会略有调整。'
    },
    {
      question: '2027年吉林省考大概什么时候报名？',
      tags: ['吉林省考', '时间节点'],
      answer: '参考往年规律，吉林省考一般在每年1-2月发布公告并报名，3月下旬参加全国多省联考笔试。建议从报名开始前就密切关注"吉林省公务员考试网"（http://www.jlgwyks.cn/）的官方通知。'
    }
  ];

  function getDailyQuestion() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const idx = seed % dailyQuestions.length;
    return dailyQuestions[idx];
  }

  function renderDailyQuestion() {
    const container = document.getElementById('daily-container');
    if (!container) return;
    const q = getDailyQuestion();
    container.innerHTML = `
      <div class="daily-badge"><i class="fa-regular fa-calendar"></i> 今日考点</div>
      <h3>${q.question}</h3>
      <div class="daily-tags">
        ${q.tags.map(t => `<span class="daily-tag">${t}</span>`).join('')}
      </div>
      <div class="daily-answer" id="daily-answer">
        <strong>💡 解答：</strong><br>${q.answer}
      </div>
      <div class="daily-actions">
        <button class="daily-btn daily-btn-primary" id="daily-reveal">
          <i class="fa-regular fa-eye"></i> 查看解答
        </button>
        <button class="daily-btn daily-btn-secondary" id="daily-refresh">
          <i class="fa-solid fa-shuffle"></i> 换一题
        </button>
      </div>
    `;
    document.getElementById('daily-reveal')?.addEventListener('click', function() {
      document.getElementById('daily-answer').classList.add('show');
      this.style.display = 'none';
    });
    document.getElementById('daily-refresh')?.addEventListener('click', function() {
      const qs = dailyQuestions;
      const rand = qs[Math.floor(Math.random() * qs.length)];
      document.querySelector('.daily-card h3').textContent = rand.question;
      const tagsContainer = document.querySelector('.daily-tags');
      if (tagsContainer) {
        tagsContainer.innerHTML = rand.tags.map(t => `<span class="daily-tag">${t}</span>`).join('');
      }
      document.getElementById('daily-answer').classList.remove('show');
      document.getElementById('daily-answer').innerHTML = `<strong>💡 解答：</strong><br>${rand.answer}`;
      document.getElementById('daily-reveal').style.display = '';
    });
  }

  if (document.getElementById('daily-container')) renderDailyQuestion();

  // ==========================================
  // 4. POMODORO TIMER - 番茄钟
  // ==========================================
  let timerState = {
    mode: 'focus',    // 'focus' | 'break'
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    isRunning: false,
    timerId: null,
    sessions: parseInt(localStorage.getItem('huohuo_sessions') || '0')
  };

  const TIMER_CONFIG = {
    focus: { label: '专注学习', minutes: 25 },
    break: { label: '休息一下', minutes: 5 }
  };

  function updateTimerDisplay() {
    const mins = Math.floor(timerState.timeLeft / 60);
    const secs = timerState.timeLeft % 60;
    const display = document.getElementById('timer-display');
    const label = document.getElementById('timer-label');
    const circle = document.getElementById('timer-circle');
    if (display) display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (label) label.textContent = TIMER_CONFIG[timerState.mode].label;
    if (circle) {
      const total = timerState.totalTime;
      const offset = 754 * (1 - timerState.timeLeft / total);
      circle.style.strokeDashoffset = offset;
    }
    // Update document title
    document.title = `${display ? display.textContent : ''} - 火火考公`;
  }

  function updateTimerButtons() {
    const startBtn = document.getElementById('timer-start');
    const resetBtn = document.getElementById('timer-reset');
    const sessionsEl = document.getElementById('timer-sessions');
    if (startBtn) {
      startBtn.innerHTML = timerState.isRunning
        ? '<i class="fa-solid fa-pause"></i>'
        : '<i class="fa-solid fa-play"></i>';
    }
    if (sessionsEl) sessionsEl.textContent = `${timerState.sessions} 个`;
  }

  function switchTimerMode(mode) {
    if (timerState.isRunning) {
      clearInterval(timerState.timerId);
      timerState.isRunning = false;
    }
    timerState.mode = mode;
    timerState.totalTime = TIMER_CONFIG[mode].minutes * 60;
    timerState.timeLeft = timerState.totalTime;
    updateTimerDisplay();
    updateTimerButtons();
    // Update mode tabs
    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  function startTimer() {
    if (timerState.isRunning) {
      clearInterval(timerState.timerId);
      timerState.isRunning = false;
      updateTimerButtons();
      return;
    }
    if (timerState.timeLeft <= 0) return;
    timerState.isRunning = true;
    updateTimerButtons();
    timerState.timerId = setInterval(() => {
      timerState.timeLeft--;
      updateTimerDisplay();
      if (timerState.timeLeft <= 0) {
        clearInterval(timerState.timerId);
        timerState.isRunning = false;
        // Play notification
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 800;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);

        if (timerState.mode === 'focus') {
          timerState.sessions++;
          localStorage.setItem('huohuo_sessions', String(timerState.sessions));
          updateTimerButtons();
          if (confirm('🎉 专注时间到！休息一下吧？')) {
            switchTimerMode('break');
          }
        } else {
          if (confirm('☕ 休息结束！开始下一轮专注？')) {
            switchTimerMode('focus');
          }
        }
      }
    }, 1000);
  }

  function resetTimer() {
    if (timerState.isRunning) {
      clearInterval(timerState.timerId);
      timerState.isRunning = false;
    }
    timerState.timeLeft = timerState.totalTime;
    updateTimerDisplay();
    updateTimerButtons();
  }

  // Init timer
  function initTimer() {
    switchTimerMode('focus');
    // Mode buttons
    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        switchTimerMode(this.dataset.mode);
      });
    });
    document.getElementById('timer-start')?.addEventListener('click', startTimer);
    document.getElementById('timer-reset')?.addEventListener('click', resetTimer);
    updateTimerButtons();
  }

  if (document.getElementById('timer-section')) initTimer();

  // ==========================================
  // UPDATE NAV TO INCLUDE NEW SECTIONS
  // ==========================================
  // The nav links are already added in the HTML

  console.log('🔥 火火功能模块已加载！');
});