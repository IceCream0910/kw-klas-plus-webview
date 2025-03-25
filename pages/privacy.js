import React from 'react';

const PrivacyPolicy = () => {
  const containerStyle = {
    margin: '0 auto',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '2rem',
    paddingBottom: '2rem',
    maxWidth: '80%', // Added for better readability on large screens
  };

  const heading1Style = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  };

  const paragraphStyle = {
    marginBottom: '1rem',
    lineHeight: '1.6', // Added for better readability
  };

  const heading2Style = {
    fontSize: '1.25rem',
    fontWeight: 'semibold',
    marginTop: '2.5rem',
    marginBottom: '1rem',
  };

  const listStyle = {
    marginBottom: '1.5rem',
    paddingLeft: '20px',
  };

  const listItemStyle = {
    marginBottom: '0.5rem',
  };

  const nestedListStyle = {
    listStyleType: 'disc',
    paddingLeft: '20px',
  };

  return (
    <div style={containerStyle}>
      <h1 style={heading1Style}>개인정보 처리방침</h1>
      <p style={paragraphStyle}>
        KLAS+는 이용자의 개인정보를 보호하고 관련 법령을 준수하기 위해 다음과 같이 개인정보 처리방침을 수립 및 공개합니다.
        본 개인정보 처리방침은 대한민국의 개인정보 보호법 및 관계 법령을 준수하며, KLAS+ 서비스 이용과 관련된 개인정보의 수집, 이용, 제공,
        보호조치 등에 대한 사항을 포함합니다.
      </p>

      <h2 style={heading2Style}>제1조 (개인정보의 수집 및 이용 목적)</h2>
      <p style={paragraphStyle}>
        KLAS+는 서비스 제공을 위해 필요한 최소한의 개인정보를 수집하며, 수집된 개인정보는 다음의 목적을 위해 사용됩니다.
      </p>
      <ul style={listStyle}>
        <li style={listItemStyle}>
          서비스 제공 및 운영
          <ul style={nestedListStyle}>
            <li style={listItemStyle}>회원 인증 및 서비스 이용에 필요한 기능 제공</li>
            <li style={listItemStyle}>KLAS 및 중앙도서관 인증 연동</li>
            <li style={listItemStyle}>KLAS GPT 서비스 이용 지원</li>
          </ul>
        </li>
        <li style={listItemStyle}>
          고객지원 및 문의 처리
          <ul style={nestedListStyle}>
            <li style={listItemStyle}>서비스 이용 관련 문의 응대 및 불만 처리</li>
          </ul>
        </li>
        <li style={listItemStyle}>
          서비스 품질 개선 및 분석
          <ul style={nestedListStyle}>
            <li style={listItemStyle}>서비스 이용 패턴 분석을 통한 기능 개선</li>
          </ul>
        </li>
      </ul>

      <h2 style={heading2Style}>제2조 (수집하는 개인정보의 항목)</h2>
      <p style={paragraphStyle}>서비스 이용 과정에서 다음과 같은 개인정보가 수집될 수 있습니다.</p>
      <ul style={listStyle}>
        <li style={listItemStyle}>로그인: 학번, KLAS 비밀번호, 쿠키(Cookies)</li>
        <li style={listItemStyle}>모바일 학생증: 학번, 중앙도서관 비밀번호, 전화번호</li>
        <li style={listItemStyle}>
          KLAS GPT: KLAS 수강 정보(수강 중인 과목 내역, 해당 과목 과제 제출, 출석 현황 등 데이터)
        </li>
        <li style={listItemStyle}>
          자동 수집 항목
          <ul style={nestedListStyle}>
            <li style={listItemStyle}>단말기 정보 (OS, 기기 모델 등)</li>
            <li style={listItemStyle}>IP 주소 및 접속 환경</li>
            <li style={listItemStyle}>서비스 이용 패턴 (접속 빈도, 이용 시간, 클릭 이벤트 등)</li>
          </ul>
        </li>
      </ul>

      <h2 style={heading2Style}>제3조 (개인정보의 보유 및 파기)</h2>
      <p style={paragraphStyle}>
        KLAS+는 이용자의 개인정보를 자체 서버에 저장하지 않으며, 사용자의 기기에만 저장합니다.
      </p>
      <p style={paragraphStyle}>
        단, 서비스 제공을 위해 수집된 정보는 다음과 같은 경우 제3자에게 제공될 수 있습니다.
      </p>
      <ul style={listStyle}>
        <li style={listItemStyle}>KLAS 및 중앙도서관 인증을 위해 학번 및 비밀번호가 학교의 공식 인증 서버로 전송됨</li>
        <li style={listItemStyle}>KLAS GPT 이용 시, 일부 수강 정보 및 대화 내용이 OpenAI 서버로 전송됨</li>
      </ul>

      <h2 style={heading2Style}>제4조 (행태정보의 수집·이용·제공 등에 관한 사항)</h2>
      <p style={paragraphStyle}>
        서비스 개선 및 이용자 분석 등에 활용하기 위해 행태정보를 수집 및 이용하고 있습니다
      </p>
      <p style={paragraphStyle}>
        행태정보는 서비스 이용 과정에서 자동으로 수집 및 저장되며, 개인 식별이 불가능한 상태에서 활용하는 등 개인정보와 결합하여 사용하지
        않습니다. 아울러 수집되는 행태정보는 분석업체와 제휴 광고사업자에 식별이 불가능한 상태로 제공될 수 있습니다.
      </p>
      <ul style={listStyle}>
        <li style={listItemStyle}>제공받는 자: Amplitude (AB180)</li>
        <li style={listItemStyle}>
          행태정보 수집 방법: 이용자가 앱을 실행할 때 등 행해지는 주요행동에 대해 자동 수집
        </li>
        <li style={listItemStyle}>
          수집∙처리 되는 행태정보 항목: 이용자의 웹/앱 서비스 내 방문기록, 스크롤, 클릭 등의 사용기록, 디바이스 관련 정보(모델명, 제조사,
          기기타입, 플랫폼, OS해상도, 언어, 통신사, 운영체제 정보), 타임존 정보, IP주소, 네트워크 정보, 웹브라우저 정보, 앱 버전, 국가,
          라이브러리, 디바이스 광고 추적 제한 설정 값
        </li>
        <li style={listItemStyle}>보유∙이용기간: 12개월(보유기간 경과 후에는 일 단위로 삭제)</li>
      </ul>

      <h2 style={heading2Style}>제5조 (개인정보의 안전성 확보 조치)</h2>
      <p style={paragraphStyle}>
        KLAS+는 이용자의 개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다.
      </p>
      <ul style={listStyle}>
        <li style={listItemStyle}>
          암호화 조치
          <ul style={nestedListStyle}>
            <li style={listItemStyle}>비밀번호 등 중요정보는 암호화하여 저장</li>
            <li style={listItemStyle}>개인정보 전송 시 암호화된 통신구간(SSL/TLS) 사용</li>
          </ul>
        </li>
        <li style={listItemStyle}>
          접근 통제 및 보안 조치
          <ul style={nestedListStyle}>
            <li style={listItemStyle}>해킹, 악성코드로부터 보호하기 위한 보안 시스템 운영</li>
            <li style={listItemStyle}>개인정보 접근 권한을 최소화하여 관리</li>
          </ul>
        </li>
      </ul>

      <h2 style={heading2Style}>
        제6조 (개인정보 보호책임자 및 문의처)
      </h2>
      <p style={paragraphStyle}>
        이용자는 개인정보 보호 관련 문의를 아래의 연락처로 할 수 있으며, KLAS+는 신속하고 성실하게 답변해드리겠습니다.
      </p>
      <ul style={listStyle}>
        <li style={listItemStyle}>개인정보 보호책임자: 윤태인</li>
        <li style={listItemStyle}>이메일 문의: hey@yuntae.in</li>
      </ul>

      <p style={paragraphStyle}>본 개인정보 처리방침은 2024년 3월 4일부터 적용됩니다.</p>
      <p style={paragraphStyle}>최종 개정일: 2025년 3월 26일</p>
    </div>
  );
};

export default PrivacyPolicy;
