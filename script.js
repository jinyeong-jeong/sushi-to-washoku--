/* ==========================================
   [SPA 섹션 전환 & 슬라이드 메뉴 제어]
   ========================================== */

// 1. 오프닝 페이지 -> 로비 화면 진입
function enterLobbyFromStart() {
  const startPage = document.getElementById('start-page');
  const lobbyScreen = document.getElementById('lobby-screen');

  if (startPage) {
    startPage.classList.add('is-hidden');
  }
  if (lobbyScreen) {
    lobbyScreen.classList.remove('is-closed');
  }
}

// 2. 로고 클릭 시 오프닝 페이지로 복귀
function goToStartPage() {
  const startPage = document.getElementById('start-page');
  const lobbyScreen = document.getElementById('lobby-screen');

  if (lobbyScreen) {
    lobbyScreen.classList.add('is-closed');
  }
  if (startPage) {
    startPage.classList.remove('is-hidden');
  }
}

// 3. 로비 메뉴 열기 / 닫기
function openLobby() {
  const lobbyScreen = document.getElementById('lobby-screen');
  if (lobbyScreen) {
    lobbyScreen.classList.remove('is-closed');
  }
}

function closeLobby() {
  const lobbyScreen = document.getElementById('lobby-screen');
  if (lobbyScreen) {
    lobbyScreen.classList.add('is-closed');
  }
}

// 4. 섹션 이동 (SPA 전환)
function navigateToSection(sectionId) {
  closeLobby();

  const sections = document.querySelectorAll('.section-block');
  sections.forEach(sec => {
    sec.classList.remove('is-active');
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('is-active');
    targetSection.scrollTop = 0;

    triggerSectionReveals(targetSection);
  }
}

// 5. 스크롤 및 섹션 진입 시 텍스트 페이드인 (.reveal)
function triggerSectionReveals(container) {
  const reveals = container.querySelectorAll('.reveal');
  reveals.forEach(el => {
    el.classList.add('is-visible');
  });
}

// 6. 스크롤 감지, 플랫피커(Flatpickr) 및 커스텀 셀렉트 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 초기 활성 섹션 리빌
  const initialActive = document.querySelector('.section-block.is-active');
  if (initialActive) {
    triggerSectionReveals(initialActive);
  }

  // 내부 스크롤 시 리빌 감지
  const sections = document.querySelectorAll('.section-block');
  sections.forEach(sec => {
    sec.addEventListener('scroll', () => {
      const reveals = sec.querySelectorAll('.reveal:not(.is-visible)');
      const triggerBottom = window.innerHeight * 0.9;

      reveals.forEach(reveal => {
        const top = reveal.getBoundingClientRect().top;
        if (top < triggerBottom) {
          reveal.classList.add('is-visible');
        }
      });
    });
  });

  // Flatpickr 달력 초기화 (스크롤 분리 방지 + 월요일 휴무 비활성화)
  const dateInput = document.getElementById('customDatePicker');
  if (dateInput && typeof flatpickr !== 'undefined') {
    const parentGroup = dateInput.closest('.form-group');
    if (parentGroup) {
      parentGroup.style.position = 'relative';
    }

    flatpickr(dateInput, {
      locale: 'ja',
      minDate: 'today',
      dateFormat: 'Y-m-d',
      appendTo: parentGroup || undefined,
      static: true,
      disable: [
        function(date) {
          // 월요일 정기휴무 비활성화 (1 = 월요일)
          return (date.getDay() === 1);
        }
      ]
    });
  }

  // 표준 <select> 태그를 유지하면서 자동으로 다크 커스텀 패널로 변환
  document.querySelectorAll('select.form-select').forEach(select => {
    if (select.dataset.customized) return;
    select.dataset.customized = 'true';

    select.style.position = 'absolute';
    select.style.opacity = '0';
    select.style.pointerEvents = 'none';
    select.style.height = '0';
    select.style.width = '0';

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';

    const selectedOpt = select.options[select.selectedIndex];
    const isPlaceholder = !selectedOpt || selectedOpt.disabled;

    trigger.innerHTML = `
      <span class="trigger-text ${isPlaceholder ? 'placeholder' : ''}">${selectedOpt ? selectedOpt.textContent : ''}</span>
      <span class="trigger-arrow">▼</span>
    `;
    wrapper.appendChild(trigger);

    const optionsList = document.createElement('ul');
    optionsList.className = 'custom-select-options';

    Array.from(select.options).forEach((opt, idx) => {
      if (opt.disabled) return;

      const li = document.createElement('li');
      li.textContent = opt.textContent;
      li.dataset.value = opt.value;

      li.addEventListener('click', () => {
        optionsList.querySelectorAll('li').forEach(el => el.classList.remove('is-selected'));
        li.classList.add('is-selected');

        const textSpan = trigger.querySelector('.trigger-text');
        textSpan.textContent = opt.textContent;
        textSpan.classList.remove('placeholder');

        select.selectedIndex = idx;
        select.dispatchEvent(new Event('change'));

        wrapper.classList.remove('is-open');
      });

      optionsList.appendChild(li);
    });

    wrapper.appendChild(optionsList);

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-select-wrapper.is-open').forEach(openEl => {
        if (openEl !== wrapper) openEl.classList.remove('is-open');
      });
      wrapper.classList.toggle('is-open');
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('is-open');
      }
    });
  });
});