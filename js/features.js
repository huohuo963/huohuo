/* ============================================
   火火考公资料站 - 核心功能模块
   Tab布局 + 刷题 + 打卡 + 番茄钟 + 错题本
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

  // ==========================================
  // 0. TAB SWITCHING
  // ==========================================
  const tabBtns = document.querySelectorAll('.tab-nav-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const navLinks = document.querySelectorAll('.nav-links a');

  function switchTab(tabId) {
    // Update tab buttons
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    // Update tab panels
    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });
    // Update nav links
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + tabId);
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });

  navLinks.forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#tab-')) {
        e.preventDefault();
        switchTab(href.substring(1));
      }
    });
  });

  // ==========================================
  // 0b. DASHBOARD STATS UPDATE
  // ==========================================
  function updateDashboard() {
    // Check-in streak
    const checkins = getCheckins();
    const streak = calcStreak(checkins);
    document.getElementById('dash-checkin') && (document.getElementById('dash-checkin').textContent = streak + '天');

    // Timer sessions
    const sessions = parseInt(localStorage.getItem('huohuo_sessions') || '0');
    document.getElementById('dash-tomato') && (document.getElementById('dash-tomato').textContent = sessions);

    // Total quiz questions answered
    const records = getQuizRecords();
    document.getElementById('dash-quiz') && (document.getElementById('dash-quiz').textContent = records.length);
  }

  // ==========================================
  // 1. QUIZ - 在线刷题 (with wrong answer recording)
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
      options: ['所有的鸟都会飞这个前提是错误的', '企鹅不是鸟', '逻辑推理不可靠', '企鹅是特例'],
      answer: 0,
      explanation: '大前提"所有的鸟都会飞"为假（企鹅、鸵鸟等不会飞的鸟），所以即使推理形式正确，结论也未必为真。'
    },
    {
      topic: '数量关系',
      question: '甲、乙两人分别从A、B两地同时出发相向而行，甲的速度5km/h，乙的速度3km/h，两地相距24km。相遇时甲走了多少千米？',
      options: ['12km', '15km', '9km', '18km'],
      answer: 1,
      explanation: '相遇时间=24÷(5+3)=3小时。甲走的路程=5×3=15km。'
    },
    {
      topic: '资料分析',
      question: '某市2025年GDP为5000亿元，较上年增长8%，则2024年GDP约为多少亿元？',
      options: ['4600亿元', '4630亿元', '4700亿元', '5400亿元'],
      answer: 1,
      explanation: '2024年GDP=5000÷(1+8%)=5000÷1.08≈4630亿元。'
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
      explanation: '"锲而不舍"意为不停地雕刻，比喻坚持不懈。其他三项均表示不能坚持。'
    },
    {
      topic: '判断推理',
      question: '如果"所有公务员都要通过考试"，"小李是公务员"，那么可以推出：',
      options: ['小李通过了考试', '小李可能要参加考试', '有些通过考试的是公务员', '通过考试的都是公务员'],
      answer: 0,
      explanation: '直言三段论：大前提"所有公务员都要通过考试"，小前提"小李是公务员"，结论"小李通过了考试"。'
    },
    {
      topic: '数量关系',
      question: '一本书300页，第一天看了全书的1/5，第二天看了余下的1/4，还剩多少页？',
      options: ['180页', '150页', '120页', '200页'],
      answer: 0,
      explanation: '第一天：300×1/5=60页。剩余240页。第二天：240×1/4=60页。还剩240-60=180页。'
    },
    {
      topic: '常识判断',
      question: '"春风又绿江南岸"中的"绿"字在修辞上属于什么用法？',
      options: ['比喻', '拟人', '通感', '使动用法'],
      answer: 3,
      explanation: '"绿"是形容词的使动用法，"使……变绿"。王安石多次修改才选定"绿"字，是炼字的经典案例。'
    },
    {
      topic: '资料分析',
      question: '2025年某省公务员报名15万人，招录5000人，则该年考录比是多少？',
      options: ['20:1', '30:1', '25:1', '35:1'],
      answer: 1,
      explanation: '考录比=150000÷5000=30:1，即平均30人竞争1个岗位。'
    },
    // 2025 省考联考回忆题
    {
      topic: '言语理解',
      question: '"纸上得来终觉浅，绝知此事要躬行。" 这句话强调的是什么？',
      options: ['书本知识不可靠', '亲身实践的重要性', '学习要勤奋', '理论指导实践'],
      answer: 1,
      explanation: '诗句强调从书本上得到的知识终究是浅薄的，要真正理解事物的本质必须亲身去实践。'
    },
    {
      topic: '判断推理',
      question: '某单位有甲、乙、丙三人，已知：(1)甲和乙中至少有一人是党员；(2)乙和丙中至少有一人不是党员。如果甲不是党员，则可以推出以下哪项？',
      options: ['乙是党员，丙不是党员', '乙不是党员，丙是党员', '甲和丙都是党员', '乙和丙都不是党员'],
      answer: 0,
      explanation: '由甲不是党员和(1)可知乙是党员。由乙是党员和(2)可知丙不是党员。所以乙是党员，丙不是党员。'
    },
    {
      topic: '数量关系',
      question: '一项工程，甲单独做需要12天完成，乙单独做需要15天完成。两人合作4天后，剩余工程由乙单独完成，还需要几天？',
      options: ['5天', '6天', '7天', '8天'],
      answer: 1,
      explanation: '甲效1/12，乙效1/15，合作4天完成(1/12+1/15)×4=3/5，剩余2/5，乙需(2/5)÷(1/15)=6天。'
    },
    {
      topic: '言语理解',
      question: '下列句子中，没有语病的一项是：',
      options: ['通过这次学习，使我提高了认识', '他的写作水平有了明显的提高', '这本书的内容和插图都很丰富', '有没有坚定的意志，是一个人在事业上能够取得成功的关键'],
      answer: 1,
      explanation: 'A项缺主语（"通过""使"连用），C项搭配不当（"插图"不能"丰富"），D项两面对一面（"有没有"对"能够"）。'
    },
    {
      topic: '资料分析',
      question: '2025年某省粮食产量为3600万吨，比上年增长20%，则2024年该省粮食产量为多少万吨？',
      options: ['2800', '3000', '3200', '3400'],
      answer: 1,
      explanation: '2024年产量=3600÷(1+20%)=3600÷1.2=3000万吨。'
    }
  ];

  let quizState = {
    currentIndex: 0,
    score: 0,
    answered: false,
    selected: -1,
    questions: shuffleArray([...quizData])
  };

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getQuizRecords() {
    try { return JSON.parse(localStorage.getItem('huohuo_quiz_records') || '[]'); }
    catch { return []; }
  }

  function saveQuizRecord(record) {
    const records = getQuizRecords();
    records.push(record);
    localStorage.setItem('huohuo_quiz_records', JSON.stringify(records));
  }

  function renderQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container) return;
    if (!quizState.questions || quizState.questions.length === 0) {
      container.innerHTML = '<div class="quiz-result"><p>暂无题目，请稍后再试</p></div>';
      return;
    }
    const q = quizState.questions[quizState.currentIndex];
    const total = quizState.questions.length;
    const letters = ['A', 'B', 'C', 'D'];

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

    q.options.forEach((opt, idx) => {
      let cls = 'quiz-option';
      if (quizState.answered) {
        cls += ' disabled';
        if (idx === q.answer) cls += ' correct';
        if (idx === quizState.selected && idx !== q.answer) cls += ' wrong';
      }
      if (quizState.answered && idx === quizState.selected && idx === q.answer) cls += ' correct';
      html += `<div class="${cls}" data-idx="${idx}">
        <span class="option-letter">${letters[idx]}</span>
        <span>${opt}</span>
      </div>`;
    });

    html += `</div>
      <div class="quiz-feedback ${quizState.answered ? 'show' : ''} ${quizState.answered ? (quizState.selected === q.answer ? 'correct' : 'wrong') : ''}">
        ${quizState.answered
          ? (quizState.selected === q.answer
            ? `<strong>✅ 回答正确！</strong><br>${q.explanation}`
            : `<strong>❌ 回答错误！</strong><br>正确答案是 ${letters[q.answer]}。<br>${q.explanation}`)
          : ''}
      </div>
    </div>`;

    // Footer buttons
    let footerHtml = '<div class="quiz-footer">';
    if (!quizState.answered) {
      footerHtml += '<span></span><button class="quiz-btn quiz-btn-primary" id="quiz-submit" disabled>确认答案</button>';
    } else {
      if (quizState.currentIndex < total - 1) {
        footerHtml += `<span></span><button class="quiz-btn quiz-btn-primary" id="quiz-next">下一题 <i class="fa-solid fa-arrow-right"></i></button>`;
      } else {
        footerHtml += `<span></span><button class="quiz-btn quiz-btn-primary" id="quiz-finish">查看成绩 <i class="fa-solid fa-trophy"></i></button>`;
      }
    }
    footerHtml += '</div>';

    container.innerHTML = html + footerHtml;

    // Events
    if (!quizState.answered) {
      let sel = -1;
      document.querySelectorAll('.quiz-option').forEach(el => {
        el.addEventListener('click', function() {
          if (quizState.answered) return;
          document.querySelectorAll('.quiz-option').forEach(o => { o.style.borderColor = ''; o.style.background = ''; });
          this.style.borderColor = 'var(--color-primary)';
          this.style.background = 'rgba(196,30,36,0.04)';
          sel = parseInt(this.dataset.idx);
          document.getElementById('quiz-submit').disabled = false;
        });
      });
      document.getElementById('quiz-submit')?.addEventListener('click', function() {
        if (sel < 0) return;
        quizState.answered = true;
        quizState.selected = sel;
        const correct = sel === q.answer;
        if (correct) quizState.score++;

        // Save record
        saveQuizRecord({
          date: new Date().toISOString(),
          topic: q.topic,
          question: q.question,
          options: q.options,
          answer: q.answer,
          selected: sel,
          correct: correct,
          explanation: q.explanation
        });

        renderQuiz();
        updateDashboard();
      });
    } else {
      document.getElementById('quiz-next')?.addEventListener('click', () => {
        quizState.currentIndex++;
        quizState.answered = false;
        quizState.selected = -1;
        renderQuiz();
      });
      document.getElementById('quiz-finish')?.addEventListener('click', showQuizResult);
    }
  }

  function showQuizResult() {
    const total = quizState.questions.length;
    const score = quizState.score;
    const pct = Math.round(score / total * 100);
    let icon, msg;
    if (pct >= 80) { icon = '🏆'; msg = '太强了！继续保持！'; }
    else if (pct >= 60) { icon = '👍'; msg = '不错！还有提升空间！'; }
    else { icon = '💪'; msg = '加油！多练练就能提高！'; }

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
    document.getElementById('quiz-restart')?.addEventListener('click', () => {
      quizState.currentIndex = 0;
      quizState.score = 0;
      quizState.answered = false;
      quizState.selected = -1;
      renderQuiz();
    });
    document.getElementById('quiz-new-set')?.addEventListener('click', () => {
      quizState = {
        currentIndex: 0, score: 0, answered: false, selected: -1,
        questions: shuffleArray([...quizData])
      };
      renderQuiz();
    });
    updateDashboard();
  }

  if (document.getElementById('quiz-container')) renderQuiz();

  // ==========================================
  // 2. WRONG ANSWER BOOK & ANALYSIS
  // ==========================================
  function renderWrongBook() {
    const records = getQuizRecords();
    const wrongRecords = records.filter(r => !r.correct);
    const total = records.length;
    const wrongCount = wrongRecords.length;
    const correctCount = total - wrongCount;

    // Stats
    document.getElementById('ws-total') && (document.getElementById('ws-total').textContent = total);
    document.getElementById('ws-wrong') && (document.getElementById('ws-wrong').textContent = wrongCount);
    const accuracy = total > 0 ? Math.round(correctCount / total * 100) : 0;
    document.getElementById('ws-accuracy') && (document.getElementById('ws-accuracy').textContent = accuracy + '%');

    // Analysis chart
    renderAnalysisChart(records);

    // Wrong list
    const listContainer = document.getElementById('wrong-list');
    if (!listContainer) return;

    if (wrongRecords.length === 0) {
      listContainer.innerHTML = `
        <div class="wrong-empty">
          <i class="fa-regular fa-face-smile"></i>
          <p>还没有错题，继续加油！</p>
        </div>`;
      return;
    }

    const letters = ['A', 'B', 'C', 'D'];
    let html = '';
    wrongRecords.slice().reverse().forEach((r, idx) => {
      html += `
        <div class="wrong-item">
          <div class="wi-header">
            <span class="wi-topic">${r.topic}</span>
            <span class="wi-date">${new Date(r.date).toLocaleDateString('zh-CN')}</span>
          </div>
          <div class="wi-question">${idx + 1}. ${r.question}</div>
          <div class="wi-answers">
            <span class="wi-your-answer">你的答案：${letters[r.selected]}</span>
            &nbsp;&nbsp;
            <span class="wi-correct-answer">正确答案：${letters[r.answer]}</span>
            <br><br>
            <span style="color:var(--color-text-light);font-size:0.85rem">${r.explanation}</span>
          </div>
        </div>`;
    });
    listContainer.innerHTML = html;
  }

  function renderAnalysisChart(records) {
    const chartContainer = document.getElementById('analysis-chart');
    const suggestionContainer = document.getElementById('analysis-suggestion');
    if (!chartContainer) return;

    const topics = ['言语理解', '判断推理', '数量关系', '资料分析', '常识判断'];
    const topicStats = {};
    topics.forEach(t => { topicStats[t] = { total: 0, correct: 0 }; });

    records.forEach(r => {
      if (topicStats[r.topic]) {
        topicStats[r.topic].total++;
        if (r.correct) topicStats[r.topic].correct++;
      }
    });

    let chartHtml = '<h3><i class="fa-solid fa-chart-bar"></i> 各模块正确率</h3>';
    let worstTopic = '';
    let worstPct = 100;
    let suggestionParts = [];

    topics.forEach(t => {
      const stat = topicStats[t];
      const pct = stat.total > 0 ? Math.round(stat.correct / stat.total * 100) : 0;
      const barClass = pct >= 70 ? 'good' : (pct >= 40 ? 'warn' : 'bad');
      if (stat.total > 0 && pct < worstPct) { worstPct = pct; worstTopic = t; }

      chartHtml += `
        <div class="analysis-bar-group">
          <div class="analysis-bar-label">
            <span class="bar-topic">${t}</span>
            <span class="bar-pct" style="color:${pct >= 70 ? '#22C55E' : (pct >= 40 ? '#F59E0B' : '#EF4444')}">${pct}%</span>
          </div>
          <div class="analysis-bar-track">
            <div class="analysis-bar-fill ${barClass}" style="width:${pct}%"></div>
          </div>
        </div>`;
      if (stat.total > 0) {
        suggestionParts.push(`${t}(${stat.correct}/${stat.total})`);
      }
    });

    chartContainer.innerHTML = chartHtml;

    // Suggestion
    if (suggestionContainer) {
      let suggestion = '';
      if (records.length === 0) {
        suggestion = '还没有做题记录，去刷几道题吧！';
      } else if (worstTopic && worstPct < 70) {
        suggestion = `📊 你的薄弱模块是 <strong>${worstTopic}</strong>（正确率 ${worstPct}%），建议优先复习该模块的基础知识和解题技巧。`;
      } else if (worstPct >= 70) {
        suggestion = '🎉 各模块表现都不错！继续保持，冲刺高分！';
      } else {
        suggestion = `📊 当前共做题 ${records.length} 道：${suggestionParts.join('、')}。针对性复习效果更好！`;
      }
      suggestionContainer.innerHTML = `<i class="fa-solid fa-lightbulb" style="color:var(--color-gold)"></i> ${suggestion}`;
    }
  }

  // ==========================================
  // 3. CHECK-IN - 每日打卡
  // ==========================================
  function getCheckins() {
    try { return JSON.parse(localStorage.getItem('huohuo_checkins') || '[]'); }
    catch { return []; }
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

  function calcStreak(list) {
    if (list.length === 0) return 0;
    const sorted = [...list].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const expected = formatDate(d);
      if (sorted.includes(expected)) streak++;
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
    const list = getCheckins();
    const streak = calcStreak(list);
    const total = list.length;

    const btn = document.getElementById('checkin-btn');
    if (btn) {
      if (checked) {
        btn.textContent = '✅ 今日已打卡';
        btn.className = 'checkin-btn done';
        btn.onclick = null;
      } else {
        btn.textContent = '🔥 今日打卡学习';
        btn.className = 'checkin-btn todo';
        btn.onclick = function() {
          saveCheckin(todayStr);
          renderCheckin();
          updateDashboard();
        };
      }
    }

    document.getElementById('checkin-streak') && (document.getElementById('checkin-streak').textContent = streak);
    document.getElementById('checkin-total') && (document.getElementById('checkin-total').textContent = total);
    document.getElementById('checkin-month') && (document.getElementById('checkin-month').textContent = getMonthlyCount(today.getFullYear(), today.getMonth()));

    renderCalendar(today.getFullYear(), today.getMonth());
  }

  function getMonthlyCount(year, month) {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return getCheckins().filter(d => d.startsWith(prefix)).length;
  }

  function renderCalendar(year, month) {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = formatDate(today);
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    document.getElementById('cal-title') && (document.getElementById('cal-title').textContent = `${year}年${monthNames[month]}`);

    let html = weekDays.map(d => `<div class="cal-header">${d}</div>`).join('');
    for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';
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

  if (document.getElementById('checkin-section')) renderCheckin();

  // ==========================================
  // 4. DAILY QUESTION
  // ==========================================
  const dailyQuestions = [
    {
      question: '行测中，资料分析常用的"估算法"核心是什么？',
      tags: ['行测', '资料分析'],
      answer: '核心是"四舍五入取整"和"保留有效数字"。在计算增长率、比重时，将数据进行合理近似，简化计算过程，同时控制误差在可接受范围内。'
    },
    {
      question: '申论大作文的"凤头、猪肚、豹尾"分别指什么？',
      tags: ['申论', '写作技巧'],
      answer: '"凤头"指开头要精彩亮眼，快速点明主题；"猪肚"指主体内容充实、论据充分、层次分明；"豹尾"指结尾简洁有力、升华主题。'
    },
    {
      question: '面试中遇到不会的问题怎么办？',
      tags: ['面试', '应试技巧'],
      answer: '保持冷静，用"这个问题我之前了解不多，但我的理解是……"过渡，结合相关知识或类似案例作答。关键展现分析思维过程，而非追求完美答案。'
    },
    {
      question: '行测数量关系中"工程问题"的核心公式是什么？',
      tags: ['行测', '数量关系'],
      answer: '工作总量=工作效率×工作时间。常用解法：设总工作量为1或最小公倍数，分别计算效率。多人合作时效率相加。'
    },
    {
      question: '吉林省考笔试各科目分值占比？',
      tags: ['吉林省考', '考试说明'],
      answer: '总分200分：行测100分（全部客观题），申论100分（全部主观题）。行测120分钟，申论150分钟。'
    },
    {
      question: '什么是"三支一扶"？考公有优势吗？',
      tags: ['考公政策', '基层项目'],
      answer: '大学生毕业后到农村基层从事支农、支教、支医和帮扶乡村振兴工作。服务期满后报考公务员可享受定向招录、加分等优惠政策，是考公的重要"跳板"。'
    },
    {
      question: '申论如何积累热点素材？',
      tags: ['申论', '素材积累'],
      answer: '1.每日"学习强国"时政要闻；2.《人民日报》评论版学习官方论述；3.分类整理（经济、民生、生态、文化等）；4.每个热点记住2-3个核心数据和1个典型案例。'
    },
    {
      question: '行测做题顺序有什么建议？',
      tags: ['行测', '应试技巧'],
      answer: '推荐：资料分析（先做，分值高易得分）→ 言语理解 → 判断推理 → 常识判断（快速作答）→ 数量关系（最后做）。先做擅长的模块。'
    },
    {
      question: '结构化面试四大测评要素？',
      tags: ['面试', '测评要素'],
      answer: '1.综合分析能力；2.组织协调能力；3.应急应变能力；4.人际交往能力。各省份会略有调整。'
    },
    {
      question: '2027年吉林省考大概什么时候报名？',
      tags: ['吉林省考', '时间节点'],
      answer: '参考往年规律：一般在1-2月发布公告报名，3月下旬参加多省联考笔试。关注"吉林省公务员考试网"（http://www.jlgwyks.cn/）官方通知。'
    }
  ];

  function getDailyQuestion() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return dailyQuestions[seed % dailyQuestions.length];
  }

  function renderDailyQuestion() {
    const container = document.getElementById('daily-container');
    if (!container) return;
    const q = getDailyQuestion();
    container.innerHTML = `
      <div class="daily-badge"><i class="fa-regular fa-calendar"></i> 今日考点</div>
      <h3>${q.question}</h3>
      <div class="daily-tags">${q.tags.map(t => `<span class="daily-tag">${t}</span>`).join('')}</div>
      <div class="daily-answer" id="daily-answer">
        <strong>💡 解答：</strong><br>${q.answer}
      </div>
      <div class="daily-actions">
        <button class="daily-btn daily-btn-primary" id="daily-reveal"><i class="fa-regular fa-eye"></i> 查看解答</button>
        <button class="daily-btn daily-btn-secondary" id="daily-refresh"><i class="fa-solid fa-shuffle"></i> 换一题</button>
      </div>`;
    document.getElementById('daily-reveal')?.addEventListener('click', function() {
      document.getElementById('daily-answer').classList.add('show');
      this.style.display = 'none';
    });
    document.getElementById('daily-refresh')?.addEventListener('click', function() {
      const rand = dailyQuestions[Math.floor(Math.random() * dailyQuestions.length)];
      container.querySelector('h3').textContent = rand.question;
      container.querySelector('.daily-tags').innerHTML = rand.tags.map(t => `<span class="daily-tag">${t}</span>`).join('');
      const ans = document.getElementById('daily-answer');
      ans.classList.remove('show');
      ans.innerHTML = `<strong>💡 解答：</strong><br>${rand.answer}`;
      document.getElementById('daily-reveal').style.display = '';
    });
  }

  if (document.getElementById('daily-container')) renderDailyQuestion();

  // ==========================================
  // 5. POMODORO TIMER + FLOATING WINDOW
  // ==========================================
  let timerState = {
    mode: 'focus',
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    isRunning: false,
    timerId: null,
    sessions: parseInt(localStorage.getItem('huohuo_sessions') || '0')
  };

  const TIMER_CONFIG = { focus: { label: '专注学习', minutes: 25 }, break: { label: '休息一下', minutes: 5 } };

  function updateTimerDisplay() {
    const mins = Math.floor(timerState.timeLeft / 60);
    const secs = timerState.timeLeft % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const display = document.getElementById('timer-display');
    const label = document.getElementById('timer-label');
    const circle = document.getElementById('timer-circle');
    if (display) display.textContent = timeStr;
    if (label) label.textContent = TIMER_CONFIG[timerState.mode].label;

    // Floating timer
    const ftDisplay = document.getElementById('ft-time');
    const ftLabel = document.getElementById('ft-label');
    if (ftDisplay) ftDisplay.textContent = timeStr;
    if (ftLabel) ftLabel.textContent = TIMER_CONFIG[timerState.mode].label;

    if (circle) {
      const total = timerState.totalTime;
      circle.style.strokeDashoffset = 754 * (1 - timerState.timeLeft / total);
    }
    document.title = `${timeStr} - 火火考公`;
  }

  function updateTimerButtons() {
    const startBtn = document.getElementById('timer-start');
    const sessionsEl = document.getElementById('timer-sessions');
    const ftToggle = document.getElementById('ft-toggle');
    if (startBtn) {
      startBtn.innerHTML = timerState.isRunning ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    }
    if (sessionsEl) sessionsEl.textContent = `${timerState.sessions} 个`;
    if (ftToggle) {
      ftToggle.innerHTML = timerState.isRunning ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    }
    updateDashboard();
  }

  function switchTimerMode(mode) {
    if (timerState.isRunning) { clearInterval(timerState.timerId); timerState.isRunning = false; }
    timerState.mode = mode;
    timerState.totalTime = TIMER_CONFIG[mode].minutes * 60;
    timerState.timeLeft = timerState.totalTime;
    updateTimerDisplay();
    updateTimerButtons();
    document.querySelectorAll('.timer-mode-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
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
    // Show floating timer
    const ft = document.getElementById('floatingTimer');
    if (ft) ft.classList.add('active');

    timerState.timerId = setInterval(() => {
      timerState.timeLeft--;
      updateTimerDisplay();
      if (timerState.timeLeft <= 0) {
        clearInterval(timerState.timerId);
        timerState.isRunning = false;

        // Beep
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = 800;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          osc.start(); osc.stop(ctx.currentTime + 0.5);
        } catch(e) {}

        if (timerState.mode === 'focus') {
          timerState.sessions++;
          localStorage.setItem('huohuo_sessions', String(timerState.sessions));
          updateTimerButtons();
          if (confirm('🎉 专注时间到！休息一下吧？')) switchTimerMode('break');
        } else {
          if (confirm('☕ 休息结束！开始下一轮专注？')) switchTimerMode('focus');
        }
      }
    }, 1000);
  }

  function resetTimer() {
    if (timerState.isRunning) { clearInterval(timerState.timerId); timerState.isRunning = false; }
    timerState.timeLeft = timerState.totalTime;
    updateTimerDisplay();
    updateTimerButtons();
  }

  /* Floating timer controls */
  document.getElementById('ft-toggle')?.addEventListener('click', startTimer);
  document.getElementById('ft-close')?.addEventListener('click', function() {
    document.getElementById('floatingTimer').classList.remove('active');
  });

  // Init timer
  if (document.getElementById('timer-section')) {
    switchTimerMode('focus');
    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.addEventListener('click', function() { switchTimerMode(this.dataset.mode); });
    });
    document.getElementById('timer-start')?.addEventListener('click', startTimer);
    document.getElementById('timer-reset')?.addEventListener('click', resetTimer);
    updateTimerButtons();
  }

  // ==========================================
  // INIT ALL
  // ==========================================
  updateDashboard();

  // Listen for tab switches to refresh content
  const observer = new MutationObserver(() => {
    // Re-render wrong book when tab becomes active
    if (document.getElementById('tab-wrongbook')?.classList.contains('active')) {
      renderWrongBook();
    }
    // Re-render dashboard when home tab active
    if (document.getElementById('tab-home')?.classList.contains('active')) {
      updateDashboard();
    }
    // Re-render checkin when checkin tab active
    if (document.getElementById('tab-checkin')?.classList.contains('active')) {
      renderCheckin();
    }
  });
  tabPanels.forEach(p => observer.observe(p, { attributes: true, attributeFilter: ['class'] }));

  // Init wrong book if already active
  if (document.getElementById('tab-wrongbook')?.classList.contains('active')) {
    renderWrongBook();
  }

  console.log('🔥 火火考公 - 功能模块加载完成！');
});