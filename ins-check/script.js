document.addEventListener('DOMContentLoaded', () => {
    
    // Supabase Configuration
    const SUPABASE_URL = 'https://ylvdasijfpudqdwpsczi.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_j-hzHJW7LuqXJ1PMQyzReg_SBSv103G';

    // 1. URL 파라미터 분석 (UTM & 광고 정보 추출)
    const urlParams = new URLSearchParams(window.location.search);
    const adSource = urlParams.get('utm_source') || urlParams.get('source') || 'direct'; // 유입 소스
    const adCampaign = urlParams.get('utm_campaign') || urlParams.get('campaign') || 'landing_v1'; // 광고 캠페인

    // 2. 스크롤 애니메이션 (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .fade-in-up').forEach(elem => {
        observer.observe(elem);
    });

    // 3. 스무스 스크롤
    const navLinks = document.querySelectorAll('.gnb a, .hero-onead a, .expert-cta-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId && targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if(targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // 4. 연락처 숫자만 입력
    const phoneInput = document.getElementById('userPhone');
    if(phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // 5. Supabase 데이터 저장 (상담 신청 처리)
    const form = document.getElementById('consultForm');
    const submitBtn = document.getElementById('submitBtn');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userName = document.getElementById('userName').value.trim();
            const userPhoneStr = phoneInput.value.trim();
            const userInterest = document.getElementById('userInterest').value;
            
            if (userName.length < 2) {
                alert('성함을 2자 이상 정확히 입력해주세요.');
                return;
            }
            if (userPhoneStr.length < 10) {
                alert('올바른 연락처 자릿수를 입력해주세요.');
                return;
            }

            // 제출 대기 상태 표시
            if(submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = '신청 처리 중...';
            }

            try {
                // Supabase API를 통한 직접 데이터 전송 (Fetch API 사용)
                const response = await fetch(`${SUPABASE_URL}/rest/v1/insurance_leads`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        name: userName,
                        phone: userPhoneStr,
                        interest: userInterest,
                        ad_source: adSource,
                        ad_campaign: adCampaign
                    })
                });

                if (response.ok) {
                    alert(`${userName}님, 무료 보장분석 신청이 정상적으로 접수되었습니다.\n전문가가 빠르게 연락드리겠습니다.`);
                    form.reset();
                } else {
                    const errorData = await response.json();
                    console.error('Supabase Error:', errorData);
                    alert('일시적인 오류로 신청에 실패했습니다. 잠시 후 다시 시도해주세요.');
                }
            } catch (error) {
                console.error('Network Error:', error);
                alert('네트워크 상태가 원활하지 않습니다. 인터넷 연결을 확인해주세요.');
            } finally {
                if(submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = '상담 신청하기';
                }
            }
        });
    }
});
