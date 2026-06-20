let inventory = [];

// 식재료 추가 기능
function addFood() {
    const name = document.getElementById('foodName').value;
    const category = document.getElementById('foodCategory').value;
    const expiryDateStr = document.getElementById('expiryDate').value;

    if (!name || !expiryDateStr) {
        alert('식재료 이름과 유통기한을 모두 입력해주세요!');
        return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const expiryDate = new Date(expiryDateStr);
    expiryDate.setHours(0,0,0,0);
    
    // 디데이 계산
    const timeDiff = expiryDate.getTime() - today.getTime();
    const dDay = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    inventory.push({ name, category, expiryDateStr, dDay });
    renderInventory();

    // 입력창 비우기
    document.getElementById('foodName').value = '';
    document.getElementById('expiryDate').value = '';
}

// 화면에 리스트 그리기
function renderInventory() {
    const listBody = document.getElementById('inventoryList');
    listBody.innerHTML = '';

    inventory.forEach((item) => {
        const row = document.createElement('tr');
        
        // 기획안 조건: 유통기한 마감 3일 전부터 빨간색 푸시 효과 대신 텍스트 강조
        let dDayBadge = ``;
        if (item.dDay <= 3 && item.dDay >= 0) {
            dDayBadge = `<span class="badge bg-danger">D-${item.dDay} (임박!)</span>`;
        } else if (item.dDay < 0) {
            dDayBadge = `<span class="badge bg-dark">기간만료 (영업사절)</span>`;
        } else {
            dDayBadge = `<span class="badge bg-success">D-${item.dDay}</span>`;
        }

        row.innerHTML = `
            <td><input type="checkbox" name="selectedFood" value="${item.name}"></td>
            <td class="${item.dDay <= 3 ? 'text-danger fw-bold' : ''}">${item.name}</td>
            <td>${item.category}</td>
            <td>${item.expiryDateStr}</td>
            <td>${dDayBadge}</td>
        `;
        listBody.appendChild(row);
    });
}

// AI 기반 레시피 추천 기능 모형 및 타이머 작동
function recommendRecipe() {
    const checkboxes = document.querySelectorAll('input[name="selectedFood"]:checked');
    let selectedFoods = [];
    checkboxes.forEach(cb => selectedFoods.push(cb.value));

    if (selectedFoods.length === 0) {
        alert('레시피를 추천받을 재료를 선택해주세요!');
        return;
    }

    document.getElementById('recipeResult').classList.remove('d-none');
    const content = document.getElementById('recipeContent');
    
    // 결과 텍스트 출력 (Step-by-step)
    content.innerHTML = `
        <p><strong>🍳 추천 요리:</strong> 자취생 맞춤형 [${selectedFoods.join(' + ')}] 소보로 덮밥</p>
        <p><strong>⏱️ 조리 시간:</strong> 5분 | <strong>⭐ 난이도:</strong> 쉬움</p>
        <p><strong>📖 조리 순서:</strong></p>
        <ol>
            <li>팬에 식용유를 두르고 선택한 재료들을 잘게 썰어 볶습니다.</li>
            <li>재료가 익으면 간장 1스푼과 올리고당 반 스푼을 넣어 졸입니다.</li>
            <li>따뜻한 밥 위에 볶은 재료를 올린 후 맛있게 드세요! (아래 타이머로 시간을 측정해보세요!)</li>
        </ol>
    `;
    
    // 타이머 리셋 (120초 = 2분)
    timeLeft = 120;
    updateTimerDisplay();
}

// 타이머 로직
let timeLeft = 120;
let timerId = null;

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('timerDisplay').innerText = `${minutes}:${seconds}`;
}

function toggleTimer() {
    const btn = document.getElementById('timerBtn');
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        btn.innerText = "타이머 시작";
        btn.className = "btn btn-outline-danger btn-sm";
    } else {
        btn.innerText = "타이머 정지";
        btn.className = "btn btn-danger btn-sm";
        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerId);
                alert("⏰ 요리가 완성되었습니다! 맛있게 드세요.");
                timerId = null;
                btn.innerText = "타이머 시작";
            }
        }, 1000);
    }
}
