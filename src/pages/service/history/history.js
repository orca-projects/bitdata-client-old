import './styles/history.css';

import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';
import ProfileManager from '@manager/ProfileManager';
import TransactionFilterObserverManager from '@manager/TransactionFilterObserverManager';
import TransactionManager from '@manager/TransactionManager';
import TransactionPaginationManager from '@manager/TransactionPaginationManager';

(async () => {
    // 필터
    // 일자 필터
    const $filterDate = document.querySelector('.filter-date input');
    $filterDate.readOnly = true;

    $(document).ready(function () {
        $('input[name="data-date"]').daterangepicker({
            // 부모 요소 설정
            parentEl: '.filter-date',
            // 기본값 설정 (지난 7일)
            startDate: moment().subtract(6, 'days'),
            endDate: moment(),
            // 지역 설정
            locale: {
                format: 'YYYY/MM/DD',
                separator: ' ~ ',
                applyLabel: '적용',
                cancelLabel: '취소',
                monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                daysOfWeek: ['일', '월', '화', '수', '목', '금', '토'],
                customRangeLabel: '사용자 지정',
            },
            // 선택 범위 노출
            ranges: {
                '이번 달': [moment().startOf('month'), moment().endOf('month')],
                '지난 달': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                '지난 7일': [moment().subtract(6, 'days'), moment()],
                '지난 14일': [moment().subtract(13, 'days'), moment()],
                '지난 3개월': [moment().subtract(3, 'months').startOf('month'), moment().endOf('month')],
            },
            showDropdowns: true,
            alwaysShowCalendars: true,
            opens: 'right',
            linkedCalendars: false,
        });
    });

    const fetchTransaction = async (filterData) => {
        try {
            const response = await new RequestSender().setUrl(`${SERVER_URL}/transaction/`).setMethod('GET').setParams(filterData).send();
            return response;
        } catch (error) {
            console.error('API 데이터 로드 오류:', error);
        }
    };

    const response = await fetchTransaction();

    const profileManager = new ProfileManager();
    await profileManager.init();

    const transactionFilterObserverManager = new TransactionFilterObserverManager();

    const transactionData = response.transaction;
    const transactionsManager = new TransactionManager(transactionFilterObserverManager);
    transactionsManager.init(transactionData);

    const transactionPaginationManager = new TransactionPaginationManager();
    transactionPaginationManager.updateItemsPerPage();

    document.querySelector('.search-btn').addEventListener('click', async () => {
        const [start, end] = $filterDate.value.split(' ~ ');
        const filterData = {
            startDate: new Date(start).getTime(),
            endDate: new Date(end).getTime(),
        };

        const response = await fetchTransaction(filterData);

        transactionsManager.init(response.transaction);

        applyTransactionFilters();
    });

    document.querySelectorAll('input[name="filter-winlose"]').forEach((radio) => {
        radio.addEventListener('change', applyTransactionFilters);
    });

    document.querySelector('input[name="data-symbol"]').addEventListener('input', applyTransactionFilters);

    function applyTransactionFilters() {
        const winlose = document.querySelector('input[name="filter-winlose"]:checked')?.value || 'all';
        const symbol = document.querySelector('input[name="data-symbol"]').value.trim().toUpperCase();

        const filterData = {
            winlose: winlose,
            symbol: symbol,
        };

        transactionFilterObserverManager.notify(filterData);
        transactionPaginationManager.updateItemsPerPage();
    }

    const updateBtn = document.querySelector('.update-history-btn');
    const loadingModal = document.querySelector('.loading'); // 로딩 화면

    updateBtn.addEventListener('click', relink);

    async function relink() {
        loadingModal.classList.remove('hidden');
        await collectHistory();
        loadingModal.classList.add('hidden');
    }

    async function collectHistory() {
        try {
            const request = new RequestSender().setUrl(`${SERVER_URL}/user/collect/`).setMethod('GET').send();

            const timeout = new Promise((resolve) => setTimeout(resolve, 3000));

            const [response] = await Promise.all([request, timeout]);

            const profileData = response.profile;

            const profileManager = new ProfileManager();
            profileManager.saveData(profileData);

            if (profileManager.isConnected()) {
                collectionSuccess();
            } else {
                collectionFail();
            }
        } catch (error) {
            console.error('Error:', error.message);
            collectionFail();
        }
    }

    function collectionSuccess() {
        startCountdown();
    }

    async function collectionFail() {
        const $connectedFail = document.querySelector('.modal.connected-fail');

        $connectedFail.classList.remove('hidden');

        await new Promise((resolve) => setTimeout(resolve, 3000));

        $connectedFail.classList.add('hidden');
    }

    const timer = document.querySelector('.update-tooltip-timer');

    async function startCountdown() {
        updateBtn.disabled = true;

        const now = Date.now();
        const endTime = now + 30 * 60 * 1000;
        localStorage.setItem('countdown_end_time', endTime.toString());

        runCountdown(endTime);
    }

    function runCountdown(endTime) {
        const interval = setInterval(() => {
            const currentTime = Date.now();
            const remaining = Math.floor((endTime - currentTime) / 1000);

            if (remaining >= 0) {
                timer.textContent = formatTime(remaining);
            } else {
                clearInterval(interval);
                updateBtn.disabled = false;
                timer.textContent = '0초';
                localStorage.removeItem('countdown_end_time');
            }
        }, 200);
    }

    function resumeCountdown() {
        const endTime = localStorage.getItem('countdown_end_time');

        if (!endTime) {
            return;
        }

        updateBtn.disabled = true;

        runCountdown(parseInt(endTime, 10));
    }

    resumeCountdown();

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;

        let timeStr = '';

        if (min > 0) {
            timeStr += `${min}분 `;
        }
        timeStr += `${sec}초`;

        return timeStr;
    }

    // 메모
    // field
    // 거래내역 페이지
    const $imageMemoBtn = document.querySelectorAll('.image-memo-btn'); // 거래내역 메모 버튼
    // 이미지 메모장 모달
    const $imageMemoModal = document.querySelector('.image-memo'); // 이미지 메모장 모달
    const $imageMemoModalImageCardContainer = document.querySelector('.image-memo .image-card-container'); // 이미지 카드 컨테이너
    const $imageMemoModalCloseBtn = document.querySelector('.image-memo .close-btn'); // 닫기 버튼
    const $imageMemoModalViewBtns = document.querySelectorAll('.image-memo .view-btn'); // 보기 버튼들
    const $imageMemoModalDeleteBtns = document.querySelectorAll('.image-memo .delete-btn'); // 삭제 버튼들
    const $imageMemoModalImageUpload = document.getElementById('image-upload'); // 이미지 업로드 input
    const MAXSIZE = 1024 * 1024; // 1MB
    const $imageMemoModalUploadBtn = document.querySelector('.image-memo .upload-btn'); // 업로드 버튼
    // 이미지 크게 보기 모달
    const $imageMemoViewModal = document.querySelector('.image-memo-view'); // 이미지 크게 보기 모달
    const $imageMemoViewModalCloseBtn = document.querySelector('.image-memo-view .close-btn'); // 닫기 버튼
    const $imageMemoViewModalImage = document.querySelector('.image-memo-view .content-image img'); // 이미지 태그
    const $imageMemoViewModalUpdateBtn = document.querySelector('.image-memo-view .update-btn'); // [수정하기] 버튼
    // 메모 수정 모달
    const $memoUpdateModal = document.querySelector('.memo-update'); // 메모 수정 모달
    const $memoUpdateModalCloseBtn = document.querySelector('.memo-update .close-btn'); // 닫기 버튼
    const $memoUpdateModalTitleInput = document.getElementById('title'); // 제목 입력란
    const $memoUpdateModalDescriptionInput = document.getElementById('description'); // 설명 입력란
    const $memoUpdateModalSaveBtn = document.querySelector('.memo-update .save-btn'); // 저장 버튼

    // methods
    // 거래내역
    const openImageMemoModal = function () {
        // 이미지 메모장 모달 열기
        $imageMemoModal.classList.remove('hidden'); // 모달 노출
        document.body.style.overflow = 'hidden'; // 뒷 배경 스크롤 방지
    };
    // 이미지 메모장 모달
    const closeImageMemoModal = function () {
        // 이미지 메모장 모달 닫기
        $imageMemoModal.classList.add('hidden'); // 모달 숨기기
        document.body.style.overflow = 'auto'; // 뒷 배경 스크롤 가능
    };
    const viewImageInModal = function (event) {
        // 보기 버튼 클릭시
        $imageMemoViewModal.classList.remove('hidden'); // 이미지 크게 보기 모달 노출
        const $img = event.target.closest('.image-card').querySelector('img'); // 이미지 소스 가져오기
        $imageMemoViewModalImage.src = $img.src; // 이미지 크게 보기 이미지에 대입
    };
    const deleteImageCard = function (event) {
        // 삭제 버튼 클릭시
        if (confirm('메모를 삭제하시겠습니까?')) {
            const $imageCard = event.target.closest('.image-card');
            $imageCard.remove();
            $imageMemoModalUploadBtn.parentElement.classList.remove('hidden'); // 업로드 버튼 노출
        }
    };
    const clickImageUpload = function () {
        // 파일 업로더 노출
        $imageMemoModalImageUpload.click();
    };
    const handleImageUploadChange = function () {
        // 파일을 업로드했을때
        const file = $imageMemoModalImageUpload.files[0];
        if (file) {
            // file이 null이 아닐 때
            if (isValidFileSize(file)) {
                uploadImage(file);
            } else {
                alert(`
            이미지 업로드 제한 사항을 확인해주세요.
            용량 제한: 1MB 이하
            `);
            }
            $imageMemoModalImageUpload.value = '';
        }
    };
    const isValidFileSize = (file) => {
        // 파일크기 유효성 검사
        return file.size <= MAXSIZE;
    };
    const uploadImage = function (image) {
        const reader = new FileReader();
        reader.onload = (image) => {
            const newImageCard = document.createElement('div');
            const title = 'IMAGE0001';
            const date = formatDate(new Date());
            newImageCard.classList.add('image-card');
            newImageCard.innerHTML = `
            <img src='${image.target.result}' alt='Image'>
            <div class='info'>
                <p class='title'>${title}</p>
                <p class='description'>디스크립션</p>
                <p class='upload-date'>${date}</p>
            </div>
            <div class='actions'>
                <button class='view-btn'>보기</button>
                <button class='delete-btn'>삭제</button>
            </div>
        `;
            $imageMemoModalImageCardContainer.appendChild(newImageCard);

            newImageCard.querySelector('.view-btn').addEventListener('click', viewImageInModal); // 새로운 [보기] 버튼에 이벤트 리스너 추가
            newImageCard.querySelector('.delete-btn').addEventListener('click', deleteImageCard); // 새로운 [삭제] 버튼에 이벤트 리스너 추가

            if ($imageMemoModal.querySelectorAll('.image-card').length === 3) {
                // 이미지 카드가 3개일 경우 업로드 버튼 숨김
                $imageMemoModalUploadBtn.parentElement.classList.add('hidden'); // 업로드 버튼 숨김
            }
        };
        reader.readAsDataURL(image);
    };
    const formatDate = function (date) {
        // 날짜 형식
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    // 이미지 크게 보기 모달
    const closeImageViewModal = function () {
        // 이미지 크게 보기 모달 닫기
        $imageMemoViewModal.classList.add('hidden');
    };
    const openMemoUpdateModal = function () {
        // 메모 수정 모달 열기
        $memoUpdateModal.classList.remove('hidden');
    };
    // 메모 수정 모달
    const closeMemoUpdateModal = function () {
        // 메모 수정 모달 닫기
        $memoUpdateModal.classList.add('hidden');
    };
    const saveMemoUpdateModal = function (event) {
        // 메모 수정 사항 저장
        event.preventDefault(); // 기본 동작(페이지 새로고침) 방지

        // 제목 입력 여부 확인
        const inputTitle = $memoUpdateModalTitleInput.value.trim();
        if (inputTitle === '') {
            alert('제목을 입력해주세요.');
        } else {
            // 확인/취소 알림창 띄우기
            const confirmResult = confirm('저장하시겠습니까?');
            if (confirmResult) {
                closeMemoUpdateModal();
            }
        }
    };

    // main
    // 거래내역
    $imageMemoBtn.forEach((imageMemobtn) => {
        imageMemobtn.addEventListener('click', openImageMemoModal);
    }); // [메모] 버튼 클릭 이벤트 추가
    // 이미지 메모장 모달
    $imageMemoModalCloseBtn.addEventListener('click', closeImageMemoModal); // [닫기] 버튼 클릭 이벤트 추가
    $imageMemoModalUploadBtn.addEventListener('click', clickImageUpload); // [업로드] 버튼 클릭 이벤트 추가
    $imageMemoModalImageUpload.addEventListener('change', handleImageUploadChange); // 이미지 업로드 변경 이벤트 추가
    // 보기 버튼 클릭 이벤트 추가
    $imageMemoModalViewBtns.forEach((viewBtn) => {
        viewBtn.addEventListener('click', viewImageInModal); // 이미지 카드 [보기] 버튼 이벤트 등록
    });
    // 삭제 버튼 클릭 이벤트 추가
    $imageMemoModalDeleteBtns.forEach((deleteBtn) => {
        deleteBtn.addEventListener('click', deleteImageCard); // 이미지 카드 [삭제] 버튼 이벤트 등록
    });
    // 이미지 크게 보기 모달 닫기 버튼 클릭 이벤트 추가
    $imageMemoViewModalCloseBtn.addEventListener('click', closeImageViewModal);
    $imageMemoViewModalUpdateBtn.addEventListener('click', openMemoUpdateModal);
    // 메모 수정 모달
    $memoUpdateModalCloseBtn.addEventListener('click', closeMemoUpdateModal);
})();
